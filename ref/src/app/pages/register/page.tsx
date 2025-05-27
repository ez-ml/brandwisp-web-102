'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      alert('Registration successful! Please verify your email before logging in.');
      router.push('//login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative flex items-center justify-center font-sans">
      {/* BrandWisp Header */}
      

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Create Your Account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 mb-4 rounded">{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-purple-700 text-white rounded px-4 py-3 font-semibold hover:bg-purple-800 transition"
        >
          Register
        </button>

        <p className="text-sm text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="//login" className="text-purple-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>

     
    </div>
  );
}
