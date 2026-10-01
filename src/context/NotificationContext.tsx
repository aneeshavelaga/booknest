'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Notification } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string, type: Notification['type'], link?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'u0000000-0000-0000-0000-000000000001',
    title: 'Rental Reminder: 3 Days Remaining',
    message: 'Your rental for "Designing Data-Intensive Applications" is due on Oct 5. You can extend your rental or initiate an easy return anytime.',
    type: 'rental_reminder',
    link: '/dashboard',
    is_read: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'u0000000-0000-0000-0000-000000000001',
    title: 'Deposit Refund Processed',
    message: 'Deposit of ₹350 for "Dune" has been processed to your original payment method after return inspection passed.',
    type: 'deposit_refund',
    link: '/dashboard',
    is_read: true,
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const { profile } = useAuth();

  useEffect(() => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder') && profile?.id) {
        const supabase = createClient();

        // Subscribe to real-time notifications
        const channel = supabase
          .channel(`user-notifications:${profile.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${profile.id}`,
            },
            (payload) => {
              const newNotif = payload.new as Notification;
              setNotifications((prev) => [newNotif, ...prev]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (e) {
      console.warn('Realtime subscription not active, using state', e);
    }
  }, [profile?.id]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const addNotification = (title: string, message: string, type: Notification['type'], link?: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: profile?.id || 'demo-user',
      title,
      message,
      type,
      link: link || null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
