import { Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, currency = 'usd', metadata } = req.body;
  const userId = req.user!.id;

  if (!amount || amount < 50) {
    throw new AppError('Invalid amount', 400);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: {
      userId,
      ...metadata,
    },
  });

  if (metadata?.courseId) {
    await prisma.payment.create({
      data: {
        userId,
        courseId: metadata.courseId,
        amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        stripePaymentId: paymentIntent.id,
      },
    });
  }

  res.json({ clientSecret: paymentIntent.client_secret });
});

export const createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items, successUrl, cancelUrl } = req.body;
  const userId = req.user!.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Items are required', 400);
  }

  const lineItems = await Promise.all(
    items.map(async (item: any) => {
      const course = await prisma.course.findUnique({
        where: { id: item.courseId },
      });

      if (!course) {
        throw new AppError(`Course ${item.courseId} not found`, 404);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: course.price,
        },
        quantity: 1,
      };
    })
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      courseIds: items.map((i: any) => i.courseId).join(','),
    },
  });

  res.json({ sessionId: session.id, url: session.url });
});

export const getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      course: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ payments });
});

export const refundPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.user!.id;

  const payment = await prisma.payment.findUnique({ where: { id } });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.userId !== userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  if (payment.status !== 'succeeded') {
    throw new AppError('Payment cannot be refunded', 400);
  }

  if (payment.stripePaymentId) {
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      amount: amount || payment.amount,
    });
  }

  await prisma.payment.update({
    where: { id },
    data: { status: 'refunded' },
  });

  res.json({ message: 'Refund processed successfully' });
});
