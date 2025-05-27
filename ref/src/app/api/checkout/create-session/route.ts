import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
  const { planId, userId } = await req.json();

  const YOUR_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Sample product metadata — replace or fetch dynamically from DB
  const productDetails: Record<string, any> = {
    basic: { name: "Basic Plan", price: 500 },
    pro: { name: "Pro Plan", price: 1500 },
    premium: { name: "Premium Plan", price: 3000 },
  };

  const plan = productDetails[planId];

  if (!plan) {
    return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
          },
          unit_amount: plan.price, // in cents
          recurring: {
            interval: "month", // required for subscriptions!
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${YOUR_DOMAIN}/plan?success=true&plan=${planId}`,
    cancel_url: `${YOUR_DOMAIN}/pricing?cancelled=true`,
    metadata: {
      userId,
      planId,
    },
  });

  return NextResponse.json({ url: session.url });
}
