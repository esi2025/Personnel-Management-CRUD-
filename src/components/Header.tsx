import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Header({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
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
    <header className="no-print bg-slate-900 border-b-2 border-blue-600 text-white py-3.5 px-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-3 mb-3">
      <div className="flex items-center gap-3">
        <Logo size="h-[48px] md:h-[54px]" />
        <div>
          <h1 className="text-lg md:text-xl font-black tracking-tight font-sans">شرکت عمران آذرستان</h1>
          <h2 className="text-xs font-semibold text-slate-300">واحد فناوری اطلاعات و ارتباطات (ICT) | مدیریت تجهیزات کارگاه</h2>
        </div>
      </div>
      
      <div className="text-left flex flex-col items-center md:items-end gap-1.5 w-full md:w-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <button
            onClick={onToggleTheme}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-200 border border-slate-700/60 px-2.5 py-1 rounded-md text-[11px] font-bold transition duration-200 cursor-pointer shadow-sm select-none"
            title={isDark ? "تغییر به پوسته روز" : "تغییر به پوسته شب"}
          >
            {isDark ? (
              <>
                <span className="text-yellow-400 text-xs">☀️</span>
                <span>پوسته روشن</span>
              </>
            ) : (
              <>
                <span className="text-indigo-400 text-xs">🌙</span>
                <span>پوسته تاریک</span>
              </>
            )}
          </button>
          
          <div className="bg-slate-800/80 px-3 py-1 rounded-md text-xs font-bold text-slate-200 border border-slate-700/50 w-full md:w-auto text-center md:text-right">
            تاریخ: <span className="text-blue-400 font-extrabold">{shamsiDate || '۱۴۰۵/۰۳/۰۵'}</span> | زمان: <span className="font-mono text-yellow-400">{time || '00:00'}</span>
          </div>
        </div>
        
        <div className="text-emerald-400 text-[10px] sm:text-xs flex items-center gap-1.5 self-center md:self-end">
          <span className="animate-pulse">●</span> سامانه فعال و آفلاین (ذخیره روی فایل‌های محلی)
        </div>
      </div>
    </header>
  );
}
