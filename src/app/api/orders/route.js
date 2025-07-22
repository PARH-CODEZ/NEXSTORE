// app/api/orders/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user || user.role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id
    const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { placedAt: 'desc' },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    title: true,
                                    reviews: { select: { rating: true } },
                                },
                            },
                            images: true, // ✅ all variant images
                        },
                    },
                },
            },
            shipments: {
                orderBy: { shippedAt: 'desc' },
                take: 1,
            },
            shippingAddress: { // ✅ include fullName from OrderAddress
                select: {
                    fullName: true,
                },
            },
        },
    });


    const formatted = orders.map((order) => ({
        id: `${order.id}`,
        customerName: order.shippingAddress?.fullName || 'Unknown', // ✅ Include this
        date: order.placedAt.toISOString().split('T')[0],
        total: Number(order.totalAmount),
        status: order.status.toLowerCase(),
        deliveryDate: order.deliveredAt?.toISOString().split('T')[0] ?? null,
        trackingNumber: order.trackingNumber,
        items: order.items.map((item) => ({
            name: item.variant.product.title,
            variantName: item.variant.variantName,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.variant.images[0]?.imageUrl || null,
            rating:
                item.variant.product.reviews.length > 0
                    ? item.variant.product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    item.variant.product.reviews.length
                    : null,
            productId: item.variant.productId, // ✅ Include productId
        })),


    }));

    return NextResponse.json(formatted);
}
