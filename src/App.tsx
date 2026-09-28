/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { DesktopSidebar, MobileBottomNav } from './components/layout/Navigation';
import { AddMovieModal } from './components/modal/AddMovieModal';
import { FloatingAddButton } from './components/common/FloatingAddButton';
import { Toast } from './components/common/Toast';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { AnimatedRoutes } from './AnimatedRoutes';
import { useMovieStore } from './store/useMovieStore';
import { Movie } from './types/movie';
import { checkMovieReleases } from './services/notificationService';
import { useKeyboardShortcuts } from './services/useKeyboardShortcuts';
import { nanoid } from 'nanoid';

function MainAppShell() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    initDb,
    isDbLoaded,
    movies,
    settings,
    updateSettings,
    updateMovie,
    addReleaseAlert,
  } = useMovieStore();

  // Initialize Dexie.js IndexedDB on mount
  useEffect(() => {
    initDb();
  }, [initDb]);

  // Show onboarding on first time launch if not previously dismissed
  useEffect(() => {
    if (isDbLoaded && !settings.onboardingCompleted && movies.length === 0) {
      setIsOnboardingOpen(true);
    }
  }, [isDbLoaded, settings.onboardingCompleted, movies.length]);

  // Check releases on load and set up periodic 6-hour interval
  useEffect(() => {
    if (!isDbLoaded || movies.length === 0) return;

    const performReleaseCheck = async () => {
      try {
        const result = await checkMovieReleases(movies, settings.notifications, updateMovie);
        if (result.newlyReleasedMovies.length > 0) {
          result.newlyReleasedMovies.forEach((m) => {
            addReleaseAlert({
              id: nanoid(),
              movieId: m.id,
              title: m.title,
              platform: m.platforms[0] || 'Streaming / Theatre',
              releaseDate: m.releaseDate || '',
            });
          });
        }
      } catch (err) {
        console.error('Error during scheduled release check:', err);
      }
    };

    performReleaseCheck();

    const intervalId = setInterval(performReleaseCheck, 6 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [isDbLoaded, settings.notifications, updateMovie, addReleaseAlert]);

  // Modals actions
  const handleOpenAddModal = (editMovie?: Movie) => {
    setMovieToEdit(editMovie || null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setMovieToEdit(null);
  };

  const handleCloseAllOverlays = () => {
    setIsAddModalOpen(false);
    setIsShortcutsOpen(false);
    setIsOnboardingOpen(false);
    setMovieToEdit(null);
  };

  const handleAddSuccess = (msg: string) => {
    setToastMessage(msg);
  };

  const handleCompleteOnboarding = () => {
    setIsOnboardingOpen(false);
    updateSettings({ onboardingCompleted: true });
    setToastMessage('Welcome to Movielist! Explore and start curating 🍿');
  };

  // Keyboard hotkeys
  useKeyboardShortcuts({
    onOpenAddModal: () => handleOpenAddModal(),
    onOpenShortcuts: () => setIsShortcutsOpen(true),
    onCloseModals: handleCloseAllOverlays,
  });

  // Synchronize theme, font size, and motion preferences with document root (<html>)
  useEffect(() => {
    const fontSize = settings.fontSize || 'medium';
    document.documentElement.dataset.fontSize = fontSize;
    if (fontSize === 'small') {
      document.documentElement.style.fontSize = '14px';
    } else if (fontSize === 'large') {
      document.documentElement.style.fontSize = '19px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [settings.fontSize]);

  useEffect(() => {
    const theme = settings.theme || 'theatre-dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.remove(
      'theme-theatre-dark',
      'theme-cinema-light',
      'theme-midnight-blue',
      'theme-warm-red'
    );
    document.documentElement.classList.add(`theme-${theme}`);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', !!settings.reduceAnimations);
  }, [settings.reduceAnimations]);

  // Apply theme and font size classes to root document wrapper
  const themeClass = `theme-${settings.theme || 'theatre-dark'}`;
  const fontClass = `font-size-${settings.fontSize || 'medium'}`;
  const reduceMotionClass = settings.reduceAnimations ? 'reduce-motion' : '';

  return (
    <div
      className={`min-h-screen ${themeClass} ${fontClass} ${reduceMotionClass} bg-[#0A0A0F] text-[#F5F5DC] flex flex-col font-sans selection:bg-[#F5B301]/30 selection:text-[#F5F5DC] transition-colors duration-300`}
    >
      {/* Subtle Film Grain Texture Overlay */}
      <div className="film-grain" aria-hidden="true" />

      {/* Cinematic Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Bar (1-row 3-zone contract) */}
      <TopBar onOpenAddModal={() => handleOpenAddModal()} />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Left Sidebar */}
        <DesktopSidebar />

        {/* Main Content View with Animated Page Transitions */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] lg:pb-12">
          <AnimatedRoutes
            onOpenAddModal={handleOpenAddModal}
            onShowToast={handleAddSuccess}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        </main>
      </div>

      {/* Floating Action Button (+) at bottom-right, styled as film reel icon in red circle */}
      <FloatingAddButton onClick={() => handleOpenAddModal()} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Full-screen / Slide-up Add / Edit Movie Modal (With Wake Lock) */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        movieToEdit={movieToEdit}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* First-time Onboarding 3-Slide Carousel */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />

      {/* Cookie & Privacy Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainAppShell />
    </BrowserRouter>
  );
}
