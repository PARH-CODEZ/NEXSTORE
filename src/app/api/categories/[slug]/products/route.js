import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const {
      page = 1,
      sort = 'Featured',
      minPrice = 0,
      maxPrice = 1000000,
      filters = [],
      product: highlightProductId,
    } = body;

    const pageSize = 12;
    const parsedFilters = Array.isArray(filters) ? filters : [];


    const category = await prisma.categories.findFirst({
      where: { Slug: slug.toLowerCase() },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    //  Get max price in this category
    const maxPriceInCategory = await prisma.product.aggregate({
      where: {
        categoryId: category.CategoryID,
        isActive: true,
        isApproved: true,
      },
      _max: {
        price: true,
      },
    });

    const maxPriceLimit = maxPriceInCategory._max.price
      ? Number(maxPriceInCategory._max.price) + 10000
      : 1000000;

    // Get matched brands
    const brandFilters = await prisma.brand.findMany({
      where: {
        name: { in: parsedFilters },
      },
      select: { name: true },
    });

    const matchedBrandNames = brandFilters.map(b => b.name);
    const nonBrandFilters = parsedFilters.filter(f => !matchedBrandNames.includes(f));

    //  Build base where clause
    const baseWhere = {
      categoryId: category.CategoryID,
      isActive: true,
      isApproved: true,
      price: {
        gte: +minPrice,
        lte: +maxPrice,
      },
    };

    // Add brand filter only if matches found
    if (matchedBrandNames.length > 0) {
      baseWhere.brand = {
        name: { in: matchedBrandNames },
      };
    }

    // ✅ Add non-brand filters only if they match specs/variant values
    const applyNonBrandFilters = nonBrandFilters.length > 0;

    const productWhere = {
      ...baseWhere,
      ...(applyNonBrandFilters && {
        OR: [
          {
            variants: {
              some: {
                attributeMapping: {
                  some: {
                    value: {
                      value: { in: nonBrandFilters },
                    },
                  },
                },
              },
            },
          },
          {
            specifications: {
              some: {
                value: { in: nonBrandFilters },
              },
            },
          },
        ],
      }),
    };

    // Total product count (exclude highlighted)
    const totalProducts = await prisma.product.count({
      where: {
        ...productWhere,
        ...(highlightProductId && {
          NOT: { id: Number(highlightProductId) },
        }),
      },
    });

    //  Fetch regular products
    const regularProducts = await prisma.product.findMany({
      where: {
        ...productWhere,
        ...(highlightProductId && {
          NOT: { id: Number(highlightProductId) },
        }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        discountPercent: true,
        images: {
          take: 1, // only send the first image
          select: { imageUrl: true },
        },
        category: { select: { Slug: true } },
        reviews: {
          select: {
            rating: true,
          },
        },
        variants: {
          take: 1,
          select: {
            images: {
              take: 1,
              select: {
                imageUrl: true, // or use the correct field name like `url` if it's different
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            variants: true,
          },

        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy:
        sort === 'PriceLowToHigh'
          ? { price: 'asc' }
          : sort === 'PriceHighToLow'
            ? { price: 'desc' }
            : { createdAt: 'desc' },
    });

    // ✅ Fetch highlighted product (if needed)
    let highlightedProduct = null;
    if (highlightProductId) {
      highlightedProduct = await prisma.product.findUnique({
        where: { id: Number(highlightProductId) },
        select: {
          id: true,
          name: true,
          price: true,
          discountPercent: true,
          images: {
            take: 1, // only send the first image
            select: { imageUrl: true },
          },
          category: { select: { Slug: true } },
          reviews: {
            select: {
              rating: true,
            },
          },
          variants: {
            take: 1,
            select: {
              images: {
                take: 1,
                select: {
                  imageUrl: true, // or use the correct field name like `url` if it's different
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
              variants: true,

            },

          },
        },
      });
    }

    const products = highlightedProduct
      ? [highlightedProduct, ...regularProducts]
      : regularProducts;

    // ✅ Brands under category
    const brands = await prisma.brand.findMany({
      where: {
        products: {
          some: {
            categoryId: category.CategoryID,
            isActive: true,
            isApproved: true,
          },
        },
      },
      select: { name: true },
      distinct: ['name'],
    });

    // ✅ Specifications under category
    const specResults = await prisma.productSpecification.findMany({
      where: {
        product: {
          categoryId: category.CategoryID,
          isActive: true,
          isApproved: true,

        },
      },
      select: { label: true, value: true },
      distinct: ['label', 'value'],
    });

    const specMap = {};
    for (const { label, value } of specResults) {
      if (!specMap[label]) specMap[label] = new Set();
      specMap[label].add(value);
    }

    const specifications = Object.entries(specMap).map(([label, values]) => [
      label,
      Array.from(values),
    ]);

    // ✅ Variant Attributes
    const attrValues = await prisma.variantAttributeValue.findMany({
      where: {
        mappings: {
          some: {
            variant: {
              product: {
                categoryId: category.CategoryID,
                isActive: true,
                isApproved: true,
              },
            },
          },
        },
      },
      select: {
        value: true,
        attribute: { select: { name: true } },
      },
    });

    const attrMap = {};
    for (const { value, attribute } of attrValues) {
      if (!attrMap[attribute.name]) attrMap[attribute.name] = new Set();
      attrMap[attribute.name].add(value);
    }

    const attributeFilters = Object.entries(attrMap).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));

    return NextResponse.json({
      totalProducts: highlightedProduct ? totalProducts + 1 : totalProducts,
      products,
      brands,
      specifications,
      attributes: attributeFilters,
      maxPrice: maxPriceLimit,
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
