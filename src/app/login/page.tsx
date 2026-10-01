'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Shield, User, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, switchDemoRole } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const res = await signUp(email, password, fullName);
      if (res.error) {
        setError(res.error.message || 'Error signing up');
      } else {
        setMessage('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } else {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message || 'Invalid login credentials');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  const handleQuickDemo = (role: 'customer' | 'admin') => {
    switchDemoRole(role);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const res = await signInWithGoogle();
    if (res?.error) {
      setError(res.error.message || 'Error signing in with Google');
      setLoading(false);
    } else if (res?.redirected) {
      return;
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center mx-auto shadow-sm overflow-hidden p-2">
            <img src="/logo.png" alt="BookNest" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            {isSignUp ? 'Create your BookNest Account' : 'Welcome back to BookNest'}
          </h1>
          <p className="text-xs text-stone-500">
            {isSignUp
              ? 'Join to buy books or rent titles with protected deposits.'
              : 'Sign in to access your active rentals, due dates, and orders.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {message}
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-3 transition shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
            Or with email
          </span>
          <div className="border-t border-stone-200 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isSignUp && (
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Reader"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="reader@booknest.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isSignUp ? (
              <span>Create Account</span>
            ) : (
              <span>Sign In with Email</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
          </button>
        </div>

        {/* Instant Demo Switcher for Evaluators */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <span className="text-[11px] text-stone-400 block text-center uppercase tracking-wider font-semibold">
            One-Click Instant Preview
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-center gap-1.5 font-medium text-stone-700"
            >
              <User className="w-3.5 h-3.5 text-amber-600" /> Demo Reader
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-indigo-50 flex items-center justify-center gap-1.5 font-medium text-indigo-700"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" /> Store Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
