import React, { useState, useMemo } from 'react';
import { Personnel, Case, Monitor, Printer, Mouse, Keyboard } from '../types';

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

interface PersonnelTabProps {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  onEdit: (p: Personnel) => void;
  onDelete: (id: string) => void;
  onShowCertificate: (code: string) => void;
  onSelectTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
}

export default function PersonnelTab({
  personnel,
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  onEdit,
  onDelete,
  onShowCertificate,
  onSelectTransfer,
  onTabChange
}: PersonnelTabProps) {
  const [sortField, setSortField] = useState<'name' | 'code' | 'title' | 'department' | 'location' | 'status' | 'hardware' | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  
  const getAssignedEquipmentCount = (code: string) => {
    const userCases = cases.filter(c => c.assignedTo === code);
    const userMonitors = monitors.filter(m => m.assignedTo === code);
    const userPrinters = printers.filter(p => p.assignedTo === code);
    const userMice = (mice || []).filter(m => m.assignedTo === code);
    const userKeyboards = (keyboards || []).filter(k => k.assignedTo === code);
    return {
      cases: userCases,
      monitors: userMonitors,
      printers: userPrinters,
      mice: userMice,
      keyboards: userKeyboards,
      total: userCases.length + userMonitors.length + userPrinters.length + userMice.length + userKeyboards.length
    };
  };

  const handleSort = (field: 'name' | 'code' | 'title' | 'department' | 'location' | 'status' | 'hardware') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedPersonnel = useMemo(() => {
    if (!sortField) return personnel;
    return [...personnel].sort((a, b) => {
      if (sortField === 'hardware') {
        const assignsA = getAssignedEquipmentCount(a.code).total;
        const assignsB = getAssignedEquipmentCount(b.code).total;
        return sortAsc ? assignsA - assignsB : assignsB - assignsA;
      }
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      return sortAsc 
        ? valA.localeCompare(valB, 'fa') 
        : valB.localeCompare(valA, 'fa');
    });
  }, [personnel, sortField, sortAsc, cases, monitors, printers, mice, keyboards]);

  const renderSortIndicator = (field: 'name' | 'code' | 'title' | 'department' | 'location' | 'status' | 'hardware') => {
    if (sortField !== field) return <span className="text-slate-300 mr-1 select-none text-[10px]">⇅</span>;
    return sortAsc 
      ? <span className="text-blue-600 mr-1 select-none">▲</span> 
      : <span className="text-blue-600 mr-1 select-none">▼</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">فهرست پرسنل و کاربران کارگاه بوشهر</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">مدیریت مشخصات پرسنلی، موقعیت‌های استقرار، حساب‌های کاربری و تجهیزات تحت تصرف</p>
          </div>
        </div>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5 shrink-0 select-none"
        >
          <span>➕</span>
          <span>ثبت پرسنل جدید</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                <th onClick={() => handleSort('name')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">
                  نام و نام خانوادگی {renderSortIndicator('name')}
                </th>
                <th onClick={() => handleSort('code')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition font-mono">
                  کد پرسنلی {renderSortIndicator('code')}
                </th>
                <th onClick={() => handleSort('title')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">
                  سمت سازمانی {renderSortIndicator('title')}
                </th>
                <th onClick={() => handleSort('department')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">
                  واحد خدمتی {renderSortIndicator('department')}
                </th>
                <th onClick={() => handleSort('location')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">
                  موقعیت استقرار {renderSortIndicator('location')}
                </th>
                <th onClick={() => handleSort('status')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">
                  وضعیت همکاری {renderSortIndicator('status')}
                </th>
                <th className="p-3 font-bold text-right select-none">
                  حساب کاربری سیستم
                </th>
                <th onClick={() => handleSort('hardware')} className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 select-none transition">
                  تجهیزات تخصیص‌یافته {renderSortIndicator('hardware')}
                </th>
                <th className="p-3 font-bold text-center select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedPersonnel.length === 0 ? (
                <tr>
                   <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    پرسنلی مطابق فیلتر جاری یافت نشد. جهت ثبت کاربر، روی دکمه «ثبت پرسنل جدید» کلیک فرمایید.
                  </td>
                </tr>
              ) : (
                sortedPersonnel.map((p) => {
                  const assigns = getAssignedEquipmentCount(p.code);
                  return (
                    <tr key={p.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center select-none shrink-0 border border-blue-200/60 dark:border-slate-700">
                            {p.name.charAt(0)}
                          </span>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">{p.code}</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{p.title}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{p.department}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{p.location}</td>
                      <td className="p-3">
                        {p.status === 'terminated' ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200/70 dark:border-rose-900/50 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            خاتمه همکاری
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            شاغل (فعال)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-sans">
                        {p.username || p.password ? (
                          <div className="space-y-0.5 max-w-[150px]">
                            {p.username && (
                              <div className="text-[11px] font-mono" dir="ltr">
                                <span className="text-slate-400 select-none">U: </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{p.username}</span>
                              </div>
                            )}
                            {p.password && (
                              <div className="text-[11px] font-mono" dir="ltr">
                                <span className="text-slate-400 select-none">P: </span>
                                <span className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer select-all font-bold border border-slate-200/60 dark:border-slate-700" title="کلیک جهت انتخاب">{p.password}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-normal">
                         <div className="flex flex-wrap gap-1.5 max-w-[340px]">
                          {assigns.cases.map(c => (
                            <div 
                              key={c.code} 
                              className="flex flex-col gap-1 p-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-right text-[10px]"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span 
                                  className="font-mono font-bold text-blue-700 dark:text-blue-300"
                                  title={`${c.motherboard} | CPU: ${c.cpu}`}
                                >
                                  🖥️ {c.code}
                                </span>
                                {c.hostName && <span className="text-slate-500 dark:text-slate-400 font-medium" title="Host Name">{c.hostName}</span>}
                              </div>
                              {c.ipAddress && <div className="text-blue-600 dark:text-blue-400 font-mono text-[10px] tabular-nums" dir="ltr">{c.ipAddress}</div>}
                              
                              {(c.ipAddress || c.hostName) && (
                                <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => downloadRdpFile(c.ipAddress || '', c.hostName || '')}
                                    title="دانلود فایل RDP برای اتصال ریموت"
                                    type="button"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded text-[9px] font-medium transition cursor-pointer"
                                  >
                                    📥 RDP
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`mstsc /v:${c.ipAddress || c.hostName}`);
                                      alert('دستور ریموت کپی شد:\n' + `mstsc /v:${c.ipAddress || c.hostName}`);
                                    }}
                                    title="کپی دستور ریموت (mstsc)"
                                    type="button"
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[9px] transition cursor-pointer font-mono"
                                  >
                                    📋 دستور
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          {assigns.monitors.map(m => (
                            <span 
                              key={m.code} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                              title={m.model}
                            >
                              📺 {m.code}
                            </span>
                          ))}
                          {assigns.printers.map(pr => (
                            <span 
                              key={pr.code} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                              title={pr.model}
                            >
                              🖨️ {pr.code}
                            </span>
                          ))}
                          {assigns.mice.map(m => (
                            <span 
                              key={m.code} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                              title={m.model}
                            >
                              🖱️ {m.code}
                            </span>
                          ))}
                          {assigns.keyboards.map(k => (
                            <span 
                              key={k.code} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                              title={k.model}
                            >
                              ⌨️ {k.code}
                            </span>
                          ))}
                          {assigns.total === 0 && (
                            <span className="text-slate-400 text-[11px]">
                              بدون سخت‌افزار
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(p)}
                            type="button"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
                            title="ویرایش مشخصات پرسنل"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onShowCertificate(p.code)}
                            type="button"
                            className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-indigo-200/80 dark:border-indigo-800/80 transition cursor-pointer"
                            title="صدور شناسنامه اموال پرسنل"
                          >
                            📜 شناسنامه
                          </button>
                          <button 
                            onClick={() => onSelectTransfer(p.code)}
                            type="button"
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer"
                            title="جابجایی و تحویل تجهیزات"
                          >
                            🔄 انتقال
                          </button>
                          <button 
                            onClick={() => onDelete(p.id || p.code)}
                            type="button"
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg text-[11px] font-bold border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer"
                            title="حذف پرونده پرسنلی"
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
