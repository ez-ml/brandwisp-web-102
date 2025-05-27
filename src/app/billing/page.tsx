"use client";

import { PLANS } from '@/types/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingPage() {
  const { subscription, loading, error, changePlan, cancelSubscription } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  const handlePlanChange = async (planId: string) => {
    try {
      await changePlan(planId as any); // Type assertion needed as planId is from PLANS
    } catch (err) {
      toast.error('Failed to change plan. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      toast.success('Subscription cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel subscription. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <Card key={plan.id} className={
            subscription?.planId === plan.id
              ? 'border-purple-600'
              : ''
          }>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>

              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Up to {plan.features.maxStores} stores</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Up to {plan.features.maxProducts} products</span>
                </li>
                {plan.features.analytics && (
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    <span>Advanced Analytics</span>
                  </li>
                )}
                {plan.features.automatedSync && (
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    <span>Automated Sync</span>
                  </li>
                )}
                {plan.features.customBranding && (
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    <span>Custom Branding</span>
                  </li>
                )}
                {plan.features.prioritySupport && (
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    <span>Priority Support</span>
                  </li>
                )}
                {plan.features.apiAccess && (
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    <span>API Access</span>
                  </li>
                )}
              </ul>
            </CardContent>

            <CardFooter>
              {subscription?.planId === plan.id ? (
                <div className="w-full space-y-2">
                  <p className="text-sm text-center text-purple-600 font-medium">Current Plan</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handlePlanChange(plan.id)}
                >
                  {subscription ? 'Switch Plan' : 'Subscribe'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 