'use client';

import React from 'react';

interface ProfileButtonProps {
  onClick: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
      aria-label="Open user menu"
    >
      {/* Placeholder for an icon, e.g., UserIcon */}
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
  );
};

export default ProfileButton;