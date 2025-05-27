export type PlanTier = 'basic' | 'standard' | 'premium';

export interface PlanFeatures {
  maxStores: number;
  maxProducts: number;
  analytics: boolean;
  automatedSync: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: PlanFeatures;
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Predefined plans
export const PLANS: Record<PlanTier, Plan> = {
  basic: {
    id: 'basic',
    tier: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started',
    price: 29,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || '',
    features: {
      maxStores: 1,
      maxProducts: 100,
      analytics: false,
      automatedSync: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  standard: {
    id: 'standard',
    tier: 'standard',
    name: 'Standard',
    description: 'Great for growing businesses',
    price: 79,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || '',
    features: {
      maxStores: 3,
      maxProducts: 1000,
      analytics: true,
      automatedSync: true,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  premium: {
    id: 'premium',
    tier: 'premium',
    name: 'Premium',
    description: 'For power users and large enterprises',
    price: 199,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
    features: {
      maxStores: 10,
      maxProducts: 10000,
      analytics: true,
      automatedSync: true,
      customBranding: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
}; 