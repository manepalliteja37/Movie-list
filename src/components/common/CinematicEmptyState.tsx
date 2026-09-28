import React from 'react';
import { FilmReelIcon, PopcornIcon, TicketIcon } from './CinematicIcons';
import { TicketButton } from './TicketButton';
import { Sparkles, Film, CheckCircle2, Share2, Plus } from 'lucide-react';

interface CinematicEmptyStateProps {
  type: 'watchlist' | 'watched' | 'share';
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

export const CinematicEmptyState: React.FC<CinematicEmptyStateProps> = ({
  type,
  onAction,
  onSecondaryAction,
}) => {
  if (type === 'watchlist') {
    return (
      <div className="text-center py-16 px-4 bg-[#14141C]/50 border-2 border-dashed border-[#28283C] rounded-3xl max-w-xl mx-auto my-6 relative overflow-hidden shadow-2xl">
        {/* Cinematic Illustration: Popcorn + Ticket */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[#0A0A0F] border border-[#28283C] flex items-center justify-center text-[#F5B301] shadow-[0_0_35px_rgba(245,179,1,0.15)] rotate-3">
            <PopcornIcon size={52} className="stroke-[1.5]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-[#C41E3A] border border-white/20 flex items-center justify-center text-white shadow-xl -rotate-6">
            <TicketIcon size={22} />
          </div>
        </div>

        <h2 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider mb-2">
          YOUR WATCHLIST IS EMPTY
        </h2>

        <p className="text-sm text-[#A3A392] max-w-md mx-auto leading-relaxed mb-6 font-medium">
          Save upcoming blockbusters, indie gems, and binge-worthy series to never lose a recommendation again!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {onAction && (
            <TicketButton onClick={onAction} variant="gold" size="lg">
              <Plus size={16} />
              <span>Add Your First Movie</span>
            </TicketButton>
          )}

          {onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-5 py-3 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] text-xs font-semibold text-[#F5F5DC] hover:text-[#F5B301] flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles size={14} className="text-[#F5B301]" />
              <span>Load Sample Blockbusters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'watched') {
    return (
      <div className="text-center py-16 px-4 bg-[#14141C]/50 border-2 border-dashed border-[#28283C] rounded-3xl max-w-xl mx-auto my-6 relative overflow-hidden shadow-2xl">
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[#0A0A0F] border border-[#C41E3A]/40 flex items-center justify-center text-[#FF5A6E] shadow-[0_0_35px_rgba(196,30,58,0.2)] -rotate-3">
            <CheckCircle2 size={48} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-[#F5B301] border border-black/20 flex items-center justify-center text-[#0A0A0F] shadow-xl rotate-6">
            <FilmReelIcon size={22} />
          </div>
        </div>

        <h2 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider mb-2">
          NO WATCHED MOVIES LOGGED
        </h2>

        <p className="text-sm text-[#A3A392] max-w-md mx-auto leading-relaxed mb-6 font-medium">
          Start recording films you’ve viewed! Log custom star ratings, theater or streaming platforms, and personal notes.
        </p>

        {onAction && (
          <div className="flex justify-center">
            <TicketButton onClick={onAction} variant="crimson" size="lg">
              <Plus size={16} />
              <span>Log a Watched Film</span>
            </TicketButton>
          </div>
        )}
      </div>
    );
  }

  // Share empty state
  return (
    <div className="text-center py-16 px-4 bg-[#14141C]/50 border-2 border-dashed border-[#28283C] rounded-3xl max-w-xl mx-auto my-6 relative overflow-hidden shadow-2xl">
      <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shadow-[0_0_35px_rgba(245,179,1,0.2)] rotate-2">
          <Share2 size={46} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-[#C41E3A] border border-white/20 flex items-center justify-center text-white shadow-xl -rotate-6">
          <TicketIcon size={22} />
        </div>
      </div>

      <h2 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider mb-2">
        NO RECOMMENDATIONS TO SHARE
      </h2>

      <p className="text-sm text-[#A3A392] max-w-md mx-auto leading-relaxed mb-6 font-medium">
        Add movies to your queue or mark them as watched to export vintage cinema pass tickets and share recommendation links with friends.
      </p>

      {onAction && (
        <div className="flex justify-center">
          <TicketButton onClick={onAction} variant="gold" size="lg">
            <Plus size={16} />
            <span>Add Movies to Share</span>
          </TicketButton>
        </div>
      )}
    </div>
  );
};
