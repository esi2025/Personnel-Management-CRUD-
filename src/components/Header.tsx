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
    <header className="no-print bg-slate-900 border-b-4 border-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div className="flex items-center gap-4">
        <Logo size="h-16" />
        <div>
          <h1 className="text-2xl font-black tracking-tight font-sans">شرکت عمران آذرستان</h1>
          <h2 className="text-sm font-medium text-slate-300">واحد فناوری اطلاعات و ارتباطات (ICT) | مدیریت تجهیزات</h2>
          <span className="inline-block mt-2 bg-blue-900/40 border border-blue-500 text-blue-400 px-3 py-0.5 text-xs rounded-full">
            سامانه تحت وب مدیریت و شناسنامه هوشمند تجهیزات اداری و کارگاهی
          </span>
        </div>
      </div>
      
      <div className="text-left flex flex-col items-end gap-1.5 w-full md:w-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onToggleTheme}
            type="button"
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-200 border border-slate-700/60 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer shadow-sm select-none"
            title={isDark ? "تغییر به پوسته روز" : "تغییر به پوسته شب"}
          >
            {isDark ? (
              <>
                <span className="text-yellow-400 text-sm">☀️</span>
                <span>پوسته روز (روشن)</span>
              </>
            ) : (
              <>
                <span className="text-indigo-400 text-sm">🌙</span>
                <span>پوسته شب (تاریک)</span>
              </>
            )}
          </button>
          
          <div className="bg-slate-800/80 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 border border-slate-700/50 w-full md:w-auto text-center md:text-right">
            تاریخ: <span className="text-blue-400 font-bold">{shamsiDate || '۱۴۰۵/۰۳/۰۵'}</span> | زمان: <span className="font-mono text-yellow-400">{time || '00:00'}</span>
          </div>
        </div>
        
        <div className="text-emerald-400 text-xs flex items-center gap-1.5 self-center md:self-end">
          <span className="animate-pulse">●</span> سامانه فعال و آفلاین (ذخیره اطلاعات روی فایل)
        </div>
      </div>
    </header>
  );
}
