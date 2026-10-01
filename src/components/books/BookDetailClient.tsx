'use client';

import React, { useState } from 'react';
import { Book, Review } from '@/types/database';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/utils/currency';
import {
  Star,
  ShieldCheck,
  Clock,
  ShoppingBag,
  RotateCcw,
  Truck,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface BookDetailClientProps {
  book: Book;
  relatedBooks: Book[];
}

export function BookDetailClient({ book, relatedBooks }: BookDetailClientProps) {
  const { addItem } = useCart();
  const { profile } = useAuth();

  const [activeMode, setActiveMode] = useState<'rent' | 'buy'>('rent');
  const [rentalDays, setRentalDays] = useState<7 | 14 | 30>(14);

  // Review state
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      book_id: book.id,
      user_id: 'u-1',
      rating: 5,
      title: 'Flawless condition and speedy delivery!',
      comment: 'Rented this for 14 days. The book arrived in pristine condition inside a nice protective sleeve. Returning it was effortless and my deposit was credited back the next day.',
      is_verified_purchase: true,
      created_at: '2026-02-15T00:00:00Z',
    },
    {
      id: 'rev-2',
      book_id: book.id,
      user_id: 'u-2',
      rating: 5,
      title: 'Indispensable reading.',
      comment: 'Decided to buy after reading half of it. Great packaging and competitive pricing compared to other book stores.',
      is_verified_purchase: true,
      created_at: '2026-02-28T00:00:00Z',
    },
  ]);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const currentRentPrice =
    rentalDays === 7
      ? book.rent_price_7_days
      : rentalDays === 14
      ? book.rent_price_14_days
      : book.rent_price_30_days;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      book_id: book.id,
      user_id: profile?.id || 'demo-user',
      rating: newRating,
      title: newTitle.trim() || 'Verified Reader Review',
      comment: newComment.trim(),
      is_verified_purchase: true,
      created_at: new Date().toISOString(),
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setNewTitle('');
    setReviewSubmitted(true);
  };

  return (
    <div className="space-y-12">
      {/* Top Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Cover Image */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-100 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.cover_image || '/placeholder-book.jpg'}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-stone-900 shadow-md backdrop-blur-xs border border-stone-200">
                Condition: {book.condition.replace('_', ' ')}
              </span>
              {book.is_featured && (
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-stone-950 shadow-md">
                  Featured Bestseller
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" /> Insured Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-600" /> Free Returns
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Verified Clean
            </span>
          </div>
        </div>

        {/* Right: Details & Purchase/Rental Engine */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {book.category?.name || 'General Catalog'}
              </span>
              <div className="flex items-center text-amber-500 text-xs gap-1 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{book.rating_average.toFixed(1)}</span>
                <span className="text-stone-400">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-1">
              By <span className="font-semibold text-stone-800">{book.author}</span>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            {book.description}
          </p>

          {/* Book Specs Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-100/70 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Publisher</span>
              <span className="font-semibold text-stone-800">{book.publisher || 'Independent'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Publication Year</span>
              <span className="font-semibold text-stone-800">{book.publication_year || 'Recent'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Pages</span>
              <span className="font-semibold text-stone-800">{book.pages || '400+'} pages</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">ISBN-13</span>
              <span className="font-semibold text-stone-800">{book.isbn || 'Available'}</span>
            </div>
          </div>

          {/* Dual Engine: Buy vs Rent Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-500/20 shadow-lg space-y-5">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveMode('rent')}
                className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeMode === 'rent'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Clock className="w-4 h-4" /> Rent Physical Copy
              </button>
              <button
                onClick={() => setActiveMode('buy')}
                className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeMode === 'buy'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" /> Buy to Keep
              </button>
            </div>

            {/* Renting Configuration */}
            {activeMode === 'rent' ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-stone-500 block">Rental Fee for {rentalDays} Days:</span>
                    <span className="text-3xl font-serif font-bold text-stone-900">
                      {formatINR(currentRentPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Refundable Deposit:</span>
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> {formatINR(book.security_deposit)}
                    </span>
                  </div>
                </div>

                {/* Duration Picker Pills */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Choose Rental Duration:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {([7, 14, 30] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setRentalDays(days)}
                        className={`p-3 rounded-xl border text-center transition ${
                          rentalDays === days
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold ring-2 ring-amber-600/30'
                            : 'border-stone-200 hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <span className="text-xs block">{days} Days</span>
                        <span className="text-sm font-bold">
                          {formatINR(days === 7 ? book.rent_price_7_days : days === 14 ? book.rent_price_14_days : book.rent_price_30_days)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rental Terms Guarantee */}
                <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Due Date:</span>
                    <strong className="text-stone-800" suppressHydrationWarning>
                      {new Date(Date.now() + rentalDays * 86400000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deposit Refund Timeline:</span>
                    <strong className="text-emerald-700">Within 24h of return inspection</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Available Copies for Rent:</span>
                    <span className="font-semibold text-stone-800">{book.stock_rent} in stock</span>
                  </div>
                </div>

                <button
                  onClick={() => addItem(book, 'rent', rentalDays)}
                  disabled={book.stock_rent <= 0}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {book.stock_rent > 0 ? `Rent for ${rentalDays} Days (${formatINR(currentRentPrice)})` : 'Currently Rented Out'}
                </button>
              </div>
            ) : (
              /* Buying Configuration */
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-stone-500 block">Purchase Price:</span>
                    <span className="text-3xl font-serif font-bold text-stone-900">
                      {formatINR(book.sale_price)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Inventory:</span>
                    {book.stock_sale > 0 ? (
                      <span className="text-xs font-semibold text-emerald-700">
                        {book.stock_sale} units available
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-600">Out of Stock</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-600">
                  Own a pristine physical copy for your home shelf. Includes our 30-day satisfaction guarantee.
                </p>

                <button
                  onClick={() => addItem(book, 'buy')}
                  disabled={book.stock_sale <= 0}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  {book.stock_sale > 0 ? `Add to Cart (${formatINR(book.sale_price)})` : 'Temporarily Sold Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Reader Reviews & Rental Feedback
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
              <div className="flex text-amber-500">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <strong className="text-stone-900">{book.rating_average.toFixed(1)} out of 5</strong>
              <span>• Based on {reviews.length} community reviews</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-xs text-stone-900">{r.title}</span>
                </div>
                {r.is_verified_purchase && (
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Reader
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{r.comment}</p>
              <span className="text-[10px] text-stone-400 block pt-1" suppressHydrationWarning>
                Reviewed on {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>

        {/* Add Review Form */}
        <div className="pt-6 border-t border-stone-200">
          <h3 className="font-serif font-bold text-sm text-stone-900 mb-3">
            Leave a Review for this Title
          </h3>

          {reviewSubmitted ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Thank you! Your verified review has been published.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs max-w-xl">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Your Rating:</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewRating(s)}
                      className="p-1 text-amber-500 hover:scale-110 transition"
                    >
                      <Star className={`w-5 h-5 ${s <= newRating ? 'fill-current' : 'text-stone-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 font-semibold text-stone-700">{newRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Review Headline:</label>
                <input
                  type="text"
                  placeholder="e.g. Great rental experience, quick return"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Your Review:</label>
                <textarea
                  rows={3}
                  placeholder="Share details about the book's condition, reading experience, and delivery..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl font-semibold shadow-xs transition"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            More Titles You Might Enjoy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <div
                key={relBook.id}
                className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="flex gap-3">
                  <div className="w-14 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={relBook.cover_image || '/placeholder-book.jpg'}
                      alt={relBook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xs text-stone-900 line-clamp-2">
                      {relBook.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">{relBook.author}</p>
                    <span className="text-xs font-bold text-amber-700 font-serif block mt-1">
                      Rent from {formatINR(relBook.rent_price_7_days)}
                    </span>
                  </div>
                </div>
                <a
                  href={`/books/${relBook.id}`}
                  className="mt-3 text-center py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition"
                >
                  View Book
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
