import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'ZZZZZZZZZZZZ';

export async function POST(req) {
  try {
    const { email, phone, password } = await req.json();

    if ((!email && !phone) || !password) {
      return NextResponse.json({ error: 'Missing login fields' }, { status: 400 });
    }

    // Find user by email or phone using Prisma
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { Email: email } : undefined,
          phone ? { PhoneNumber: phone } : undefined,
        ].filter(Boolean),
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT payload
    const tokenPayload = {
      userid: user.UserID,
      role: user.Role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    console.log('Generated token:', token);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.UserID,
        name: user.FullName,
        email: user.Email,
        phone: user.PhoneNumber,
        role: user.Role,
      },
    });

    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    );

    return response;
  } catch (err) {
    console.error('login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
