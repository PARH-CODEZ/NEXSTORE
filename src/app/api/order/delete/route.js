import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    /* ── 1. Read and validate body ─────────────────────────────── */
    const { orderId, orderItemId } = await req.json();

    // Cast to numbers because JSON strings ≠ Prisma Ints
    const numericOrderId     = Number(orderId);
    const numericOrderItemId = Number(orderItemId);

    if (!numericOrderId || !numericOrderItemId) {
      return NextResponse.json(
        { error: "Missing or invalid orderId or orderItemId" },
        { status: 400 }
      );
    }

    console.log("🔎  Cancel request:", { numericOrderId, numericOrderItemId });

    /* ── 2. Fetch order item and verify ownership ──────────────── */
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

    /* ── 3. Delete (or flag) the item ──────────────────────────── */
    await prisma.orderItem.delete({ where: { id: numericOrderItemId } });

    /* ── 4. If no items remain, cancel the whole order ─────────── */
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: numericOrderId },
    });

    if (remainingItems.length === 0) {
      await prisma.order.update({
        where: { id: numericOrderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });
    }

    /* ── 5. Respond OK ──────────────────────────────────────────── */
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Cancel Item Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
