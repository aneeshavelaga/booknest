import React from 'react';
import { getBooks, getCategories } from '@/lib/services/books';
import { AdminClient } from '@/components/admin/AdminClient';

export const metadata = {
  title: 'Store Operations & Admin | BookNest',
  description: 'Manage BookNest physical inventory, catalog pricing, rental returns inspection, and escrow deposit release.',
};

export default async function AdminPage() {
  const [books, categories] = await Promise.all([
    getBooks(),
    getCategories(),
  ]);

  return <AdminClient initialBooks={books} categories={categories} />;
}
