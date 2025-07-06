// src/components/BookDetailSidebar.tsx

'use client';

import React from 'react';
import { Book } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { useSessionContext } from '@/context/SessionContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios'; // SYNTH-STACK: Import the correct error type

// This defines the expected shape of the data returned by the backend on success.
// It corresponds to a row in the 'user_reading_progress' table.
interface UserReadingProgress {
  user_id: string;
  book_id: string;
  status: 'to_read' | 'reading' | 'finished' | 'abandoned';
  last_progress_update_at: string;
}

// This defines the shape of the error response from our Flask API.
interface ApiError {
  error: {
    type: string;
    message: string;
    code: string;
    request_id?: string;
  };
}

async function addBookToLibrary(bookId: string): Promise<UserReadingProgress> {
  const { data } = await apiClient.post('/api/my-books', { book_id: bookId });
  return data;
}

interface BookDetailSidebarProps {
  book: Book | null;
  onClose: () => void;
}

const BookDetailSidebar: React.FC<BookDetailSidebarProps> = ({ book, onClose }) => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const placeholderImageUrl = 'https://via.placeholder.com/300x450.png?text=No+Cover';
  const isOpen = !!book;

  const { mutate: addBook, isPending } = useMutation<
    UserReadingProgress, // Type of data returned on success
    AxiosError<ApiError>,  // Type of error
    string                 // Type of variables passed to mutationFn (bookId)
  >({
    mutationFn: addBookToLibrary,
    onSuccess: () => {
      toast.success(`"${book?.title}" has been added to your library!`);
      queryClient.invalidateQueries({ queryKey: ['books'] });
      onClose();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || "An unknown error occurred.";
      const errorCode = error.response?.data?.error?.code;
      const requestId = error.response?.data?.error?.request_id;
      toast.error(`${errorMessage}${errorCode ? ` (Code: ${errorCode})` : ''}${requestId ? ` [Request ID: ${requestId}]` : ''}`);
    }
  });

  const handleAddBookClick = () => {
    if (!book || book.is_in_library) return;
    addBook(book.id);
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {book && (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">Book Details</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-grow overflow-y-auto p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
              <div className="mb-4 w-40 flex-shrink-0 sm:mb-0">
                <img
                  src={book.cover_image_url || placeholderImageUrl}
                  alt={`Cover of ${book.title}`}
                  className="h-auto w-full rounded-md shadow-lg"
                />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                {book.author && <p className="mt-1 text-lg text-gray-600">by {book.author}</p>}
                {book.total_pages && <p className="mt-2 text-sm text-gray-500">{book.total_pages} pages</p>}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
              <p className="mt-2 text-base text-gray-700 leading-relaxed">
                {book.description || 'No description available for this book.'}
              </p>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="border-t p-4">
            {session ? (
              book.is_in_library ? (
                <Button className="w-full" disabled variant="secondary">
                  ✓ In Your Library
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={handleAddBookClick}
                  disabled={isPending}
                >
                  {isPending ? 'Adding...' : 'Add to My Books'}
                </Button>
              )
            ) : (
              <>
                <Button className="w-full" disabled>Add to My Books</Button>
                <p className="text-center text-xs text-gray-500 mt-2">
                    You must be logged in to add books.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default BookDetailSidebar;