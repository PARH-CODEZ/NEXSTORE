import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/verifyAuth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized Request' }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: {
        SellerID: user.userid,
      },
      select: {
        BusinessName: true,
        GSTNumber: true,
        TotalOrders: true,
        TotalProducts: true,
        Rating: true,
      },
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    return NextResponse.json(sellerProfile);

  } catch (err) {
    console.error('seller profile fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
