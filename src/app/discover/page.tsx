// src/pages/categories.tsx
// Or if not using a framework with file-system routing: src/components/CategoriesPage.tsx
'use client';
import React, { useState, useEffect } from 'react';
import apiClient from '@/api';

// 1. TypeScript interface for a Category object
interface Category {
  id: string | number;
  name: string;
  description?: string;
  slug: string;
}

// 2. CategoriesPage component
const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. useEffect to fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/api/categories');

        setCategories(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 4. Render loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading categories...</p>
      </div>
    );
  }

  // 5. Render error state
  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>Error: {error}</p>
        <button onClick={() => window.location.reload()} style={styles.button}>Try Again</button>
      </div>
    );
  }

  // 6. Render categories list
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Explore Knowledge Categories</h1>
      {categories.length === 0 ? (
        <p style={styles.infoText}>No categories available at the moment. Please check back later.</p>
      ) : (
        <ul style={styles.list}>
          {categories.map((category) => (
            <li key={category.id} style={styles.listItem}>
              {/*
                Replace <a> with <Link> from Next.js or React Router if you're using them.
                Example for Next.js:
                <Link href={`/categories/${category.slug}/tracks`} passHref>
                  <a style={styles.link}>{category.name}</a>
                </Link>

                Example for React Router:
                <Link to={`/categories/${category.slug}/tracks`} style={styles.link}>
                  {category.name}
                </Link>
              */}
              <a href={`/categories/${category.slug}/tracks`} style={styles.link}>
                <h2 style={styles.categoryName}>{category.name}</h2>
              </a>
              {category.description && (
                <p style={styles.descriptionText}>{category.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Basic inline styles for demonstration
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  } as React.CSSProperties,
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#555',
  } as React.CSSProperties,
  errorText: {
    textAlign: 'center',
    fontSize: '1.2em',
    color: 'red',
    marginBottom: '15px',
  } as React.CSSProperties,
  infoText: {
    textAlign: 'center',
    fontSize: '1em',
    color: '#777',
  } as React.CSSProperties,
  list: {
    listStyleType: 'none',
    padding: 0,
  } as React.CSSProperties,
  listItem: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px 20px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  link: {
    textDecoration: 'none',
  } as React.CSSProperties,
  categoryName: {
    margin: '0 0 5px 0',
    color: '#007bff', // A typical link blue
    fontSize: '1.5em',
  } as React.CSSProperties,
  descriptionText: {
    margin: '0',
    fontSize: '0.95em',
    color: '#555',
    lineHeight: '1.4',
  } as React.CSSProperties,
  button: {
    display: 'block',
    margin: '20px auto 0',
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  } as React.CSSProperties,
};

export default CategoriesPage;