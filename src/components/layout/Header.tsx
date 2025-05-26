'use client';

import React from 'react';
import Link from 'next/link';
import ProfileButton from '../ProfileButton';

interface HeaderProps {
  onProfileButtonClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileButtonClick }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
          Kitapp
        </Link>
        <div className="flex items-center">
          <nav className="hidden md:flex space-x-4 mr-4">
            <Link href="/discover" className="text-gray-600 hover:text-green-700 transition-colors">Discover</Link>
            <Link href="/my-books" className="text-gray-600 hover:text-green-700 transition-colors">My Books</Link>
          </nav>
          <ProfileButton onClick={onProfileButtonClick} />
        </div>
      </div>
    </header>
  );
};

export default Header;