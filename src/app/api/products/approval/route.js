import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function PATCH(req) {
  try {
    const user = verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, isApproved } = await req.json();

    if (typeof productId !== 'number' || typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Approval update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
