// src/components/MyBooks.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import apiClient from '@/api';
import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from '@/components/LoadingIndicator';
import LibraryBookCard from '@/components/LibraryBookCard';
// SYNTH-STACK: Import the new LibraryBook type
import { LibraryBook } from '@/types';

// Define the shape of the data returned by our new API endpoint
interface LibraryData {
  reading: LibraryBook[];
  to_read: LibraryBook[];
  finished: LibraryBook[];
  abandoned: LibraryBook[];
}

// Fetcher function for React Query
const fetchMyLibrary = async (): Promise<LibraryData> => {
  const { data } = await apiClient.get('/api/my-books');
  return data;
};

// A helper component for rendering each book shelf
const BookShelf = ({ title, books }: { title: string; books: LibraryBook[] }) => {
  if (books.length === 0) {
    return null; // Don't render the shelf if there are no books
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-2 mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {books.map((book) => (
          <LibraryBookCard
            key={book.id}
            book={book}
            onClick={() => console.log(`Clicked ${book.title}`)} // Placeholder for detail view
          />
        ))}
      </div>
    </section>
  );
};

const MyBooks: React.FC = () => {
  const { session, loading: sessionLoading } = useSessionContext();
  const router = useRouter();

  const {
    data: library,
    isLoading: libraryLoading,
    isError,
    error,
  } = useQuery<LibraryData, Error>({
    queryKey: ['my-books'],
    queryFn: fetchMyLibrary,
    enabled: !!session, // Only run the query if the user is logged in
  });

  // Handle redirection if not logged in
  React.useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Handle loading states
  if (sessionLoading || (libraryLoading && session)) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingIndicator size={50} />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Failed to load your library</h2>
        <p>{error?.message || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  const isEmpty =
    !library ||
    (library.reading.length === 0 &&
     library.to_read.length === 0 &&
     library.finished.length === 0);

  // Handle empty state
  if (isEmpty) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Library is Empty</h1>
        <p className="text-gray-600 mb-6">
          Add some books from the Discover page to get started.
        </p>
        <button
          onClick={() => router.push('/discover')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Discover Books
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">My Library</h1>
      
      <BookShelf title="Currently Reading" books={library?.reading || []} />
      <BookShelf title="Up Next" books={library?.to_read || []} />
      <BookShelf title="Finished" books={library?.finished || []} />
    </div>
  );
};

export default MyBooks;