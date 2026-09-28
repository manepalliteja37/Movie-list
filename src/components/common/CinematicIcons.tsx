import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// Custom Film Reel Icon
export const FilmReelIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="6" r="1.5" fill="currentColor" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    <circle cx="6" cy="12" r="1.5" fill="currentColor" />
    <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    <circle cx="7.75" cy="7.75" r="1.2" fill="currentColor" />
    <circle cx="16.25" cy="16.25" r="1.2" fill="currentColor" />
    <circle cx="7.75" cy="16.25" r="1.2" fill="currentColor" />
    <circle cx="16.25" cy="7.75" r="1.2" fill="currentColor" />
  </svg>
);

// Custom Clapperboard Icon
export const ClapperboardIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M2 11h20" />
    <path d="M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3" />
    <path d="m6 3 3 4" />
    <path d="m11 3 3 4" />
    <path d="m16 3 3 4" />
    <circle cx="7" cy="15" r="1" fill="currentColor" />
    <path d="M11 15h6" />
    <path d="M11 18h4" />
  </svg>
);

// Custom Ticket Icon
export const TicketIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
    <path d="M12 6v12" strokeDasharray="2 2" />
    <circle cx="7" cy="12" r="1" fill="currentColor" />
    <circle cx="17" cy="12" r="1" fill="currentColor" />
  </svg>
);

// Custom Popcorn Icon
export const PopcornIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 9l-2 12H8L6 9" />
    <path d="M10 9v12" strokeDasharray="1.5 2" />
    <path d="M14 9v12" strokeDasharray="1.5 2" />
    {/* Popcorn fluffy top */}
    <circle cx="7" cy="6" r="2.5" />
    <circle cx="12" cy="4.5" r="2.5" />
    <circle cx="17" cy="6" r="2.5" />
    <circle cx="9.5" cy="7" r="2" />
    <circle cx="14.5" cy="7" r="2" />
  </svg>
);
