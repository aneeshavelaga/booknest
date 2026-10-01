'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Clock, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Book } from '@/types/database';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils/currency';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('rent');
  const [rentalDays, setRentalDays] = useState<7 | 14 | 30>(14);

  const getConditionColor = (cond: Book['condition']) => {
    switch (cond) {
      case 'new':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'like_new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'good':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getConditionLabel = (cond: Book['condition']) => {
    switch (cond) {
      case 'new':
        return 'Brand New';
      case 'like_new':
        return 'Like New';
      case 'good':
        return 'Good Condition';
      default:
        return 'Pre-Owned';
    }
  };

  const currentRentPrice =
    rentalDays === 7
      ? book.rent_price_7_days
      : rentalDays === 14
      ? book.rent_price_14_days
      : book.rent_price_30_days;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group">
      {/* Cover Image & Badges */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.cover_image || '/placeholder-book.jpg'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs backdrop-blur-xs ${getConditionColor(
              book.condition
            )}`}
          >
            {getConditionLabel(book.condition)}
          </span>
          {book.is_featured && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 border border-amber-400 shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick View Link */}
        <Link
          href={`/books/${book.id}`}
          className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1.5 bg-white text-stone-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            <Eye className="w-3.5 h-3.5 text-amber-600" /> View Details
          </span>
        </Link>
      </div>

      {/* Book Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1 text-xs">
            <div className="flex text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-stone-800">{book.rating_average.toFixed(1)}</span>
            <span className="text-stone-400 text-[11px]">({book.ratings_count})</span>
          </div>

          {/* Title & Author */}
          <Link href={`/books/${book.id}`}>
            <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 hover:text-amber-700 transition">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 mb-3">{book.author}</p>

          {/* Buy vs Rent Toggle Switch */}
          <div className="grid grid-cols-2 bg-stone-100 p-0.5 rounded-lg mb-3 text-xs font-medium">
            <button
              onClick={() => setActiveTab('rent')}
              className={`py-1 rounded-md transition flex items-center justify-center gap-1 ${
                activeTab === 'rent'
                  ? 'bg-white text-amber-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-600" /> Rent
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`py-1 rounded-md transition flex items-center justify-center gap-1 ${
                activeTab === 'buy'
                  ? 'bg-white text-emerald-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-emerald-600" /> Buy
            </button>
          </div>

          {/* Dynamic Pricing Content */}
          {activeTab === 'rent' ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-serif font-bold text-stone-900">
                    {formatINR(currentRentPrice)}
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">/{rentalDays} days</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> {formatINR(book.security_deposit)} deposit
                </span>
              </div>

              {/* Duration selector */}
              <div className="flex items-center gap-1 text-[10px]">
                {([7, 14, 30] as const).map((days) => (
                  <button
                    key={days}
                    onClick={() => setRentalDays(days)}
                    className={`flex-1 py-1 rounded border transition ${
                      rentalDays === days
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-serif font-bold text-stone-900">
                    {formatINR(book.sale_price)}
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">to own</span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {book.stock_sale > 0 ? (
                    <span className="text-emerald-600 font-medium">In Stock ({book.stock_sale})</span>
                  ) : (
                    <span className="text-rose-500 font-medium">Out of Stock</span>
                  )}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 h-6 flex items-center">
                Free courier delivery included on orders above ₹499.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
          {activeTab === 'rent' ? (
            <button
              onClick={() => addItem(book, 'rent', rentalDays)}
              disabled={book.stock_rent <= 0}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white py-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              {book.stock_rent > 0 ? 'Rent This Book' : 'Currently Rented Out'}
            </button>
          ) : (
            <button
              onClick={() => addItem(book, 'buy')}
              disabled={book.stock_sale <= 0}
              className="flex-1 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              {book.stock_sale > 0 ? 'Buy & Keep' : 'Sold Out'}
            </button>
          )}

          <Link
            href={`/books/${book.id}`}
            className="p-2 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-50 transition"
            title="Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
