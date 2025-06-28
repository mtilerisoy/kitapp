// It's a good practice to centralize common type definitions.
export interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
}