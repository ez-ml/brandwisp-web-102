"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { signInWithEmail, signInWithGoogle, signInWithFacebook, signInWithShopify } from '@/lib/firebase/auth';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { success, error, user } = await signInWithEmail(
        formData.email,
        formData.password
      );

      if (success && user) {
        // Store mock user in localStorage for development mode
        if (process.env.NODE_ENV === 'development') {
          localStorage.setItem('mockUser', JSON.stringify(user));
        }
        router.push('/dashboard');
      } else {
        setError(error || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'shopify') => {
    setIsLoading(true);
    setError('');

    try {
      const signInMethod = {
        google: signInWithGoogle,
        facebook: signInWithFacebook,
        shopify: signInWithShopify
      }[provider];

      const { success, error, user } = await signInMethod();

      if (success && user) {
        // Store mock user in localStorage for development mode
        if (process.env.NODE_ENV === 'development') {
          localStorage.setItem('mockUser', JSON.stringify(user));
        }
        router.push('/dashboard');
      } else {
        setError(error || `Error signing in with ${provider}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleSocialSignIn('google')}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleSocialSignIn('facebook')}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.945 22v-8.834H7V9.485h2.945V6.54c0-3.043 1.926-4.54 4.64-4.54 1.3 0 2.418.097 2.744.14v3.18h-1.883c-1.476 0-1.82.703-1.82 1.732v2.433h3.68l-.736 3.68h-2.944L13.685 22"></path>
          </svg>
          Continue with Facebook
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleSocialSignIn('shopify')}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.055-.121-.055l-.914 21.085h.023zm-11.25-11.37s-.676-.365-1.485-.803c-.809-.438-1.687-.91-1.687-.91s1.529-1.023 2.32-1.561c.79-.537 2.149-1.47 2.149-1.47s1.172-.056 1.879-.093c.708-.036 1.855-.092 1.855-.092s.186-2.196.28-3.328c.093-1.132.28-3.403.28-3.403L8.013 0s-.056.074-.13.167c-.056.074-1.297 1.615-1.297 1.615s-3.533.26-3.571.26c-.037.019-.093.074-.13.13C2.829 2.265 0 23.979 0 23.979l4.087-11.37zm2.32 7.784s1.669-.865 2.524-1.316l1.781-.926.504-6.03-1.227.167s-1.262 2.395-1.892 3.57c-.631 1.176-1.69 4.535-1.69 4.535zm8.699-19.962c-.057-.019-1.133-.074-1.133-.074s-.745-.745-.838-.82c-.093-.074-.13-.111-.13-.111s-.724.167-1.746.446c-1.021.279-2.507.671-2.507.671l-.26 3.106c.057 0 1.206.056 1.969.093.762.037 1.91.093 1.91.093s.186-2.196.279-3.329c.056-.502.13-1.58.167-2.345.019-.558.037-1.06.037-1.06s1.244.26 2.265.446c-.02 0-.015 2.884-.013 2.884z"></path>
          </svg>
          Continue with Shopify
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/90"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
} 