// /app/api/variant-attributes/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { toast } from 'react-toastify';

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Attribute name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // ✅ Check if it already exists
    const existing = await prisma.variantAttribute.findFirst({
      where: { name: trimmedName }
    });

    if (existing) {
      return NextResponse.json({ success: true, attribute: existing });
    }

    // ✅ Create new only if not exists
    const attribute = await prisma.variantAttribute.create({
      data: {
        name: trimmedName
      }
    });

    return NextResponse.json({ success: true, attribute });

  } catch (error) {
    toast.error('❌ Error creating attribute:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create attribute' },
      { status: 500 }
    );
  }
}




export async function GET() {
  try {
    const attributes = await prisma.variantAttribute.findMany({
      orderBy: { name: 'asc' } // optional
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