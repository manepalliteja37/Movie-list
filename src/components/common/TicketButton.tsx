import React from 'react';
import { FilmReelIcon } from './CinematicIcons';

/**
 * TicketButton Component Props Interface
 * 
 * @property {React.ReactNode} [children='ADD TO WATCHLIST'] - Text or elements inside main ticket section
 * @property {'gold' | 'crimson' | 'ghost' | 'white'} [variant='gold'] - Color scheme variant defined in src/index.css
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Ticket size variant defined in src/index.css
 * @property {boolean} [icon=true] - Toggles rotating film reel icon
 * @property {boolean} [showStub=true] - Toggles left "CINEMA ADMIT 1" ticket stub section
 */
export interface TicketButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'gold' | 'crimson' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  showStub?: boolean;
}

/**
 * TicketButton Component
 * 
 * Renders a cinema-style admission ticket button featuring:
 * 1. Left Ticket Stub: 3 stars, "CINEMA ADMIT 1" label, and barcode graphic.
 * 2. Scalloped Tear Cutouts: Masked 6px quarter-circle notches at the top and bottom of the tear line.
 * 3. Main Ticket Body: Action label and spinning film reel icon.
 * 
 * ALL CSS styling (colors, gradients, text colors, borders, shadows, sizes) are centralized
 * in `src/index.css` under the `.ticket-button`, `.ticket-variant-*`, and `.ticket-size-*` classes.
 */
export const TicketButton: React.FC<TicketButtonProps> = ({
  children = 'ADD TO WATCHLIST',
  variant = 'gold',
  size = 'md',
  icon = true,
  showStub = true,
  className = '',
  ...props
}) => {
  // Mapping size key to icon pixel size
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      /* Main Button Container - Visual variant and size are applied via CSS class hooks */
      className={`ticket-button ticket-size-${size} ticket-variant-${variant} group ${className}`}
      {...props}
    >
      {/* -----------------------------------------------------------------
          LEFT TICKET STUB SECTION
          Rendered when showStub is true and size is not 'sm'
         ----------------------------------------------------------------- */}
      {showStub && size !== 'sm' && (
        <div className="ticket-stub">
          {/* Stub dark/tint overlay layer */}
          <div className="ticket-stub-overlay absolute inset-0 pointer-events-none" />

          {/* Star Rating Header */}
          <div className="ticket-stars">
            <span>★</span>
            <span className="text-[1.25em]">★</span>
            <span>★</span>
          </div>

          {/* Stub Text Label */}
          <div className="ticket-text-label">
            <span className="block text-[12px] font-mono font-black tracking-widest text-center opacity-100">CINEMA</span>
            <span className="block text-[8px] font-mono font-bold text-center opacity-90 mt-0.5">ADMIT 1</span>
          </div>

          {/* Barcode Graphic */}
          <div className="ticket-barcode">
            <span className="w-[1.5px] h-full bg-current" />
            <span className="w-[3px] h-full bg-current ml-[1px]" />
            <span className="w-[1px] h-full bg-current ml-[1px]" />
            <span className="w-[2.5px] h-full bg-current ml-[1px]" />
            <span className="w-[1px] h-full bg-current ml-[1px]" />
            <span className="w-[2px] h-full bg-current ml-[1px]" />
            <span className="w-[3px] h-full bg-current ml-[1px]" />
            <span className="w-[1px] h-full bg-current ml-[1px]" />
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          RIGHT MAIN TICKET BODY SECTION
         ----------------------------------------------------------------- */}
      <div
        className={`ticket-main ${showStub && size !== 'sm'
          ? 'border-t border-b border-r'
          : 'border'
          }`}
      >
        {icon && (
          <FilmReelIcon
            size={iconSizes[size]}
            className="shrink-0 animate-spin-slow opacity-95 group-hover:scale-110 transition-transform"
          />
        )}
        <span className="truncate leading-none pt-0.5">{children}</span>
      </div>
    </button>
  );
};
