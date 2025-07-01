import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function DELETE(req, { params }) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = await Number(params.id);
    if (!addressId) {
      return NextResponse.json({ error: 'Missing or invalid address ID' }, { status: 400 });
    }

    await prisma.UserAddress.deleteMany({
      where: {
        AddressID: addressId,
        UserID: user.userid,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete address error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = params.id === 'new' ? null : Number(params.id);
    if (addressId !== null && (!Number.isInteger(addressId) || addressId <= 0)) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    const {
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      isDefault = false,
      addressType,
    } = await req.json();

    // If isDefault true, unset previous defaults for this user
    if (isDefault) {
      await prisma.UserAddress.updateMany({
        where: {
          UserID: user.userid,
          IsDefault: true,
        },
        data: { IsDefault: false },
      });
    }

    if (addressId === null) {
      // Create new address
      const newAddress = await prisma.UserAddress.create({
        data: {
          UserID: user.userid,
          AddressLine1: addressLine1,
          AddressLine2: addressLine2,
          City: city,
          State: state,
          PostalCode: zipCode,
          Country: country,
          IsDefault: isDefault,
          AddressType: addressType,
        },
      });
      return NextResponse.json({ success: true, addressId: newAddress.AddressID });
    } else {
      // Update existing address
      await prisma.UserAddress.updateMany({
        where: {
          AddressID: addressId,
          UserID: user.userid,
        },
        data: {
          AddressLine1: addressLine1,
          AddressLine2: addressLine2,
          City: city,
          State: state,
          PostalCode: zipCode,
          Country: country,
          IsDefault: isDefault,
          AddressType: addressType,
        },
      });
      return NextResponse.json({ success: true, addressId });
    }
  } catch (err) {
    console.error('Add/Update address error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
