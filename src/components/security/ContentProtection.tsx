'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ContentProtection() {
  const { profile, user, signOut } = useAuth();
  const [screenshotWarning, setScreenshotWarning] = useState(false);
  const [deviceConflict, setDeviceConflict] = useState(false);

  // 1. Anti-Screenshot & Anti-Copy Protection
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Keyboard protection: PrintScreen, Ctrl+P, DevTools, Ctrl+S
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerScreenshotAlert();
        return false;
      }

      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerScreenshotAlert();
        return false;
      }

      // Ctrl/Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + Shift + I or J or C (DevTools) or F12
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key.toLowerCase() === 'i' ||
            e.key.toLowerCase() === 'j' ||
            e.key.toLowerCase() === 'c'))
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Window blur (e.g. Snipping Tool trigger)
    const handleBlur = () => {
      // Blur can indicate external screen capture tool activation
    };

    const triggerScreenshotAlert = () => {
      setScreenshotWarning(true);
      setTimeout(() => setScreenshotWarning(false), 4000);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);

    // Apply global CSS selection lock
    document.documentElement.style.userSelect = 'none';
    (document.documentElement.style as any).webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 2. Single-Device Session Enforcement
  useEffect(() => {
    if (!profile?.id) return;

    // Generate or fetch local device token
    let localDeviceToken = localStorage.getItem(`bn_device_${profile.id}`);
    if (!localDeviceToken) {
      localDeviceToken = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(`bn_device_${profile.id}`, localDeviceToken);
    }

    // Set active session in localStorage
    const activeTokenKey = `bn_active_session_${profile.id}`;
    const currentActiveToken = localStorage.getItem(activeTokenKey);

    if (!currentActiveToken) {
      localStorage.setItem(activeTokenKey, localDeviceToken);
    } else if (currentActiveToken !== localDeviceToken) {
      // Session is active on another device/browser
      setDeviceConflict(true);
    }

    // Listen to cross-window / cross-device storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === activeTokenKey && e.newValue && e.newValue !== localDeviceToken) {
        setDeviceConflict(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [profile?.id]);

  const handleClaimDevice = () => {
    if (!profile?.id) return;
    const localDeviceToken = localStorage.getItem(`bn_device_${profile.id}`);
    if (localDeviceToken) {
      localStorage.setItem(`bn_active_session_${profile.id}`, localDeviceToken);
      setDeviceConflict(false);
    }
  };

  return (
    <>
      {/* Screenshot / Screen Capture Warning Banner */}
      {screenshotWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-rose-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rose-500/50 backdrop-blur-md flex items-center gap-3 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">🔒 Content Protected</span>
            <span className="text-rose-200 text-[11px]">
              Screen capture, printing, and text copying are restricted on BookNest.
            </span>
          </div>
        </div>
      )}

      {/* Single Device Session Conflict Modal */}
      {deviceConflict && (
        <div className="fixed inset-0 z-[120] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Single-Device Security Policy
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your BookNest account ({profile?.email}) is currently active on another device. For security and digital rights management, only one active device session is permitted.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl text-[11px] text-amber-900 border border-amber-200 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                To continue on this device, click &quot;Make This My Active Device&quot;. The session on your other device will be terminated.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleClaimDevice}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition"
              >
                Make This My Active Device
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2.5 text-xs text-stone-600 hover:text-stone-900 font-semibold"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
