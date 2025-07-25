import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

const STATUS_FLOW = [
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
  const user = await verifyAuth(req);

  if (!user || !user.userid) {
    return NextResponse.json({ error: 'Unauthorized or missing user ID' }, { status: 401 });
  }

  if (!orderId || isNaN(Number(orderId))) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  const body = await req.json();
  const { status } = body;

  if (!status || !STATUS_FLOW.includes(status)) {
    return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
  }

  try {
    // ✅ Check if the seller is involved in the order
    const sellerOrder = await prisma.orderItem.findFirst({
      where: {
        orderId: Number(orderId),
        sellerId: user.id,
      },
    });

    if (!sellerOrder) {
      return NextResponse.json({ error: 'Unauthorized for this order' }, { status: 403 });
    }

    const now = new Date();

    // ✅ Get existing history statuses
    const existingHistory = await prisma.orderStatusHistory.findMany({
      where: { orderId: Number(orderId) },
      select: { status: true },
    });

    const existingSet = new Set(existingHistory.map((h) => h.status));

    const newStatusIndex = STATUS_FLOW.indexOf(status);

    // ✅ Add all previous missing statuses (till current one)
    const missingStatuses = STATUS_FLOW
      .slice(0, newStatusIndex + 1)
      .filter((s) => !existingSet.has(s));

    const historyEntries = missingStatuses.map((s) => ({
      orderId: Number(orderId),
      status: s,
      updatedBy: user.userid,
      timestamp: now,
    }));

    // ✅ Transaction: update order + insert all missing history entries
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: Number(orderId) },
        data: {
          status,
          deliveredAt: status === 'DELIVERED' ? now : undefined,
          cancelledAt: status === 'CANCELLED' ? now : undefined,
          updatedAt: now,
        },
      }),
      prisma.orderStatusHistory.createMany({
        data: historyEntries,
        skipDuplicates: true,
      }),
    ]);

    // ✅ Return updated order with full history
    const fullOrder = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        history: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: fullOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
