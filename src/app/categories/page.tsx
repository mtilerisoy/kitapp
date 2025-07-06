// src/pages/categories.tsx
// Or if not using a framework with file-system routing: src/components/CategoriesPage.tsx
'use client';

import React from 'react';
import apiClient from '@/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import LoadingIndicator from '@/components/LoadingIndicator';

// 1. Define the TypeScript interface for a Category
interface Category {
  id: string | number;
  name: string;
  description?: string;
  slug: string;
}

// 2. Create the asynchronous fetcher function.
const fetchCategories = async (): Promise<{ categories: Category[] }> => {
  const { data } = await apiClient.get('/api/categories');
  return data;
};

// 3. The CategoriesPage component, now vastly simplified.
const CategoriesPage: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ categories: Category[] }, Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const categories = data?.categories || [];

  // 4. Render a localized loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* We reuse the loading indicator, but it's no longer a global overlay */}
        <LoadingIndicator size={40} withText={true} />
      </div>
    );
  }

  // 5. Render a localized error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Failed to load categories</h2>
        <p>{error?.message || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  // 6. Render the categories list
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Explore Knowledge Categories
      </h1>
      {categories?.length === 0 ? (
        <p className="text-center text-gray-500">
          No categories available at the moment. Please check back later.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}/tracks`} // Assumes slug exists
              passHref
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;