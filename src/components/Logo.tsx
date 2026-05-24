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
        <rect width="160" height="190" rx="14" fill="#84141A" />
        
        {/* Outer White Arch (Geometric Precision SVG Arc) */}
        <path
          d="M 23 150
             L 23 92
             A 57 57 0 0 1 137 92
             L 137 150
             L 122 150
             L 122 92
             A 42 42 0 0 0 38 92
             L 38 150
             Z"
          fill="#FFFFFF"
        />

        {/* Inner White Arch/Gateway (Geometric Precision Concentric Arc) */}
        <path
          d="M 52 150
             L 52 92
             A 28 28 0 0 1 108 92
             L 108 150
             L 93 150
             L 93 92
             A 13 13 0 0 0 67 92
             L 67 150
             Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}
