import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { cancelSubscription } from '@/lib/stripe/server';
import { SubscriptionModel } from '@/lib/models/subscription';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth(getFirebaseAdmin()).verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get current subscription
    const subscription = await SubscriptionModel.getByUserId(userId);
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Update in database
    await SubscriptionModel.cancelSubscription(subscription.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 