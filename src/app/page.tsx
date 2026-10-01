import React from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/home/HeroBanner';
import { RentalPerks } from '@/components/home/RentalPerks';
import { BookCard } from '@/components/books/BookCard';
import { getBooks, getCategories } from '@/lib/services/books';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Flame,
  Award,
  BookCheck,
  Cpu,
  Briefcase,
  Compass,
  User,
} from 'lucide-react';

export default async function HomePage() {
  const [books, categories] = await Promise.all([
    getBooks(),
    getCategories(),
  ]);

  const featuredRentals = books.filter((b) => b.is_available_for_rent).slice(0, 4);
  const featuredBestsellers = books.filter((b) => b.is_featured).slice(0, 4);

  const getCategoryIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-emerald-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-amber-600" />;
      case 'User':
        return <User className="w-5 h-5 text-rose-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Category Navigation Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-600">
              Curated Shelves
            </span>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Browse by Category
            </h2>
          </div>
          <Link
            href="/books"
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/books?category=${cat.id}`}
              className="p-4 bg-white rounded-2xl border border-stone-200/80 hover:border-amber-400 hover:shadow-md transition text-center group flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-amber-50 flex items-center justify-center transition">
                {getCategoryIcon(cat.icon)}
              </div>
              <h3 className="text-xs font-semibold text-stone-800 group-hover:text-amber-700 transition line-clamp-1">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Rentals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold mb-1.5">
              <Flame className="w-3 h-3 text-amber-600" /> Most Rented This Month
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Popular Rentals for 7 to 30 Days
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Read great books at a fraction of retail price with 100% refundable security deposits.
            </p>
          </div>
          <Link
            href="/books?type=rent"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-full border border-amber-200/60 transition"
          >
            Explore All Rentals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredRentals.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 4. How Renting Works Explainer */}
      <RentalPerks />

      {/* 5. Featured Books to Buy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
              <Award className="w-3 h-3 text-emerald-600" /> Permanent Library Additions
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Bestsellers to Purchase & Keep
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Premium editions, crisp condition, prompt tracked shipping to your door.
            </p>
          </div>
          <Link
            href="/books?type=sale"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-full border border-stone-200 transition"
          >
            Browse Buy Shelf <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBestsellers.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 6. Testimonial / Trust Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              The BookNest Pledge
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              Enjoy complete peace of mind with our Guaranteed Deposit Protection.
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans">
              Every book rented from BookNest is quality-verified before dispatch. When you return your rented book, our logistics team inspects the copy and releases your security deposit back within 24 hours. No hidden deductions, no hassles.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/books"
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-3 rounded-full text-xs shadow-md transition"
              >
                Start Browsing
              </Link>
              <Link
                href="/how-it-works"
                className="bg-stone-800 hover:bg-stone-700 text-white font-medium px-6 py-3 rounded-full text-xs border border-stone-700 transition"
              >
                Read Deposit Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
