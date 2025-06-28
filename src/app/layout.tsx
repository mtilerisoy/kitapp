// src/app/layout.tsx

'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { SessionProvider } from '@/context/SessionContext';
import QueryProvider from '@/context/QueryProvider';
import { Toaster } from 'sonner'; // SYNTH-STACK: Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Kitapp - Track Your Reading</title>
        <meta
          name="description"
          content="Your personal platform to track and discover books."
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            {/* SYNTH-STACK: Add Toaster component here */}
            <Toaster position="top-right" richColors />
            <div className="flex flex-col min-h-screen">
              <Header onProfileButtonClick={toggleSidebar} />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
              </main>
              <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm lg:hidden"
                  onClick={closeSidebar}
                  aria-hidden="true"
                />
              )}
            </div>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}