import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SubscriptionModel } from '@/lib/models/subscription';
import { PLANS, PlanTier } from '@/types/subscription';

export async function checkSubscriptionAccess(
  userId: string,
  feature: keyof typeof PLANS[PlanTier]['features']
): Promise<boolean> {
  const subscription = await SubscriptionModel.getByUserId(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = PLANS[subscription.planId as PlanTier];
  return plan.features[feature] === true;
}

export async function checkStoreLimit(userId: string): Promise<boolean> {
  const subscription = await SubscriptionModel.getByUserId(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = PLANS[subscription.planId as PlanTier];
  
  // TODO: Get actual store count from StoreModel
  const currentStoreCount = 0;
  return currentStoreCount < plan.features.maxStores;
}

export async function checkProductLimit(userId: string): Promise<boolean> {
  const subscription = await SubscriptionModel.getByUserId(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = PLANS[subscription.planId as PlanTier];
  
  // TODO: Get actual product count
  const currentProductCount = 0;
  return currentProductCount < plan.features.maxProducts;
}

export async function middleware(request: NextRequest) {
  // TODO: Get actual user ID from session/token
  const userId = 'test-user';

  // Protected routes that require subscription
  const protectedRoutes = {
    '/api/analytics': 'analytics',
    '/api/sync': 'automatedSync',
    '/api/branding': 'customBranding',
    '/api/support': 'prioritySupport',
    '/api/v1': 'apiAccess',
  } as const;

  const path = request.nextUrl.pathname;
  const requiredFeature = protectedRoutes[path as keyof typeof protectedRoutes];

  if (requiredFeature) {
    const hasAccess = await checkSubscriptionAccess(userId, requiredFeature);
    
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Subscription required',
          message: `This feature requires a subscription plan with ${requiredFeature} access`,
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
} 