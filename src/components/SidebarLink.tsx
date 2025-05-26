'use client';

import Link from 'next/link';
import React from 'react';

interface SidebarLinkProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href = '#', onClick, children, className = "" }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block py-2.5 px-4 rounded-md text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors ${className}`}
    >
      {children}
    </Link>
  );
};

export default SidebarLink;