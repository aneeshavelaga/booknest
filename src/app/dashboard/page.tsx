import React from 'react';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const metadata = {
  title: 'My Rentals & Orders Dashboard | BookNest',
  description: 'Manage active book rentals, track countdowns until due date, request return pickups, and view deposit refunds.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
