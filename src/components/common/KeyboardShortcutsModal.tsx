import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import { FilmReelIcon } from '../common/CinematicIcons';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', description: 'Add new movie / title' },
    { key: 'W', description: 'Go to Watchlist page' },
    { key: 'V', description: 'Go to Watched archive ("Viewed")' },
    { key: 'S', description: 'Go to Share & Cinema Pass' },
    { key: '/', description: 'Focus search bar in top navigation' },
    { key: 'Esc', description: 'Close any modal, drawer, or dialog' },
    { key: '?', description: 'Show / hide this shortcuts cheat-sheet' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        {/* Click outside to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#14141C] border border-[#28283C] rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#101018] border-b border-[#20202E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                <Keyboard size={16} />
              </div>
              <div>
                <h3 className="font-poster text-lg tracking-wider text-[#F5F5DC]">
                  KEYBOARD SHORTCUTS
                </h3>
                <p className="text-[11px] text-[#A3A392]">Cinephile Hotkeys for fast navigation</p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="text-[#737380] hover:text-[#F5F5DC] p-1.5 rounded-lg hover:bg-[#1C1C28] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Shortcuts List */}
          <div className="p-6 space-y-2.5">
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E0E16] border border-[#20202E] text-xs"
              >
                <span className="text-[#E0E0CE] font-medium">{s.description}</span>
                <kbd className="px-2.5 py-1 rounded-md bg-[#1C1C28] border border-[#333348] text-[#F5B301] font-mono text-xs font-bold shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#101018] border-t border-[#20202E] text-center text-xs text-[#737380]">
            Press <kbd className="text-[#F5B301] font-mono px-1">Esc</kbd> anytime to dismiss overlays
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
