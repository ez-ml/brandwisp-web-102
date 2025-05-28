"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS, PlanTier } from '@/types/subscription';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true') {
      toast.success('Successfully subscribed to the plan!');
      router.replace('/plans');
    } else if (cancelled === 'true') {
      toast.error('Subscription process was cancelled');
      router.replace('/plans');
    }
  }, [searchParams, router]);

  const handleSubscribe = async (planTier: PlanTier) => {
    try {
      if (!user) {
        router.push('/login');
        return;
      }

      setProcessingPlanId(planTier);

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ planTier }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to initiate subscription');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      if (!user || !subscription) return;

      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      router.refresh();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </MainLayout>
    );
  }

  const plans = Object.values(PLANS);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-[#F6F2FF] to-[#F9F6FF] rounded-[2rem] shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-10">
            {subscription ? 'Your Current Plan & Upgrade Options' : 'Choose the Plan that Fits You'}
          </h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrent = subscription?.planId === plan.id;
              const isProcessing = processingPlanId === plan.tier;

              return (
                <Card 
                  key={plan.id}
                  className={`p-6 flex flex-col border-2 transition-all duration-300 ${
                    isCurrent ? 'border-green-500 shadow-green-100' : 
                    plan.tier === 'standard' ? 'border-purple-200 bg-purple-50' : ''
                  }`}
                >
                  {plan.tier === 'standard' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</span>
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-bold mb-2 text-purple-600">{plan.name}</h2>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold mb-6">
                    ${plan.price}<span className="text-lg text-gray-500">/mo</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Up to {plan.features.maxStores} stores
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      Up to {plan.features.maxProducts} products
                    </li>
                    {plan.features.analytics && (
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Advanced Analytics
                      </li>
                    )}
                    {plan.features.automatedSync && (
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Automated Sync
                      </li>
                    )}
                    {plan.features.customBranding && (
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Custom Branding
                      </li>
                    )}
                    {plan.features.prioritySupport && (
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Priority Support
                      </li>
                    )}
                    {plan.features.apiAccess && (
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        API Access
                      </li>
                    )}
                  </ul>

                  {isCurrent ? (
                    <div className="space-y-3">
                      <div className="text-green-600 text-center font-semibold">
                        Your Current Plan
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-red-500 border-red-200 hover:bg-red-50"
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.tier === 'standard' ? 'bg-purple-600 hover:bg-purple-700' : ''
                      }`}
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Get Started'
                      )}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 