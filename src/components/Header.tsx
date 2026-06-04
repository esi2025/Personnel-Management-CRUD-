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
    <header className="no-print bg-white dark:bg-slate-900 border-b-4 border-blue-600 text-slate-900 dark:text-white py-2.5 px-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4 mb-3 shrink-0">
      <div className="flex items-center gap-3 shrink-0 md:w-1/4">
        <Logo size="h-12 md:h-12" />
      </div>
      
      <div className="text-center flex-1 flex flex-col items-center">
        <h1 className="text-sm sm:text-base font-black tracking-tight font-sans">شرکت عمران آذرستان</h1>
        <h2 className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">واحد فناوری اطلاعات و ارتباطات (ICT) | مدیریت تجهیزات</h2>
        <span className="inline-block mt-1 text-[9.5px] sm:text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-2.5 py-0.5 rounded-full">
          سامانه تحت وب مدیریت و شناسنامه هوشمند تجهیزات اداری و کارگاهی
        </span>
      </div>
      
      <div className="text-left flex flex-col items-center md:items-end gap-1 shrink-0 md:w-1/4">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-350 px-2.5 py-1 rounded-md text-[10px] font-bold dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700/60 transition duration-200 cursor-pointer shadow-xs select-none"
            title={isDark ? "تغییر به پوسته روز" : "تغییر به پوسته شب"}
          >
            {isDark ? "☀️ روز" : "🌙 شب"}
          </button>
          
          <div className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50">
            تاریخ: <span className="text-blue-600 dark:text-blue-400 font-bold">{shamsiDate || '۱۴۰۵/۰۳/۰۵'}</span> | زمان: <span className="font-mono text-yellow-600 dark:text-yellow-500 font-bold">{time || '00:00'}</span>
          </div>
        </div>
        
        <div className="text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] flex items-center gap-1.5">
          <span className="animate-pulse">●</span> سامانه فعال و آفلاین (دیتابیس محلی)
        </div>
      </div>
    </header>
  );
}
