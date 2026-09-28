import React from 'react';
import { Check } from 'lucide-react';

interface StampButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isWatched?: boolean;
  size?: 'sm' | 'md';
}

export const StampButton: React.FC<StampButtonProps> = ({
  children = 'Mark as Watched',
  isWatched = false,
  size = 'md',
  className = '',
  ...props
}) => {
  if (isWatched) {
    return (
      <div
        className={`stamp-watched select-none ${
          size === 'sm' ? 'text-xs py-0.5 px-2' : 'text-sm py-1 px-3'
        } ${className}`}
      >
        <Check size={size === 'sm' ? 12 : 14} className="mr-1 stroke-[2.5]" />
        <span>WATCHED</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`stamp-btn rounded-sm font-poster uppercase cursor-pointer select-none inline-flex items-center justify-center gap-1.5 font-medium tracking-wider ${
        size === 'sm' ? 'py-1 px-2.5 text-xs' : 'py-1.5 px-3.5 text-sm'
      } ${className}`}
      {...props}
    >
      <Check size={size === 'sm' ? 13 : 15} className="stroke-[2.5]" />
      <span className="truncate">{children}</span>
    </button>
  );
};
