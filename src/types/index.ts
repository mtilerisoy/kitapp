// src/types/index.ts

export interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  description: string | null;
  total_pages: number | null;
  is_in_library: boolean;
}

// SYNTH-STACK: NEW TYPE DEFINITION
// This type represents a book that is part of the user's library,
// so it includes reading progress information.
export interface LibraryBook extends Book {
  status: 'reading' | 'to_read' | 'finished' | 'abandoned';
  progress_percentage: number | null;
}