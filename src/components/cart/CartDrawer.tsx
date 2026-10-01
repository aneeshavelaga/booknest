'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils/currency';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    updateRentalDays,
    salesSubtotal,
    rentalFeesTotal,
    securityDepositTotal,
    shippingFee,
    grandTotal,
    totalItemsCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-stone-900">Your Basket</h2>
              <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-semibold text-stone-900 text-base mb-1">
                  Your cart is empty
                </h3>
                <p className="text-stone-500 text-xs mb-6 max-w-xs mx-auto">
                  Browse our catalog to buy books for your permanent shelf or rent them for 7, 14, or 30 days.
                </p>
                <Link
                  href="/books"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs transition"
                >
                  Browse Books <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex gap-3.5 relative group"
                >
                  {/* Book Cover */}
                  <div className="w-16 h-22 rounded-md overflow-hidden bg-stone-200 shrink-0 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.book.cover_image || '/placeholder-book.jpg'}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {item.book.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-rose-600 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{item.book.author}</p>

                      {/* Type Badge & Rental Duration Picker */}
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {item.itemType === 'buy' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                            Purchase (To Keep)
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-200 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Rental
                            </span>
                            {/* Duration pills */}
                            <div className="flex bg-stone-200/80 rounded-md p-0.5 text-[9px] font-medium">
                              {([7, 14, 30] as const).map((days) => (
                                <button
                                  key={days}
                                  onClick={() => updateRentalDays(item.id, days)}
                                  className={`px-1.5 py-0.5 rounded transition ${
                                    item.rentalDays === days
                                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                                      : 'text-stone-600 hover:text-stone-900'
                                  }`}
                                >
                                  {days}d
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-stone-300 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-stone-900">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                        {item.itemType === 'rent' && (
                          <span className="block text-[9px] text-emerald-700 font-medium">
                            +{formatINR(item.securityDeposit * item.quantity)} deposit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Refundable Deposit Notice */}
              {securityDepositTotal > 0 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{formatINR(securityDepositTotal)} Security Deposit</span>
                    <p className="text-[11px] text-emerald-700 leading-tight">
                      100% refundable as soon as rented books are returned in good condition.
                    </p>
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                {salesSubtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Book Purchases:</span>
                    <span className="font-medium text-stone-900">{formatINR(salesSubtotal)}</span>
                  </div>
                )}
                {rentalFeesTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Rental Fees:</span>
                    <span className="font-medium text-stone-900">{formatINR(rentalFeesTotal)}</span>
                  </div>
                )}
                {securityDepositTotal > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Refundable Deposits:</span>
                    <span className="font-medium">{formatINR(securityDepositTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping & Delivery:</span>
                  <span className="font-medium text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE (Over ₹499)</span>
                    ) : (
                      formatINR(shippingFee)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>Grand Total:</span>
                  <span className="text-base text-amber-700 font-serif">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-semibold text-sm shadow-md transition"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
