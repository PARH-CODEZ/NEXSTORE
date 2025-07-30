import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET ;

export async function GET(req) {
  try {
    const cookie = req.headers.get('cookie') ?? '';
    const token = cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { userid } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { UserID: userid },
      select: {
        UserID: true,
        FullName: true,
        Email: true,
        PhoneNumber: true,
        Role: true,
        IsActive: true,
      },
    });

    if (!user || !user.IsActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.UserID,
        name: user.FullName,
        email: user.Email,
        phone: user.PhoneNumber,
        role: user.Role,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
