import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    } = body;

    const pageSize = 12;
    const parsedFilters = Array.isArray(filters) ? filters : [];

    // ✅ Get the category
    const category = await prisma.categories.findFirst({
      where: { Slug: slug.toLowerCase() },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // ✅ Find selected brands from filters
   // Filters brand by name directly
const brandFilters = await prisma.brand.findMany({
  where: {
    name: { in: parsedFilters }, // parsedFilters = ["samsung"]
  },
  select: { name: true },
});


    const selectedBrandNames = brandFilters.map((b) => b.name);
    const nonBrandFilters = parsedFilters.filter(f => !selectedBrandNames.includes(f));

    // ✅ Final product filter
    const productWhere = {
      categoryId: category.CategoryID,
      isActive: true,
      isApproved: true,
      price: {
        gte: +minPrice,
        lte: +maxPrice,
      },
      ...(selectedBrandNames.length > 0 && {
        brand: {
          name: { in: selectedBrandNames },
        },
      }),
      ...(nonBrandFilters.length > 0 && {
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

    // ✅ Count total
    const totalProducts = await prisma.product.count({ where: productWhere });

    // ✅ Fetch products
    const products = await prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        price: true,
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

    // ✅ All brands under this category
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

    // ✅ Specifications (label + values)
    const specResults = await prisma.productSpecification.findMany({
      where: {
        product: {
          categoryId: category.CategoryID,
          isActive: true,
          isApproved: true,
        },
      },
      select: {
        label: true,
        value: true,
      },
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

    // ✅ Variant Attributes (Color, RAM, etc.)
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
        attribute: {
          select: {
            name: true,
          },
        },
      },
    });

    const attrMap = {};
    for (const item of attrValues) {
      const key = item.attribute.name;
      if (!attrMap[key]) attrMap[key] = new Set();
      attrMap[key].add(item.value);
    }

    const attributeFilters = Object.entries(attrMap).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));

    // ✅ Return response
 return NextResponse.json({
  totalProducts,
  products,
  brands,
  specifications,
  attributeFilters, // ✅ match frontend
});
  } catch (error) {
    console.error('❌ Error fetching category data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
