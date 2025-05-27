"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import CommonLayout from '@/app/components/CommonLayout';
import Link from 'next/link';

const plans = [
  {
    plan_id: 'basic',
    name: 'Basic Plan',
    price_monthly: 10,
    price_yearly: 100,
    features: ['SEO Score', 'AutoBlogGen Lite'],
  },
  {
    plan_id: 'pro',
    name: 'Pro Plan',
    price_monthly: 25,
    price_yearly: 250,
    features: ['All Basic Features', 'ProductPulse', 'AutoBlogGen Advanced'],
  },
  {
    plan_id: 'enterprise',
    name: 'Enterprise Plan',
    price_monthly: 50,
    price_yearly: 500,
    features: ['All Pro Features', 'Multi-Store Insights', 'Custom Workflows'],
  },
];

export default function PricingPage() {
  return (
    <CommonLayout>
      <div className="bg-gradient-to-br from-[#F6F2FF] to-[#F9F6FF] rounded-[2rem] shadow-xl p-6 w-full max-w-7xl transition-all duration-500">
        <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
          <PricingPageContent />
        </Suspense>
      </div>
    </CommonLayout>
  );
}

function PricingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const success = searchParams.get('success');
      const plan = searchParams.get('plan');

      if (success === 'true' && plan) {
        try {
          const insertRes = await fetch('/api/subscriptions/insert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              plan_id: plan,
              provider_customer_id: 'stripe-mock-customer',
              provider_subscription_id: 'stripe-mock-subscription',
            }),
          });

          const insertData = await insertRes.json();
          if (insertRes.ok) {
            setCurrentPlanId(plan);
            setStatus('active');
            router.replace('/pages/plan');
          } else {
            console.error('❌ Insert failed:', insertData);
          }
        } catch (err) {
          console.error('❌ Error during insert:', err);
        }
      }

      try {
        const res = await fetch('/api/subscriptions/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok && data.subscription) {
          if (data.subscription.status !== 'cancelled') {
            setCurrentPlanId(data.subscription.plan_id);
            setStatus(data.subscription.status);
          } else {
            setCurrentPlanId(null);
            setStatus('cancelled');
          }
        }
      } catch (err) {
        console.error('❌ Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [searchParams]);

  const handleChoosePlan = async (planId: string) => {
    const res = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleCancel = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentPlanId(null);
        setStatus('cancelled');
      } else {
        console.error('❌ Cancel failed:', data);
      }
    } catch (err) {
      console.error('❌ Cancel error:', err);
    }
  };

  return (
    <div className="text-[#1E293B] px-6 pt-4">
      <h1 className="text-4xl font-bold text-center mb-10">
        {currentPlanId ? 'Your Current Plan & Upgrade Options' : 'Choose the Plan that Fits You'}
      </h1>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isCurrent = plan.plan_id === currentPlanId;
            return (
              <motion.div
                key={plan.plan_id}
                className={`bg-white border ${
                  isCurrent ? 'border-green-600' : 'border-purple-200'
                } p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-purple-600">{plan.name}</h2>
                <p className="text-lg mb-2">${plan.price_monthly}/month</p>
                <p className="text-sm text-gray-500 mb-4">or ${plan.price_yearly}/year</p>
                <ul className="mb-6 space-y-2 text-sm text-gray-700">
                  {plan.features.map((f, idx) => (
                    <li key={idx}>✔ {f}</li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-green-600 text-center font-semibold text-sm">
                      Your Current Plan
                    </div>
                    <button
                      onClick={handleCancel}
                      className="bg-transparent text-red-500 border border-red-400 hover:bg-red-500 hover:text-white transition-colors px-4 py-1 rounded text-xs font-medium"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleChoosePlan(plan.plan_id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full font-semibold"
                  >
                    {currentPlanId ? 'Switch to this Plan' : 'Choose Plan'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
