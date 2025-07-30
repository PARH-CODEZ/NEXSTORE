// Route: /api/cart/delete
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function POST(req) {
  try {
    const user = verifyAuth(req);
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userid;
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Fetch the item to verify ownership
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      return NextResponse.json({ error: 'Item not found or access denied' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting cart item:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
