import { verifyAuth } from "@/lib/middleware/verifyAuth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    const user = await verifyAuth(req);

    if (!user || user.role !== 'customer') {
        return new Response(null, { status: 204 }); 
    }


    const cartItemCount = await prisma.cartItem.count({
        where: {
            cart: {
                userId: user.userid,
            },
        },
    });

    return NextResponse.json({ cartItemCount }, { status: 200 });
}
