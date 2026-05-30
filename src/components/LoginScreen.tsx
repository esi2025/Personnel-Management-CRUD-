import React, { useState, useEffect } from 'react';
import { Lock, User, AlertCircle, Cpu, Wifi } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [systemIp, setSystemIp] = useState<string>('در حال شناسایی...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch live client IP info from server
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (data.ip) {
          setSystemIp(data.ip);
        } else {
          setSystemIp('نامشخص');
        }
      })
      .catch(() => {
        setSystemIp('۱۲۷.۰.۰.۱ (آفلاین / محلی)');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('لطفاً نام کاربری و کلمه‌عبور را وارد نمایید.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('current_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('user-session-changed'));
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'ورود به سیستم با خطا مواجه شد.');
      }
    } catch (err) {
      console.error("Login failure:", err);
      // Fallback inside context (allowing default test users if backend is currently restarting/unreachable)
      if (username === 'admin' && password === 'admin') {
        const dummyUser = {
          id: "u1",
          username: "admin",
          role: "admin",
          name: "مدیر کل (سیستم آفلاین)",
          canEditPersonnel: true,
          canEditEquipment: true,
          canExport: true,
          canBackup: true,
          allowedIPs: ""
        };
        localStorage.setItem('current_user', JSON.stringify(dummyUser));
        window.dispatchEvent(new Event('user-session-changed'));
        onLoginSuccess(dummyUser);
      } else {
        setErrorMsg('ارتباط با سرور برقرار نشد. چنانچه از ادمین پیش‌فرض استفاده می‌کنید، از املای آن مطمئن شوید.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none" dir="rtl">
      
      {/* Background ambient light styling */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-650/10 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }} />

      {/* Main card box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative backdrop-blur-xl z-10 transition-all">
        
        {/* Company and system brand names */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 animate-[pulse_2s_infinite]">
            <Cpu size={30} className="stroke-[2.5]" />
          </div>
          <h1 className="text-lg font-black text-white leading-none">شرکت عمران آذرستان</h1>
          <h2 className="text-xs text-slate-400 font-bold">سامانه متمرکز شناسنامه سخت‌افزاری و پرسنل کارگاهی</h2>
        </div>

        {/* Informational connection live IP pill */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 mb-6 text-xs text-slate-350 flex justify-between items-center">
          <div className="flex items-center gap-1.5 font-bold">
            <Wifi size={14} className="text-emerald-500" />
            <span>آی‌پی اتصال جاری شما:</span>
          </div>
          <span className="font-mono font-black text-emerald-450 tracking-wider" style={{ color: '#34d399' }}>{systemIp}</span>
        </div>

        {/* Error message slot alert box */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-3.5 mb-6 text-xs text-red-400 font-medium flex gap-2.5 items-start">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Authentication submission inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block mr-1">نام کاربری:</label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="مثال: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full text-right p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 placeholder-slate-600 tracking-wide font-medium pr-10"
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-550">
                <User size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block mr-1">کلمه عبور (رمز سیستم):</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full text-right p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 placeholder-slate-600 tracking-wide pr-10"
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-550">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Tips block */}
          <div className="text-[10px] text-slate-500 leading-relaxed text-right py-1">
            💡 ورود به سیستم با حساب‌های کلیدی پشتیبانی می‌شود. حساب‌های آزمایشی پیش‌فرض: <br />
             کلمه عبور و نام کاربری مدیر سیستم هر دو <strong>admin</strong> است.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs md:text-sm shadow-lg shadow-blue-500/10 cursor-pointer transition duration-200 flex justify-center items-center gap-2 mt-2 disabled:bg-slate-850 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>درحال احراز هویت...</span>
            ) : (
              <>
                <Lock size={15} />
                <span>ورود امن به سامانه جامع</span>
              </>
            )}
          </button>
        </form>

        {/* Little Footer note */}
        <div className="text-center text-[10px] text-slate-600 mt-8 border-t border-slate-900/50 pt-3">
          فناوری اطلاعات و ارتباطات شرکت عمران آذرستان © ۱۴۰۵
        </div>
      </div>
    </div>
  );
}
