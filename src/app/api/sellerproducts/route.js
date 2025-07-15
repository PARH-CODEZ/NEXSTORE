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
          select: { images: { take: 1, select: { imageUrl: true } } },
        },
        _count: { select: { reviews: true, variants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    /* ─── 3. Roll‑up sales & revenue per product ─── */

    // 3‑a. All variantIds that belong to *any* product of this seller
    const variantIds = (
      await prisma.productVariant.findMany({
        where: { product: { sellerId } },
        select: { id: true, productId: true },
      })
    );

    const variantToProduct = Object.fromEntries(
      variantIds.map((v) => [v.id, v.productId])
    );
    const variantIdList = Object.keys(variantToProduct).map(Number);

    // 3‑b. Aggregate orderItems by variantId
    const variantSales = await prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true, totalPrice: true },
      where: {
        variantId: { in: variantIdList },
        order: { status: 'DELIVERED' }, // completed orders only
      },
    });

    // 3‑c. Roll up to productId
    const productSalesMap = {};
    for (const { variantId, _sum } of variantSales) {
      const pid = variantToProduct[variantId];
      if (!productSalesMap[pid])
        productSalesMap[pid] = { unitsSold: 0, revenue: 0 };

      productSalesMap[pid].unitsSold += Number(_sum.quantity ?? 0);
      productSalesMap[pid].revenue += Number(_sum.totalPrice ?? 0);
    }

    // 3‑d. Merge into original product list
    const enrichedProducts = products.map((p) => ({
      ...p,
      unitsSold: productSalesMap[p.id]?.unitsSold ?? 0,
      revenue: productSalesMap[p.id]?.revenue ?? 0,
    }));

    /* ─── 4. Seller‑level aggregates ─── */
    const sellerAgg = await prisma.orderItem.aggregate({
      where: {
        variant: { product: { sellerId } },
        order: { status: 'DELIVERED' },
      },
      _sum: { quantity: true, totalPrice: true },
    });

    const totalSales = Number(sellerAgg._sum.quantity ?? 0);
    const totalRevenueRaw = Number(sellerAgg._sum.totalPrice ?? 0);
    const totalRevenue = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalRevenueRaw);

    const activeProducts = await prisma.product.count({
      where: {
        sellerId,
        isApproved: true,
        stockAvailable: true,
      },
    });

    /* ─── 5. Response ─── */
    return NextResponse.json({
      products: enrichedProducts,
      stats: {
        totalSales,
        totalRevenue,
        activeProducts,
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
