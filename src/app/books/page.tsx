import React from 'react';
import { getBooks, getCategories } from '@/lib/services/books';
import { CatalogBrowser } from '@/components/books/CatalogBrowser';

interface BooksPageProps {
  searchParams: Promise<{
    category?: string;
    type?: 'all' | 'rent' | 'sale';
    condition?: string;
    search?: string;
  }>;
}

export const metadata = {
  title: 'Browse Books & Rentals | BookNest',
  description: 'Search and filter our complete catalog of books available for purchase or flexible rental.',
};

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const [books, categories] = await Promise.all([
    getBooks(),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          BookNest Library Catalog
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Explore books available to purchase outright or rent for 7, 14, or 30 days.
        </p>
      </div>

      <CatalogBrowser
        initialBooks={books}
        categories={categories}
        initialCategory={params.category}
        initialType={params.type}
        initialSearch={params.search}
      />
    </div>
  );
}
