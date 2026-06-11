import React, { useState, useEffect, useRef } from 'react';

export interface AutocompleteOption {
  value: string;         // The actual value that will be set in the input (e.g. codes like C-101, personnel code)
  label: string;         // Primary display text (e.g. name of personnel, unit name, or equipment specification)
  sublabel?: string;     // Secondary detail text (e.g. position, current location, or type of equipment)
  icon?: string;         // Visual icon like 👤, 🖥️, 📍
  searchTerms?: string[]; // Additional terms for matching
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  onSelect?: (option: AutocompleteOption) => void;
  id?: string;
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  required = false,
  onSelect,
  id
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on input value
  useEffect(() => {
    const term = value.trim().toLowerCase();
    if (!term || !isOpen) {
      setFilteredOptions([]);
      return;
    }

    const matches = options.filter(opt => {
      const valMatch = opt.value.toLowerCase().includes(term);
      const labelMatch = opt.label.toLowerCase().includes(term);
      const sublabelMatch = opt.sublabel?.toLowerCase().includes(term) || false;
      const termsMatch = opt.searchTerms?.some(t => t.toLowerCase().includes(term)) || false;
      return valMatch || labelMatch || sublabelMatch || termsMatch;
    });

    // Limit to 10 suggestions for better performance and UI structure
    setFilteredOptions(matches.slice(0, 10));
    setActiveIndex(prev => (prev >= matches.length ? 0 : prev));
  }, [value, options, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 >= filteredOptions.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        selectOption(filteredOptions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectOption = (opt: AutocompleteOption) => {
    onChange(opt.value);
    if (onSelect) {
      onSelect(opt);
    }
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full text-right" id={id ? `wrapper-${id}` : undefined}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={`w-full text-right p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none placeholder-slate-400 dark:text-slate-100 ${className}`}
        autoComplete="off"
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 text-xs text-right animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
          {filteredOptions.map((opt, index) => (
            <li
              key={`${opt.value}-${index}`}
              onClick={() => selectOption(opt)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                index === activeIndex
                  ? 'bg-blue-500 text-white dark:bg-blue-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
                <div className="flex flex-col text-right">
                  <span className={`font-medium ${index === activeIndex ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                    {opt.label}
                  </span>
                  {opt.sublabel && (
                    <span className={`text-[10px] truncate mt-0.5 ${index === activeIndex ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </div>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                index === activeIndex
                  ? 'bg-blue-600/50 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {opt.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
