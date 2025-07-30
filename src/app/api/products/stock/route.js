import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function PATCH(req) {
  try {
   
    const user = verifyAuth(req);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

   
    const { productId, stockAvailable } = await req.json();

    if (typeof productId !== 'number' || typeof stockAvailable !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input. Expected productId (number) and stockAvailable (boolean).' },
        { status: 400 }
      );
    }

    const updated = await prisma.product.updateMany({
      where: {
        id: productId,
        sellerId: user.userid,
      },
      data: {
        stockAvailable,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Product #${productId} marked as ${stockAvailable ? 'In Stock' : 'Out of Stock'}`,
    });
  } catch (error) {
    console.error('❌ Error updating stock status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
