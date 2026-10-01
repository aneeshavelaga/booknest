'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, Zap, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ConfigBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { role, switchDemoRole } = useAuth();

  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs border-b border-indigo-800/40">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Production Stack
          </span>
          <span className="text-slate-300">
            Next.js 16 + Supabase (PostgreSQL, Auth, Storage, Realtime) + Vercel Pro Ready
          </span>
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Database className="w-3.5 h-3.5" /> Seed Data Active (Add Supabase Keys in .env to connect live instance)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for easy testing of customer vs store admin portals */}
          <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700">
            <button
              onClick={() => switchDemoRole('customer')}
              className={`px-2 py-0.5 rounded transition ${
                role === 'customer'
                  ? 'bg-amber-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer View
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`px-2 py-0.5 rounded transition ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Store Admin View
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-indigo-300 hover:text-white flex items-center gap-0.5 transition underline decoration-dotted"
          >
            Stack Specs <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-slate-950/90 border-t border-slate-800 p-4 text-slate-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <h4 className="font-semibold text-white flex items-center gap-1.5 mb-1.5">
                <Database className="w-4 h-4 text-emerald-400" /> Database & Storage
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Supabase PostgreSQL with full schema DDL in <code className="text-amber-300">supabase/schema.sql</code>, RLS security policies, triggers for stock management, and storage buckets for covers.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <h4 className="font-semibold text-white flex items-center gap-1.5 mb-1.5">
                <Zap className="w-4 h-4 text-indigo-400" /> Realtime & Rental Engine
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Supabase Realtime for instant rental due date alerts, overdue status calculations, return requests, and refundable deposit ledger tracking.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <h4 className="font-semibold text-white flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Production Architecture
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Zero unwanted AI wrappers or paid payment APIs. Clean checkout with COD, Store Deposit & Invoicing, SSR middleware security, and Vercel Pro ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
