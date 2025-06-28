'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';
import { Book } from '@/types';
import BookCard, { BookCardSkeleton } from '@/components/BookCard';
import { Input } from '@/components/ui/Input';

// Define the fetcher function for React Query
const fetchBooks = async ({ pageParam = 1, limit = 20 }): Promise<Book[]> => {
  const { data } = await apiClient.get('/api/books', {
    params: { page: pageParam, limit },
  });
  return data;
};

const DiscoverPage: React.FC = () => {
  const [limit] = useState(20); // For now, the limit is fixed.

  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery<Book[], Error>({
    queryKey: ['books', { limit }], // The query key includes the limit
    queryFn: () => fetchBooks({ limit }),
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Discover Books
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Explore our collection and find your next great read.
        </p>
      </header>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Search for books, authors..."
            // Search functionality is not yet implemented
            disabled
          />
        </div>
      </div>

      {/* Books Grid Section */}
      <main>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {/* Render skeleton loaders based on the limit */}
            {Array.from({ length: limit }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Failed to load books</h2>
            <p>{error?.message || 'An unexpected error occurred.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {books?.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {books && books.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No books found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoverPage;