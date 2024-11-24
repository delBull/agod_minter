"use client";

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useEffect, useState } from 'react';

export function ReCaptchaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!reCaptchaKey) {
        setError('reCAPTCHA key is missing');
        console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
      }
      setMounted(true);
    }
  }, [reCaptchaKey]);

  // Handle server-side rendering
  if (!mounted) {
    return <>{children}</>;
  }

  if (error || !reCaptchaKey) {
    console.warn('reCAPTCHA initialization failed:', error || 'Missing site key');
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
        nonce: undefined,
      }}
      container={{
        parameters: {
          badge: 'bottomright',
          theme: 'dark',
        },
      }}
      useRecaptchaNet={true}
      language="es"
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
