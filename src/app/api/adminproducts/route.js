import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function POST(req) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.role === 'admin';
    const sellerId = user.userid;
    const { page = 1, pageSize = 10 } = await req.json().catch(() => ({}));
    const p = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize))); // cap at 100
    const productWhere = isAdmin ? {} : { sellerId };
    const totalProducts = await prisma.product.count({ where: productWhere });

    const products = await prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        price: true,
        discountPercent: true,
        createdAt: true,
        updatedAt: true,
        sellerId: true,
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
            images: { take: 1, select: { imageUrl: true } }
          }
        },
        _count: { select: { reviews: true, variants: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * limit,
      take: limit,
    });

    const productIds = products.map((p) => p.id);

    const variantPairs = await prisma.productVariant.findMany({
      where: { productId: { in: productIds } },
      select: { id: true, productId: true },
    });

    const v2p = Object.fromEntries(variantPairs.map((v) => [v.id, v.productId]));
    const variantSales = await prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true, totalPrice: true },
      where: {
        variantId: { in: Object.keys(v2p).map(Number) },
        order: { status: 'DELIVERED' },
      },
    });

    const salesMap = {};
    for (const { variantId, _sum } of variantSales) {
      const pid = v2p[variantId];
      if (!salesMap[pid]) salesMap[pid] = { unitsSold: 0, revenue: 0 };
      salesMap[pid].unitsSold += Number(_sum.quantity ?? 0);
      salesMap[pid].revenue += Number(_sum.totalPrice ?? 0);
    }

    const enriched = products.map((p) => ({
      ...p,
      unitsSold: salesMap[p.id]?.unitsSold ?? 0,
      revenue: salesMap[p.id]?.revenue ?? 0,
    }));

   
    const productBaseFilter = isAdmin ? {} : { sellerId };

    const [activeProducts, inactiveProducts, pendingProducts] = await Promise.all([
      prisma.product.count({
        where: { ...productBaseFilter, isApproved: true, stockAvailable: true },
      }),
      prisma.product.count({
        where: { ...productBaseFilter, isApproved: true, stockAvailable: false },
      }),
      prisma.product.count({
        where: { ...productBaseFilter, isApproved: false },
      }),
    ]);


    return NextResponse.json({
      products: enriched,
      pagination: {
        page: p,
        pageSize: limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
      stats: {
        inactiveProducts,
        pendingProducts,
        activeProducts,
      },
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
