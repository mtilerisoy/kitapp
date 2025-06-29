// src/components/LibraryBookCard.tsx

'use client';

import React from 'react';
// SYNTH-STACK: Import the specific LibraryBook type
import { LibraryBook } from '@/types';
import { cn } from '@/lib/utils';

// SYNTH-STACK: Update the props to use the imported type
interface LibraryBookCardProps {
  book: LibraryBook;
  onClick: () => void;
  className?: string;
}

const LibraryBookCard: React.FC<LibraryBookCardProps> = ({ book, onClick, className }) => {
  const placeholderImageUrl = 'https://via.placeholder.com/300x450.png?text=No+Cover';
  
  return (
    <button
      onClick={onClick}
      className={cn("group relative text-left", className)}
      aria-label={`View details for ${book.title}`}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-200 shadow-md transition-opacity group-hover:opacity-75">
        <img
          src={book.cover_image_url || placeholderImageUrl}
          alt={`Cover of the book ${book.title}`}
          className="h-full w-full object-cover object-center"
        />
      </div>
      
      {/* Progress Bar for 'reading' status */}
      {book.status === 'reading' && book.progress_percentage != null && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-green-600"
            style={{ width: `${book.progress_percentage}%` }}
          />
        </div>
      )}

      <div className={cn("mt-1 flex flex-col", book.status !== 'reading' && 'mt-2')}>
        <h3 className="text-sm font-semibold text-gray-800 truncate" title={book.title}>
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs text-gray-500 truncate" title={book.author}>
            {book.author}
          </p>
        )}
      </div>
    </button>
  );
};

export default LibraryBookCard;