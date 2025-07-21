'use client';

import React from 'react';
import { useSessionContext } from '@/context/SessionContext';
import { Star } from 'lucide-react';

interface ProfileButtonProps {
  onClick: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onClick }) => {
  const { subscriptionStatus } = useSessionContext();

  return (
    <div className="flex items-center space-x-2">
      {/* Subscription Status Badge */}
      {subscriptionStatus === 'active' && (
        <div className="flex items-center px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full">
          <Star className="w-3 h-3 mr-1" />
          <span className="font-medium">Pro</span>
        </div>
      )}
      
      {/* Profile Button */}
      <button
        onClick={onClick}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
        aria-label="Open user menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ProfileButton;