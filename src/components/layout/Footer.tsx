import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800 text-xs">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white rounded-xl p-1 shrink-0 shadow-md">
                <Image
                  src="/logo.png"
                  alt="BookNest Logo"
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white tracking-tight block">
                  Book<span className="text-amber-500">Nest</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold font-sans">
                  RENT • READ • BUY
                </span>
              </div>
            </Link>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              The premier online book retailer and rental platform. Buy collector copies or rent physical books for 7 to 30 days with automated due date tracking and guaranteed refundable deposits.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Insured Deliveries & Deposit Protection</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Store Catalog</h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="/books" className="hover:text-amber-400 transition">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/books?type=rent" className="hover:text-amber-400 transition">
                  Rentals Under ₹99
                </Link>
              </li>
              <li>
                <Link href="/books?type=sale" className="hover:text-amber-400 transition">
                  New & Like-New to Buy
                </Link>
              </li>
              <li>
                <Link href="/books?condition=new" className="hover:text-amber-400 transition">
                  Collector Editions
                </Link>
              </li>
            </ul>
          </div>

          {/* Rental Services */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Rental Policy</h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition">
                  How Renting Works
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#deposit-policy" className="hover:text-amber-400 transition">
                  Deposit Refund Rules
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition">
                  Request Book Return
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition">
                  Rental Extensions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Store Operations</h4>
            <ul className="space-y-2.5 text-stone-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>100 Bookstore Way, Seattle, WA</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>+1 (800) 555-NEST</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>concierge@booknest.store</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} BookNest. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-stone-400">Built with Next.js 16 + Supabase PostgreSQL</span>
            <span className="text-stone-400">Vercel Pro Production Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
