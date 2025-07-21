import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/checkout/stripe
export async function POST(req) {
    try {
        const { items, userId, addressId } = await req.json();

        if (!items || !userId || !addressId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch the user’s address from saved addresses
        const userAddress = await prisma.userAddress.findUnique({
            where: { AddressID: addressId },
        });

        if (!userAddress) {
            return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
        }

        // ✅ 1.5: Fetch the user to get phone number
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

        // 2. Clone address into OrderAddress for historical consistency
        const orderAddress = await prisma.orderAddress.create({
            data: {
                fullName: user.FullName || "N/A",
                phoneNumber: user.PhoneNumber || "0000000000", // ✅ correct source
                addressLine1: userAddress.AddressLine1,
                addressLine2: userAddress.AddressLine2 || "",
                city: userAddress.City,
                state: userAddress.State || "",
                postalCode: userAddress.PostalCode,
                country: userAddress.Country,
            },
        });


        // 3. Prepare items: fetch variant info, calculate final prices
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
                };
            })
        );

        // 4. Calculate total order pricing
        const subtotal = itemsWithPrices.reduce((acc, item) => acc + item.totalPrice, 0);
        const shippingFee = 0; // Update if you introduce shipping logic
        const totalPrice = subtotal + shippingFee;

        // 5. Create Order in DB
        const order = await prisma.order.create({
            data: {
                userId,
                shippingAddressId: orderAddress.id,
                billingAddressId: orderAddress.id,
                shippingFee: new Prisma.Decimal(shippingFee),
                subtotal: new Prisma.Decimal(subtotal),
                totalAmount: new Prisma.Decimal(totalPrice),
                paymentMethod: "card",
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
                        method: "card",
                    },
                },
            },
        });

        // 6. Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: itemsWithPrices.map((item) => ({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.variantName,
                    },
                    unit_amount: Math.round(Number(item.price)) * 100, // ₹ to paise, no decimals

                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            metadata: {
                orderId: order.id.toString(),
                userId: userId.toString(),
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
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
