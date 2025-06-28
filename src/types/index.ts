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