import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email = '', phone = '' } = await request.json();

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { Email: email } : undefined,
          phone ? { PhoneNumber: phone } : undefined,
        ].filter(Boolean),
      },
      select: {
        Role: true,
        PhoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    const isCustomer = user.Role === 'customer';

    return NextResponse.json({
      exists: true,
      role: user.Role,
      isCustomer,
      phoneNumber: user.PhoneNumber,
    });
  } catch (error) {
    console.error('check-user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
