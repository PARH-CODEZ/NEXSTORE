import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, email, phone, password, businessName, gstNumber } = await req.json();

    if (!name || !phone || !password || !businessName || !gstNumber || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          FullName: name,
          Email: email,
          PasswordHash: hashed,
          PhoneNumber: phone,
          Role: 'seller',
        },
      });

      await tx.sellerProfile.create({
        data: {
          SellerID: user.UserID,
          BusinessName: businessName,
          GSTNumber: gstNumber,
        },
      });

      return user;
    });

    return NextResponse.json({ success: true, userId: createdUser.UserID });
  } catch (err) {
    console.error('register-seller error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
