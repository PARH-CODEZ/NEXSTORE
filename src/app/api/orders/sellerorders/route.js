import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware/verifyAuth";

export async function GET(req) {
  const user = verifyAuth(req);
  if (!user || user.role !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  console.log("Incoming seller orders request");
  console.log("Parsed page and limit:", page, limit);
  console.log("User after verifyAuth:", user);

  const offset = (page - 1) * limit;

  try {
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          items: {
            some: { sellerId: user.id },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
        include: {
          items: {
            where: { sellerId: user.id },
            include: {
              variant: {
                select: {
                  variantName: true,
                  product: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
          payments: true,
          shipments: true,
        },
      }),
      prisma.order.count({
        where: {
          items: {
            some: { sellerId: user.id },
          },
        },
      }),
    ]);

    const formattedOrders = orders.map((order) => {
      const products = order.items.map((item) => ({
        title: item.variant.product.title ?? "Unknown Title",
        variantName: item.variant.variantName ?? "Default Variant",
      }));

      const customerName =
        order.shippingAddress?.fullName ?? "Unknown Customer";
      const phone = order.shippingAddress?.phoneNumber ?? "+91 00000 00000";
      const quantity = order.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const status = order.status ?? "PENDING";
      const trackingNumber = order.shipments?.[0]?.trackingNumber ?? null;
      const amount = order.payments?.[0]?.amount?.toFixed(2) ?? "0.00";
      const paymentStatus = order.paymentStatus ?? "PENDING";


      return {
        id: order.id,
        customerName,
        phone,
        products,
        quantity,
        amount,
        status,
        paymentStatus, 
        orderDate: new Date(order.createdAt).toISOString().split("T")[0],
        shippingAddress: `${order.shippingAddress?.addressLine1 ?? ""}, ${order.shippingAddress?.city ?? ""
          }, ${order.shippingAddress?.postalCode ?? ""}`,
        trackingNumber:
          ["SHIPPED", "DELIVERED"].includes(status) ? trackingNumber : null,
      };
    });


    return NextResponse.json({
      orders: formattedOrders,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
