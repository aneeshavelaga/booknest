'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, RefreshCw, BookMarked, Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-stone-50 to-white border-b border-stone-200 py-12 md:py-20">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Smart Hybrid Bookstore • Rent or Own</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
              Read more, spend less. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">
                Rent for weeks or buy for life.
              </span>
            </h1>

            <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
              BookNest gives you full freedom. Rent bestselling hardcovers & paperbacks for 7, 14, or 30 days with a 100% refundable security deposit, or purchase copies for your permanent library.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/books?type=rent"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-lg shadow-amber-600/25 transition duration-200"
              >
                <Clock className="w-4 h-4" />
                Explore Rentals from ₹69
              </Link>
              <Link
                href="/books?type=sale"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-md transition duration-200"
              >
                Browse Books to Buy <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-200/80 text-left">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">100% Safe Deposits</h4>
                  <p className="text-[11px] text-stone-500">Auto-refunded on return</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Easy Extensions</h4>
                  <p className="text-[11px] text-stone-500">Extend anytime in 1-click</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Pristine Quality</h4>
                  <p className="text-[11px] text-stone-500">Sanitized & verified copies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-200/80 relative">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    How it Compares
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                  Save up to 80%
                </span>
              </div>

              {/* Comparison Matrix */}
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-800">Standard Retail Buy</span>
                    <p className="text-[11px] text-stone-500">Keep forever on your shelf</p>
                  </div>
                  <span className="font-bold text-stone-900 font-serif">₹499 - ₹1,299</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-amber-950">BookNest 14-Day Rental</span>
                      <span className="text-[9px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded">
                        POPULAR
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">Read & return when finished</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-900 font-serif text-sm">₹99 - ₹199</span>
                    <span className="block text-[9px] text-emerald-700 font-medium">Refundable deposit</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-800">Need More Time?</span>
                    <p className="text-[11px] text-stone-500">Extend your rental easily</p>
                  </div>
                  <span className="font-semibold text-stone-700">+₹20/day</span>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-200/80 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                </div>
                <p className="text-[11px] leading-tight">
                  <span className="font-bold">Guaranteed Return Inspection:</span> We inspect returned books and initiate your deposit refund within 24 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
