import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseKeyboardShortcutsProps {
  onOpenAddModal: () => void;
  onOpenShortcuts: () => void;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts({
  onOpenAddModal,
  onOpenShortcuts,
  onCloseModals,
}: UseKeyboardShortcutsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when typing in inputs, textareas, or contenteditables
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Esc always closes modals regardless of focus
      if (e.key === 'Escape') {
        onCloseModals();
        return;
      }

      if (isInput) return;

      // Single key shortcuts (case-insensitive: e.key.toLowerCase() matches both capital 'N' and lowercase 'n')
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          onOpenAddModal();
          break;

        case 'w':
          e.preventDefault();
          navigate('/');
          break;

        case 'v':
          e.preventDefault();
          navigate('/watched');
          break;

        case 's':
          e.preventDefault();
          navigate('/share');
          break;

        case '/':
          e.preventDefault();
          const searchInput = document.getElementById('global-movie-search') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;

        case '?':
          e.preventDefault();
          onOpenShortcuts();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location, onOpenAddModal, onOpenShortcuts, onCloseModals]);
}
