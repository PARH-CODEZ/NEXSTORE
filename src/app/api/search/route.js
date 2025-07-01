import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawTerm = searchParams.get('term')?.trim().toLowerCase() || '';

  if (!rawTerm) {
    return NextResponse.json({ categories: [], products: [] });
  }

  // Check if "washing machine" is anywhere in the term
  const keywordToSearch = rawTerm.includes('washing machine') ? 'washing machine' : rawTerm;

  try {
    const categories = await prisma.Categories.findMany({
      where: {
        CategoryName: {
          contains: keywordToSearch,
          mode: 'insensitive',
        },
      },
      select: {
        CategoryID: true,
        CategoryName: true,
        Description: true,
        Slug: true,
      },
    });

    // Similarly for products if needed
    // const products = await prisma.Product.findMany({
    //   where: {
    //     ProductName: {
    //       contains: keywordToSearch,
    //       mode: 'insensitive',
    //     },
    //   },
    //   select: { ... }
    // });

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.CategoryID,
        name: cat.CategoryName,
        description: cat.Description,
        slug: cat.Slug,
      })),
      products: [], // add products similarly if you want
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ categories: [], products: [] }, { status: 500 });
  }
}

