// /app/api/auth/me/route.ts (or .js)
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'ZZZZZZZZZZZZ';

export async function GET(req) {
  try {
    // 1. Read token from HttpOnly cookie
    const cookie = req.headers.get('cookie') ?? '';
    const token = cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Verify & extract userid
    const { userid } = jwt.verify(token, JWT_SECRET);

    // 3. Fetch fresh user data from Prisma
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

    // 4. Return safe user object (rename fields if you want)
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
