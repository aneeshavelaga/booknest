'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ShoppingBag,
  Bell,
  User,
  Shield,
  Search,
  Menu,
  X,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

export function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { profile, role, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-12 h-12 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="BookNest Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif block leading-none">
                Book<span className="text-amber-600">Nest</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-amber-700 font-sans font-bold">
                RENT • READ • BUY
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              placeholder="Search books by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-800 placeholder-stone-400 transition"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link
              href="/books"
              className={`hover:text-amber-700 transition ${
                pathname === '/books' ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              Browse Catalog
            </Link>
            <Link
              href="/how-it-works"
              className={`hover:text-amber-700 transition ${
                pathname === '/how-it-works' ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              How Renting Works
            </Link>
            <Link
              href="/dashboard"
              className={`hover:text-amber-700 transition ${
                pathname.startsWith('/dashboard') ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              My Rentals & Orders
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition ${
                  pathname.startsWith('/admin') ? 'ring-2 ring-indigo-400' : ''
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Store Admin
              </Link>
            )}
          </nav>

          {/* Action Icons: Notifications, Cart, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Realtime Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-stone-600 hover:text-amber-600 hover:bg-stone-100 rounded-full transition relative"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-stone-900">Notifications</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                        Realtime
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-stone-500 py-6 text-center">
                        No notifications right now.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 text-xs rounded-lg transition cursor-pointer flex flex-col gap-1 ${
                            n.is_read ? 'hover:bg-stone-50 text-stone-600' : 'bg-amber-50/60 text-stone-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-800">{n.title}</span>
                            {!n.is_read && (
                              <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-stone-400 self-end">
                            {new Date(n.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-full text-xs font-medium transition shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded-full text-[11px] min-w-4 text-center">
                {totalItemsCount}
              </span>
            </button>

            {/* User Profile / Dashboard Avatar */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition border border-stone-200"
              title={`Logged in as ${profile?.full_name} (${role})`}
            >
              <div className="w-7 h-7 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center text-stone-600">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search - Visible on small devices */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-full text-stone-800"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
          </form>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200 space-y-2">
            <Link
              href="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
            >
              Browse Catalog
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
            >
              How Renting Works
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
            >
              My Rentals & Orders
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-700 bg-indigo-50"
              >
                Store Admin Management
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
