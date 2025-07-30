import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET ;

export async function PUT(req) {
  try {

    const cookie = req.headers.get('cookie') ?? '';
    const token = cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { userid } = jwt.verify(token, JWT_SECRET);
    const { name, email, phone } = await req.json();
    const updateData = {};
    if (name) updateData.FullName = name;
    if (email) updateData.Email = email;
    if (phone) updateData.PhoneNumber = phone;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data provided to update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { UserID: userid },
      data: updateData,
      select: {
        FullName: true,
        Email: true,
        PhoneNumber: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated',
      user: {
        id: updatedUser.UserID,
        name: updatedUser.FullName,
        email: updatedUser.Email,
        phone: updatedUser.PhoneNumber,
        role: updatedUser.Role,
      },
    });
  } catch (err) {
    console.error('update-user error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
