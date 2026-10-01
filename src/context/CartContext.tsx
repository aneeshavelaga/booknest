'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Book, CartItem, OrderItemType } from '@/types/database';

interface CartContextType {
  items: CartItem[];
  addItem: (book: Book, itemType: OrderItemType, rentalDays?: 7 | 14 | 30) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateRentalDays: (itemId: string, days: 7 | 14 | 30) => void;
  clearCart: () => void;
  totalItemsCount: number;
  salesSubtotal: number;
  rentalFeesTotal: number;
  securityDepositTotal: number;
  shippingFee: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('booknest_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('booknest_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (book: Book, itemType: OrderItemType, rentalDays: 7 | 14 | 30 = 14) => {
    setItems((prev) => {
      const durationKey = itemType === 'rent' ? `-${rentalDays}d` : '';
      const cartItemId = `${book.id}-${itemType}${durationKey}`;

      const existingIndex = prev.findIndex((i) => i.id === cartItemId);

      let unitPrice = book.sale_price;
      let deposit = 0;

      if (itemType === 'rent') {
        deposit = book.security_deposit;
        if (rentalDays === 7) unitPrice = book.rent_price_7_days;
        else if (rentalDays === 14) unitPrice = book.rent_price_14_days;
        else if (rentalDays === 30) unitPrice = book.rent_price_30_days;
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          bookId: book.id,
          book,
          itemType,
          quantity: 1,
          rentalDays: itemType === 'rent' ? rentalDays : undefined,
          unitPrice,
          securityDeposit: deposit,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const updateRentalDays = (itemId: string, days: 7 | 14 | 30) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId && i.itemType === 'rent') {
          let unitPrice = i.book.rent_price_14_days;
          if (days === 7) unitPrice = i.book.rent_price_7_days;
          else if (days === 14) unitPrice = i.book.rent_price_14_days;
          else if (days === 30) unitPrice = i.book.rent_price_30_days;

          const newId = `${i.bookId}-rent-${days}d`;
          return {
            ...i,
            id: newId,
            rentalDays: days,
            unitPrice,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const salesSubtotal = items
    .filter((i) => i.itemType === 'buy')
    .reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  const rentalFeesTotal = items
    .filter((i) => i.itemType === 'rent')
    .reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  const securityDepositTotal = items
    .filter((i) => i.itemType === 'rent')
    .reduce((acc, curr) => acc + curr.securityDeposit * curr.quantity, 0);

  // Free shipping on cart value over ₹499, else ₹49 standard insured courier
  const totalValueBeforeShipping = salesSubtotal + rentalFeesTotal;
  const shippingFee = totalValueBeforeShipping === 0 ? 0 : totalValueBeforeShipping > 499 ? 0 : 49;

  const grandTotal = salesSubtotal + rentalFeesTotal + securityDepositTotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateRentalDays,
        clearCart,
        totalItemsCount,
        salesSubtotal,
        rentalFeesTotal,
        securityDepositTotal,
        shippingFee,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
