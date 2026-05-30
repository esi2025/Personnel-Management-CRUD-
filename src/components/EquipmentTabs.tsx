import React, { useState, useMemo } from 'react';
import { Case, Monitor, Printer, Personnel, Mouse, Keyboard } from '../types';

export function StatusBadge({ status }: { status?: 'working' | 'repair' | 'retired' }) {
  const currentStatus = status || 'working';
  switch (currentStatus) {
    case 'working':
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-100/80 border border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-black shrink-0 shadow-sm transition">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
          سالم
        </span>
      );
    case 'repair':
      return (
        <span className="inline-flex items-center gap-1.5 bg-orange-100 border border-orange-500 text-orange-850 dark:bg-orange-950/60 dark:border-orange-500 dark:text-orange-300 px-2.5 py-1 rounded-md text-[11px] font-black shrink-0 shadow-sm animate-pulse transition">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-xs" />
          نیاز به تعمیر
        </span>
      );
    case 'retired':
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-100 border border-red-400 text-red-800 dark:bg-red-950/60 dark:border-red-600 dark:text-red-300 px-2.5 py-1 rounded-md text-[11px] font-black shrink-0 shadow-sm transition">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-xs" />
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">🖥️ لیست کیس‌های رایانه‌ای</h3>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          ➕ ثبت کیس جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کد کیس (شماره اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('motherboard')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">مادربورد {renderSortIndicator('motherboard')}</th>
                <th onClick={() => handleSort('cpu')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">پردازنده (CPU) {renderSortIndicator('cpu')}</th>
                <th onClick={() => handleSort('ram')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">رم (RAM) {renderSortIndicator('ram')}</th>
                <th onClick={() => handleSort('vga')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کارت گرافیک {renderSortIndicator('vga')}</th>
                <th onClick={() => handleSort('hdd')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">فضای هارد (HDD/SSD) {renderSortIndicator('hdd')}</th>
                <th onClick={() => handleSort('power')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">پاور (منبع تغذیه) {renderSortIndicator('power')}</th>
                <th onClick={() => handleSort('status')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-2.5 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">تحویل به {renderSortIndicator('assignedTo')}</th>
                <th className="p-2.5 font-bold text-center select-none">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.length === 0 ? (
                <tr>
                   <td colSpan={11} className="p-6 text-center text-slate-400">
                    کیسی در سامانه ثبت نگردیده است. نسبت به افزودن از تب ثبت جدید اقدام فرمایید.
                  </td>
                </tr>
              ) : (
                sortedCases.map((c) => {
                  const owner = personnel.find(p => p.code === c.assignedTo);
                  return (
                    <tr 
                      key={c.code} 
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(c.code, 'case', c)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                             📸 QR
                          </span>
                          <span>{c.code}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{c.motherboard}</td>
                      <td className="p-2.5 text-slate-600">{c.cpu}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] md:text-xs font-mono inline-block whitespace-nowrap">
                          {c.ramType} - {c.ramQty}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{c.vga}</td>
                      <td className="p-2.5 text-slate-500 font-mono text-[10px] md:text-[11px]">{c.hdd1} | {c.hdd2}</td>
                      <td className="p-2.5 text-slate-600 font-mono text-[10px] md:text-[11px]">{c.power || "—"}</td>
                      <td className="p-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="p-2.5 text-slate-500 max-w-[150px] truncate" title={c.description || undefined}>
                        {c.description || '—'}
                      </td>
                      <td className="p-2.5">
                        {owner ? (
                          <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEdit(c)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(c.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(c.code)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] md:text-xs transition font-semibold cursor-pointer"
                          >
                            🔄 جابجایی
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">📺 لیست مانیتورهای موجود</h3>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          ➕ ثبت مانیتور جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کد مانیتور (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">نام مدل و مشخصات فنی {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-2.5 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کاربر تحویل گیرنده {renderSortIndicator('assignedTo')}</th>
                <th className="p-2.5 text-center font-bold select-none">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedMonitors.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-6 text-center text-slate-400">
                    مانیتوری در سامانه ثبت نگردیده است.
                  </td>
                </tr>
              ) : (
                sortedMonitors.map((m) => {
                  const owner = personnel.find(p => p.code === m.assignedTo);
                  return (
                    <tr 
                      key={m.code} 
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(m.code, 'monitor', m)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{m.code}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{m.model}</td>
                      <td className="p-2.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="p-2.5 text-slate-500 max-w-[150px] truncate" title={m.description || undefined}>
                        {m.description || '—'}
                      </td>
                      <td className="p-2.5">
                        {owner ? (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEdit(m)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(m.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(m.code)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] md:text-xs transition font-semibold cursor-pointer"
                          >
                            🔄 جابجایی
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">🖨️ لیست پرینترها و چاپگرها</h3>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          ➕ ثبت پرینتر جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کده پرینتر (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">مدل و سازنده {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-2.5 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">تحویل به کاربر کارگاه {renderSortIndicator('assignedTo')}</th>
                <th className="p-2.5 text-center font-bold select-none">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrinters.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-6 text-center text-slate-400">
                    پرینتری در سیستم ثبت نگردیده است.
                  </td>
                </tr>
              ) : (
                sortedPrinters.map((pr) => {
                  const owner = personnel.find(p => p.code === pr.assignedTo);
                  return (
                    <tr 
                      key={pr.code} 
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(pr.code, 'printer', pr)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{pr.code}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{pr.model}</td>
                      <td className="p-2.5">
                        <StatusBadge status={pr.status} />
                      </td>
                      <td className="p-2.5 text-slate-500 max-w-[150px] truncate" title={pr.description || undefined}>
                        {pr.description || '—'}
                      </td>
                      <td className="p-2.5">
                        {owner ? (
                          <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEdit(pr)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(pr.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(pr.code)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] md:text-xs transition font-semibold cursor-pointer"
                          >
                            🔄 جابجایی
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">🖱️ لیست ماوس‌ها</h3>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          ➕ ثبت ماوس جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کد ماوس (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">مدل و برند {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-2.5 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کاربر تحویل گیرنده {renderSortIndicator('assignedTo')}</th>
                <th className="p-2.5 text-center font-bold select-none">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedMice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    ماوسی در سیستم ثبت نگردیده است.
                  </td>
                </tr>
              ) : (
                sortedMice.map((m) => {
                  const owner = personnel.find(p => p.code === m.assignedTo);
                  return (
                    <tr 
                      key={m.code} 
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(m.code, 'mouse', m)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{m.code}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{m.model}</td>
                      <td className="p-2.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="p-2.5 text-slate-500 max-w-[150px] truncate" title={m.description || undefined}>
                        {m.description || '—'}
                      </td>
                      <td className="p-2.5">
                        {owner ? (
                          <span className="bg-pink-50 border border-pink-200 text-pink-800 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEdit(m)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(m.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(m.code)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] md:text-xs transition font-semibold cursor-pointer"
                          >
                            🔄 جابجایی
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">⌨️ لیست کیبوردها</h3>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          ➕ ثبت کیبورد جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کد کیبورد (اموال) {renderSortIndicator('code')}</th>
                <th onClick={() => handleSort('model')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">مدل و برند {renderSortIndicator('model')}</th>
                <th onClick={() => handleSort('status')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">وضعیت سلامت {renderSortIndicator('status')}</th>
                <th className="p-2.5 font-bold text-right select-none">توضیحات</th>
                <th onClick={() => handleSort('assignedTo')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">کاربر تحویل گیرنده {renderSortIndicator('assignedTo')}</th>
                <th className="p-2.5 text-center font-bold select-none">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedKeyboards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    کیبوردی در سیستم ثبت نگردیده است.
                  </td>
                </tr>
              ) : (
                sortedKeyboards.map((k) => {
                  const owner = personnel.find(p => p.code === k.assignedTo);
                  return (
                    <tr 
                      key={k.code} 
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer group whitespace-nowrap"
                      onClick={() => onShowQR(k.code, 'keyboard', k)}
                      title="کلیک روی سطر جهت مشاهده و چاپ برچسب بارکد اموال"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans font-bold flex items-center gap-0.5 shrink-0 select-none">
                            📸 QR
                          </span>
                          <span>{k.code}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{k.model}</td>
                      <td className="p-2.5">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="p-2.5 text-slate-500 max-w-[150px] truncate" title={k.description || undefined}>
                        {k.description || '—'}
                      </td>
                      <td className="p-2.5">
                        {owner ? (
                          <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEdit(k)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(k.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(k.code)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] md:text-xs transition font-semibold cursor-pointer"
                          >
                            🔄 جابجایی
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
