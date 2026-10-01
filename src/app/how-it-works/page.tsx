import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  RotateCcw,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'How Book Renting Works | Deposit & Return Policy | BookNest',
  description:
    'Learn how BookNest book rentals work. Understand rental durations (7, 14, 30 days), 100% refundable security deposits, and hassle-free returns.',
};

export default function HowItWorksPage() {
  const faqs = [
    {
      q: 'Why does BookNest require a security deposit for rentals?',
      a: 'A refundable security deposit allows us to maintain a pristine, premium physical catalog without requiring costly monthly membership subscriptions. Once you return the book in readable condition, 100% of your deposit is credited back within 24 hours.',
    },
    {
      q: 'What condition does the rented book need to be returned in?',
      a: 'We understand normal reading wear! Light spine bending and normal page turning are completely fine. Only severe damage (liquid spills, torn or missing pages, dog-eared writing in pen) is subject to partial deduction.',
    },
    {
      q: 'What if I need more time to finish reading?',
      a: 'You can extend your rental directly from your Dashboard with a single click before your due date. Extensions are billed at a nominal daily rate (usually ₹20 - ₹30/day).',
    },
    {
      q: 'Can I choose to buy a book after renting it?',
      a: 'Yes! Simply select "Buy Out Book" from your active rentals dashboard. Your paid rental fee is credited towards the purchase price.',
    },
    {
      q: 'How does return shipping work?',
      a: 'Every rental includes a pre-labeled, protective return envelope. You can hand it to our courier during scheduled doorstep pickup or drop it at any partner drop-off point at zero cost.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Transparent Bookstore Policy
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          How Renting Works at BookNest
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
          Read any book for 7, 14, or 30 days. No monthly subscriptions, no hidden clauses.
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-lg">Choose Your Duration</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Select 7, 14, or 30 days depending on your reading pace. The transparent rental fee and refundable deposit are calculated in real time.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-lg">Doorstep Delivery</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Your physical copy arrives in protective packaging with a pre-paid return mailer. Track your delivery status directly in your dashboard.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-lg">Realtime Due Date Alerts</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We send gentle reminders 3 days before your rental is due. If you need more time, extend easily in 1 click without returning the book first.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            4
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-lg">Hassle-Free Deposit Refund</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Once our inspection team receives the book, your full security deposit is credited back to your account within 24 business hours.
          </p>
        </div>
      </div>

      {/* Security Deposit Policy In-Depth */}
      <section id="deposit-policy" className="p-8 bg-emerald-50/80 rounded-3xl border border-emerald-200 space-y-4">
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
          <h2 className="text-xl font-serif">Security Deposit Protection Promise</h2>
        </div>
        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
          Your deposit is held in a protected escrow ledger during your rental period. It is not an upfront fee — it remains 100% your money. Here is how our condition grading works:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 space-y-1.5">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Normal Reading (100% Refund)
            </span>
            <ul className="text-stone-600 list-disc list-inside space-y-1 text-[11px]">
              <li>Natural reading curvature on spine</li>
              <li>Light corner bumps from shelf handling</li>
              <li>Clean pages without ink or highlighter marks</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-rose-200/80 space-y-1.5">
            <span className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" /> Major Damage (Deduction Applies)
            </span>
            <ul className="text-stone-600 list-disc list-inside space-y-1 text-[11px]">
              <li>Water or beverage damage causing wrinkled pages</li>
              <li>Torn, ripped, or detached covers/pages</li>
              <li>Heavy pen or permanent marker annotations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900 text-center">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-stone-200 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-8 py-3.5 rounded-full text-xs font-semibold shadow-md transition"
        >
          Explore Catalog Now <ArrowRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>
    </div>
  );
}
