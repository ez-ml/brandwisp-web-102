'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

import SiteHeader from "../../components/SiteHeader";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleLogin = async () => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Block if not verified
      if (!user.emailVerified) {
        await signOut(auth);
        setError('Please verify your email first. Check your inbox.');
        return;
      }

      // ✅ Proceed if verified
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        alert('Verification email sent again! Please check your inbox.');
      } else {
        alert('Your email is already verified.');
      }

      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
      {/* Header */}
     <SiteHeader/>

      {/* Login Form */}
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Sign In to BrandWisp</h1>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded font-semibold transition"
          >
            Sign In
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            New here?{' '}
            <Link href="/register" className="text-purple-700 font-semibold">Create Account</Link>
          </p>

          <p className="mt-2 text-center text-sm text-gray-500">
            Didn't get email?{' '}
            <button
              onClick={handleResendVerification}
              className="text-purple-700 font-semibold"
              disabled={sendingVerification}
            >
              {sendingVerification ? 'Sending...' : 'Resend Verification'}
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6 text-sm">
        © {new Date().getFullYear()} BrandWisp. All rights reserved.
      </footer>
    </div>
  );
}
