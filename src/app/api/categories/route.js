import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSlug } from '@/lib/middleware/slugify';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function POST(req) {
  try {

    // const user = verifyAuth(req);
    // if (!user) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }


    const { CategoryName, Description, DisplayImageURL } = await req.json();

    if (!CategoryName) {
      return NextResponse.json({ error: 'CategoryName is required' }, { status: 400 });
    }

    const slug = generateSlug(CategoryName);

    await prisma.Categories.create({
      data: {
        CategoryName,
        Description: Description || null,
        Slug: slug,
        DisplayImageURL: DisplayImageURL || null,
      },
    });

    return NextResponse.json({ message: 'Category created' }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.Categories.findMany({
      orderBy: { CreatedAt: 'asc' },
      select: {
        CategoryID: true,
        CategoryName: true,
        Description: true,
        Slug: true,
        DisplayImageURL: true,
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE category by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await prisma.Categories.delete({
      where: {
        CategoryID: Number(id),
      },
    });

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
