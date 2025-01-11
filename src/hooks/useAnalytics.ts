
import { useEffect } from "react";

const GA_MEASUREMENT_ID = "G-SBM90QPVXV";

export const useAnalytics = (): void => {
  useEffect(() => {
    // Load Google Analytics script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize Google Analytics
    script.onload = () => {
      window.dataLayer = window?.dataLayer || [];
      function gtag(...args: any[]) {
        (window.dataLayer as any[]).push(args);
      }
      gtag("js", new Date());
      gtag("config", GA_MEASUREMENT_ID);
    }; // pengaturan analisis data pada website 

    // Cleanup on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, []);
};
