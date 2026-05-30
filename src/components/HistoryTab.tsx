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
    <div className="space-y-4">
      
      {/* Search and export actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex-1 w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در تاریخچه بر اساس شخص، کد یا کالا..."
            className="w-full text-right p-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 self-end">
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            📥 خروجی اکسل (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition cursor-pointer"
          >
            🖨️ چاپ تاریخچه
          </button>
        </div>
      </div>

      {/* Main Table listings */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('type')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-100 select-none transition">رده کالا {renderSortIndicator('type')}</th>
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-100 select-none transition">کد اموال سخت‌افزار {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('owner')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-100 select-none transition">تحویل‌گیرنده کارتابل {renderSortIndicator('owner')}</th>
                <th onClick={() => handleSort('personnelCode')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-100 select-none transition">کد پرسنلی {renderSortIndicator('personnelCode')}</th>
                <th onClick={() => handleSort('startDate')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-100 select-none transition">تاریخ تحویل (شروع) {renderSortIndicator('startDate')}</th>
                <th onClick={() => handleSort('endDate')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-100 select-none transition">تاریخ پایان (استرداد) {renderSortIndicator('endDate')}</th>
                <th className="p-2.5 font-bold text-center select-none">سررسید و وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFiltered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    رکوردی ثبت نشده یا فاقد شرایط منطبق با فیلتر است.
                  </td>
                </tr>
              ) : (
                sortedAndFiltered.map((ass) => {
                  const isCurrent = !ass.endDate || ass.endDate === '';
                  return (
                    <tr key={ass.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition whitespace-nowrap">
                      <td className="p-2.5">
                        {ass.equipmentType === 'case' && <span className="text-blue-600 font-bold">🖥️ کیس رایانه</span>}
                        {ass.equipmentType === 'monitor' && <span className="text-emerald-600 font-bold">📺 مانیتور</span>}
                        {ass.equipmentType === 'printer' && <span className="text-amber-600 font-bold">🖨️ پرینتر</span>}
                        {ass.equipmentType === 'mouse' && <span className="text-pink-600 font-bold">🖱️ ماوس</span>}
                        {ass.equipmentType === 'keyboard' && <span className="text-purple-600 font-bold">⌨️ کیبورد</span>}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{ass.equipmentCode}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{ass.personnelName || 'انبار مرکزی کارگاه'}</td>
                      <td className="p-2.5 font-mono text-slate-500">{ass.personnelCode || '-'}</td>
                      <td className="p-2.5 text-slate-600">{ass.startDate}</td>
                      <td className="p-2.5 text-slate-600">{isCurrent ? '-' : ass.endDate}</td>
                      <td className="p-2.5 text-center">
                        {isCurrent ? (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block">
                            فعلی (تحت اختیار)
                          </span>
                        ) : (
                          <span className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-medium inline-block">
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
