import React from 'react';
import { notFound } from 'next/navigation';
import { getBookById, getBooks } from '@/lib/services/books';
import { BookDetailClient } from '@/components/books/BookDetailClient';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: 'Book Not Found | BookNest' };

  return {
    title: `${book.title} by ${book.author} | Rent or Buy on BookNest`,
    description: book.description.substring(0, 160),
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const allBooks = await getBooks();
  const relatedBooks = allBooks
    .filter((b) => b.id !== book.id && b.category_id === book.category_id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <BookDetailClient book={book} relatedBooks={relatedBooks} />
    </div>
  );
}
