import React from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WatchlistPage } from './components/watchlist/WatchlistPage';
import { WatchedPage } from './components/watched/WatchedPage';
import { DiscoverPage } from './components/discover/DiscoverPage';
import { SharePage } from './components/share/SharePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { TermsPage } from './components/legal/TermsPage';
import { NotFoundPage } from './components/common/NotFoundPage';
import { Movie } from './types/movie';
import { useMovieStore } from './store/useMovieStore';

interface AnimatedRoutesProps {
  onOpenAddModal: (movie?: Movie) => void;
  onShowToast: (msg: string) => void;
  onOpenShortcuts: () => void;
  onOpenOnboarding: () => void;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
  onOpenAddModal,
  onShowToast,
  onOpenShortcuts,
  onOpenOnboarding,
}) => {
  const location = useLocation();
  const { settings } = useMovieStore();
  const reduceAnimations = settings.reduceAnimations;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: -8 }}
        transition={
          reduceAnimations
            ? { duration: 0 }
            : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
        }
        className="w-full"
      >
        <Routes location={location}>
          <Route
            path="/"
            element={
              <WatchlistPage
                onOpenAddModal={onOpenAddModal}
                onShowToast={onShowToast}
              />
            }
          />
          <Route path="/watchlist" element={<Navigate to="/" replace />} />
          <Route
            path="/watched"
            element={
              <WatchedPage
                onOpenAddModal={onOpenAddModal}
                onShowToast={onShowToast}
              />
            }
          />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route
            path="/share"
            element={
              <SharePage
                onShowToast={onShowToast}
                onOpenAddModal={onOpenAddModal}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                onShowToast={onShowToast}
                onOpenShortcuts={onOpenShortcuts}
                onOpenOnboarding={onOpenOnboarding}
              />
            }
          />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};
