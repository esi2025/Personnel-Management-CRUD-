import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Header() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hrs}:${mins}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 border-b-4 border-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div className="flex items-center gap-4">
        <Logo size="h-16" />
        <div>
          <h1 className="text-2xl font-black tracking-tight">شرکت عمران آذرستان</h1>
          <h2 className="text-sm font-medium text-slate-300">واحد فناوری اطلاعات و ارتباطات (ICT) | کارگاه بوشهر</h2>
          <span className="inline-block mt-2 bg-blue-900/40 border border-blue-500 text-blue-400 px-3 py-0.5 text-xs rounded-full">
            سامانه تحت وب مدیریت و شناسنامه هوشمند تجهیزات اداری و کارگاهی
          </span>
        </div>
      </div>
      
      <div className="text-left flex flex-col items-end gap-1.5 w-full md:w-auto">
        <div className="bg-slate-800/80 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 border border-slate-700/50 w-full md:w-auto text-center md:text-right">
          تاریخ: <span className="text-blue-400">۱۴۰۵/۰۳/۰۳</span> | زمان: <span className="font-mono text-yellow-400">{time || '00:00'}</span>
        </div>
        <div className="text-emerald-400 text-xs flex items-center gap-1.5 self-center md:self-end">
          <span className="animate-pulse">●</span> سامانه فعال و آفلاین (ذخیره اطلاعات روی فایل)
        </div>
      </div>
    </header>
  );
}
