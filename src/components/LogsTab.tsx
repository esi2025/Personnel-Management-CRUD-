import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, Shield, Calendar, Terminal, Filter, RefreshCw, XCircle, FileText, CheckCircle2 
} from 'lucide-react';

interface AuditLog {
  id: string;
  username: string;
  name: string;
  ip: string;
  action: string; // 'login' | 'logout' | 'create' | 'edit' | 'delete' | 'transfer'
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

interface LogsTabProps {
  currentUser: {
    username: string;
    role: string;
    name: string;
  };
}

export default function LogsTab({ currentUser }: LogsTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching security logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!confirm('🚨 هشدار امنیتی:\n\nآیا از تخلیه کامل تاریخچه لاگ‌های سیستم اطمینان قطعی دارید؟ این عمل غیرقابل بازگشت است!')) {
      return;
    }
    try {
      const res = await fetch('/api/logs/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-operator-username': currentUser.username,
          'x-operator-name': encodeURIComponent(currentUser.name)
        }
      });
      if (res.ok) {
        setSuccessMsg('لاگ‌های امنیتی سیستم با موفقیت تخلیه گردید و لاگ پاکسازی ثبت شد.');
        fetchLogs();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg('خطا در پاکسازی کل لاگ‌ها.');
        setTimeout(() => setErrorMsg(''), 5500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطای سیستم در تخلیه لاگ.');
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
        return (
          <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-405 text-[10px] font-bold py-1 px-2 border border-emerald-200 dark:border-emerald-800 rounded flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-500" />
            <span>ورود به سیستم</span>
          </span>
        );
      case 'logout':
        return (
          <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-405 text-[10px] font-bold py-1 px-2 border border-rose-200 dark:border-rose-800 rounded flex items-center gap-1">
            <XCircle size={11} className="text-rose-500" />
            <span>خروج از سیستم</span>
          </span>
        );
      case 'create':
        return (
          <span className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-405 text-[10px] font-bold py-1 px-2 border border-blue-200 dark:border-blue-800 rounded flex items-center gap-1">
            <CheckCircle2 size={11} className="text-blue-500" />
            <span>ثبت هوشمند</span>
          </span>
        );
      case 'edit':
        return (
          <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-405 text-[10px] font-bold py-1 px-2 border border-amber-200 dark:border-amber-800 rounded flex items-center gap-1">
            <Terminal size={11} className="text-amber-500" />
            <span>ویرایش مشخصات</span>
          </span>
        );
      case 'delete':
        return (
          <span className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-405 text-[10px] font-bold py-1 px-2 border border-red-200 dark:border-red-800 rounded flex items-center gap-1">
            <Trash2 size={11} className="text-red-500" />
            <span>حذف و ابطال</span>
          </span>
        );
      case 'transfer':
        return (
          <span className="bg-purple-50 dark:bg-purple-950/20 text-purple-750 dark:text-purple-400 text-[10px] font-bold py-1 px-2 border border-purple-200 dark:border-purple-800 rounded flex items-center gap-1">
            <Terminal size={11} className="text-purple-500" />
            <span>انتقال لجستیک</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] py-1 px-2 rounded">
            سایر عملیات
          </span>
        );
    }
  };

  const filteredLogs = logs.filter(log => {
    // Action Filter
    if (filterAction !== 'all' && log.action !== filterAction) {
      return false;
    }
    // Search Query (Details, User, ID, IP)
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (log.details || '').toLowerCase().includes(q) ||
      (log.name || '').toLowerCase().includes(q) ||
      (log.username || '').toLowerCase().includes(q) ||
      (log.ip || '').toLowerCase().includes(q) ||
      (log.targetId || '').toLowerCase().includes(q) ||
      (log.targetType || '').toLowerCase().includes(q)
    );
  });

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-350 p-8 rounded-xl text-center border border-red-200" dir="rtl">
        <XCircle size={48} className="mx-auto mb-3 text-red-500" />
        <h3 className="font-bold text-base">دسترسی محدود شده است!</h3>
        <p className="text-sm mt-1.5 leading-relaxed">
          فقط کاربری مدیریت کل (Admin) مجاز به ورود و پایش لاگ‌های امنیتی سیستم می‌باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none leading-relaxed text-right font-sans" dir="rtl">
      
      {/* Upper Title Ribbon */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white">گزارش تاریخچه و لاگ‌های امنیتی سیستم</h3>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">پایش برخط کلیه ورودها، خروج‌ها، ثبت، ویرایش، حذف دارایی‌ها و جابه‌جایی تجهیزات کارگاهی بوشهر</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={fetchLogs}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-350 transition flex items-center gap-1 text-xs font-bold"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>به‌روزرسانی جدول</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            className="bg-red-500 hover:bg-red-650 text-white font-bold p-2 px-3.5 rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-red-500/10"
          >
            <Trash2 size={14} />
            <span>تخلیه کامل فایل لاگ</span>
          </button>
        </div>
      </div>

      {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-semibold">✅ {successMsg}</div>}
      {errorMsg && <div className="bg-red-500/10 border border-red-500/25 text-red-800 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold">⚠️ {errorMsg}</div>}

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        
        {/* Filter controls bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
          
          {/* Active search container */}
          <div className="flex-1 max-w-md relative">
            <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام کاربر، عملیات، آی‌پی، یا مشخصات ثبت شده..."
              className="w-full text-right p-2.5 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 select-all rounded-xl text-xs md:text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-medium"
            />
          </div>

          {/* Action category tags select Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold text-xs flex items-center gap-1 ml-1.5">
              <Filter size={13} className="text-slate-400" />
              <span>فیلتر دسته‌بندی:</span>
            </span>
            {[
              { id: 'all', label: '🗂️ همه لاگ‌ها' },
              { id: 'login', label: '🔐 ورودها' },
              { id: 'create', label: '➕ ثبت‌ها' },
              { id: 'edit', label: '✍️ ویرایش‌ها' },
              { id: 'delete', label: '❌ حذف‌ها' },
              { id: 'transfer', label: '🔄 جابه‌جایی‌ها' },
            ].map((act) => (
              <button
                key={act.id}
                onClick={() => setFilterAction(act.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterAction === act.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-150 dark:border-slate-800'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>

        </div>

        {/* Audit register display list */}
        {loading ? (
          <p className="text-center text-slate-450 py-12 text-sm">در حال پایش و دریافت لاگ‌های امنیتی سیستم عِمران آذرستان...</p>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-sm">هیچ لاگ متناظری برای فیلتر یا عبارت مورد جستجو یافت نگردید!</p>
            <p className="text-[10.5px]">در صورت نیاز، وضعیت فیلترها را مجدداً پایش کنید</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black">
                  <th className="p-3">نام کاربر / شناسه کاربری</th>
                  <th className="p-3">دسته عملیات</th>
                  <th className="p-3">آی‌پی اتصال</th>
                  <th className="p-3">شرح کامل واقعه امنیتی</th>
                  <th className="p-3">کد اموال/هدف</th>
                  <th className="p-3">زمان دقیق ثبت واقعه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{log.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono select-all">@{log.username}</span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-3 font-mono text-[11px] select-all max-xs:hidden text-slate-500 dark:text-slate-400">
                      {log.ip}
                    </td>
                    <td className="p-3 leading-relaxed font-medium text-slate-800 dark:text-slate-200 text-xs max-w-[360px]">
                      {log.details}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 dark:bg-slate-900 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-800 select-all tracking-wider text-slate-600 dark:text-slate-400">
                        {log.targetId && log.targetId !== "-" ? log.targetId : "—"}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400 inline shrink-0" />
                      <span>{log.timestamp}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
