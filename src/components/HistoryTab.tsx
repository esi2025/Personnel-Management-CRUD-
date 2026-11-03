import React, { useState, useMemo } from 'react';
import { Assignment } from '../types';

interface HistoryTabProps {
  assignments: Assignment[];
}

export default function HistoryTab({ assignments }: HistoryTabProps) {
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<'type' | 'code' | 'owner' | 'personnelCode' | 'startDate' | 'endDate' | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Filter based on query
  const filtered = useMemo(() => {
    // Sort assignments: newest first by default
    const sortedDefault = [...assignments].reverse();
    return sortedDefault.filter(ass => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        ass.equipmentCode.toLowerCase().includes(q) ||
        (ass.personnelName && ass.personnelName.toLowerCase().includes(q)) ||
        (ass.personnelCode && ass.personnelCode.toLowerCase().includes(q)) ||
        ass.equipmentType.toLowerCase().includes(q)
      );
    });
  }, [assignments, query]);

  // Sort filtered based on selected sort configuration
  const sortedAndFiltered = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'type') {
        valA = a.equipmentType || '';
        valB = b.equipmentType || '';
      } else if (sortField === 'code') {
        valA = a.equipmentCode || '';
        valB = b.equipmentCode || '';
      } else if (sortField === 'owner') {
        valA = a.personnelName || 'انبار مرکزی کارگاه';
        valB = b.personnelName || 'انبار مرکزی کارگاه';
      } else if (sortField === 'personnelCode') {
        valA = a.personnelCode || '';
        valB = b.personnelCode || '';
      } else if (sortField === 'startDate') {
        valA = a.startDate || '';
        valB = b.startDate || '';
      } else if (sortField === 'endDate') {
        valA = a.endDate || '';
        valB = b.endDate || '';
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [filtered, sortField, sortAsc]);

  const handleSort = (field: 'type' | 'code' | 'owner' | 'personnelCode' | 'startDate' | 'endDate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderSortIndicator = (field: 'type' | 'code' | 'owner' | 'personnelCode' | 'startDate' | 'endDate') => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  const exportCSV = () => {
    let csv = '\uFEFF'; // Correct UTF-8 BOM representation inside JS
    csv += 'نوع سخت افزار,کد اموال سخت افزار,تحویل گیرنده ردیف,کد پرسنلی,تاریخ تحویل,تاریخ استرداد/عودت,وضعیت\r\n';

    sortedAndFiltered.forEach(ass => {
      const type = ass.equipmentType === 'case' ? 'کیس کامپیوتر' : ass.equipmentType === 'monitor' ? 'مانیتور' : 'پرینتر';
      const owner = ass.personnelName || 'انبار کارگاه';
      const code = ass.personnelCode || '-';
      const estرداد = ass.endDate ? ass.endDate : 'تحت اختیار کاربر';
      const state = ass.endDate ? 'استرداد شده' : 'فعال';

      csv += `"${type}","${ass.equipmentCode}","${owner}","${code}","${ass.startDate}","${estرداد}","${state}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `assignments_history_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Search and export actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در تاریخچه بر اساس نام، کد پرسنلی یا کد اموال..."
            className="w-full text-right py-2.5 pr-10 pl-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            🔍
          </span>
        </div>
        <div className="flex items-center gap-2 self-end">
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>📥</span>
            <span>خروجی اکسل (CSV)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-[0.98]"
          >
            <span>🖨️</span>
            <span>چاپ تاریخچه</span>
          </button>
        </div>
      </div>

      {/* Main Table listings */}
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <th onClick={() => handleSort('type')} className="p-3 font-bold cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 select-none transition">رده کالا {renderSortIndicator('type')}</th>
                <th onClick={() => handleSort('code')} className="p-3 font-bold cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 select-none transition">کد اموال سخت‌افزار {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('owner')} className="p-3 font-bold cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 select-none transition">تحویل‌گیرنده {renderSortIndicator('owner')}</th>
                <th onClick={() => handleSort('personnelCode')} className="p-3 font-bold cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 select-none transition">کد پرسنلی {renderSortIndicator('personnelCode')}</th>
                <th onClick={() => handleSort('startDate')} className="p-3 font-bold cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 select-none transition">تاریخ تحویل {renderSortIndicator('startDate')}</th>
                <th onClick={() => handleSort('endDate')} className="p-3 font-bold cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 select-none transition">تاریخ استرداد {renderSortIndicator('endDate')}</th>
                <th className="p-3 font-bold text-center select-none">وضعیت تخصیص</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedAndFiltered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 dark:text-slate-500">
                    رکوردی ثبت نشده یا فاقد شرایط منطبق با فیلتر است.
                  </td>
                </tr>
              ) : (
                sortedAndFiltered.map((ass) => {
                  const isCurrent = !ass.endDate || ass.endDate === '';
                  return (
                    <tr key={ass.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition whitespace-nowrap">
                      <td className="p-3">
                        {ass.equipmentType === 'case' && <span className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-1.5">🖥️ کیس رایانه</span>}
                        {ass.equipmentType === 'monitor' && <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1.5">📺 مانیتور</span>}
                        {ass.equipmentType === 'printer' && <span className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1.5">🖨️ پرینتر</span>}
                        {ass.equipmentType === 'mouse' && <span className="text-pink-600 dark:text-pink-400 font-bold inline-flex items-center gap-1.5">🖱️ ماوس</span>}
                        {ass.equipmentType === 'keyboard' && <span className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-1.5">⌨️ کیبورد</span>}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">{ass.equipmentCode}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{ass.personnelName || 'انبار مرکزی کارگاه'}</td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400 tabular-nums">{ass.personnelCode || '—'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono tabular-nums">{ass.startDate}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono tabular-nums">{isCurrent ? '—' : ass.endDate}</td>
                      <td className="p-3 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            فعلی (تحت اختیار)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            استرداد شده
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
