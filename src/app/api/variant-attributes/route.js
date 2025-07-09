import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Attribute name is required' },
        { status: 400 }
      );
    }

    const normalizedName = name.trim().toLowerCase();

   
    const existing = await prisma.variantAttribute.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive' // Prisma-level case-insensitive match
        }
      }
    });

    if (existing) {
      return NextResponse.json({ success: true, attribute: existing });
    }

    // Create new attribute with normalized name
    const attribute = await prisma.variantAttribute.create({
      data: {
        name: normalizedName
      }
    });

    return NextResponse.json({ success: true, attribute });

  } catch (error) {
    console.error('❌ Error creating attribute:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create attribute' },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const attributes = await prisma.variantAttribute.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error('❌ Error fetching attributes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attributes' },
      { status: 500 }
    );
  }
}
