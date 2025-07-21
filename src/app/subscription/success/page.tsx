'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { useSessionContext } from '@/context/SessionContext';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/api';

function SubscriptionSuccessContent() {
  // const { user } = useSessionContext(); // Removed unused variable
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error('Invalid session');
        router.push('/subscription');
        return;
      }

      try {
        // Verify the payment with your backend
        const response = await apiClient.post('/api/verify-payment', { sessionId });

        toast.success('Welcome to Pro! Your subscription is now active.');
        setIsLoading(false);
      } catch (error: any) {
        console.error('Payment verification error:', error);
        
        // Handle axios error response
        if (error.response) {
          const errorMessage = error.response.data?.error?.message || 'Payment verification failed';
          toast.error(errorMessage);
        } else {
          toast.error('Payment verification failed. Please contact support.');
        }
        router.push('/subscription');
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  const handleContinueToApp = () => {
    router.push('/my-books');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="mx-auto max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Pro! 🎉
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>

        {/* Pro Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full mb-8">
          <Star className="w-5 h-5 mr-2" />
          <span className="font-semibold">Pro Member</span>
        </div>

        {/* What's Next */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">What&apos;s next?</h3>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Explore unlimited books in the discover section</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Track your reading progress with advanced analytics</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Enjoy ad-free reading experience</span>
            </li>
          </ul>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinueToApp}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
        >
          <span>Continue to App</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Support */}
        <p className="text-sm text-gray-500 mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@kitapp.com" className="text-green-600 hover:text-green-700">
            support@kitapp.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="h-screen" />}> 
      <SubscriptionSuccessContent />
    </Suspense>
  );
} 