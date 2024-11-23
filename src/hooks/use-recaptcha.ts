import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyHuman = async () => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not yet available');
      return null;
    }

    try {
      const token = await executeRecaptcha('submit');
      return token;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return null;
    }
  };

  return { verifyHuman };
}
