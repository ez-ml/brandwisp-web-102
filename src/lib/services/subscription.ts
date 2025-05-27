import { SubscriptionModel } from '@/lib/models/subscription';
import { PLANS, PlanTier, Subscription } from '@/types/subscription';
import * as stripeClient from '@/lib/stripe/client';

export class SubscriptionService {
  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    return await SubscriptionModel.getByUserId(userId);
  }

  static async initiateSubscription(userId: string, planTier: PlanTier): Promise<string> {
    const { url } = await stripeClient.createCheckoutSession(planTier);
    return url;
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripeClient.cancelSubscription();
    await SubscriptionModel.cancelSubscription(subscriptionId);
  }

  static async checkFeatureAccess(userId: string, feature: keyof typeof PLANS[PlanTier]['features']): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = PLANS[subscription.planId as PlanTier];
    return !!plan.features[feature];
  }

  static async checkResourceLimit(
    userId: string,
    resource: 'maxStores' | 'maxProducts',
    currentCount: number
  ): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = PLANS[subscription.planId as PlanTier];
    return currentCount < plan.features[resource];
  }

  static getPlanDetails(planTier: PlanTier) {
    return PLANS[planTier];
  }

  static async isSubscriptionActive(userId: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    return subscription?.status === 'active';
  }
} 