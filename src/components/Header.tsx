import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Header({ isDark, onToggleTheme, customTitle }: { isDark: boolean; onToggleTheme: () => void; customTitle?: string }) {
  const [time, setTime] = useState('');
  const [shamsiDate, setShamsiDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hrs}:${mins}`);

      try {
        const formatter = new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        setShamsiDate(formatter.format(now));
      } catch (e) {
        setShamsiDate('۱۴۰۵/۰۳/۰۵');
      }
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={`no-print py-3 px-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-3 mb-4 transition-all duration-200 ${
      isDark 
        ? 'bg-slate-900/95 border-slate-800 text-white shadow-sm backdrop-blur-md' 
        : 'bg-white border-slate-200/90 text-slate-900 shadow-2xs backdrop-blur-md'
    }`}>
      <div className="flex items-center gap-3.5">
        <div className="transition-transform duration-200 hover:scale-105">
          <Logo size="h-[46px] md:h-[50px]" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-black tracking-tight font-sans text-slate-900 dark:text-white">
              شرکت عمران آذرستان
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              کارگاه بوشهر
            </span>
          </div>
          <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>{customTitle || "سامانه جامع مدیریت و پایش تجهیزات سخت‌افزاری و پرسنل"}</span>
          </h2>
        </div>
      </div>
      
      <div className="flex flex-col items-center md:items-end gap-1.5 w-full md:w-auto">
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            type="button"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer select-none border ${
              isDark 
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/70 hover:text-white' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 shadow-2xs'
            }`}
            title={isDark ? "تغییر به پوسته روشن" : "تغییر به پوسته تاریک"}
          >
            {isDark ? (
              <>
                <span className="text-amber-400 text-xs">☀️</span>
                <span>پوسته روز</span>
              </>
            ) : (
              <>
                <span className="text-indigo-600 text-xs">🌙</span>
                <span>پوسته شب</span>
              </>
            )}
          </button>
          
          {/* Live Date & Time Chip */}
          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
            isDark 
              ? 'bg-slate-800/60 text-slate-300 border-slate-700/60' 
              : 'bg-slate-50 text-slate-700 border-slate-200/80'
          }`}>
            <span className="text-slate-400">تاریخ:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{shamsiDate || '۱۴۰۵/۰۳/۰۵'}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-400">ساعت:</span>
            <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">{time || '00:00'}</span>
          </div>
        </div>
        
        {/* Status pill */}
        <div className="text-[11px] font-medium flex items-center gap-1.5 self-center md:self-end text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>پایگاه داده کارگاه متصل و آماده</span>
        </div>
      </div>
    </header>
  );
}
