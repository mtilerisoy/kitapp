'use client'; // Add this line to make it a Client Component

import type { Metadata } from "next"; // Keep this for metadata, but it's handled by Next.js separately
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { useState } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import { SessionProvider} from '@/context/SessionContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = { // Metadata can still be exported from a client component layout
//   title: "Kitapp - Track Your Reading",
//   description: "Your personal platform to track and discover books.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <html lang="en">
      <SessionProvider>
      <head>
        {/* Metadata is typically handled by Next.js `metadata` export or <Head> component in `pages` dir.
            For App Router, the `metadata` export is preferred.
            If you need dynamic titles or specific head tags per page, use `generateMetadata` in page.tsx/layout.tsx.
        */}
        <title>Kitapp - Track Your Reading</title>
        <meta name="description" content="Your personal platform to track and discover books." />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-800`}
      >
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header onProfileButtonClick={toggleSidebar} />
          {/* Removed the flex container that was causing issues with sidebar placement */}
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </main>
          
          {/* Single Sidebar instance, controlled by isSidebarOpen and handles its own responsive display */}
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm lg:hidden" // This backdrop is for small screens
              onClick={closeSidebar}
              aria-hidden="true" // Corrected aria-hidden
            />
          )}
        </div>
      </body>
      </SessionProvider>
    </html>
  );
}