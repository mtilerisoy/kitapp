// src/components/UpdateBookModal.tsx

'use client';

import React from 'react';
import { Book } from '@/types';
import { Button } from './ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

// Type Definitions for strictness
type ReadingStatus = 'to_read' | 'reading' | 'finished' | 'abandoned';

interface LibraryBook extends Book {
  status: ReadingStatus;
  progress_percentage: number | null;
}

interface UpdatePayload {
  bookId: string;
  status?: ReadingStatus;
  progress?: number;
}

interface ApiError {
  error: string;
}

// Mutation function
async function updateBookProgress(payload: UpdatePayload) {
  const { bookId, ...updates } = payload;
  const { data } = await apiClient.patch(`/api/my-books/${bookId}`, updates);
  return data;
}

// Component Props
interface UpdateBookModalProps {
  book: LibraryBook | null;
  onClose: () => void;
}

export const UpdateBookModal: React.FC<UpdateBookModalProps> = ({ book, onClose }) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<any, AxiosError<ApiError>, UpdatePayload>({
    mutationFn: updateBookProgress,
    onSuccess: () => {
      toast.success(`"${book?.title}" has been updated.`);
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      onClose();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || "Failed to update book.";
      toast.error(errorMessage);
    },
  });

  const handleStatusChange = (newStatus: ReadingStatus) => {
    if (!book) return;
    mutate({ bookId: book.id, status: newStatus });
  };
  
  if (!book) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Close modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
            <p className="text-md text-gray-600">by {book.author || 'Unknown Author'}</p>
        </div>

        <div className="mt-8 space-y-4">
            {book.status === 'to_read' && (
                <Button className="w-full" onClick={() => handleStatusChange('reading')} disabled={isPending}>
                    Start Reading
                </Button>
            )}
             {book.status === 'reading' && (
                <Button className="w-full" onClick={() => handleStatusChange('finished')} disabled={isPending}>
                    Mark as Finished
                </Button>
            )}
             {book.status === 'finished' && (
                <Button className="w-full" onClick={() => handleStatusChange('reading')} disabled={isPending}>
                    Read Again
                </Button>
            )}
             <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleStatusChange('abandoned')} 
                disabled={isPending}
             >
                Move to Abandoned
             </Button>
        </div>
      </div>
    </div>
  );
};