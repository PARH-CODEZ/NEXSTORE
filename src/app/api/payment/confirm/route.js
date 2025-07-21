import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.payments || order.payments.length === 0) {
      return NextResponse.json({ error: "No payment record found" }, { status: 400 });
    }

    const sessionId = order.payments[0].providerOrderId;

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      return NextResponse.json({ error: "Invalid Stripe session ID" }, { status: 500 });
    }

    if (session.payment_status === "paid") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "SUCCESS",
          status: "CONFIRMED",
          payments: {
            update: {
              where: { id: order.payments[0].id },
              data: {
                status: "SUCCESS",
                paidAt: new Date(),
                transactionId: session.payment_intent?.toString() ?? null,
              },
            },
          },
        },
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

  } catch (err) {
    console.error("Error in payment confirmation:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
