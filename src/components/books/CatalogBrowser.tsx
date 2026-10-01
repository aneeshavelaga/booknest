'use client';

import React, { useState, useMemo } from 'react';
import { Book, Category } from '@/types/database';
import { BookCard } from './BookCard';
import { Search, Filter, RotateCcw, SlidersHorizontal, BookOpen } from 'lucide-react';

interface CatalogBrowserProps {
  initialBooks: Book[];
  categories: Category[];
  initialCategory?: string;
  initialType?: 'all' | 'rent' | 'sale';
  initialSearch?: string;
}

export function CatalogBrowser({
  initialBooks,
  categories,
  initialCategory,
  initialType = 'all',
  initialSearch = '',
}: CatalogBrowserProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedType, setSelectedType] = useState<'all' | 'rent' | 'sale'>(initialType);
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const filteredBooks = useMemo(() => {
    return initialBooks.filter((book) => {
      // Type filter
      if (selectedType === 'rent' && !book.is_available_for_rent) return false;
      if (selectedType === 'sale' && !book.is_available_for_sale) return false;

      // Category filter
      if (selectedCategory !== 'all' && book.category_id !== selectedCategory) return false;

      // Condition filter
      if (selectedCondition !== 'all' && book.condition !== selectedCondition) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesDesc = book.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating_average - a.rating_average;
      }
      if (sortBy === 'price-asc') {
        const priceA = selectedType === 'rent' ? a.rent_price_7_days : a.sale_price;
        const priceB = selectedType === 'rent' ? b.rent_price_7_days : b.sale_price;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = selectedType === 'rent' ? a.rent_price_30_days : a.sale_price;
        const priceB = selectedType === 'rent' ? b.rent_price_30_days : b.sale_price;
        return priceB - priceA;
      }
      // default: featured
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [initialBooks, selectedType, selectedCategory, selectedCondition, search, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedCondition('all');
    setSortBy('featured');
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedCondition !== 'all' ||
    sortBy !== 'featured';

  return (
    <div className="space-y-8">
      {/* Control Bar: Search & Top Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          {/* Mode Switcher: All / Rent Only / Buy Only */}
          <div className="md:col-span-4 flex bg-stone-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                selectedType === 'all'
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setSelectedType('rent')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                selectedType === 'rent'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Rentals
            </button>
            <button
              onClick={() => setSelectedType('sale')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                selectedType === 'sale'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              To Buy
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
            >
              <option value="featured">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Secondary Category & Condition Filters */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-400 font-medium">Category:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs transition ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Condition Pills */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Condition:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="py-1 px-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-700 focus:outline-none"
            >
              <option value="all">Any Condition</option>
              <option value="new">Brand New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 ml-2"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          Showing <strong className="text-stone-900 font-semibold">{filteredBooks.length}</strong> {filteredBooks.length === 1 ? 'title' : 'titles'}
        </span>
        {selectedType !== 'all' && (
          <span className="capitalize bg-stone-200/80 px-2 py-0.5 rounded text-stone-700 font-medium">
            Filtered by: {selectedType === 'rent' ? 'Rentals' : 'Available for purchase'}
          </span>
        )}
      </div>

      {/* Grid of Books */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-900 text-lg mb-1">
            No matching books found
          </h3>
          <p className="text-stone-500 text-xs mb-4">
            Try adjusting your search keywords, category filters, or condition criteria.
          </p>
          <button
            onClick={resetFilters}
            className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
