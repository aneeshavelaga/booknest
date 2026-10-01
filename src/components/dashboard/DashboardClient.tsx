'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { formatINR } from '@/lib/utils/currency';
import { getUserOrders, getUserRentals } from '@/lib/services/orders';
import { updateUserProfile } from '@/lib/services/profile';
import {
  BookOpen,
  Clock,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  Camera,
} from 'lucide-react';

export function DashboardClient() {
  const { profile, role, switchDemoRole, updateProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'rentals' | 'orders' | 'deposits' | 'profile'>('rentals');

  // Rentals state
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.full_name || 'Alex Reader',
    email: profile?.email || 'alex.reader@booknest.com',
    phone: profile?.phone || '+91 98765 43210',
    avatarUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    addressStreet: profile?.address_street || '42 MG Road, Indiranagar',
    addressCity: profile?.address_city || 'Bengaluru',
    addressState: profile?.address_state || 'Karnataka',
    addressPostalCode: profile?.address_postal_code || '560038',
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm((prev) => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        avatarUrl: profile.avatar_url || prev.avatarUrl,
        addressStreet: profile.address_street || prev.addressStreet,
        addressCity: profile.address_city || prev.addressCity,
        addressState: profile.address_state || prev.addressState,
        addressPostalCode: profile.address_postal_code || prev.addressPostalCode,
      }));
    }
  }, [profile]);

  // Modal states for return & extension
  const [selectedRental, setSelectedRental] = useState<any | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState('Tomorrow, 2:00 PM - 5:00 PM');
  const [pickupAddress, setPickupAddress] = useState(
    profileForm.addressStreet
      ? `${profileForm.addressStreet}, ${profileForm.addressCity}, ${profileForm.addressState} - ${profileForm.addressPostalCode}`
      : '42 MG Road, Indiranagar, Bengaluru, Karnataka - 560038'
  );

  useEffect(() => {
    async function loadData() {
      // 1. Load rentals
      const userRentals = await getUserRentals(profile?.id);
      if (userRentals && userRentals.length > 0) {
        setRentals(userRentals);
      } else {
        const defaultRentals = [
          {
            id: 'rent-101',
            order_id: 'ord-101',
            order_number: 'BN-2026-482910',
            book_id: 'b0000000-0000-0000-0000-000000000001',
            book_title: 'Designing Data-Intensive Applications',
            book_author: 'Martin Kleppmann',
            cover_image:
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
            rental_days: 14,
            start_date: new Date(Date.now() - 9 * 86400000).toISOString(),
            due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
            rental_fee: 249,
            deposit_amount: 500,
            status: 'active',
            deposit_status: 'held',
          },
          {
            id: 'rent-102',
            order_id: 'ord-102',
            order_number: 'BN-2026-391823',
            book_id: 'b0000000-0000-0000-0000-000000000002',
            book_title: 'Dune (60th Anniversary Deluxe)',
            book_author: 'Frank Herbert',
            cover_image:
              'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
            rental_days: 7,
            start_date: new Date(Date.now() - 14 * 86400000).toISOString(),
            due_date: new Date(Date.now() - 7 * 86400000).toISOString(),
            rental_fee: 99,
            deposit_amount: 300,
            status: 'returned',
            deposit_status: 'refunded',
          },
        ];
        setRentals(defaultRentals);
      }

      // 2. Load orders
      const userOrders = await getUserOrders(profile?.id);
      if (userOrders && userOrders.length > 0) {
        setOrders(userOrders);
      } else {
        const defaultOrders = [
          {
            id: 'ord-101',
            order_number: 'BN-2026-482910',
            customer_name: profileForm.fullName,
            sales_subtotal: 0,
            rental_fees_total: 249,
            security_deposit_total: 500,
            shipping_fee: 0,
            grand_total: 749,
            payment_method: 'cash_on_delivery',
            order_status: 'delivered',
            created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
            items: [
              {
                book_title: 'Designing Data-Intensive Applications',
                item_type: 'rent',
                rental_days: 14,
                quantity: 1,
                unit_price: 249,
              },
            ],
          },
        ];
        setOrders(defaultOrders);
      }
    }

    loadData();
  }, [profile?.id]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      full_name: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
      avatar_url: profileForm.avatarUrl,
      address_street: profileForm.addressStreet,
      address_city: profileForm.addressCity,
      address_state: profileForm.addressState,
      address_postal_code: profileForm.addressPostalCode,
      updated_at: new Date().toISOString(),
    };

    if (profile?.id) {
      await updateUserProfile(profile.id, {
        full_name: profileForm.fullName,
        phone: profileForm.phone,
        avatar_url: profileForm.avatarUrl,
        address_street: profileForm.addressStreet,
        address_city: profileForm.addressCity,
        address_state: profileForm.addressState,
        address_postal_code: profileForm.addressPostalCode,
      });
    }

    await updateProfile(updatedProfile);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3500);

    addNotification(
      'Profile Updated Successfully',
      'Your personal details and shipping address have been saved to your account.',
      'system',
      '/dashboard'
    );
  };

  // Handle Return Initiation
  const handleInitiateReturn = (rental: any) => {
    setSelectedRental(rental);
    setIsReturnModalOpen(true);
  };

  const confirmReturnPickup = () => {
    if (!selectedRental) return;

    const updated = rentals.map((r) =>
      r.id === selectedRental.id
        ? {
            ...r,
            status: 'return_pending',
            deposit_status: 'refund_pending',
            return_pickup_scheduled: pickupDate,
          }
        : r
    );

    setRentals(updated);
    localStorage.setItem('booknest_user_rentals', JSON.stringify(updated));

    addNotification(
      'Return Pickup Scheduled',
      `Courier will collect "${selectedRental.book_title}" on ${pickupDate}. Your ${formatINR(selectedRental.deposit_amount)} deposit will be refunded upon inspection.`,
      'deposit_refund',
      '/dashboard'
    );

    setIsReturnModalOpen(false);
    setSelectedRental(null);
  };

  // Handle Rental Extension (+7 Days)
  const handleExtendRental = (rental: any) => {
    const currentDue = new Date(rental.due_date).getTime();
    const newDueDate = new Date(currentDue + 7 * 86400000).toISOString();

    const updated = rentals.map((r) =>
      r.id === rental.id
        ? {
            ...r,
            due_date: newDueDate,
            rental_days: r.rental_days + 7,
            rental_fee: r.rental_fee + 79,
          }
        : r
    );

    setRentals(updated);
    localStorage.setItem('booknest_user_rentals', JSON.stringify(updated));

    addNotification(
      'Rental Extended (+7 Days)',
      `Your rental for "${rental.book_title}" has been extended until ${new Date(newDueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}.`,
      'rental_reminder',
      '/dashboard'
    );
  };

  // Metrics
  const activeRentalsCount = rentals.filter((r) => r.status === 'active' || r.status === 'return_pending').length;
  const heldDepositsTotal = rentals
    .filter((r) => r.deposit_status === 'held' || r.deposit_status === 'refund_pending')
    .reduce((acc, r) => acc + (r.deposit_amount || 0), 0);
  const refundedDepositsTotal = rentals
    .filter((r) => r.deposit_status === 'refunded')
    .reduce((acc, r) => acc + (r.deposit_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileForm.avatarUrl}
              alt={profileForm.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-stone-900">
                {profileForm.fullName}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full border border-stone-300">
                {role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{profileForm.email}</p>
            <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" />
              {profileForm.addressCity}, {profileForm.addressState} - {profileForm.addressPostalCode}
            </p>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-center min-w-24">
            <span className="text-xl font-serif font-bold text-amber-900">{activeRentalsCount}</span>
            <span className="block text-[10px] text-amber-800 font-medium">Active Rentals</span>
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-center min-w-28">
            <span className="text-xl font-serif font-bold text-emerald-900">
              {formatINR(heldDepositsTotal)}
            </span>
            <span className="block text-[10px] text-emerald-800 font-medium">Protected Escrow</span>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-center min-w-24">
            <span className="text-xl font-serif font-bold text-stone-900">{orders.length}</span>
            <span className="block text-[10px] text-stone-600 font-medium">Total Orders</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-stone-200 text-sm font-semibold gap-6 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('rentals')}
          className={`pb-3 transition flex items-center gap-2 relative whitespace-nowrap ${
            activeTab === 'rentals'
              ? 'text-amber-700 border-b-2 border-amber-600 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active & Past Rentals</span>
          <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full">
            {rentals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition flex items-center gap-2 relative whitespace-nowrap ${
            activeTab === 'orders'
              ? 'text-amber-700 border-b-2 border-amber-600 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders & Invoices</span>
          <span className="text-xs bg-stone-200 text-stone-800 px-2 py-0.2 rounded-full">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`pb-3 transition flex items-center gap-2 relative whitespace-nowrap ${
            activeTab === 'deposits'
              ? 'text-amber-700 border-b-2 border-amber-600 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Escrow Deposit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition flex items-center gap-2 relative whitespace-nowrap ${
            activeTab === 'profile'
              ? 'text-amber-700 border-b-2 border-amber-600 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4 text-indigo-600" />
          <span>My Profile & Address</span>
        </button>
      </div>

      {/* Tab 1: Rentals View */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          {rentals.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-stone-900 text-lg mb-1">
                No active book rentals yet
              </h3>
              <p className="text-stone-500 text-xs mb-4">
                Rent any title from our catalog for 7 to 30 days with a 100% refundable deposit.
              </p>
              <Link
                href="/books?type=rent"
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs"
              >
                Browse Books for Rent
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rentals.map((rental) => {
                const now = Date.now();
                const due = new Date(rental.due_date).getTime();
                const daysLeft = Math.ceil((due - now) / 86400000);
                const isOverdue = daysLeft < 0 && rental.status === 'active';

                return (
                  <div
                    key={rental.id}
                    className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                  >
                    <div>
                      {/* Status header */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <span className="text-[11px] font-mono text-stone-400">
                          Order: {rental.order_number}
                        </span>

                        {rental.status === 'returned' ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Returned & Verified
                          </span>
                        ) : rental.status === 'return_pending' ? (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <RotateCcw className="w-3 h-3 animate-spin" /> Pickup Scheduled
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {Math.abs(daysLeft)} Days Overdue
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            {daysLeft === 0 ? 'Due Today' : `${daysLeft} Days Remaining`}
                          </span>
                        )}
                      </div>

                      {/* Book info */}
                      <div className="flex gap-4 pt-3">
                        <div className="w-16 h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={rental.cover_image || '/placeholder-book.jpg'}
                            alt={rental.book_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">
                            {rental.book_title}
                          </h3>
                          <p className="text-xs text-stone-500 mb-2">{rental.book_author}</p>

                          <div className="text-[11px] space-y-0.5 text-stone-600">
                            <div>
                              <span>Rental Duration:</span>{' '}
                              <strong className="text-stone-800">{rental.rental_days} Days</strong>
                            </div>
                            <div>
                              <span>Due Date:</span>{' '}
                              <strong className="text-stone-800">
                                {new Date(rental.due_date).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </strong>
                            </div>
                            <div className="text-emerald-700 font-semibold">
                              <span>Security Deposit:</span> {formatINR(rental.deposit_amount)}{' '}
                              ({rental.deposit_status})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {rental.status === 'active' && (
                      <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                        <button
                          onClick={() => handleInitiateReturn(rental)}
                          className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Request Free Return
                        </button>
                        <button
                          onClick={() => handleExtendRental(rental)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 py-2 px-3 rounded-xl text-xs font-semibold transition"
                          title="Extend rental by 7 days"
                        >
                          +7 Days (₹79)
                        </button>
                      </div>
                    )}

                    {rental.status === 'return_pending' && (
                      <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pickup scheduled: <strong>{rental.return_pickup_scheduled || 'Tomorrow'}</strong></span>
                      </div>
                    )}

                    {rental.status === 'returned' && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Book returned in good condition. Deposit of {formatINR(rental.deposit_amount)} refunded.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders View */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div>
                  <span className="font-serif font-bold text-stone-900 text-sm">
                    Order Reference: {ord.order_number}
                  </span>
                  <p className="text-[11px] text-stone-400">
                    Placed on {new Date(ord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {ord.order_status}
                  </span>
                  <span className="font-serif font-bold text-stone-900 text-base">
                    {formatINR(ord.grand_total)}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2 text-xs">
                {ord.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-stone-800 font-medium">
                      {item.book_title} ({item.item_type === 'rent' ? `${item.rental_days}d Rental` : 'Purchase'})
                    </span>
                    <span className="text-stone-600 font-semibold">{formatINR(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Escrow Ledger */}
      {activeTab === 'deposits' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Security Deposit Escrow Account
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              BookNest holds 100% refundable security deposits in a dedicated trust ledger until book returns are inspected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <span className="text-xs text-amber-800 font-semibold block">Currently Held in Escrow:</span>
              <span className="text-3xl font-serif font-bold text-amber-950 mt-1 block">
                {formatINR(heldDepositsTotal)}
              </span>
              <p className="text-[11px] text-amber-800 mt-2">
                Covers {activeRentalsCount} active rentals. 100% credited back when returned.
              </p>
            </div>

            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <span className="text-xs text-emerald-800 font-semibold block">Total Deposits Refunded to Date:</span>
              <span className="text-3xl font-serif font-bold text-emerald-950 mt-1 block">
                {formatINR(refundedDepositsTotal)}
              </span>
              <p className="text-[11px] text-emerald-800 mt-2">
                Processed automatically to your original payment method.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: User Profile Editor */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Edit Reader Profile & Delivery Address
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Update your personal contact information and delivery address for book deliveries and courier pickups.
            </p>
          </div>

          {profileSaveSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Profile and delivery address updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            {/* Avatar Preview & URL */}
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileForm.avatarUrl}
                  alt={profileForm.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <label className="block text-stone-700 font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-semibold mb-1">Phone Number (For Delivery & Return Courier)</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" /> Primary Shipping Address
              </h4>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Street Address / Apartment / Landmark</label>
                <input
                  type="text"
                  required
                  value={profileForm.addressStreet}
                  onChange={(e) => setProfileForm({ ...profileForm, addressStreet: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={profileForm.addressCity}
                    onChange={(e) => setProfileForm({ ...profileForm, addressCity: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={profileForm.addressState}
                    onChange={(e) => setProfileForm({ ...profileForm, addressState: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">PIN / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={profileForm.addressPostalCode}
                    onChange={(e) => setProfileForm({ ...profileForm, addressPostalCode: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white px-7 py-3 rounded-2xl font-bold shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-amber-400" />
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Return Modal */}
      {isReturnModalOpen && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Schedule Free Book Return
                </h3>
                <p className="text-xs text-stone-500">{selectedRental.book_title}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Pickup Time Window:</label>
                <select
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                >
                  <option value="Tomorrow, 10:00 AM - 1:00 PM">Tomorrow, 10:00 AM - 1:00 PM</option>
                  <option value="Tomorrow, 2:00 PM - 5:00 PM">Tomorrow, 2:00 PM - 5:00 PM</option>
                  <option value="Day after Tomorrow, 10:00 AM - 1:00 PM">Day after Tomorrow, 10:00 AM - 1:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Pickup Address:</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{formatINR(selectedRental.deposit_amount)} Deposit Refund:</strong> Our courier will verify condition and release your full deposit within 24 hours.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturnPickup}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition"
              >
                Confirm Pickup & Request Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
