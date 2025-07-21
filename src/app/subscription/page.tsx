'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import { Button } from '@/components/ui/Button';
import { Check, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '@/api';

export default function SubscriptionPage() {
  const { user, loading } = useSessionContext();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/create-checkout-session', {
        // TODO: Get priceId from the user
        priceId: "process.env.STRIPE_PRICE_ID",
      });

      const { sessionId } = response.data;
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          toast.error('Payment failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      // Handle axios error response
      if (error.response) {
        const errorMessage = error.response.data?.error?.message || 'Payment processing failed';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="mx-auto max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upgrade to Pro
          </h1>
          <p className="text-gray-600 text-lg">
            Unlock unlimited reading and premium features
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Pro Plan</h2>
                <p className="text-green-100 text-sm">Perfect for avid readers</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">€0.99</div>
                <div className="text-green-100 text-sm">per month</div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="px-6 py-6">
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Unlimited book access</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Advanced reading analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Priority customer support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Early access to new features</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Ad-free reading experience</span>
              </li>
            </ul>

            {/* Subscribe Button */}
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Subscribe Now
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Secure payment powered by Stripe • Cancel anytime
          </p>
        </div>

        {/* Back to App */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            ← Back to app
          </button>
        </div>
      </div>
    </div>
  );
} 