import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

const VALID_STATUSES = [
    'PENDING',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
];

export async function PATCH(req, context) {
    const { orderId } = context.params;

    // ✅ Await the verifyAuth function
    const user = await verifyAuth(req);
    if (!user || !user.userid) {
        return NextResponse.json({ error: 'Unauthorized or missing user ID' }, { status: 401 });
    }

    if (!orderId || isNaN(Number(orderId))) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    try {
        // ✅ Check if user is part of the order as seller
        const sellerOrder = await prisma.orderItem.findFirst({
            where: {
                orderId: Number(orderId),
                sellerId: user.id,
            },
        });

        if (!sellerOrder) {
            return NextResponse.json({ error: 'Unauthorized for this order' }, { status: 403 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: Number(orderId) },
            data: {
                status,
                deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
                cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
                updatedAt: new Date(),
                history: {
                    create: {
                        status,
                        updatedBy: user.userid,
                        timestamp: new Date(),
                    },
                },
            },
            include: {
                history: true,
            },
        });

        return NextResponse.json({
            message: 'Order status updated',
            order: updatedOrder,
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
