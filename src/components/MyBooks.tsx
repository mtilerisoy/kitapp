// src/components/MyBooks.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import apiClient from '@/api';
import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from './LoadingIndicator';
import LibraryBookCard from './LibraryBookCard';
import { LibraryBookSidebar } from './LibraryBookSidebar';

// --- Type Definitions ---
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

const fetchMyLibrary = async (): Promise<{ library: LibraryData }> => {
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
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  const { data, isLoading: libraryLoading, isError, error } = useQuery<{ library: LibraryData }, Error>({
    queryKey: ['my-books'],
    queryFn: fetchMyLibrary,
    enabled: !!session,
  });

  const library = data?.library;

  React.useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  const handleCloseSidebar = () => {
    setSelectedBook(null);
  };

  if (sessionLoading || (libraryLoading && session)) {
    return <div className="flex justify-center items-center h-96"><LoadingIndicator size={50} /></div>;
  }

  if (isError) {
    let errorMessage = error.message;
    let errorCode = '';
    let requestId = '';
    if ((error as any).response?.data?.error) {
      errorMessage = (error as any).response.data.error.message || errorMessage;
      errorCode = (error as any).response.data.error.code || '';
      requestId = (error as any).response.data.error.request_id || '';
    }
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Failed to Load Your Library</h2>
        <p>{errorMessage}</p>
        {errorCode && <div className="text-xs mt-2">Code: {errorCode}</div>}
        {requestId && <div className="text-xs mt-1">Request ID: {requestId}</div>}
      </div>
    );
  }
  
  const isEmpty = !library || (library.reading.length === 0 && library.to_read.length === 0 && library.finished.length === 0 && library.abandoned.length === 0);

  if (isEmpty) {
    return (
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Library is Empty</h1>
          <p className="text-gray-600 mb-6">Add some books from the Discover page to get started.</p>
          <button onClick={() => router.push('/discover')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            Discover Books
          </button>
        </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">My Library</h1>
        
        <BookShelf title="Currently Reading" books={library?.reading || []} onBookClick={setSelectedBook} />
        <BookShelf title="Up Next" books={library?.to_read || []} onBookClick={setSelectedBook} />
        <BookShelf title="Finished" books={library?.finished || []} onBookClick={setSelectedBook} />
        <BookShelf title="Abandoned" books={library?.abandoned || []} onBookClick={setSelectedBook} />
      </div>
      
      <LibraryBookSidebar book={selectedBook} onClose={handleCloseSidebar} />
      {selectedBook && (<div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={handleCloseSidebar} aria-hidden="true"/>)}
    </>
  );
};

export default MyBooks;