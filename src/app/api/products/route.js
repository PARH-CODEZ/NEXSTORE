// /app/api/products/route.js or route.ts
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // ✅ Verify auth (optional for now)
    // const user = verifyAuth(req);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const {
      name,
      categoryId,
      brandId,
      description,
      price,
      discountPercent,
      isActive,
      slug,
      images,
      variants,
      specifications,
    } = await req.json(); // ✅ use .json() instead of req.body

    const createdProduct = await prisma.product.create({
      data: {
        name,
        categoryId: Number(categoryId),
        brandId: brandId ? Number(brandId) : null,
        description,
        price: Number(price),
        discountPercent: discountPercent ? Number(discountPercent) : 0,
        isActive: isActive ?? true,
        slug,
        images: {
          create: images.map(img => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary || false,
          })),
        },
        specifications: {
          create: specifications.map(spec => ({
            label: spec.label,
            value: spec.value,
          })),
        },
        variants: {
          create: variants.map(variant => ({
            variantName: variant.variantName,
            sku: variant.sku,
            additionalPrice: variant.additionalPrice ? Number(variant.additionalPrice) : 0,
            quantityAvailable: variant.quantityAvailable ? Number(variant.quantityAvailable) : 0,
            isActive: variant.isActive ?? true,
            images: {
              create: (variant.images || []).map(img => ({
                imageUrl: img.imageUrl,
                isPrimary: img.isPrimary || false,
              })),
            },
            attributeMapping: {
              create: (variant.attributes || []).map(attr => ({
                valueId: attr.valueId,
              })),
            },
          })),
        },
      },
      include: {
        images: true,
        specifications: true,
        variants: {
          include: {
            images: true,
            attributeMapping: true,
          },
        },
      },
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
