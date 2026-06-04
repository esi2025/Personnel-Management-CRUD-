import React, { useState, useEffect } from 'react';
import { User, Clock, Calendar } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  const [time, setTime] = useState('');
  const [shamsiDate, setShamsiDate] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    fetchUser();
    window.addEventListener('user-session-changed', fetchUser);
    return () => window.removeEventListener('user-session-changed', fetchUser);
  }, []);

  return (
    <header className="header-container no-print bg-slate-900 border-b-4 border-blue-600 text-white py-5 px-6 md:px-8 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-5 mb-4 shrink-0">
      <div className="flex items-center gap-3 shrink-0 md:w-1/4">
        <Logo size="h-12 md:h-12" />
      </div>
      
      <div className="text-center flex-1 flex flex-col items-center">
        <h1 className="text-sm sm:text-base font-black tracking-tight font-sans">شرکت عمران آذرستان</h1>
        <h2 className="text-[10px] sm:text-[11px] font-semibold text-slate-300 mt-1">واحد فناوری اطلاعات و ارتباطات (ICT) | مدیریت تجهیزات</h2>
        <span className="inline-block mt-1.5 text-[9.5px] sm:text-[10px] text-blue-400 font-bold bg-blue-950/40 border border-blue-900 px-3 py-0.5 rounded-full">
          سامانه تحت وب مدیریت و شناسنامه هوشمند تجهیزات اداری و کارگاهی
        </span>
      </div>
      
      <div className="text-left flex flex-col items-center md:items-end gap-2 shrink-0 md:w-1/4">
        {currentUser && (
          <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 transition px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-100 border border-slate-700/60 shadow-xs">
            <User size={13} className="text-blue-400 stroke-[3] shrink-0" />
            <span className="leading-none">
              کاربر جاری: <strong className="text-blue-400 font-bold">{currentUser.name}</strong> <span className="opacity-75">({currentUser.role === 'admin' ? 'مدير' : 'اپراتور'})</span>
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 hover:bg-slate-800 transition px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-100 border border-slate-700/60 shadow-xs flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span className="leading-none">تاریخ: <span className="text-blue-400 font-bold">{shamsiDate || '۱۴۰۵/۰۳/۰۵'}</span></span>
            </div>
            <span className="text-slate-600 font-light select-none">|</span>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-yellow-500 shrink-0" />
              <span className="leading-none">زمان: <span className="font-mono text-yellow-500 font-bold">{time || '00:00'}</span></span>
            </div>
          </div>
        </div>
        
        <div className="text-emerald-400 text-[9.5px] sm:text-[10.5px] flex items-center gap-2 font-medium bg-slate-950/30 px-3 py-1 rounded-md border border-slate-800/55">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="leading-none">سامانه فعال و آفلاین (دیتابیس محلی)</span>
        </div>
      </div>
    </header>
  );
}
