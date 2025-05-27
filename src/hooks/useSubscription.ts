import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SubscriptionService } from '@/lib/services/subscription';
import { Subscription, PlanTier, PLANS, PlanFeatures } from '@/types/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const sub = await SubscriptionService.getCurrentSubscription(user.uid);
        setSubscription(sub);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to fetch subscription details');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const changePlan = async (planTier: PlanTier) => {
    if (!user) {
      throw new Error('User must be logged in to change plan');
    }

    try {
      const checkoutUrl = await SubscriptionService.initiateSubscription(
        user.uid,
        planTier,
        subscription?.stripeCustomerId || ''
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Error changing plan:', err);
      throw new Error('Failed to initiate plan change');
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) {
      throw new Error('No active subscription to cancel');
    }

    try {
      await SubscriptionService.cancelSubscription(subscription.stripeSubscriptionId);
      setSubscription(prev => prev ? { ...prev, status: 'canceled' } : null);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      throw new Error('Failed to cancel subscription');
    }
  };

  const checkFeatureAccess = async (feature: keyof PlanFeatures) => {
    if (!user) return false;
    return await SubscriptionService.checkFeatureAccess(user.uid, feature);
  };

  return {
    subscription,
    loading,
    error,
    changePlan,
    cancelSubscription,
    checkFeatureAccess,
    isActive: subscription?.status === 'active',
  };
} 