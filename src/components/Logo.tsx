import React from 'react';

interface LogoProps {
  className?: string;
  size?: string; // height/width style class, default is h-12
}

export default function Logo({ className = '', size = 'h-12' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Emblem */}
      <svg
        className={`${size} drop-shadow-sm`}
        viewBox="0 0 160 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        key="omran-azarestan-logo-svg"
      >
        {/* Burgundy Background Rectangle */}
        <rect width="160" height="190" rx="14" fill="#611C23" />
        
        {/* Outer White Arch */}
        <path
          d="M 23 150 
             C 23 105, 30 50, 80 40 
             C 100 36, 115 42, 125 55
             C 134 65, 137 80, 137 92
             L 137 150
             C 137 156, 128 156, 126 150
             L 126 95
             C 126 80, 122 68, 114 60
             C 106 52, 95 48, 80 50
             C 45 54, 38 100, 38 150
             C 38 156, 23 156, 23 150 Z"
          fill="#FFFFFF"
        />

        {/* Inner White Arch/Gateway */}
        <path
          d="M 52 150
             C 52 110, 60 75, 80 75
             C 100 75, 108 110, 108 150
             C 108 156, 96 156, 96 150
             C 96 115, 91 88, 80 88
             C 69 88, 64 115, 64 150
             C 64 156, 52 156, 52 150 Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}
