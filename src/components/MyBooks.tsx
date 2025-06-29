// src/components/MyBooks.tsx

'use client';

import React, { useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import apiClient from '@/api';
import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from '@/components/LoadingIndicator';
import LibraryBookCard from '@/components/LibraryBookCard';
import { Book } from '@/types';
import { UpdateBookModal } from './UpdateBookModal'; // Import the modal

// Define a stricter type for books in our library
type ReadingStatus = 'to_read' | 'reading' | 'finished' | 'abandoned';
interface LibraryBook extends Book {
  status: ReadingStatus;
  progress_percentage: number | null;
}

// Update the LibraryData interface to use the stricter type
interface LibraryData {
  reading: LibraryBook[];
  to_read: LibraryBook[];
  finished: LibraryBook[];
  abandoned: LibraryBook[];
}

const fetchMyLibrary = async (): Promise<LibraryData> => {
  const { data } = await apiClient.get('/api/my-books');
  return data;
};

// Update the props for BookShelf
const BookShelf = ({ title, books, onBookClick }: { title: string; books: LibraryBook[]; onBookClick: (book: LibraryBook) => void; }) => {
  if (books.length === 0) return null;

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
            onClick={() => onBookClick(book)}
          />
        ))}
      </div>
    </section>
  );
};

const MyBooks: React.FC = () => {
  const { session, loading: sessionLoading } = useSessionContext();
  const router = useRouter();
  // State for managing the modal
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  const { data: library, isLoading: libraryLoading, isError, error } = useQuery<LibraryData, Error>({
    queryKey: ['my-books'],
    queryFn: fetchMyLibrary,
    enabled: !!session,
  });

  React.useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);
  
  const handleBookClick = (book: LibraryBook) => {
    setSelectedBook(book);
  };
  
  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  if (sessionLoading || (libraryLoading && session)) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingIndicator size={50} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Failed to load your library</h2>
        <p>{error?.message || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  const isEmpty = !library || (library.reading.length === 0 && library.to_read.length === 0 && library.finished.length === 0);

  if (isEmpty) {
    // ... (empty state component remains the same) ...
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
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">My Library</h1>
        
        <BookShelf title="Currently Reading" books={library?.reading || []} onBookClick={handleBookClick} />
        <BookShelf title="Up Next" books={library?.to_read || []} onBookClick={handleBookClick} />
        <BookShelf title="Finished" books={library?.finished || []} onBookClick={handleBookClick} />
        <BookShelf title="Abandoned" books={library?.abandoned || []} onBookClick={handleBookClick} />
      </div>

      <UpdateBookModal book={selectedBook} onClose={handleCloseModal} />
    </>
  );
};

export default MyBooks;