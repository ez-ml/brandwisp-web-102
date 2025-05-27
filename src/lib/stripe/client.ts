import { PlanTier } from '@/types/subscription';
import { auth } from '@/lib/firebase';

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in');
  }
  return await user.getIdToken();
}

export async function createCheckoutSession(planTier: PlanTier) {
  const token = await getAuthToken();
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ planTier }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  return data;
}

export async function createPortalSession() {
  const token = await getAuthToken();
  const response = await fetch('/api/stripe/create-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create portal session');
  }

  return data;
}

export async function cancelSubscription() {
  const token = await getAuthToken();
  const response = await fetch('/api/stripe/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to cancel subscription');
  }

  return data;
} 