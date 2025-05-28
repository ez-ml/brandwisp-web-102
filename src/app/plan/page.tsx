"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();

  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true') {
      toast.success('Successfully subscribed to the plan!');
      router.replace('/plan'); // Remove query params
    } else if (cancelled === 'true') {
      toast.error('Subscription process was cancelled');
      router.replace('/plan'); // Remove query params
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view subscription details</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Your Subscription</h1>
        
        {subscription ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">Status</h3>
                <p className={`text-sm ${subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/plans')}
              >
                Manage Plan
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Subscription Details</h3>
              <div className="space-y-2 text-sm">
                <p>Plan ID: {subscription.planId}</p>
                <p>Started: {new Date(subscription.currentPeriodStart).toLocaleDateString()}</p>
                <p>Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-red-600">
                    Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => router.push('/plans')}
              >
                Change Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-600">You don't have an active subscription</p>
            <Button
              onClick={() => router.push('/plans')}
            >
              View Plans
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
} 