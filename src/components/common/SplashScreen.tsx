'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasSeen = sessionStorage.getItem('booknest_splash_seen');
    if (hasSeen) {
      setIsVisible(false);
      return;
    }

    // Sequence: show for 1.8s, fade out over 400ms
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('booknest_splash_seen', 'true');
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-200/40 via-orange-100/30 to-blue-100/40 blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Animated Official Logo */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 transform transition-transform duration-1000 ease-out scale-105 hover:scale-110">
          <Image
            src="/logo.png"
            alt="BookNest Logo"
            fill
            sizes="(max-width: 640px) 192px, 224px"
            priority
            className="object-contain drop-shadow-xl animate-fade-in"
          />
        </div>

        {/* Brand Name & Tagline */}
        <div className="mt-4 space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-700 font-sans">
            RENT • READ • BUY
          </p>
          <p className="text-[11px] text-stone-500 font-sans">
            Your Premier Online Bookstore & Rental Library
          </p>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="mt-6 w-36 h-1 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 rounded-full animate-[progress_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
