import { verifyAuth } from "@/lib/middleware/verifyAuth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    const user = verifyAuth(req);
    if (!user || user.role !== 'seller') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: { sellerId: user.id },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                items: {
                    where: { sellerId: user.id },
                    include: {
                        variant: {
                            select: {
                                id: true,
                                variantName: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        brand: true,
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
        });

        // Map and format the data to frontend structure
        const formattedOrders = orders.map((order, i) => {
            const item = order.items[0]; // Assuming one item per order for simplicity
            const productName = item?.variant?.product?.name || "Unknown Product";

            const customerName = `${order.shippingAddress?.firstName ?? "First"} ${order.shippingAddress?.lastName ?? "Last"}`;
            const email = order.shippingAddress?.email ?? "unknown@example.com";
            const phone = order.shippingAddress?.phoneNumber ?? "+91 00000 00000";
            const quantity = item?.quantity ?? 1;
            const status = order.status ?? "pending";
            const trackingNumber = order.shipments?.[0]?.trackingNumber ?? null;
            const amount = order.payments?.[0]?.amount?.toFixed(2) ?? "0.00";

            return {
                id: `ORD-${String(i + 1).padStart(6, '0')}`,
                customerName,
                email,
                phone,
                product: productName,
                quantity,
                amount,
                status,
                orderDate: new Date(order.createdAt).toISOString().split("T")[0],
                shippingAddress: `${order.shippingAddress?.addressLine1 ?? ""}, ${order.shippingAddress?.city ?? ""}, ${order.shippingAddress?.postalCode ?? ""}`,
                trackingNumber: ["shipped", "delivered"].includes(status) ? trackingNumber : null,
            };
        });

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}
