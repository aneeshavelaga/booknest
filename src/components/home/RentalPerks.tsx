'use client';

import React from 'react';
import { Search, PackageCheck, BookOpen, RotateCcw, ShieldCheck, HeartHandshake } from 'lucide-react';

export function RentalPerks() {
  const steps = [
    {
      step: '01',
      title: 'Pick Your Book & Period',
      description: 'Choose to buy outright or rent for 7, 14, or 30 days. See transparent rental fees and security deposit upfront.',
      icon: Search,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      step: '02',
      title: 'Doorstep Courier Delivery',
      description: 'Your book arrives carefully packaged with a protective sleeve and return envelope ready for when you finish.',
      icon: PackageCheck,
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      step: '03',
      title: 'Read & Enjoy Without Stress',
      description: 'Receive helpful due-date reminders via our notification center. Need extra time? Extend anytime directly from your dashboard.',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      step: '04',
      title: 'Free Return & Deposit Refund',
      description: 'Hand the book to our pickup courier or drop it off. Upon quick condition inspection, 100% of your deposit is credited back.',
      icon: RotateCcw,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold text-amber-600 mb-2">
            Simple & Transparent Process
          </h2>
          <p className="text-3xl font-serif font-bold text-stone-900">
            How Renting at BookNest Works
          </p>
          <p className="text-sm text-stone-500 mt-2">
            No subscription traps, no hidden fees. Just great literature delivered to your door.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={index}
                className="bg-stone-50/70 rounded-2xl p-6 border border-stone-200/80 hover:border-amber-300 hover:bg-amber-50/20 transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-2xl font-black text-stone-300">{s.step}</span>
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-base mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
