// src/components/BookCard.tsx

import React from 'react';
import { Book } from '@/types';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  onClick: () => void; // SYNTH-STACK UPDATE: Added onClick prop
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick, className }) => {
  const placeholderImageUrl = 'https://via.placeholder.com/300x450.png?text=No+Cover';
  
  return (
    // SYNTH-STACK UPDATE: Changed to a button for accessibility and added onClick
    <button
      onClick={onClick}
      className={cn("group relative text-left", className)}
      aria-label={`View details for ${book.title}`}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-200 shadow-md group-hover:opacity-75 transition-opacity">
        <img
          src={book.cover_image_url || placeholderImageUrl}
          alt={`Cover of the book ${book.title}`}
          width={300}
          height={450}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="mt-2 flex flex-col">
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

// The skeleton loader remains unchanged and is perfectly fine.
export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] w-full rounded-md bg-gray-300"></div>
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-300"></div>
    </div>
  );
};

export default BookCard;