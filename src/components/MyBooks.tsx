'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext'; // Assuming this context provides session info
import apiClient from '@/api'; // Your configured Axios instance

const MyBooks: React.FC = () => {
  const { session, loading } = useSessionContext();
  const router = useRouter();
  const [bookTitle, setBookTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // If session loading is complete and there's no session, redirect to login
    if (!loading && !session) {
      router.push('/login');
    }
  }, [session, loading, router]);

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setMessage('Please enter a book title.');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Assume your backend endpoint for adding a book is /api/books
      // and it expects a POST request with { title: "Book Title" }
      const response = await apiClient.post('/api/books', { title: bookTitle });

      if (response.status === 201 || response.status === 200) { // 201 Created or 200 OK
        setMessage(`Book "${bookTitle}" saved successfully!`);
        setBookTitle(''); // Clear the input field
      } else {
        // Handle other successful statuses if necessary
        setMessage(`Book saved, but received status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving book:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { data: { message?: string } }; request?: unknown; message?: string };
        setMessage(`Error: ${err.response.data.message || 'Could not save the book.'}`);
      } else if (typeof error === 'object' && error !== null && 'request' in error) {
        setMessage('Error: No response from the server. Please try again.');
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        const err = error as { message?: string };
        setMessage(`Error: ${err.message || 'An unexpected error occurred.'}`);
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // If session is still loading, show a loading state or nothing
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading dashboard...</p></div>;
  }

  // If there's no session (even after loading), this part might not be reached due to redirect,
  // but it's good for robustness or if redirect logic changes.
  if (!session) {
    return <div className="flex justify-center items-center h-screen"><p>Redirecting to login...</p></div>;
  }

  // User is logged in, show the dashboard content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Dashboard</h1>
      <p className="text-gray-600 mb-4">Welcome, {session.user?.email || 'User'}!</p>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add a New Book</h2>
        <form onSubmit={handleSaveBook}>
          <div className="mb-4">
            <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Book Title
            </label>
            <input
              type="text"
              id="bookTitle"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="e.g., The Great Gatsby"
              disabled={isSaving}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50"
            disabled={isSaving || !bookTitle.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Book'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${message.startsWith('Error:') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyBooks;