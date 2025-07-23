import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function POST(req) {
  try {
    /* ─── 1. Auth ─── */
    const user = verifyAuth(req);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sellerId = user.userid;

    /* ─── 2. Product list (basic info) ─── */
    const products = await prisma.product.findMany({
      where: { sellerId },
      select: {
        id: true,
        name: true,
        price: true,
        discountPercent: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        isApproved: true,
        stockAvailable: true,
        images: { take: 1, select: { imageUrl: true } },
        category: { select: { Slug: true } },
        reviews: { select: { rating: true } },
        variants: {
          take: 1,
          select: {
            additionalPrice: true,
            images: { take: 1, select: { imageUrl: true } },
          },
        },
        _count: { select: { reviews: true, variants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    /* ─── 3. Count active, inactive, pending ─── */
    const [activeCount, inactiveCount, pendingCount] = await Promise.all([
      prisma.product.count({
        where: {
          sellerId,
          isApproved: true,
          stockAvailable: true,
        },
      }),
      prisma.product.count({
        where: {
          sellerId,
          isApproved: true,
          stockAvailable: false,
        },
      }),
      prisma.product.count({
        where: {
          sellerId,
          isApproved: false,
        },
      }),
    ]);

    /* ─── 4. Response ─── */
    return NextResponse.json({
      products,
      stats: {
        activeProducts: activeCount,
        inactiveProducts: inactiveCount,
        pendingProducts: pendingCount,
      },
    });
  } catch (err) {
    console.error('Error fetching seller products:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
