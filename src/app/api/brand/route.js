import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: Create Brand
export async function POST(req) {
  try {
    const { name, imageUrl } = await req.json();

    if (!name || !imageUrl) {
      return NextResponse.json({ error: 'Name and imageUrl are required' }, { status: 400 });
    }

    await prisma.brand.create({
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json({ message: 'Brand created successfully' }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: All Brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete Brand by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    await prisma.brand.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({ message: 'Brand deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
