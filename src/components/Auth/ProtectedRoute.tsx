'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute useEffect triggered', { user, loading, requireAuth });
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated, redirect to login
        console.log('Redirecting to login - user not authenticated');
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be (e.g., on login page)
        console.log('Redirecting to dashboard - user is authenticated');
        router.push('/dashboard');
      } else {
        // User state is correct, stop checking
        console.log('User state is correct, stopping checks');
        setIsChecking(false);
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-purple-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If we reach here and requireAuth is true, user is authenticated
  // If requireAuth is false, user is not authenticated (or we don't care)
  if (requireAuth && !user) {
    // This shouldn't happen due to the redirect above, but just in case
    return null;
  }

  if (!requireAuth && user) {
    // This shouldn't happen due to the redirect above, but just in case
    return null;
  }

  return <>{children}</>;
} 