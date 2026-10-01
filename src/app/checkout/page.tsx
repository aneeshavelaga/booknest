import React from 'react';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata = {
  title: 'Checkout | BookNest',
  description: 'Complete your purchase and rental booking with transparent refundable deposits and tracked delivery.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
