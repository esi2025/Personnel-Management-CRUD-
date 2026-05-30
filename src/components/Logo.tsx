import React, { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: string; // height/width style class, default is h-12
}

export default function Logo({ className = '', size = 'h-12' }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and load custom logo from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('custom_company_logo');
    if (stored) {
      setLogoUrl(stored);
    }

    // Listener for logo sync across all Logo components instantly
    const handleSync = () => {
      setLogoUrl(localStorage.getItem('custom_company_logo'));
    };

    window.addEventListener('custom-logo-updated', handleSync);
    return () => {
      window.removeEventListener('custom-logo-updated', handleSync);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Limit file size to 2MB to keep localStorage healthy
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم تصویر لوگو نباید بیشتر از ۲ مگابایت باشد.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          localStorage.setItem('custom_company_logo', base64);
          setLogoUrl(base64);
          // Sync with all other instances
          window.dispatchEvent(new Event('custom-logo-updated'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering file click
    if (confirm('آیا مایل به حذف لوگوی بارگذاری شده هستید؟')) {
      localStorage.removeItem('custom_company_logo');
      setLogoUrl(null);
      // Sync across all other Logo components
      window.dispatchEvent(new Event('custom-logo-updated'));
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`} id="custom-logo-wrapper">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {logoUrl ? (
        // Render custom corporate uploaded logo image
        <div className="relative group flex items-center justify-center">
          <img 
            src={logoUrl} 
            className={`${size} object-contain max-w-[240px] drop-shadow-sm transition-transform duration-200 group-hover:scale-105`} 
            alt="لوگوی شرکت" 
          />
          {/* Quick inline delete button - only visible on screen hover */}
          <button
            type="button"
            onClick={handleDelete}
            className="no-print absolute -top-1.5 -left-1.5 bg-red-650 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: '#dc2626' }}
            title="حذف لوگو"
          >
            <X size={14} className="stroke-[3px]" />
          </button>
        </div>
      ) : (
        // DEFAULT: Keep Logo area EMPTY as requested by the user ("پیشفرض برنامه جای لوگو خالی باشد")
        // But render a small professional interactive upload button on screen (hidden in print)
        // so that administrators know they can click of course, while keeping the physical profile document pristine.
        <button
          type="button"
          onClick={triggerUploadClick}
          className="no-print group flex items-center gap-2 border-2 border-dashed border-slate-600/50 hover:border-blue-500 hover:bg-blue-50/10 text-xs text-slate-400 hover:text-blue-400 px-4.5 py-2.5 rounded-xl transition-all cursor-pointer font-sans shadow-sm"
          title="بارگذاری لوگوی جدید شرکت"
        >
          <Upload size={14} className="group-hover:animate-bounce shrink-0" />
          <span>افزودن لوگوی شرکت (۳۰٪ بزرگتر)</span>
        </button>
      )}
    </div>
  );
}
