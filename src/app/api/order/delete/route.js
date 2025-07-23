import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orderId, orderItemId } = await req.json();

    const numericOrderId = Number(orderId);
    const numericOrderItemId = Number(orderItemId);

    if (!numericOrderId || !numericOrderItemId) {
      return NextResponse.json(
        { error: "Missing or invalid orderId or orderItemId" },
        { status: 400 }
      );
    }

    console.log("🔎 Cancel request:", { numericOrderId, numericOrderItemId });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: numericOrderItemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.orderId !== numericOrderId) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    if (orderItem.order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Order already cancelled" },
        { status: 400 }
      );
    }

    await prisma.orderItem.delete({ where: { id: numericOrderItemId } });

    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: numericOrderId },
    });

    if (remainingItems.length === 0) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: numericOrderId },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        }),

        prisma.orderStatusHistory.create({
          data: {
            orderId: numericOrderId,
            status: "CANCELLED",
            note: "Cancelled due to all items being removed",
            updatedBy: null, 
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Cancel Item Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
