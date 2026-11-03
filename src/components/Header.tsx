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
    <header className={`no-print py-3 px-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-3.5 mb-4 transition-all duration-200 ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800/90 text-white shadow-sm backdrop-blur-md' 
        : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs backdrop-blur-md'
    }`}>
      <div className="flex items-center gap-3.5">
        <div className="transition-transform duration-200 hover:scale-105 shrink-0">
          <Logo size="h-[44px] md:h-[48px]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base md:text-lg font-black tracking-tight font-sans text-slate-900 dark:text-white">
              شرکت عمران آذرستان
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              کارگاه بوشهر
            </span>
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{customTitle || "سامانه جامع پایش تجهیزات سخت‌افزاری و لجستیک پرسنل"}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center md:items-end justify-center gap-2.5 w-full md:w-auto">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Live Date & Time Display */}
          <div className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 select-none ${
            isDark 
              ? 'bg-slate-800/70 text-slate-300 border-slate-700/70 shadow-inner' 
              : 'bg-slate-50 text-slate-700 border-slate-200/80'
          }`}>
            <span className="text-slate-400 text-[11px]">امروز:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{shamsiDate || '۱۴۰۴/۰۱/۰۱'}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400 text-xs">{time || '00:00'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            type="button"
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer select-none border ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-slate-750 hover:text-amber-200 hover:border-slate-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-2xs'
            }`}
            title={isDark ? "تغییر به پوسته روز" : "تغییر به پوسته شب"}
          >
            {isDark ? (
              <>
                <span className="text-xs">☀️</span>
                <span className="text-[11px]">پوسته روز</span>
              </>
            ) : (
              <>
                <span className="text-xs">🌙</span>
                <span className="text-[11px]">پوسته شب</span>
              </>
            )}
          </button>
        </div>
        
        {/* Real-time DB Status Badge */}
        <div className="text-[11px] font-medium flex items-center gap-1.5 self-center md:self-end text-slate-500 dark:text-slate-400 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs"></span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">بانک اطلاعات کارگاه آنلاین</span>
        </div>
      </div>
    </header>
  );
}
