import { buffer } from 'micro';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
});

export async function POST(req) {
    const rawBody = await req.arrayBuffer();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            Buffer.from(rawBody).toString(),
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = parseInt(session.metadata?.orderId);

        if (!orderId) {
            console.error('❌ No orderId in metadata');
            return new Response('orderId missing in metadata', { status: 400 });
        }

        try {
            // ✅ Update payment record
            await prisma.payment.updateMany({
                where: { orderId },
                data: {
                    status: 'SUCCESS',
                    transactionId: session.payment_intent ?? null,
                    paidAt: new Date(),
                },
            });

            // ✅ Update order and insert CONFIRMED into history + shipment
            await prisma.$transaction([
                prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'SUCCESS',
                        status: 'CONFIRMED',
                    },
                }),

                await prisma.orderStatusHistory.create({
                    data: {
                        orderId,
                        status: 'CONFIRMED',       // enum OrderStatus
                        note: 'Auto-confirmed after successful payment', // optional
                        updatedBy: null,           // optional (null if system-triggered)
                        timestamp: new Date(),     // optional since default(now()) is set
                    },
                }),
                ,

                prisma.shipment.create({
                    data: {
                        orderId,
                        courierName: 'To be assigned', // You can update later
                        status: 'PENDING',
                    },
                }),
            ]);

            console.log(`✅ Payment successful. Order #${orderId} updated.`);
        } catch (err) {
            console.error('❌ DB update error:', err);
            return new Response('DB update error', { status: 500 });
        }
    }

    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
        const session = event.data.object;
        const orderId = parseInt(session.metadata?.orderId);

        if (!orderId) {
            console.error('❌ No orderId in metadata');
            return new Response('orderId missing in metadata', { status: 400 });
        }

        try {
            // Delete order items
            await prisma.orderItem.deleteMany({
                where: { orderId },
            });

            // Delete payment record
            await prisma.payment.deleteMany({
                where: { orderId },
            });

            // Delete the order
            await prisma.order.delete({
                where: { id: orderId },
            });

            console.log(`🗑️ Deleted Order #${orderId} and all related data.`);
        } catch (err) {
            console.error('❌ Error deleting order and related data:', err);
            return new Response('Error cleaning up order', { status: 500 });
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
