'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import { supabase } from '@/utils/supabase';
import { logger } from '@/utils/logger';
import LoadingIndicator from '@/components/LoadingIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const { session, loading: sessionLoading } = useSessionContext();
  const [email, setEmail] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && session) {
      logger.info(
        `User already logged in. Redirecting to /my-books`,
      );
      router.push('/my-books');
    }
  }, [session, sessionLoading, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      router.push(`/login/verify?email=${encodeURIComponent(email)}`);
    }
    setFormLoading(false);
  };

  // Render a loading state while session is being checked
  if (sessionLoading || session) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingIndicator size={50} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6 p-8 rounded-xl shadow-lg bg-white border border-gray-100">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold text-green-600">Login</h1>
          <p className="text-balance text-muted-foreground text-gray-600">
            Enter your email below to login to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOTP} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="sr-only">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={formLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={formLoading}>
            {formLoading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>
      </div>
    </div>
  );
}