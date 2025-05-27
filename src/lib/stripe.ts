import Stripe from 'stripe';
import { PLANS, PlanTier } from '@/types/subscription';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
});

interface CheckoutURLs {
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckoutSession(
  customerId: string,
  planTier: PlanTier,
  urls: CheckoutURLs
) {
  const plan = PLANS[planTier];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: urls.successUrl,
    cancel_url: urls.cancelUrl,
  });

  return session;
}

export async function createStripePortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
  name?: string
) {
  // Check if customer already exists
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer;
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.resume(subscriptionId);
} 