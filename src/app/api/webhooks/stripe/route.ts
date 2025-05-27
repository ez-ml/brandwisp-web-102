import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { SubscriptionModel } from '@/lib/models/subscription';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error('No userId found in subscription metadata');
          break;
        }

        await SubscriptionModel.update(subscription.id, {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await SubscriptionModel.update(subscription.id, {
          status: 'canceled',
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await SubscriptionModel.update(invoice.subscription, {
            status: 'active',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await SubscriptionModel.update(invoice.subscription, {
            status: 'past_due',
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 