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


    const { variantId, quantity = 1 } = await req.json();


    if (!variantId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (quantity > 10) {
      return NextResponse.json(
        { error: 'You can add at most 10 units of a single item' },
        { status: 400 }
      );
    }

 
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { user: { connect: { UserID: userId } } },
      });
    }

    
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId },
      },
    });

    if (existingItem) {
      const newQty = Math.min(existingItem.quantity + quantity, 10); 
      if (newQty === existingItem.quantity) {
        return NextResponse.json(
          { error: 'Maximum 10 units per item in cart' },
          { status: 400 }
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity: Math.min(quantity, 10),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Add‑to‑cart error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



