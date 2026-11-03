import React, { useState, useMemo } from 'react';
import { Case, Monitor, Printer, Personnel, Mouse, Keyboard, Radio, Cctv } from '../types';
import { isServiceOverdue } from '../utils/date';
import CctvStatusPieChart from './CctvStatusPieChart';

export const downloadRdpFile = (ipAddress: string, hostName: string) => {
  const target = ipAddress || hostName || 'localhost';
  const content = `full address:s:${target}\nprompt for credentials:i:1\nusername:s:Administrator\n`;
  const blob = new Blob([content], { type: 'application/x-rdp' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${hostName || ipAddress || 'remote'}.rdp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function StatusBadge({ status }: { status?: 'working' | 'repair' | 'retired' }) {
  const currentStatus = status || 'working';
  switch (currentStatus) {
    case 'working':
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          سالم
        </span>
      );
    case 'repair':
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          نیاز به تعمیر
        </span>
      );
    case 'retired':
      return (
        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          اسقاط شده
        </span>
      );
    default:
      return null;
  }
}

interface CasesSubTabProps {
  cases: Case[];
  personnel: Personnel[];
  onEdit: (c: Case) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'case', data: Case) => void;
}

export function CasesSubTab({
  cases,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: CasesSubTabProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return '';
    const found = personnel.find(p => p.code === assignedToCode);
    return found ? found.name : '';
  };

  const sortedCases = useMemo(() => {
    if (!sortField) return cases;
    return [...cases].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';

      if (sortField === 'assignedTo') {
        valA = getOwnerName(a.assignedTo);
        valB = getOwnerName(b.assignedTo);
      } else if (sortField === 'ram') {
        valA = `${a.ramType || ''} ${a.ramQty || ''}`;
        valB = `${b.ramType || ''} ${b.ramQty || ''}`;
      } else if (sortField === 'hdd') {
        valA = `${a.hdd1 || ''} ${a.hdd2 || ''}`;
        valB = `${b.hdd1 || ''} ${b.hdd2 || ''}`;
      } else {
        valA = String(a[sortField] || '');
        valB = String(b[sortField] || '');
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [cases, sortField, sortAsc, personnel]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖥️</span>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">لیست کیس‌های رایانه‌ای کارگاه بوشهر</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">مشخصات فنی مادربورد، پردازنده، حافظه رم، شبکه ریموت و وضعیت استقرار</p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 shrink-0 select-none"
        >
          <span>➕</span>
          <span>ثبت کیس جدید</span>
        </button>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد کیس (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('motherboard')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مادربورد {renderSortIndicator('motherboard')}</th>
                <th onClick={() => handleSort('cpu')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">پردازنده (CPU) {renderSortIndicator('cpu')}</th>
                <th onClick={() => handleSort('ram')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">رم (RAM) {renderSortIndicator('ram')}</th>
                <th onClick={() => handleSort('vga')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کارت گرافیک {renderSortIndicator('vga')}</th>
                <th onClick={() => handleSort('hdd')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">فضای ذخیره‌سازی {renderSortIndicator('hdd')}</th>
                <th onClick={() => handleSort('power')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">پاور {renderSortIndicator('power')}</th>
                <th className="p-3 font-bold text-right select-none">مشخصات شبکه و ریموت</th>
                <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-3 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('assignedTo')}</th>
                <th className="p-3 font-bold text-center select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedCases.length === 0 ? (
                <tr>
                   <td colSpan={12} className="p-8 text-center text-slate-400">
                    کیسی در سامانه ثبت نگردیده است. جهت افزودن، از دکمه «ثبت کیس جدید» استفاده فرمایید.
                  </td>
                </tr>
              ) : (
                sortedCases.map((c) => {
                  const owner = personnel.find(p => p.code === c.assignedTo);
                  return (
                    <tr 
                      key={c.code} 
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(c.code, 'case', c)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                             📸 QR
                          </span>
                          <span>{c.code}</span>
                          {isServiceOverdue(c.lastServiced) && (
                            <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${c.lastServiced})`}>
                              ⚠️
                            </span>
                          )}
                        </div>
                        {c.lastServiced && (
                          <div className="text-[10px] font-sans text-slate-400 mt-0.5" title="تاریخ آخرین سرویس دوره‌ای">
                            📅 سرویس: {c.lastServiced}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{c.motherboard}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{c.cpu}</td>
                      <td className="p-3">
                        <span className="font-mono text-xs tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                          {c.ramType} - {c.ramQty}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.vga}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] tabular-nums">{c.hdd1} {c.hdd2 && c.hdd2 !== '-' ? `| ${c.hdd2}` : ''}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] tabular-nums">{c.power || "—"}</td>
                      <td className="p-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-0.5 max-w-[190px]">
                          {c.hostName && <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">🖥️ {c.hostName}</div>}
                          {c.ipAddress && <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono tabular-nums" dir="ltr">{c.ipAddress}</div>}
                          {c.macAddress && <div className="text-[10px] text-slate-400 font-mono tabular-nums" dir="ltr">{c.macAddress}</div>}
                          {!c.hostName && !c.ipAddress && !c.macAddress && <span className="text-slate-400">—</span>}
                          
                          {(c.ipAddress || c.hostName) && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                onClick={() => downloadRdpFile(c.ipAddress || '', c.hostName || '')}
                                title="دانلود فایل RDP برای اتصال ریموت"
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
                              >
                                📥 RDP
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`mstsc /v:${c.ipAddress || c.hostName}`);
                                  alert('دستور ریموت کپی شد! می‌توانید با فشردن Win+R و وارد کردن آن ریموت بزنید:\n' + `mstsc /v:${c.ipAddress || c.hostName}`);
                                }}
                                title="کپی دستور ریموت (mstsc)"
                                type="button"
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-[10px] transition cursor-pointer font-mono"
                              >
                                📋 دستور
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={c.description || undefined}>
                        {c.description || '—'}
                      </td>
                      <td className="p-3">
                        {owner ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <span className="text-slate-400">👤</span>
                            <span>{owner.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">({owner.code})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="text-slate-400">📍</span>
                            <span>{c.location || 'مستقر در انبار کارگاه'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(c)}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                            title="ویرایش مشخصات کیس"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onTransfer(c.code)}
                            type="button"
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                            title="انتقال یا تخصیص کیس"
                          >
                            🔄 جابجایی
                          </button>
                          <button 
                            onClick={() => onDelete(c.code)}
                            type="button"
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                            title="حذف کیس از موجودی"
                          >
                            🗑️ حذف
                          </button>
                        </div>
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

interface MonitorsSubTabProps {
  monitors: Monitor[];
  personnel: Personnel[];
  onEdit: (m: Monitor) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'monitor', data: Monitor) => void;
}

export function MonitorsSubTab({
  monitors,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: MonitorsSubTabProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return '';
    const found = personnel.find(p => p.code === assignedToCode);
    return found ? found.name : '';
  };

  const sortedMonitors = useMemo(() => {
    if (!sortField) return monitors;
    return [...monitors].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';

      if (sortField === 'assignedTo') {
        valA = getOwnerName(a.assignedTo);
        valB = getOwnerName(b.assignedTo);
      } else {
        valA = String(a[sortField] || '');
        valB = String(b[sortField] || '');
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [monitors, sortField, sortAsc, personnel]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📺</span>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">فهرست مانیتورهای کارگاه بوشهر</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اطلاعات مدل، ابعاد صفحه، وضعیت سلامت و مشخصات تحویل‌گیرنده</p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 shrink-0 select-none"
        >
          <span>➕</span>
          <span>ثبت مانیتور جدید</span>
        </button>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد مانیتور (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">نام مدل و ابعاد {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-3 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('assignedTo')}</th>
                <th className="p-3 text-center font-bold select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedMonitors.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400">
                    مانیتوری در سامانه ثبت نگردیده است. جهت افزودن، روی دکمه «ثبت مانیتور جدید» کلیک فرمایید.
                  </td>
                </tr>
              ) : (
                sortedMonitors.map((m) => {
                  const owner = personnel.find(p => p.code === m.assignedTo);
                  return (
                    <tr 
                      key={m.code} 
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(m.code, 'monitor', m)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{m.code}</span>
                          {isServiceOverdue(m.lastServiced) && (
                            <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${m.lastServiced})`}>
                              ⚠️
                            </span>
                          )}
                        </div>
                        {m.lastServiced && (
                          <div className="text-[10px] font-sans text-slate-400 mt-0.5" title="تاریخ آخرین سرویس دوره‌ای">
                            📅 سرویس: {m.lastServiced}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{m.model}</td>
                      <td className="p-3">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={m.description || undefined}>
                        {m.description || '—'}
                      </td>
                      <td className="p-3">
                        {owner ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <span className="text-slate-400">👤</span>
                            <span>{owner.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">({owner.code})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="text-slate-400">📍</span>
                            <span>{m.location ? m.location : 'مستقر در انبار کارگاه'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(m)}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                            title="ویرایش مشخصات مانیتور"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onTransfer(m.code)}
                            type="button"
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                            title="انتقال یا تخصیص مانیتور"
                          >
                            🔄 جابجایی
                          </button>
                          <button 
                            onClick={() => onDelete(m.code)}
                            type="button"
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                            title="حذف مانیتور از سیستم"
                          >
                            🗑️ حذف
                          </button>
                        </div>
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

interface PrintersSubTabProps {
  printers: Printer[];
  personnel: Personnel[];
  onEdit: (p: Printer) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'printer', data: Printer) => void;
}

export function PrintersSubTab({
  printers,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: PrintersSubTabProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return '';
    const found = personnel.find(p => p.code === assignedToCode);
    return found ? found.name : '';
  };

  const sortedPrinters = useMemo(() => {
    if (!sortField) return printers;
    return [...printers].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';

      if (sortField === 'assignedTo') {
        valA = getOwnerName(a.assignedTo);
        valB = getOwnerName(b.assignedTo);
      } else {
        valA = String(a[sortField] || '');
        valB = String(b[sortField] || '');
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [printers, sortField, sortAsc, personnel]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖨️</span>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">فهرست پرینترها و تجهیزات چاپ کارگاه بوشهر</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">اطلاعات مدل، آدرس IP تحت شبکه، پورت مدیریت وب و وضعیت تخصیص</p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 shrink-0 select-none"
        >
          <span>➕</span>
          <span>ثبت پرینتر جدید</span>
        </button>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد پرینتر (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مدل و سازنده {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th onClick={() => handleSort('ipAddress')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مشخصات شبکه و وب {renderSortIndicator('ipAddress')}</th>
                <th className="p-3 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('assignedTo')}</th>
                <th className="p-3 text-center font-bold select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedPrinters.length === 0 ? (
                <tr>
                   <td colSpan={7} className="p-8 text-center text-slate-400">
                    پرینتری در سیستم ثبت نگردیده است. جهت افزودن، از دکمه «ثبت پرینتر جدید» استفاده فرمایید.
                  </td>
                </tr>
              ) : (
                sortedPrinters.map((pr) => {
                  const owner = personnel.find(p => p.code === pr.assignedTo);
                  return (
                    <tr 
                      key={pr.code} 
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(pr.code, 'printer', pr)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{pr.code}</span>
                          {isServiceOverdue(pr.lastServiced) && (
                            <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${pr.lastServiced})`}>
                              ⚠️
                            </span>
                          )}
                        </div>
                        {pr.lastServiced && (
                          <div className="text-[10px] font-sans text-slate-400 mt-0.5" title="تاریخ آخرین سرویس دوره‌ای">
                            📅 سرویس: {pr.lastServiced}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{pr.model}</td>
                      <td className="p-3">
                        <StatusBadge status={pr.status} />
                      </td>
                      <td className="p-3">
                        {pr.ipAddress || pr.macAddress || pr.accessLink ? (
                          <div className="flex flex-col gap-1 items-start font-mono text-[10px] md:text-xs" onClick={(e) => e.stopPropagation()}>
                            {pr.ipAddress && (
                              <span className="font-mono text-blue-600 dark:text-blue-400 tabular-nums font-bold" dir="ltr" title="آدرس IP">
                                IP: {pr.ipAddress}
                              </span>
                            )}
                            {pr.macAddress && (
                              <span className="text-[10px] text-slate-400 font-mono tabular-nums" dir="ltr" title="آدرس فیزیکی مک کارت شبکه">
                                MAC: {pr.macAddress}
                              </span>
                            )}
                            {(pr.accessLink || pr.ipAddress) && (
                              <a 
                                href={pr.accessLink || `http://${pr.ipAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg flex items-center gap-1 font-sans font-bold transition select-none mt-0.5"
                                title="کلیک جهت ورود به صفحه وب مدیریت پرینتر"
                              >
                                🌐 پنل وب
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={pr.description || undefined}>
                        {pr.description || '—'}
                      </td>
                      <td className="p-3">
                        {owner ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <span className="text-slate-400">👤</span>
                            <span>{owner.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">({owner.code})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="text-slate-400">📍</span>
                            <span>{pr.location ? pr.location : 'مستقر در انبار کارگاه'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(pr)}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                            title="ویرایش مشخصات پرینتر"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onTransfer(pr.code)}
                            type="button"
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                            title="انتقال یا تخصیص پرینتر"
                          >
                            🔄 جابجایی
                          </button>
                          <button 
                            onClick={() => onDelete(pr.code)}
                            type="button"
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                            title="حذف پرینتر از سیستم"
                          >
                            🗑️ حذف
                          </button>
                        </div>
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

interface MiceSubTabProps {
  mice: Mouse[];
  personnel: Personnel[];
  onEdit: (m: Mouse) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'mouse', data: Mouse) => void;
}

export function MiceSubTab({
  mice = [],
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: MiceSubTabProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return '';
    const found = personnel.find(p => p.code === assignedToCode);
    return found ? found.name : '';
  };

  const sortedMice = useMemo(() => {
    if (!sortField) return mice;
    return [...mice].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';

      if (sortField === 'assignedTo') {
        valA = getOwnerName(a.assignedTo);
        valB = getOwnerName(b.assignedTo);
      } else {
        valA = String(a[sortField] || '');
        valB = String(b[sortField] || '');
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [mice, sortField, sortAsc, personnel]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖱️</span>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">فهرست ماوس‌های کارگاه بوشهر</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">کدهای اموال، وضعیت اتصال، مشخصات سلامت و موقعیت استقرار</p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 shrink-0 select-none"
        >
          <span>➕</span>
          <span>ثبت ماوس جدید</span>
        </button>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد ماوس (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مدل و سازنده {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-3 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('assignedTo')}</th>
                <th className="p-3 text-center font-bold select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedMice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    ماوسی در سیستم ثبت نگردیده است. جهت افزودن، از دکمه «ثبت ماوس جدید» استفاده فرمایید.
                  </td>
                </tr>
              ) : (
                sortedMice.map((m) => {
                  const owner = personnel.find(p => p.code === m.assignedTo);
                  return (
                    <tr 
                      key={m.code} 
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(m.code, 'mouse', m)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{m.code}</span>
                          {isServiceOverdue(m.lastServiced) && (
                            <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${m.lastServiced})`}>
                              ⚠️
                            </span>
                          )}
                        </div>
                        {m.lastServiced && (
                          <div className="text-[10px] font-sans text-slate-400 mt-0.5" title="تاریخ آخرین سرویس دوره‌ای">
                            📅 سرویس: {m.lastServiced}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{m.model}</td>
                      <td className="p-3">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={m.description || undefined}>
                        {m.description || '—'}
                      </td>
                      <td className="p-3">
                        {owner ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <span className="text-slate-400">👤</span>
                            <span>{owner.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">({owner.code})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="text-slate-400">📍</span>
                            <span>{m.location ? m.location : 'مستقر در انبار کارگاه'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(m)}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                            title="ویرایش مشخصات ماوس"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onTransfer(m.code)}
                            type="button"
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                            title="انتقال یا تخصیص ماوس"
                          >
                            🔄 جابجایی
                          </button>
                          <button 
                            onClick={() => onDelete(m.code)}
                            type="button"
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                            title="حذف ماوس از سیستم"
                          >
                            🗑️ حذف
                          </button>
                        </div>
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

interface KeyboardsSubTabProps {
  keyboards: Keyboard[];
  personnel: Personnel[];
  onEdit: (k: Keyboard) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'keyboard', data: Keyboard) => void;
}

export function KeyboardsSubTab({
  keyboards = [],
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: KeyboardsSubTabProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return '';
    const found = personnel.find(p => p.code === assignedToCode);
    return found ? found.name : '';
  };

  const sortedKeyboards = useMemo(() => {
    if (!sortField) return keyboards;
    return [...keyboards].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';

      if (sortField === 'assignedTo') {
        valA = getOwnerName(a.assignedTo);
        valB = getOwnerName(b.assignedTo);
      } else {
        valA = String(a[sortField] || '');
        valB = String(b[sortField] || '');
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [keyboards, sortField, sortAsc, personnel]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⌨️</span>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">فهرست کیبوردهای کارگاه بوشهر</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">کدهای اموال، وضعیت سلامت کلیدها و موقعیت استقرار</p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 shrink-0 select-none"
        >
          <span>➕</span>
          <span>ثبت کیبورد جدید</span>
        </button>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد کیبورد (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مدل و سازنده {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-3 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('assignedTo')}</th>
                <th className="p-3 text-center font-bold select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedKeyboards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    کیبوردی در سیستم ثبت نگردیده است. جهت افزودن، از دکمه «ثبت کیبورد جدید» استفاده فرمایید.
                  </td>
                </tr>
              ) : (
                sortedKeyboards.map((k) => {
                  const owner = personnel.find(p => p.code === k.assignedTo);
                  return (
                    <tr 
                      key={k.code} 
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(k.code, 'keyboard', k)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{k.code}</span>
                          {isServiceOverdue(k.lastServiced) && (
                            <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${k.lastServiced})`}>
                              ⚠️
                            </span>
                          )}
                        </div>
                        {k.lastServiced && (
                          <div className="text-[10px] font-sans text-slate-400 mt-0.5" title="تاریخ آخرین سرویس دوره‌ای">
                            📅 سرویس: {k.lastServiced}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{k.model}</td>
                      <td className="p-3">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={k.description || undefined}>
                        {k.description || '—'}
                      </td>
                      <td className="p-3">
                        {owner ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <span className="text-slate-400">👤</span>
                            <span>{owner.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">({owner.code})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="text-slate-400">📍</span>
                            <span>{k.location ? k.location : 'مستقر در انبار کارگاه'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(k)}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                            title="ویرایش مشخصات کیبورد"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onTransfer(k.code)}
                            type="button"
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                            title="انتقال یا تخصیص کیبورد"
                          >
                            🔄 جابجایی
                          </button>
                          <button 
                            onClick={() => onDelete(k.code)}
                            type="button"
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                            title="حذف کیبورد از سیستم"
                          >
                            🗑️ حذف
                          </button>
                        </div>
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

interface RadiosSubTabProps {
  radios: Radio[];
  personnel: Personnel[];
  onEdit: (r: Radio) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'radio', data: Radio) => void;
}

export function RadiosSubTab({
  radios,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: RadiosSubTabProps) {
  const [subView, setSubView] = useState<'inventory' | 'delivery_stats'>('inventory');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return '';
    const found = personnel.find(p => p.code === assignedToCode);
    return found ? found.name : '';
  };

  const sortedRadios = useMemo(() => {
    if (!sortField) return radios;
    return [...radios].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';

      if (sortField === 'assignedTo') {
        valA = getOwnerName(a.assignedTo);
        valB = getOwnerName(b.assignedTo);
      } else {
        valA = String(a[sortField] || '');
        valB = String(b[sortField] || '');
      }

      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [radios, sortField, sortAsc, personnel]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  // Delivery statistics calculation
  const stats = useMemo(() => {
    const total = radios.length;
    const assigned = radios.filter(r => r.assignedTo !== null).length;
    const inRepair = radios.filter(r => r.status === 'repair').length;
    const warehouse = radios.filter(r => r.assignedTo === null && r.status !== 'retired').length;
    const retired = radios.filter(r => r.status === 'retired').length;

    // Personnel holding radios
    const assignees = radios
      .filter(r => r.assignedTo !== null)
      .map(r => {
        const pers = personnel.find(p => p.code === r.assignedTo);
        return {
          radioCode: r.code,
          radioModel: r.model,
          radioStatus: r.status,
          persCode: r.assignedTo!,
          persName: pers ? pers.name : 'کاربر نامعلوم',
          persTitle: pers ? pers.title : 'پرسنل کارگاه',
          persDept: pers ? pers.department : 'اجرایی/پیمانکاری',
          persLoc: pers ? pers.location : 'کارگاه بوشهر'
        };
      });

    return { total, assigned, inRepair, warehouse, retired, assignees };
  }, [radios, personnel]);

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      
      {/* Upper header */}
      <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-sm md:text-base font-black text-slate-800 flex items-center gap-1.5">
              <span>📻 مدیریت و فناوری تخصیص بی‌سیم کارگاهی</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              ثبت بی‌سیم‌های دستی (موتورولا، کنوود)، ردیابی هوشمند تحویل به اکیپ‌های اجرایی کارگاه و ترخیص تعمیرگاهی مشابه پرینتر.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onTabChange('add-new-tab')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-sm scale-100 hover:scale-[1.02]"
            >
              ➕ ثبت بی‌سیم جدید
            </button>
          </div>
        </div>

        {/* View Switch / SubTabs */}
        <div className="flex items-center gap-1.5 mt-4 border-t pt-3.5 border-slate-200 font-sans">
          <button
            onClick={() => setSubView('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              subView === 'inventory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
            }`}
          >
            📋 لیست موجودی کل بی‌سیم‌ها ({radios.length})
          </button>
          <button
            onClick={() => setSubView('delivery_stats')}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subView === 'delivery_stats'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            📜 آمار تحویل مجزای افراد اجرایی ({stats.assigned})
          </button>
        </div>
      </div>

      {subView === 'inventory' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Grid Mini Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3 rounded-2xl shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">کل بی‌سیم‌ها</span>
              <span className="text-base font-black font-mono tabular-nums text-slate-900 dark:text-white block mt-0.5">{stats.total} دستگاه</span>
            </div>
            <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3 rounded-2xl shadow-2xs">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">تحویل فعال</span>
              <span className="text-base font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400 block mt-0.5">{stats.assigned} دستگاه</span>
            </div>
            <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3 rounded-2xl shadow-2xs">
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">در انتظار تعمیر</span>
              <span className="text-base font-black font-mono tabular-nums text-amber-700 dark:text-amber-400 block mt-0.5">{stats.inRepair} دستگاه</span>
            </div>
            <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3 rounded-2xl shadow-2xs">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">موجود در انبار</span>
              <span className="text-base font-black font-mono tabular-nums text-blue-700 dark:text-blue-400 block mt-0.5">{stats.warehouse} دستگاه</span>
            </div>
          </div>

          {/* MAIN INVENTORY TABLE */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-[11px] md:text-xs">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد بی‌سیم (اموال) {renderSortIndicator('code')}</th>
                    <th onClick={() => handleSort('model')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مدل و سازنده {renderSortIndicator('model')}</th>
                    <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                    <th className="p-3 font-bold text-right select-none">توضیحات</th>
                    <th onClick={() => handleSort('assignedTo')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('assignedTo')}</th>
                    <th className="p-3 text-center font-bold select-none">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedRadios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                         هیچ دستگاه بی‌سیمی در انبار ثبت نگردیده است. جهت افزودن، از دکمه «ثبت بی‌سیم جدید» استفاده فرمایید.
                      </td>
                    </tr>
                  ) : (
                    sortedRadios.map((r) => {
                      const owner = personnel.find(p => p.code === r.assignedTo);
                      return (
                        <tr 
                          key={r.code} 
                          className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                          onClick={() => onShowQR(r.code, 'radio', r)}
                          title="کلیک روی سطر جهت مشاهده برچسب بارکد اموال بی‌سیم"
                        >
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                              <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                                📸 QR
                              </span>
                              <span>{r.code}</span>
                              {isServiceOverdue(r.lastServiced) && (
                                <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${r.lastServiced})`}>
                                  ⚠️
                                </span>
                              )}
                            </div>
                            {r.lastServiced && (
                              <div className="text-[10px] font-sans text-slate-400 mt-0.5" title="تاریخ آخرین سرویس دوره‌ای">
                                📅 سرویس: {r.lastServiced}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{r.model}</td>
                          <td className="p-3">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={r.description || undefined}>
                            {r.description || '—'}
                          </td>
                          <td className="p-3">
                            {owner ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                <span className="text-slate-400">👤</span>
                                <span>{owner.name}</span>
                                <span className="font-mono text-[10px] text-slate-400 tabular-nums">({owner.code})</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span className="text-slate-400">📍</span>
                                <span>{r.location ? r.location : 'مستقر در انبار مرکزی سخت‌افزار'}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button 
                                onClick={() => onEdit(r)}
                                type="button"
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                                title="ویرایش مشخصات بی‌سیم"
                              >
                                ✏️ ویرایش
                              </button>
                              <button 
                                onClick={() => onTransfer(r.code)}
                                type="button"
                                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                                title="انتقال یا تخصیص بی‌سیم"
                              >
                                🔄 انتقال / تحویل
                              </button>
                              <button 
                                onClick={() => onDelete(r.code)}
                                type="button"
                                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                                title="حذف بی‌سیم از موجودی"
                              >
                                🗑️ حذف
                              </button>
                            </div>
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
      ) : (
        /* SEPARATE OPERATIONAL DELIVERY STATISTICS VIEW */
        <div className="space-y-4 animate-fade-in text-xs md:text-sm">
          
          <div className="p-4 bg-indigo-50/45 border border-indigo-100/80 rounded-2xl">
            <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              <span>📌 شرح و فلسفه تفکیک آمار تحویلی بی‌سیم‌ها</span>
            </h4>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed mt-1.5 leading-relaxed">
              نفرات تحویل‌گیرنده بی‌سیم دستی اکثراً بقیه تجهیزات اداری (کیس، مانیتور و چاپگر) را به دلیل ماهیت کارگاه و عدم برخورداری از میز تحریر تحویل نگرفته‌اند. نیروهای اجرایی و عملیاتی، سرپرستان کارگاه، HSE و امور ماشین‌آلات به صورت سیار تحویل‌گیرنده این ابزار ارتباطی بسیار ارزشمند هستند. لیست زیر منحصراً نمایانگر زنجیره فعال تحویل بی‌سیم‌ها در کارگاه به پرسنل اجرایی است.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-[11px] md:text-xs">
                <thead>
                  <tr className="bg-indigo-950/95 text-white whitespace-nowrap">
                    <th className="p-3 font-extrabold">کد بی‌سیم</th>
                    <th className="p-3 font-extrabold">برند و مدل بی‌سیم</th>
                    <th className="p-3 font-extrabold">وضعیت سلامت</th>
                    <th className="p-3 font-extrabold">نام تحویل‌گیرنده اجرایی</th>
                    <th className="p-3 font-extrabold">شناسه پرسنلی</th>
                    <th className="p-3 font-extrabold">مسئولیت / سمت سازمانی</th>
                    <th className="p-3 font-extrabold">بخش خدمتی / کاربری</th>
                    <th className="p-3 font-extrabold">انتقال فوری</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.assignees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        در حال حاضر هیچ بی‌سیم فعالی به اکیپ‌های اجرایی واگذار نشده است.
                      </td>
                    </tr>
                  ) : (
                    stats.assignees.map((asgn) => {
                      return (
                        <tr key={asgn.radioCode} className="border-b border-indigo-50/70 hover:bg-indigo-50/20 transition whitespace-nowrap">
                          <td className="p-3 font-mono font-black text-red-700">{asgn.radioCode}</td>
                          <td className="p-3 text-slate-700 font-bold">{asgn.radioModel}</td>
                          <td className="p-3">
                            <StatusBadge status={asgn.radioStatus} />
                          </td>
                          <td className="p-3 font-black text-slate-900">{asgn.persName}</td>
                          <td className="p-3 font-mono text-slate-500 font-bold">{asgn.persCode}</td>
                          <td className="p-3 text-slate-600">{asgn.persTitle}</td>
                          <td className="p-3">
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded text-[10px] font-bold">
                              {asgn.persDept}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => onTransfer(asgn.radioCode)}
                              className="bg-indigo-650 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[10px] transition font-bold cursor-pointer"
                            >
                              🔄 انتقالات
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border rounded-xl flex flex-col sm:flex-row justify-between text-xs font-bold text-slate-600 gap-3">
            <span>📊 سهم توزیع بی‌سیم کارگاهی بین اکیپ‌های فعال:</span>
            <div className="flex flex-wrap gap-4 text-slate-500 text-[11px]">
              <span>نیروهای HSE: <strong className="text-slate-800">{stats.assignees.filter(a => a.persDept.includes('HSE') || a.persDept.includes('ایمنی')).length} دستگاه</strong></span>
              <span>امور فنی و برق عملیاتی: <strong className="text-slate-800">{stats.assignees.filter(a => a.persDept.includes('برق') || a.persDept.includes('پیمانکار') || a.persDept.includes('اجرایی')).length} دستگاه</strong></span>
              <span>سایر اکیپ‌ها: <strong className="text-slate-800">{stats.assignees.filter(a => !a.persDept.includes('HSE') && !a.persDept.includes('ایمنی') && !a.persDept.includes('برق') && !a.persDept.includes('پیمانکار') && !a.persDept.includes('اجرایی')).length} دستگاه</strong></span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export interface CctvsSubTabProps {
  cctvs: Cctv[];
  personnel: Personnel[];
  onEdit: (cctv: Cctv) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
  onShowQR: (code: string, type: 'cctv', data: Cctv) => void;
}

export function CctvsSubTab({
  cctvs,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange,
  onShowQR
}: CctvsSubTabProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'location'>('table');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedCctvs = useMemo(() => {
    if (!sortField) return cctvs;
    return [...cctvs].sort((a: any, b: any) => {
      let valA = String(a[sortField] || '');
      let valB = String(b[sortField] || '');
      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [cctvs, sortField, sortAsc]);

  const groupedCctvs = useMemo(() => {
    const groups: Record<string, Cctv[]> = {};
    cctvs.forEach((c) => {
      const loc = (c.location || '').trim() || 'نامشخص / ثبت نشده';
      if (!groups[loc]) {
        groups[loc] = [];
      }
      groups[loc].push(c);
    });
    return groups;
  }, [cctvs]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  const stats = useMemo(() => {
    const total = cctvs.length;
    const working = cctvs.filter(c => c.status === 'working').length;
    const inRepair = cctvs.filter(c => c.status === 'repair').length;
    const retired = cctvs.filter(c => c.status === 'retired').length;
    return { total, working, inRepair, retired };
  }, [cctvs]);

  return (
    <div className="space-y-4 animate-fade-in text-right font-sans" dir="rtl">
      {/* Upper header */}
      <div className="bg-white/95 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎥</span>
            <div>
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">نظارت و مدیریت دوربین‌های مداربسته کارگاه بوشهر</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">مشخصات فنی دوربین‌ها، تفکیک موقعیت‌های استقرار، لینک پخش زنده تحت شبکه و پایش آنلاین</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => onTabChange('add-new-tab')}
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 select-none"
            >
              <span>➕</span>
              <span>ثبت دوربین جدید</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Stats & Pie Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 flex flex-col justify-between">
            {/* Grid Mini Stats */}
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-medium block">کل دوربین‌ها</span>
                <span className="text-base md:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white block mt-0.5">{stats.total} دستگاه</span>
              </div>
              <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs flex flex-col justify-center">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">فعال و سالم</span>
                <span className="text-base md:text-lg font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400 block mt-0.5">{stats.working} دستگاه</span>
              </div>
              <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs flex flex-col justify-center">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">در انتظار تعمیر</span>
                <span className="text-base md:text-lg font-black font-mono tabular-nums text-amber-700 dark:text-amber-400 block mt-0.5">{stats.inRepair} دستگاه</span>
              </div>
              <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs flex flex-col justify-center">
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">غیرفعال و اسقاط</span>
                <span className="text-base md:text-lg font-black font-mono tabular-nums text-rose-700 dark:text-rose-400 block mt-0.5">{stats.retired} دستگاه</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <CctvStatusPieChart 
              workingCount={stats.working}
              repairCount={stats.inRepair}
              retiredCount={stats.retired}
            />
          </div>
        </div>

        {/* VIEW MODE TOGGLE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">نحوه نمایش دوربین‌ها:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>📋</span> لیست یکپارچه جدول
            </button>
            <button
              onClick={() => setViewMode('location')}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'location'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🗂️</span> دسته‌بندی بر اساس موقعیت کارگاه
            </button>
          </div>
        </div>

        {viewMode === 'location' ? (
          <div className="space-y-4">
            {Object.keys(groupedCctvs).length === 0 ? (
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 text-center text-slate-400">
                هیچ دوربین مداربسته‌ای در سامانه کارگاه ثبت نگردیده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(groupedCctvs) as [string, Cctv[]][]).map(([locName, list]) => (
                  <div key={locName} className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
                    <div className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 px-4 py-3 flex justify-between items-center">
                      <h5 className="text-xs md:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-blue-600 dark:text-blue-400">📍</span>
                        <span>{locName}</span>
                      </h5>
                      <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tabular-nums">
                        {list.length} دستگاه
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2.5 flex-1">
                      {list.map((c) => {
                        return (
                          <div 
                            key={c.code} 
                            className="border border-slate-100 dark:border-slate-800 hover:bg-blue-50/20 dark:hover:bg-slate-800/30 rounded-xl p-3 transition cursor-pointer group"
                            onClick={() => onShowQR(c.code, 'cctv', c)}
                            title="کلیک جهت مشاهده برچسب بارکد اموال دوربین"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="space-y-1 text-right">
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                                  <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold select-none">📸 QR</span>
                                  <span>{c.code}</span>
                                  {isServiceOverdue(c.lastServiced) && (
                                    <span className="text-amber-500 text-sm animate-pulse inline-block" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${c.lastServiced})`}>
                                      ⚠️
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  {c.brand} - {c.model}
                                </div>
                                {c.accessLink && (
                                  <div className="pt-0.5">
                                    <a 
                                      href={c.accessLink.startsWith('http') ? c.accessLink : `http://${c.accessLink}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200/80 dark:border-indigo-800/60 px-2 py-0.5 rounded-lg font-bold transition"
                                    >
                                      🌐 پخش زنده ({c.accessLink})
                                    </a>
                                  </div>
                                )}
                                {c.description && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs truncate" title={c.description}>
                                    {c.description}
                                  </p>
                                )}
                                {c.lastServiced && (
                                  <div className="text-[9px] text-slate-400">
                                    📅 آخرین سرویس: {c.lastServiced}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-start sm:items-end gap-2 self-stretch sm:self-auto shrink-0">
                                <StatusBadge status={c.status} />
                                <div className="flex gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={() => onEdit(c)}
                                    type="button"
                                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                                  >
                                    ✏️ ویرایش
                                  </button>
                                  <button 
                                    onClick={() => onTransfer(c.code)}
                                    type="button"
                                    className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                                  >
                                    🔄 انتقال
                                  </button>
                                  <button 
                                    onClick={() => onDelete(c.code)}
                                    type="button"
                                    className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                                  >
                                    🗑️ حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* MAIN INVENTORY TABLE */
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-[11px] md:text-xs">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">کد دوربین (اموال) {renderSortIndicator('code')}</th>
                    <th onClick={() => handleSort('brand')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مارک سازنده {renderSortIndicator('brand')}</th>
                    <th onClick={() => handleSort('model')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">مدل فنی {renderSortIndicator('model')}</th>
                    <th onClick={() => handleSort('location')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">موقعیت استقرار {renderSortIndicator('location')}</th>
                    <th className="p-3 font-bold text-right select-none">پخش زنده شبکه</th>
                    <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">وضعیت فعالیت {renderSortIndicator('status')}</th>
                    <th className="p-3 font-bold text-right select-none">توضیحات تکمیلی</th>
                    <th className="p-3 text-center font-bold select-none">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedCctvs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                         هیچ دوربین مداربسته‌ای در سامانه کارگاه ثبت نگردیده است. جهت افزودن، از دکمه «ثبت دوربین جدید» استفاده فرمایید.
                      </td>
                    </tr>
                  ) : (
                    sortedCctvs.map((c) => {
                      return (
                        <tr 
                          key={c.code} 
                          className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group whitespace-nowrap"
                          onClick={() => onShowQR(c.code, 'cctv', c)}
                          title="کلیک روی سطر جهت مشاهده برچسب بارکد اموال دوربین"
                        >
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5 justify-start font-mono tabular-nums">
                              <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 px-1.5 py-0.5 rounded-md font-sans font-bold select-none">
                                📸 QR
                              </span>
                              <span>{c.code}</span>
                              {isServiceOverdue(c.lastServiced) && (
                                <span className="text-amber-500 text-sm animate-pulse select-none inline-block ml-1 font-sans" title={`⚠️ نیاز به سرویس: بیش از ۶ ماه از آخرین سرویس گذشته است (${c.lastServiced})`}>
                                  ⚠️
                                </span>
                              )}
                            </div>
                            {c.lastServiced && (
                              <div className="text-[10px] font-sans text-slate-400 mt-0.5 font-normal" title="تاریخ آخرین سرویس دوره‌ای">
                                📅 سرویس: {c.lastServiced}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{c.brand}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{c.model}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <span className="text-slate-400">📍</span>
                              <span>{c.location || 'کارگاه بوشهر'}</span>
                            </div>
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            {c.accessLink ? (
                              <a 
                                href={c.accessLink.startsWith('http') ? c.accessLink : `http://${c.accessLink}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200/80 dark:border-indigo-800/60 px-2 py-0.5 rounded-lg font-bold transition"
                              >
                                🌐 پخش زنده
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={c.description || undefined}>
                            {c.description || '—'}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button 
                                onClick={() => onEdit(c)}
                                type="button"
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                              >
                                ✏️ ویرایش
                              </button>
                              <button 
                                onClick={() => onTransfer(c.code)}
                                type="button"
                                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                              >
                                🔄 انتقال
                              </button>
                              <button 
                                onClick={() => onDelete(c.code)}
                                type="button"
                                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                              >
                                🗑️ حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
