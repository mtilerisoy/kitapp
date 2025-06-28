import React from 'react';
// import Image from 'next/image';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const placeholderImageUrl = 'https://via.placeholder.com/300x450.png?text=No+Cover';
  
  return (
    <div className="group relative">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-200 shadow-md group-hover:opacity-75 transition-opacity">
        {/* <Image  commecnyed out because of current placeholder image types are not allowed (svg+xml)*/}
        <img
          src={book.cover_image_url || placeholderImageUrl}
          alt={`Cover of the book ${book.title}`}
          width={300}
          height={450}
          className="h-full w-full object-cover object-center"
        //   priority={false} // Set to false for non-critical images
        />
      </div>
      <div className="mt-2 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 truncate" title={book.title}>
          {book.title}
        </h3>
        {/* We only render the author if it exists */}
        {book.author && (
          <p className="text-xs text-gray-500 truncate" title={book.author}>
            {book.author}
          </p>
        )}
      </div>
    </div>
  );
};

// A skeleton loader component for the BookCard
export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] w-full rounded-md bg-gray-300"></div>
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-300"></div>
    </div>
  );
};

export default BookCard;