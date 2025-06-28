'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OtpVerification from '@/components/OtpVerification'; // Updated path
import { supabase } from '@/utils/supabase';

// The actual page content needs to be wrapped in Suspense for useSearchParams to work
function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6 p-8 rounded-xl shadow-lg bg-white border border-gray-100">
        <div className="grid gap-2 text-center">
          <h1 className="text-2xl font-bold text-green-600">Check your email</h1>
          <p className="text-balance text-muted-foreground text-gray-600">
            We've sent a verification code to
            <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        <OtpVerification
          email={email}
          onBack={handleBackToLogin}
          supabase={supabase}
        />
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <VerifyPageContent />
    </Suspense>
  );
}