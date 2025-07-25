import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// POST /api/checkout/cod
export async function POST(req) {
    try {
        const { items, userId, addressId } = await req.json();

        if (!items || !userId || !addressId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch user address
        const userAddress = await prisma.userAddress.findUnique({
            where: { AddressID: addressId },
        });

        if (!userAddress) {
            return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
        }

        // 2. Fetch user details
        const user = await prisma.user.findUnique({
            where: { UserID: userId },
            select: {
                FullName: true,
                PhoneNumber: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        // 3. Clone address into OrderAddress
        const orderAddress = await prisma.orderAddress.create({
            data: {
                fullName: user.FullName || "N/A",
                phoneNumber: user.PhoneNumber || "0000000000",
                addressLine1: userAddress.AddressLine1,
                addressLine2: userAddress.AddressLine2 || "",
                city: userAddress.City,
                state: userAddress.State || "",
                postalCode: userAddress.PostalCode,
                country: userAddress.Country,
            },
        });

        // 4. Prepare items with prices
        const itemsWithPrices = await Promise.all(
            items.map(async (item) => {
                const variant = await prisma.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true },
                });

                if (!variant) {
                    throw new Error("Invalid variantId: " + item.variantId);
                }

                const basePrice = parseFloat(variant.product.price) + parseFloat(variant.additionalPrice || 0);
                const discountPercent = variant.product.discountPercent || 0;
                const finalPrice = getDiscountedPrice(basePrice, discountPercent);

                return {
                    ...item,
                    price: finalPrice,
                    totalPrice: finalPrice * item.quantity,
                    productId: variant.productId,
                    variantName: variant.variantName || variant.product.name,
                    sellerId: variant.product.sellerId,
                };
            })
        );

        // 5. Calculate totals
        const subtotal = itemsWithPrices.reduce((acc, item) => acc + item.totalPrice, 0);
        const shippingFee = 0;
        const totalPrice = subtotal + shippingFee;

        // 6. Create order with payment method COD
        const order = await prisma.order.create({
            data: {
                userId,
                shippingAddressId: orderAddress.id,
                billingAddressId: orderAddress.id,
                shippingFee: new Prisma.Decimal(shippingFee),
                subtotal: new Prisma.Decimal(subtotal),
                totalAmount: new Prisma.Decimal(totalPrice),
                paymentMethod: "cod",
                paymentStatus: "PENDING",
                status: "CONFIRMED",
                items: {
                    create: itemsWithPrices.map((item) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: new Prisma.Decimal(item.price),
                        totalPrice: new Prisma.Decimal(item.totalPrice),
                        sellerId: item.sellerId,
                    })),
                },
                payments: {
                    create: {
                        amount: new Prisma.Decimal(totalPrice),
                        status: "PENDING",
                        method: "cod",
                    },
                },
            },
        });

        // Now create order status history and shipment in parallel
        await Promise.all([
            prisma.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: 'CONFIRMED',
                    note: 'Auto-confirmed after COD order placement',
                    updatedBy: null,
                },
            }),
            prisma.shipment.create({
                data: {
                    orderId: order.id,
                    courierName: 'To be assigned',
                    status: 'PENDING',
                },
            }),
        ]);


        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error) {
        console.error("COD Checkout Error:", error);
        return NextResponse.json(
            { error: "Something went wrong", details: error.message },
            { status: 500 }
        );
    }
}

// Utility to calculate final price after discount
function getDiscountedPrice(price, discountPercent) {
    if (!discountPercent || discountPercent <= 0) return price;
    const discountAmount = (price * discountPercent) / 100;
    return parseFloat((price - discountAmount).toFixed(2));
}
