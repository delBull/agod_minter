import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useEffect, useState } from 'react';

export function ReCaptchaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!reCaptchaKey) {
      console.error('reCAPTCHA site key is not configured');
      return;
    }
    setIsReady(true);
  }, [reCaptchaKey]);

  if (!reCaptchaKey) {
    console.warn('reCAPTCHA is not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your .env file');
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
      useEnterprise={false}
      useRecaptchaNet={false}
      language="es"
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
