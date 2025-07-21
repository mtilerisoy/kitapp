'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push('/subscription');
  };

  const handleBackToApp = () => {
    router.push('/my-books');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="mx-auto max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          No worries! Your payment was cancelled and you haven&apos;t been charged. You can try again anytime.
        </p>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">What happened?</h3>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Your payment was cancelled before completion</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>No charges were made to your account</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>You can still use the free version of Kitapp</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={handleBackToApp}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Support */}
        <p className="text-sm text-gray-500 mt-6">
          Having trouble? Contact us at{' '}
          <a href="mailto:support@kitapp.com" className="text-green-600 hover:text-green-700">
            support@kitapp.com
          </a>
        </p>
      </div>
    </div>
  );
} 