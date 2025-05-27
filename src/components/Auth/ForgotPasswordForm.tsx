"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '@/lib/firebase/auth';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { success, error } = await resetPassword(email);

      if (success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(error || 'Failed to send reset email');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-sm text-gray-600">
          We've sent you an email with a link to reset your password.
          Please check your inbox and follow the instructions.
        </div>
        <Button asChild variant="outline">
          <Link href="/login">
            Return to login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>

        <Button asChild variant="outline">
          <Link href="/login">
            Back to login
          </Link>
        </Button>
      </div>
    </form>
  );
} 