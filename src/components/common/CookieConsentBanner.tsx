import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, X, CheckCircle2 } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '../../services/analyticsService';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('movielist_cookie_consent');
    if (!raw) {
      // Delay display slightly for smooth UI rendering on load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent(true);
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    setCookieConsent(false);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-[100] bg-[#12121C]/95 backdrop-blur-xl border border-[#F5B301]/30 text-[#F5F5DC] p-4 sm:p-5 rounded-2xl shadow-2xl shadow-black/80"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie and Privacy Consent"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B301]/10 border border-[#F5B301]/20 flex items-center justify-center text-[#F5B301] shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm sm:text-base text-white flex items-center gap-1.5">
                  Privacy & Cookie Preferences
                </h4>
                <button
                  onClick={handleEssentialOnly}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
                  title="Dismiss & Essential Only"
                  aria-label="Close cookie consent banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Movielist uses client local storage (IndexedDB) to store your movie collections securely on your device. We use anonymous performance cookies to improve app speed and experience. Read our{' '}
                <Link
                  to="/privacy"
                  className="text-[#F5B301] underline hover:text-amber-300 transition-colors font-medium"
                >
                  Privacy Policy
                </Link>.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-gradient-to-r from-[#C41E3A] to-amber-600 hover:brightness-110 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#C41E3A]/20 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept All
                </button>

                <button
                  onClick={handleEssentialOnly}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
