import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { Email: email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { Email: email },
      data: { PasswordHash: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('change-password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
