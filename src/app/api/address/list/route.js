import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/verifyAuth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized Request' }, { status: 401 });
    }

    const addresses = await prisma.UserAddress.findMany({
      where: {
        UserID: user.userid,
      },
      select: {
        AddressID: true,
        AddressLine1: true,
        AddressLine2: true,
        City: true,
        State: true,
        PostalCode: true,
        Country: true,
        IsDefault: true,
        AddressType: true,
      },
    });

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('address list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
