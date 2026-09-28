import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  icon?: React.ReactNode;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const hasSelection = selected.length > 0;

  return (
    <div className="relative inline-block text-left multi-select-dropdown" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`h-9 px-3 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer select-none whitespace-nowrap dropdown-trigger-btn ${
          hasSelection
            ? 'bg-[#181824] border-[#F5B301] text-[#F5B301] shadow-[0_0_12px_rgba(245,179,1,0.15)]'
            : 'bg-[#0A0A0F] border-[#262638] text-[#A3A392] hover:text-[#F5F5DC] hover:border-[#F5B301]/60'
        }`}
      >
        {icon && <span className="text-current opacity-80">{icon}</span>}
        <span>{label}</span>
        {hasSelection && (
          <span className="w-4 h-4 rounded-full bg-[#F5B301] text-[#0A0A0F] text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
            {selected.length}
          </span>
        )}
        {hasSelection ? (
          <span
            onClick={clearSelection}
            className="p-0.5 hover:text-white rounded-full hover:bg-white/10"
            title="Clear filter"
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-52 sm:w-56 max-w-[calc(100vw-2rem)] max-h-64 overflow-y-auto bg-[#14141C] border border-[#28283C] rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5 animate-fadeIn dropdown-menu-popover">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#737380] border-b border-[#20202E] flex justify-between items-center mb-1 dropdown-menu-header">
            <span>Filter by {label}</span>
            {hasSelection && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[#F5B301] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                data-selected={isSelected}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-all cursor-pointer dropdown-option-item ${
                  isSelected
                    ? 'bg-[#1C1C28] text-[#F5B301] font-medium selected-option'
                    : 'text-[#C4C4B5] hover:bg-[#1C1C28]/60 hover:text-[#F5F5DC]'
                }`}
              >
                <span className="truncate">{option}</span>
                {isSelected && <Check size={13} className="text-[#F5B301] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
