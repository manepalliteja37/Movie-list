import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookmarkPlus,
  CheckCircle2,
  Share2,
  ChevronRight,
  Sparkles,
  Film,
  Ticket,
} from 'lucide-react';
import { FilmReelIcon, PopcornIcon } from './CinematicIcons';
import { TicketButton } from './TicketButton';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'SAVE YOUR CINEMATIC QUEUE',
      subtitle: 'Never forget a recommendation again',
      description:
        'Save films from YouTube reviews, Google searches, and friend recommendations. Track release dates, audio languages, and platforms like Netflix, Prime & Theatre.',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-[#0A0A0F] border-2 border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shadow-[0_0_30px_rgba(245,179,1,0.2)]">
          <BookmarkPlus size={40} />
        </div>
      ),
      badge: 'STEP 1 OF 3 · CURATE',
    },
    {
      title: 'LOG & RATE AS WATCHED',
      subtitle: 'Your personal cinema ledger',
      description:
        'Stamp viewed movies with custom 1–10 star ratings, the date you watched them, where you streamed them, and personal notes or reviews.',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-[#0A0A0F] border-2 border-[#C41E3A]/40 flex items-center justify-center text-[#FF5A6E] shadow-[0_0_30px_rgba(196,30,58,0.2)]">
          <CheckCircle2 size={40} />
        </div>
      ),
      badge: 'STEP 2 OF 3 · ARCHIVE',
    },
    {
      title: 'SHARE WITH FRIENDS',
      subtitle: 'Collectible ticket stubs & recommendations',
      description:
        'Export vintage ticket stubs as PNG images for WhatsApp or Instagram stories, generate public share links, or curate your entire month’s watched list.',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-[#0A0A0F] border-2 border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shadow-[0_0_30px_rgba(245,179,1,0.2)]">
          <Share2 size={38} />
        </div>
      ),
      badge: 'STEP 3 OF 3 · RECOMMEND',
    },
  ];

  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          key={slide}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#14141C] border border-[#28283C] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1C28] border border-[#28283C] text-[10px] font-mono tracking-widest text-[#F5B301] uppercase">
            <Sparkles size={11} />
            <span>{current.badge}</span>
          </div>

          {/* Central Icon Illustration */}
          <div className="flex justify-center my-2">{current.icon}</div>

          {/* Text Lockup */}
          <div className="space-y-2">
            <h2 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider">
              {current.title}
            </h2>
            <div className="text-sm font-semibold text-[#F5B301]">
              {current.subtitle}
            </div>
            <p className="text-xs sm:text-sm text-[#A3A392] leading-relaxed max-w-md mx-auto">
              {current.description}
            </p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide
                    ? 'w-8 bg-[#F5B301]'
                    : 'w-2 bg-[#28283C]'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onComplete}
              className="text-xs text-[#737380] hover:text-[#F5F5DC] uppercase font-mono tracking-wider cursor-pointer"
            >
              Skip Intro
            </button>

            <TicketButton onClick={handleNext} variant="gold" size="md">
              <span>{slide === slides.length - 1 ? 'Start Curating 🎬' : 'Next'}</span>
              {slide < slides.length - 1 && <ChevronRight size={16} />}
            </TicketButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
