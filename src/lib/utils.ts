import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// A utility function to merge Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}