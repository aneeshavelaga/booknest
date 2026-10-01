'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, UserRole } from '@/types/database';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null; redirected?: boolean }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updated: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CUSTOMER: Profile = {
  id: 'u0000000-0000-0000-0000-000000000001',
  email: 'alex.reader@booknest.com',
  full_name: 'Alex Reader',
  phone: '+91 98765 43210',
  role: 'customer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  address_street: '42 MG Road, Indiranagar',
  address_city: 'Bengaluru',
  address_state: 'Karnataka',
  address_postal_code: '560038',
  address_country: 'India',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const DEMO_ADMIN: Profile = {
  id: 'u0000000-0000-0000-0000-000000000099',
  email: 'admin@booknest.com',
  full_name: 'BookNest Store Admin',
  phone: '+91 98765 00099',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  address_street: '100 Bookstore Hub, Brigade Road',
  address_city: 'Bengaluru',
  address_state: 'Karnataka',
  address_postal_code: '560001',
  address_country: 'India',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(DEMO_CUSTOMER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (userProfile) {
              setProfile(userProfile as Profile);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Supabase auth session check, using local state', err);
      }

      // Check localStorage for saved profile
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('booknest_user_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setProfile(parsed);
            setUser({ id: parsed.id, email: parsed.email });
          } catch {}
        }
      }

      setIsLoading(false);
    }
    initAuth();
  }, []);

  const signIn = async (email: string, password?: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder') && password) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error };
        if (data.user) {
          setUser(data.user);
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (userProfile) {
            setProfile(userProfile as Profile);
            localStorage.setItem('booknest_user_profile', JSON.stringify(userProfile));
          }
        }
        return { error: null };
      }
    } catch (err: any) {
      return { error: err };
    }

    // Fallback demo login
    if (email.toLowerCase().includes('admin')) {
      setProfile(DEMO_ADMIN);
      setUser({ id: DEMO_ADMIN.id, email: DEMO_ADMIN.email });
      localStorage.setItem('booknest_user_profile', JSON.stringify(DEMO_ADMIN));
    } else {
      const userProf = {
        ...DEMO_CUSTOMER,
        email,
        full_name: email.split('@')[0],
      };
      setProfile(userProf);
      setUser({ id: DEMO_CUSTOMER.id, email });
      localStorage.setItem('booknest_user_profile', JSON.stringify(userProf));
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });
        if (error) return { error };
        if (data?.url) {
          window.location.href = data.url;
          return { error: null, redirected: true };
        }
        return { error: null };
      }
    } catch (err: any) {
      console.warn('Google OAuth redirected or bypassed', err);
    }

    // Demo fallback for preview
    setProfile(DEMO_CUSTOMER);
    setUser({ id: DEMO_CUSTOMER.id, email: DEMO_CUSTOMER.email });
    localStorage.setItem('booknest_user_profile', JSON.stringify(DEMO_CUSTOMER));
    return { error: null };
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder') && password) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: 'customer' },
          },
        });
        if (error) return { error };
        return { error: null };
      }
    } catch (err: any) {
      return { error: err };
    }

    const newProf = {
      ...DEMO_CUSTOMER,
      email,
      full_name: fullName || email.split('@')[0],
    };
    setProfile(newProf);
    localStorage.setItem('booknest_user_profile', JSON.stringify(newProf));
    return { error: null };
  };

  const signOut = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error signing out', err);
    }
    localStorage.removeItem('booknest_user_profile');
    setUser(null);
    setProfile(null);
  };

  const switchDemoRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setProfile(DEMO_ADMIN);
      setUser({ id: DEMO_ADMIN.id, email: DEMO_ADMIN.email });
      localStorage.setItem('booknest_user_profile', JSON.stringify(DEMO_ADMIN));
    } else {
      setProfile(DEMO_CUSTOMER);
      setUser({ id: DEMO_CUSTOMER.id, email: DEMO_CUSTOMER.email });
      localStorage.setItem('booknest_user_profile', JSON.stringify(DEMO_CUSTOMER));
    }
  };

  const updateProfile = async (updated: Partial<Profile>) => {
    setProfile((prev) => {
      const next = prev ? { ...prev, ...updated, updated_at: new Date().toISOString() } : (updated as Profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('booknest_user_profile', JSON.stringify(next));
      }
      return next;
    });
  };

  const role: UserRole = profile?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
