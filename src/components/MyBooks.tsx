// src/components/MyBooks.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import apiClient from '@/api';
import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from './LoadingIndicator';
import LibraryBookCard from './LibraryBookCard';
import { LibraryBookSidebar } from './LibraryBookSidebar'; // Import the new sidebar

// --- Type Definitions (Now fully consistent) ---
type ReadingStatus = 'to_read' | 'reading' | 'finished' | 'abandoned';

interface LibraryBook {
  id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  description: string | null;
  total_pages: number | null;
  status: ReadingStatus;
  progress_percentage: number | null;
}

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

const BookShelf = ({ title, books, onBookClick }: { title: string; books: LibraryBook[]; onBookClick: (book: LibraryBook) => void; }) => {
  if (books.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-2 mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {books.map((book) => (
          <LibraryBookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
        ))}
      </div>
    </section>
  );
};

const MyBooks: React.FC = () => {
  const { session, loading: sessionLoading } = useSessionContext();
  const router = useRouter();
  // State for managing the sidebar
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

  const handleCloseSidebar = () => {
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
    // ... error component ...
    return <div>Error loading library.</div>
  }
  
  const isEmpty = !library || (library.reading.length === 0 && library.to_read.length === 0 && library.finished.length === 0);

  if (isEmpty) {
    // ... empty state component ...
    return <div>Your library is empty.</div>
  }

  return (
    // We use a React fragment to render the sidebar and overlay alongside the page content
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">My Library</h1>
        
        <BookShelf title="Currently Reading" books={library?.reading || []} onBookClick={setSelectedBook} />
        <BookShelf title="Up Next" books={library?.to_read || []} onBookClick={setSelectedBook} />
        <BookShelf title="Finished" books={library?.finished || []} onBookClick={setSelectedBook} />
        <BookShelf title="Abandoned" books={library?.abandoned || []} onBookClick={setSelectedBook} />
      </div>
      
      {/* Render the Sidebar and its overlay */}
      <LibraryBookSidebar book={selectedBook} onClose={handleCloseSidebar} />
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default MyBooks;