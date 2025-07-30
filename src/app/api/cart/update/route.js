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
    const { itemId, quantity } = await req.json();

    if (!itemId || typeof quantity !== 'number' || quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Invalid quantity '}, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      return NextResponse.json({ error: 'Cart item not found or access denied' }, { status: 404 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error('Error updating cart item:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
 