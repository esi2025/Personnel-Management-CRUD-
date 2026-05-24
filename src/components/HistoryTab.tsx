import React, { useState } from 'react';
import { Assignment } from '../types';

interface HistoryTabProps {
  assignments: Assignment[];
}

export default function HistoryTab({ assignments }: HistoryTabProps) {
  const [query, setQuery] = useState('');

  // Sort assignments: newest first
  const sorted = [...assignments].reverse();

  // Filter based on query
  const filtered = sorted.filter(ass => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      ass.equipmentCode.toLowerCase().includes(q) ||
      (ass.personnelName && ass.personnelName.toLowerCase().includes(q)) ||
      (ass.personnelCode && ass.personnelCode.toLowerCase().includes(q)) ||
      ass.equipmentType.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    let csv = '\uFEFF'; // Correct UTF-8 BOM representation inside JS
    csv += 'نوع سخت افزار,کد اموال سخت افزار,تحویل گیرنده ردیف,کد پرسنلی,تاریخ تحویل,تاریخ استرداد/عودت,وضعیت\r\n';

    filtered.forEach(ass => {
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
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-3.5 font-bold">رده کالا</th>
                <th className="p-3.5 font-bold">کد اموال سخت‌افزار</th>
                <th className="p-3.5 font-bold">تحویل‌گیرنده کارتابل</th>
                <th className="p-3.5 font-bold">کد پرسنلی</th>
                <th className="p-3.5 font-bold">تاریخ تحویل (شروع)</th>
                <th className="p-3.5 font-bold">تاریخ پایان (استرداد)</th>
                <th className="p-3.5 font-bold text-center">سررسید و وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    رکوردی ثبت نشده یا فاقد شرایط منطبق با فیلتر است.
                  </td>
                </tr>
              ) : (
                filtered.map((ass) => {
                  const isCurrent = !ass.endDate || ass.endDate === '';
                  return (
                    <tr key={ass.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-3.5">
                        {ass.equipmentType === 'case' && <span className="text-blue-600 font-bold">🖥️ کیس رایانه</span>}
                        {ass.equipmentType === 'monitor' && <span className="text-emerald-600 font-bold">📺 مانیتور</span>}
                        {ass.equipmentType === 'printer' && <span className="text-amber-600 font-bold">🖨️ پرینتر</span>}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">{ass.equipmentCode}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{ass.personnelName || 'انبار مرکزی کارگاه'}</td>
                      <td className="p-3.5 font-mono text-slate-500">{ass.personnelCode || '-'}</td>
                      <td className="p-3.5 text-slate-600">{ass.startDate}</td>
                      <td className="p-3.5 text-slate-600">{isCurrent ? '-' : ass.endDate}</td>
                      <td className="p-3.5 text-center">
                        {isCurrent ? (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
                            فعلی (تحت اختیار)
                          </span>
                        ) : (
                          <span className="bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-medium inline-block">
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
