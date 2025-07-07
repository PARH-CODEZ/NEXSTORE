// /app/api/products/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      categoryId,
      brandId,
      description,
      price,
      discountPercent,
      isActive,
      images = [],
      specifications = [],
      variants = []
    } = body;

    // ✅ Step 1: Directly create variantAttributeValue
    for (const variant of variants) {
      for (const attr of variant.attributes) {
        const createdValue = await prisma.variantAttributeValue.create({
          data: {
            attributeId: attr.attributeId,
            value: attr.value.trim()
          }
        });

        // Assign the created valueId to attach in mapping
        attr.valueId = createdValue.id;
      }
    }

    // ✅ Step 2: Create the product
    const createdProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        isActive,
        price: parseFloat(price),
        discountPercent: parseFloat(discountPercent || 0),
        category: {
          connect: {
            CategoryID: Number(categoryId)
          }
        },
        ...(brandId && {
          brand: {
            connect: { id: Number(brandId) }
          }
        }),
        specifications: {
          create: specifications.map(spec => ({
            label: spec.label,
            value: spec.value
          }))
        },
        images: {
          create: images.map(img => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary || false
          }))
        },
        variants: {
          create: variants.map(variant => ({
            sku: variant.sku,
            variantName: variant.variantName,
            additionalPrice: parseFloat(variant.additionalPrice || 0),
            quantityAvailable: Number(variant.quantityAvailable || 0),
            isActive: true,
            images: {
              create: variant.images.map(img => ({
                imageUrl: img.imageUrl,
                isPrimary: img.isPrimary || false
              }))
            },
            attributeMapping: {
              create: variant.attributes.map(attr => ({
                valueId: attr.valueId
              }))
            }
          }))
        }
      },
      include: {
        specifications: true,
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

    return Response.json({ success: true, product: createdProduct });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to create product', error: error.message }),
      { status: 500 }
    );
  }
}


// DELETE /api/products?id=123

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const productId = Number(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete attribute mappings for variants
    await prisma.productVariantAttributeMap.deleteMany({
      where: {
        variant: {
          productId: productId,
        },
      },
    });

    // Delete images that belong to variants
    await prisma.productImage.deleteMany({
      where: {
        variant: {
          productId: productId,
        },
      },
    });

    // Delete variants
    await prisma.productVariant.deleteMany({
      where: {
        productId: productId,
      },
    });

    // Delete product images not tied to a variant
    await prisma.productImage.deleteMany({
      where: {
        productId: productId,
        variantId: null,
      },
    });

    // Delete specifications
    await prisma.productSpecification.deleteMany({
      where: {
        productId: productId,
      },
    });

    // Delete reviews
    await prisma.productReview.deleteMany({
      where: {
        productId: productId,
      },
    });

    // Delete the product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

