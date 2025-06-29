// src/components/LibraryBookSidebar.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// --- Type Definitions for strictness ---
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

interface UpdatePayload {
  bookId: string;
  status?: ReadingStatus;
  progress?: number;
}

// SYNTH-STACK FIX: Define the expected API error shape
interface ApiError {
  error: string;
}

// --- Mutation function ---
async function updateBookProgress(payload: UpdatePayload) {
  const { bookId, ...updates } = payload;
  const { data } = await apiClient.patch(`/api/my-books/${bookId}`, updates);
  return data;
}

// --- Component Props and Implementation ---
interface LibraryBookSidebarProps {
  book: LibraryBook | null;
  onClose: () => void;
}

export const LibraryBookSidebar: React.FC<LibraryBookSidebarProps> = ({ book, onClose }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const placeholderImageUrl = 'https://via.placeholder.com/300x450.png?text=No+Cover';
  const isOpen = !!book;

  // SYNTH-STACK FIX: Properly type the useMutation hook generics
  const { mutate, isPending } = useMutation<any, AxiosError<ApiError>, UpdatePayload>({
    mutationFn: updateBookProgress,
    onSuccess: () => {
      toast.success(`"${book?.title}" has been updated.`);
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
    // SYNTH-STACK FIX: Replace 'any' with the specific AxiosError type
    onError: (error) => {
      const errorMessage = error.response?.data?.error || "Failed to update book.";
      toast.error(errorMessage);
    },
  });

  const handleStatusChange = (newStatus: ReadingStatus) => {
    if (!book) return;
    mutate({ bookId: book.id, status: newStatus });
  };

  const handleReadNow = () => {
    if (!book) return;
    onClose();
    router.push(`/read/${book.id}`);
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
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">My Book</h2>
            <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close details">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
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

            {book.status === 'reading' && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800">My Progress</h3>
                <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">{book.progress_percentage || 0}%</span>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${book.progress_percentage || 0}%` }}/>
                    </div>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
              <p className="mt-2 text-base text-gray-700 leading-relaxed">{book.description || 'No description available for this book.'}</p>
            </div>
          </div>

          <div className="border-t p-4 space-y-3">
             <Button className="w-full" onClick={handleReadNow}>Read Now</Button>
            
             {book.status === 'to_read' && (<Button variant="outline" className="w-full" onClick={() => handleStatusChange('reading')} disabled={isPending}>Move to "Currently Reading"</Button>)}
             {book.status === 'reading' && (<Button className="w-full" onClick={() => handleStatusChange('finished')} disabled={isPending}>Mark as Finished</Button>)}
             {book.status === 'finished' && (<Button variant="outline" className="w-full" onClick={() => handleStatusChange('reading')} disabled={isPending}>Read Again</Button>)}
             <Button variant="outline" className="w-full" onClick={() => handleStatusChange('abandoned')} disabled={isPending}>Move to Abandoned</Button>
          </div>
        </div>
      )}
    </aside>
  );
};