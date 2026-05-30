import React, { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: string; // height/width style class, default is h-12
}

export default function Logo({ className = '', size = 'h-12' }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load logo from server/localStorage & determine if the current user is an admin
  useEffect(() => {
    const fetchLogo = () => {
      fetch('/api/logo')
        .then(res => res.json())
        .then(data => {
          if (data.logo) {
            localStorage.setItem('custom_company_logo', data.logo);
            setLogoUrl(data.logo);
          } else {
            localStorage.removeItem('custom_company_logo');
            setLogoUrl(null);
          }
        })
        .catch(err => {
          console.warn("Failed to fetch server logo, reading localStorage:", err);
          const stored = localStorage.getItem('custom_company_logo');
          if (stored) setLogoUrl(stored);
        });
    };

    fetchLogo();

    // Check if current user role is admin
    const checkRole = () => {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setIsAdmin(parsed.role === 'admin');
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkRole();

    // Custom sync listeners
    const handleSync = () => {
      const stored = localStorage.getItem('custom_company_logo');
      setLogoUrl(stored);
    };

    window.addEventListener('custom-logo-updated', handleSync);
    window.addEventListener('user-session-changed', checkRole);
    
    return () => {
      window.removeEventListener('custom-logo-updated', handleSync);
      window.removeEventListener('user-session-changed', checkRole);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return; // double check

    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم تصویر لوگو نباید بیشتر از ۲ مگابایت باشد.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          fetch('/api/logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logo: base64 })
          })
          .then(res => res.json())
          .then(() => {
            localStorage.setItem('custom_company_logo', base64);
            setLogoUrl(base64);
            window.dispatchEvent(new Event('custom-logo-updated'));
          })
          .catch(err => {
            console.error("Error updating logo on server:", err);
            alert("خطا در ذخیره‌سازی لوگو بر روی سرور مرکزی.");
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;

    if (confirm('آیا مایل به حذف لوگوی بارگذاری شده هستید؟')) {
      fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: null })
      })
      .then(() => {
        localStorage.removeItem('custom_company_logo');
        setLogoUrl(null);
        window.dispatchEvent(new Event('custom-logo-updated'));
      })
      .catch(err => console.error("Error resetting logo on server:", err));
    }
  };

  const triggerUploadClick = () => {
    if (isAdmin) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`} id="custom-logo-wrapper">
      {isAdmin && (
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      )}

      {logoUrl ? (
        // Render custom corporate uploaded logo image
        <div className="relative group flex items-center justify-center">
          <img 
            src={logoUrl} 
            className={`${size} object-contain max-w-[240px] drop-shadow-sm transition-transform duration-200 group-hover:scale-105`} 
            alt="لوگوی شرکت" 
          />
          {/* Quick inline delete button - only visible on screen hover for Admin */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              className="no-print absolute -top-1.5 -left-1.5 bg-red-650 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: '#dc2626' }}
              title="حذف لوگو"
            >
              <X size={14} className="stroke-[3px]" />
            </button>
          )}
        </div>
      ) : (
        // DEFAULT: Keep Logo area EMPTY when none is selected or visitor is not Admin
        isAdmin ? (
          <button
            type="button"
            onClick={triggerUploadClick}
            className="no-print group flex items-center gap-2 border-2 border-dashed border-slate-600/50 hover:border-blue-500 hover:bg-blue-50/10 text-xs text-slate-400 hover:text-blue-400 px-4.5 py-2.5 rounded-xl transition-all cursor-pointer font-sans shadow-sm"
            title="بارگذاری لوگوی جدید شرکت"
          >
            <Upload size={14} className="group-hover:animate-bounce shrink-0" />
            <span>افزودن لوگوی شرکت (۳۰٪ بزرگتر)</span>
          </button>
        ) : (
          <div className="no-print hidden"></div>
        )
      )}
    </div>
  );
}
