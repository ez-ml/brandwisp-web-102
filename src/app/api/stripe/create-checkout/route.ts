import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { createOrRetrieveCustomer } from '@/lib/stripe/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { PLANS, PlanTier } from '@/types/subscription';

export async function POST(req: NextRequest) {
  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Initialize Firebase Admin and verify token
    try {
      const auth = getAuth(getFirebaseAdmin());
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      const { planTier } = await req.json() as { planTier: PlanTier };
      if (!planTier) {
        return NextResponse.json({ error: 'Plan tier is required' }, { status: 400 });
      }

      // Validate plan tier and get Stripe price ID
      const plan = PLANS[planTier];
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
      }

      if (!plan.stripePriceId) {
        return NextResponse.json(
          { error: 'Stripe price ID not configured for this plan' },
          { status: 500 }
        );
      }

      // Get or create Stripe customer
      const user = await auth.getUser(userId);
      const customer = await createOrRetrieveCustomer(
        userId,
        user.email!,
        user.displayName || undefined
      );

      const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL!;
      const session = await createCheckoutSession(customer.id, planTier, {
        successUrl: `${baseUrl}/plans?success=true&plan=${planTier}`,
        cancelUrl: `${baseUrl}/plans?cancelled=true`,
      });

      return NextResponse.json({ url: session.url });
    } catch (firebaseError) {
      console.error('Firebase Admin error:', firebaseError);
      return NextResponse.json(
        { error: 'Authentication failed. Please check your Firebase configuration.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 