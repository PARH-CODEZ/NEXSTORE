import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  const orderId = parseInt(params.orderId);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                images: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        customer: {
          select: {
            UserID: true,
            FullName: true,
            Email: true,
            PhoneNumber: true,
          },
        },
        payments: true,
        shipments: true,

        history: {
          orderBy: {
            timestamp: "asc", 
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
