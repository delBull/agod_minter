import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyHuman = useCallback(async () => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA no está inicializado correctamente');
      return null;
    }

    try {
      const token = await executeRecaptcha('submit');
      return token;
    } catch (error) {
      console.error('Error al verificar reCAPTCHA:', error);
      return null;
    }
  }, [executeRecaptcha]);

  return { 
    verifyHuman,
    isReady: !!executeRecaptcha 
  };
}
