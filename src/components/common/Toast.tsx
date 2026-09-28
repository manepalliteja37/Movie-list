import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { ClapperboardIcon } from './CinematicIcons';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce-in max-w-sm pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#14141C] border-2 border-[#F5B301] text-[#F5F5DC] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="w-8 h-8 rounded-lg bg-[#F5B301]/15 text-[#F5B301] flex items-center justify-center shrink-0">
          <ClapperboardIcon size={18} />
        </div>
        <div className="flex-1 text-sm font-medium pr-1">
          {message}
        </div>
        <button
          onClick={onClose}
          type="button"
          aria-label="Dismiss toast"
          className="text-[#737380] hover:text-[#F5F5DC] p-1 rounded-md transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
