"use client";

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback, useEffect, useState } from 'react';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const checkRecaptcha = () => {
      if (executeRecaptcha) {
        console.log('reCAPTCHA initialized successfully');
        setIsInitialized(true);
        setInitializationError(null);
      } else {
        const error = 'reCAPTCHA no está disponible. Asegúrate de que el sitio web esté cargado correctamente.';
        console.warn(error);
        setInitializationError(error);
        setIsInitialized(false);
      }
    };

    // Verificar inmediatamente
    checkRecaptcha();

    // Verificar después de un breve retraso para asegurar la carga
    const timeoutId = setTimeout(checkRecaptcha, 1000);

    return () => clearTimeout(timeoutId);
  }, [executeRecaptcha]);

  const verifyHuman = useCallback(async () => {
    if (!executeRecaptcha) {
      const error = 'reCAPTCHA no está inicializado correctamente';
      console.warn(error);
      setInitializationError(error);
      return null;
    }

    try {
      console.log('Iniciando verificación reCAPTCHA...');
      const token = await executeRecaptcha('submit');
      console.log('Verificación reCAPTCHA completada');
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al verificar reCAPTCHA:', errorMessage);
      setInitializationError(errorMessage);
      return null;
    }
  }, [executeRecaptcha]);

  return { 
    verifyHuman,
    isReady: isInitialized && !!executeRecaptcha,
    error: initializationError
  };
}
