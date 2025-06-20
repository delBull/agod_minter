"use client";

import { useState, useEffect } from 'react';

export type WalletOS = 'iOS' | 'Android' | 'Other';

export const useWalletDetector = (): WalletOS => {
  const [os, setOs] = useState<WalletOS>('Other');

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Simple detection logic
    if (/android/i.test(userAgent)) {
      setOs('Android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setOs('iOS');
    } else {
      setOs('Other');
    }
  }, []);

  return os;
};