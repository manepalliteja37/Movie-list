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

// Custom Mobile App Icon: Light White Background, Light Neon Blue Reel, Yellow Play Button
export const MobileAppIcon: React.FC<IconProps & { glow?: boolean; useImage?: boolean }> = ({
  size = 28,
  className = '',
  glow = false,
  useImage = false,
  ...props
}) => {
  if (useImage) {
    return (
      <img
        src="/app-icon.png"
        width={size}
        height={size}
        alt="Movielist App Icon"
        className={`object-contain rounded-xl ${glow ? 'drop-shadow-[0_0_12px_rgba(0,229,255,0.45)]' : ''} ${className}`}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`inline-block shrink-0 ${glow ? 'drop-shadow-[0_0_10px_rgba(0,229,255,0.45)]' : ''} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mobileIconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F4F7FB" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="mobileIconNeonBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00C4EF" />
        </linearGradient>
        <linearGradient id="mobileIconPlayYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE033" />
          <stop offset="100%" stopColor="#F5B301" />
        </linearGradient>
      </defs>

      {/* Squircle Light White Background */}
      <rect x="3" y="3" width="94" height="94" rx="22" fill="url(#mobileIconBgGrad)" stroke="#CBD5E1" strokeWidth="1.2" />
      <rect x="5" y="5" width="90" height="90" rx="20" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />

      {/* Light Neon Blue Reel Strip with sprocket perforations */}
      <rect x="30" y="16" width="40" height="68" rx="4" fill="url(#mobileIconNeonBlue)" />

      {/* Center Film Frame Window (Light Background) */}
      <rect x="37.5" y="31" width="25" height="38" rx="3.5" fill="#F8FAFC" stroke="url(#mobileIconNeonBlue)" strokeWidth="1" />

      {/* Left Sprocket Holes */}
      <g fill="#F8FAFC">
        <rect x="32" y="20" width="3.2" height="4" rx="1" />
        <rect x="32" y="26" width="3.2" height="4" rx="1" />
        <rect x="32" y="32" width="3.2" height="4" rx="1" />
        <rect x="32" y="38" width="3.2" height="4" rx="1" />
        <rect x="32" y="44" width="3.2" height="4" rx="1" />
        <rect x="32" y="50" width="3.2" height="4" rx="1" />
        <rect x="32" y="56" width="3.2" height="4" rx="1" />
        <rect x="32" y="62" width="3.2" height="4" rx="1" />
        <rect x="32" y="68" width="3.2" height="4" rx="1" />
        <rect x="32" y="74" width="3.2" height="4" rx="1" />
      </g>

      {/* Right Sprocket Holes */}
      <g fill="#F8FAFC">
        <rect x="64.8" y="20" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="26" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="32" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="38" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="44" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="50" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="56" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="62" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="68" width="3.2" height="4" rx="1" />
        <rect x="64.8" y="74" width="3.2" height="4" rx="1" />
      </g>

      {/* Yellow Play Button in Center */}
      <path
        d="M 46 41 C 46 39.8 47.3 39.1 48.3 39.8 L 56.7 48.6 C 57.5 49.3 57.5 50.7 56.7 51.4 L 48.3 60.2 C 47.3 60.9 46 60.2 46 59 Z"
        fill="url(#mobileIconPlayYellow)"
      />
    </svg>
  );
};

