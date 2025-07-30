import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawTerm = searchParams.get('term')?.trim().toLowerCase() || '';

  if (!rawTerm) {
    return NextResponse.json({ categories: [], products: [] });
  }

  const keywordToSearch = rawTerm.includes('washing machine') ? 'washing machine' : rawTerm;

  try {
  
    const categories = await prisma.Categories.findMany({
      where: {
        OR: [
          {
            CategoryName: {
              contains: keywordToSearch,
              mode: 'insensitive',
            },
          },
          {
            Description: {
              contains: keywordToSearch,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        CategoryID: true,
        CategoryName: true,
        Description: true,
        Slug: true,
      },
    });

    const categoryIds = categories.map(cat => cat.CategoryID);

 
    const products = await prisma.product.findMany({
      where: {
           isApproved: true,
        OR: [
          {
            name: {
              contains: keywordToSearch,
              mode: 'insensitive',
            },
          },
          {
            categoryId: {
              in: categoryIds,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            CategoryName: true,
            Slug: true, 
          },
        },
      },
    });

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.CategoryID,
        name: cat.CategoryName,
        description: cat.Description,
        slug: cat.Slug,
      })),
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        categoryName: p.category?.CategoryName || 'Unknown',
        categorySlug: p.category?.Slug || '', // 👈 ADD THIS
      }))

    });

  } catch (error) {
    console.error('❌ Search API error:', error);
    return NextResponse.json({ categories: [], products: [] }, { status: 500 });
  }
}
