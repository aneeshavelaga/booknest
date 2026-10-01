'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { formatINR } from '@/lib/utils/currency';
import { createOrder } from '@/lib/services/orders';
import {
  ShieldCheck,
  Truck,
  Clock,
  ShoppingBag,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    salesSubtotal,
    rentalFeesTotal,
    securityDepositTotal,
    shippingFee,
    grandTotal,
    clearCart,
  } = useCart();
  const { profile } = useAuth();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || 'Alex Reader',
    email: profile?.email || 'alex.reader@booknest.com',
    phone: profile?.phone || '+1 (555) 234-5678',
    street: profile?.address_street || '742 Evergreen Terrace',
    city: profile?.address_city || 'Seattle',
    state: profile?.address_state || 'WA',
    postalCode: profile?.address_postal_code || '98101',
    orderNotes: '',
    paymentMethod: 'cash_on_delivery',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  if (items.length === 0 && !completedOrderNumber) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Your Basket is Empty</h2>
        <p className="text-xs text-stone-500">
          Add books to your cart for purchase or flexible rental before proceeding to checkout.
        </p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-full text-xs font-semibold"
        >
          Browse Library
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { order, orderNumber } = await createOrder({
      userId: profile?.id || null,
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      salesSubtotal,
      rentalFeesTotal,
      securityDepositTotal,
      shippingFee,
      grandTotal,
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: 'India',
      },
      items: items.map((i) => ({
        bookId: i.bookId,
        bookTitle: i.book.title,
        bookAuthor: i.book.author,
        coverImage: i.book.cover_image || undefined,
        itemType: i.itemType,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        rentalDays: i.rentalDays || null,
        securityDeposit: i.securityDeposit,
      })),
    });

    // Trigger realtime notification
    addNotification(
      `Order Confirmed: ${orderNumber}`,
      `Your order for ${formatINR(grandTotal)} has been placed successfully. Track delivery from your dashboard.`,
      'order_update',
      '/dashboard'
    );

    clearCart();
    setCompletedOrderNumber(orderNumber);
    setIsSubmitting(false);
  };

  // Order Success View
  if (completedOrderNumber) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Thank you for ordering with BookNest. Your books are being carefully prepared and packaged for dispatch.
          </p>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block text-xs font-mono font-bold text-stone-800">
            Order Reference: <span className="text-amber-700">{completedOrderNumber}</span>
          </div>

          {securityDepositTotal > 0 && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{formatINR(securityDepositTotal)} Refundable Security Deposit Protected</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Your deposit will be securely released back to your payment method when you return your rented books in good condition.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-full text-xs font-semibold shadow-md transition"
            >
              View Order in Dashboard
            </Link>
            <Link
              href="/books"
              className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-full text-xs font-semibold transition"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">
        Secure Checkout
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Shipping & Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact & Shipping Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Truck className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif font-bold text-lg text-stone-900">
                1. Delivery Address & Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-semibold mb-1">Phone Number (For Delivery Courier)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Production Payment Options (Zero Third-Party Gateway Dependencies) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Banknote className="w-5 h-5 text-emerald-600" />
              <h2 className="font-serif font-bold text-lg text-stone-900">
                2. Payment Method
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option 1: Cash On Delivery / Doorstep Payment */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  formData.paymentMethod === 'cash_on_delivery'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">Cash On Delivery / Card at Doorstep</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Zero Fees
                    </span>
                  </div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Pay securely in cash or card when our courier delivers your books to your doorstep.
                  </p>
                </div>
              </label>

              {/* Option 2: Direct Bank Transfer / Business Invoice */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  formData.paymentMethod === 'direct_bank_transfer'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="direct_bank_transfer"
                  checked={formData.paymentMethod === 'direct_bank_transfer'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">Direct Bank Wire / Official Invoice</span>
                    <Building2 className="w-4 h-4 text-stone-400" />
                  </div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    An official electronic invoice with BookNest wire details and reference number will be sent.
                  </p>
                </div>
              </label>

              {/* Option 3: BookNest Escrow & Store Deposit */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                  formData.paymentMethod === 'store_credit'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="store_credit"
                  checked={formData.paymentMethod === 'store_credit'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">BookNest Escrow & Reader Account Balance</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Utilize previously refunded rental deposits or store credit on file.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
            <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
              Order Review ({items.length} items)
            </h2>

            {/* Itemized List */}
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 text-xs">
                  <div className="w-12 h-16 rounded-md overflow-hidden bg-stone-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.book.cover_image || '/placeholder-book.jpg'}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-stone-900 truncate">{item.book.title}</h4>
                    <p className="text-[11px] text-stone-500 truncate">{item.book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.itemType === 'buy' ? (
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                          Purchase (Qty: {item.quantity})
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {item.rentalDays}d Rental (Qty: {item.quantity})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                    {item.itemType === 'rent' && (
                      <span className="block text-[9px] text-emerald-700">
                        +{formatINR(item.securityDeposit * item.quantity)} deposit
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Deposit Guarantee Box */}
            {securityDepositTotal > 0 && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{formatINR(securityDepositTotal)} Refundable Security Deposit</span>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    This deposit is completely refunded when you return your rented books.
                  </p>
                </div>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
              {salesSubtotal > 0 && (
                <div className="flex justify-between">
                  <span>Purchases Subtotal:</span>
                  <span className="font-medium text-stone-900">{formatINR(salesSubtotal)}</span>
                </div>
              )}
              {rentalFeesTotal > 0 && (
                <div className="flex justify-between">
                  <span>Rental Fees Subtotal:</span>
                  <span className="font-medium text-stone-900">{formatINR(rentalFeesTotal)}</span>
                </div>
              )}
              {securityDepositTotal > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-medium">{formatINR(securityDepositTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Courier Insured Delivery:</span>
                <span className="font-medium text-stone-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE (Order &gt; ₹499)</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                <span>Grand Total:</span>
                <span className="text-xl font-serif text-amber-700">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Place Order & Schedule Dispatch</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
