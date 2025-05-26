'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import apiClient from '../api';

async function init_api() {
  try {
    const res = await apiClient.get('/api');
    return res.data; 
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return []; 
  }
}

export default function LandingPage() {

  useEffect(() => {
    init_api().then(data => {
      console.log("API initialized with data:", data);
    }).catch(error => {
      console.error("Error initializing API:", error);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <section className="py-12 md:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Welcome to <span className="text-green-600">Kitapp</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Dive into your reading journey. Track your progress, discover new books,
          and connect with a community of readers. All in one place.
        </p>
        <div className="space-x-4">
          <Link
            href="/login" // Replace with your actual signup route
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            href="/discover"
            className="bg-white hover:bg-gray-100 text-green-600 font-semibold py-3 px-8 rounded-lg border border-green-600 shadow-sm transition-transform transform hover:scale-105"
          >
            Discover Books
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gray-100 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
            Why <span className="text-green-600">Kitapp</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-left">
              {/* Placeholder for an icon */}
              <div className="text-green-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Track Your Reading</h3>
              <p className="text-gray-600">
                Easily log the books you&aposre reading, have read, or want to read. Monitor your progress and set reading goals.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-left">
              {/* Placeholder for an icon */}
              <div className="text-green-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Discover New Titles</h3>
              <p className="text-gray-600">
                Explore a vast library of books. Get personalized recommendations based on your reading habits and preferences.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-left">
              {/* Placeholder for an icon */}
              <div className="text-green-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Join the Community</h3>
              <p className="text-gray-600">
                Share your thoughts on books, participate in discussions, and connect with fellow book lovers. (Coming Soon!)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Ready to Start Your Next Chapter?
        </h2>
        <Link
          href="/api/auth_check" // Replace with your actual signup route
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 text-lg"
        >
          Sign Up for Free
        </Link>
      </section>
    </div>
  );
}