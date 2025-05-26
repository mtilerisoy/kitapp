'use client';

import React from 'react';
import SidebarLink from '../SidebarLink';
// You can import icons from a library like heroicons or lucide-react
// import { XIcon, HomeIcon, BookOpenIcon, SearchIcon, CogIcon, LogoutIcon } from '@heroicons/react/outline';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
                  ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
                  lg:w-72`} // Sidebar is now an overlay, toggled by isOpen. Adjusted lg width as an example.
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center"> {/* Removed lg:hidden to show header on all sidebar sizes */}
          <h2 className="text-xl font-semibold text-green-700">Menu</h2> {/* Removed odd background from title */}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close menu"
          >
            {/* Placeholder for XIcon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <SidebarLink href="/dashboard" onClick={onClose}>
            {/* HomeIcon */} Dashboard
          </SidebarLink>
          <SidebarLink href="/my-books" onClick={onClose}>
            {/* BookOpenIcon */} My Books
          </SidebarLink>
          <SidebarLink href="/discover" onClick={onClose}>
            {/* SearchIcon */} Discover Books
          </SidebarLink>
          <SidebarLink href="/settings" onClick={onClose}>
            {/* CogIcon */} Settings
          </SidebarLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              console.log('Logout action'); // Replace with actual logout logic
              onClose();
            }}
            className="w-full flex items-center justify-start py-2.5 px-4 rounded-md text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            {/* LogoutIcon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;