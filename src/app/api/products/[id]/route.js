import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  const { params } = context;
  const productId = parseInt(params.id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        images: true,
        displayImages: true,
        specifications: true,
        reviews: {
          include: {
            user: { select: { FullName: true } }
          }
        },
        variants: {
          include: {
            images: true,
            attributeMapping: {
              include: {
                value: {
                  include: {
                    attribute: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const seller = await prisma.user.findUnique({
      where: { UserID: product.sellerId },
      select: { FullName: true }
    });

    const relatedProducts = await prisma.product.findMany({
      where: {
        brandId: product.brandId,
        isActive: true,
        isApproved: true,
        NOT: { id: productId }
      },
      take: 10,
      include: {
        displayImages: true
      }
    });

    // ───────────────────────────────
    // ✅ Normalize & Group Variants
    // ───────────────────────────────
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');

    let primaryAttribute = null;
    const attributeSet = new Set();

    for (const variant of product.variants) {
      for (const mapping of variant.attributeMapping) {
        const attr = normalize(mapping.value.attribute.name);
        attributeSet.add(attr);
      }
    }

    if (attributeSet.has('storage')) {
      primaryAttribute = 'storage';
    } else if (attributeSet.has('size')) {
      primaryAttribute = 'size';
    }

    // Group variants by the selected attribute value
    const grouped = {}; // e.g., { '128gb': { display: '128 GB', variants: [...] } }

    if (primaryAttribute) {
      for (const variant of product.variants) {
        const match = variant.attributeMapping.find(
          m => normalize(m.value.attribute.name) === primaryAttribute
        );
        if (!match) continue;

        const key = normalize(match.value.value);
        if (!grouped[key]) {
          grouped[key] = {
            display: match.value.value.trim(),
            variants: []
          };
        }
        grouped[key].variants.push(variant);
      }
    }

    // Keep order of first appearance
    const attributeValues = Object.values(grouped).map(g => g.display);

    return NextResponse.json({
      product,
      sellerName: seller?.FullName || 'Unknown Seller',
      brand: {
        name: product.brand?.name || 'No Brand',
        imageUrl: product.brand?.imageUrl || null
      },
      relatedProducts,
      variantData: {
        primaryAttribute,
        attributeValues,         // ['128 GB', '256 GB'] or ['S', 'M', 'L']
        groupedVariants: grouped // { '128gb': { display: '128 GB', variants: [...] } }
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
