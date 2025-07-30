import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/middleware/verifyAuth'

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.userid },
      include: {
        items: {
          include: {
            variant: {
              select: {
                id: true,
                variantName: true, 
                additionalPrice: true,
                images: { take: 1, select: { imageUrl: true } },
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    discountPercent: true,
                    stockAvailable: true,
                    images: { take: 1, select: { imageUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const filteredItems = cart?.items.filter(
      (item) => item.variant?.product?.stockAvailable
    ) || [];

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: filteredItems });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
