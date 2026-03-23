import React, { createContext, useContext, useCallback } from 'react';
import { GoogleReCaptchaProvider as ReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ReCaptchaContext = createContext(null);

export const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
export const IS_CAPTCHA_ENABLED = !!SITE_KEY;

export function GoogleReCaptchaProvider({ children }) {
  if (!IS_CAPTCHA_ENABLED) {
    return (
      <ReCaptchaContext.Provider value={{ executeRecaptcha: null, isCaptchaEnabled: false }}>
        {children}
      </ReCaptchaContext.Provider>
    );
  }

  return (
    <ReCaptchaProvider
      reCaptchaKey={SITE_KEY}
      scriptProps={{
        async: false,
        defer: true,
        appendTo: 'head',
      }}
    >
      <ReCaptchaContextProvider>{children}</ReCaptchaContextProvider>
    </ReCaptchaProvider>
  );
}

function ReCaptchaContextProvider({ children }) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const executeCaptcha = useCallback(
    async (action = 'submit') => {
      if (!executeRecaptcha) {
        console.warn('ReCaptcha not loaded');
        return null;
      }
      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        console.error('ReCaptcha execution failed:', error);
        return null;
      }
    },
    [executeRecaptcha]
  );

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha: executeCaptcha, isCaptchaEnabled: true }}>
      {children}
    </ReCaptchaContext.Provider>
  );
}

export function useReCaptcha() {
  const context = useContext(ReCaptchaContext);
  if (!context) {
    throw new Error('useReCaptcha must be used within GoogleReCaptchaProvider');
  }
  return context;
}
