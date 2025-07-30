import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/verifyAuth';

export async function POST(req) {
  const user = verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, rating = 5, review = '' } = await req.json();

  const pid = Number(productId);
  const stars = Number(rating);

  if (!pid || Number.isNaN(pid) || !stars || stars < 1 || stars > 5) {
    return NextResponse.json(
      { error: 'Invalid product ID or rating' },
      { status: 400 }
    );
  }

  try {
    const newReview = await prisma.productReview.create({
      data: {
        productId: pid,
        userId: user.userid,
        rating: stars,
        review,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function DELETE(req) {
  const user = verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reviewId } = await req.json();
  const rid = Number(reviewId);

  if (!rid || Number.isNaN(rid)) {
    return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
  }

  try {
    const { count } = await prisma.productReview.deleteMany({
      where: { id: rid, userId: user.userid },
    });

    if (count === 0) {
      return NextResponse.json(
        { error: 'Review not found or not yours' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
