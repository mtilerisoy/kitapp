// src/app/discover/page.tsx

'use client';

import React, { useState } from 'react'; // SYNTH-STACK UPDATE: Imported useState
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api';
import { Book } from '@/types';
import BookCard, { BookCardSkeleton } from '@/components/BookCard';
import BookDetailSidebar from '@/components/BookDetailSidebar'; // SYNTH-STACK UPDATE: Imported new component
import { Input } from '@/components/ui/Input';

// The fetcher function now uses the updated Book type
const fetchBooks = async ({ limit = 20 }): Promise<{ books: Book[] }> => {
  const { data } = await apiClient.get('/api/books', { params: { page: 1, limit } });
  return data;
};

const DiscoverPage: React.FC = () => {
  const [limit] = useState(20);
  // SYNTH-STACK UPDATE: State to manage which book is selected for the detail view
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ books: Book[] }, Error>({
    queryKey: ['books', { limit }],
    queryFn: () => fetchBooks({ limit }),
  });

  const books = data?.books || [];

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Discover Books
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore our collection and find your next great read.
          </p>
        </header>

        <div className="mb-8">
          <div className="max-w-md">
            <Input
              type="search"
              placeholder="Search for books, authors..."
              disabled
            />
          </div>
        </div>

        <main>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
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
                <BookCard 
                  key={book.id} 
                  book={book} 
                  // SYNTH-STACK UPDATE: Pass the onClick handler
                  onClick={() => setSelectedBook(book)}
                />
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
      
      {/* SYNTH-STACK UPDATE: Render the sidebar and overlay */}
      <BookDetailSidebar book={selectedBook} onClose={() => setSelectedBook(null)} />
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default DiscoverPage;