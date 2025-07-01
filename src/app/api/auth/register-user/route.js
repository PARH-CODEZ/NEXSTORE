// app/api/auth/register-user/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, email = null, phone, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        FullName: name,
        Email: email,
        PasswordHash: hashed,
        PhoneNumber: phone,
        Role: 'customer',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('register-user error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
