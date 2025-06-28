'use client';

import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { useRouter } from 'next/navigation';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface OtpVerificationProps {
  email: string;
  onBack: () => void;
  supabase: SupabaseClient;
}

export default function OtpVerification({
  email,
  onBack,
  supabase,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    logger.info('Verifying OTP for email:', { email });
    const { error: verificationError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verificationError) {
      setError(verificationError.message);
      logger.error('OTP Verification Failed', {
        error: verificationError.message,
      });
    } else {
      logger.success('OTP Verification successful. Redirecting...');
      router.push('/my-books'); // On success, redirect to the main app
    }
    setLoading(false);
  };

  return (
    <div className="grid gap-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleVerifyOTP} className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="otp" className="sr-only">
            Verification Code
          </label>
          <Input
            id="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
      <Button variant="link" onClick={onBack} disabled={loading}>
        Use a different email
      </Button>
    </div>
  );
}