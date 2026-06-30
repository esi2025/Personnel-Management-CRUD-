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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">👥 لیست پرسنل و کاربران کارگاه</h3>
        <button 
          onClick={() => onTabChange('add-new-tab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          ➕ ثبت پرسنل جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th onClick={() => handleSort('name')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  نام کامل {renderSortIndicator('name')}
                </th>
                <th onClick={() => handleSort('code')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  کد پرسنلی {renderSortIndicator('code')}
                </th>
                <th onClick={() => handleSort('title')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  سمت سازمانی {renderSortIndicator('title')}
                </th>
                <th onClick={() => handleSort('department')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  واحد خدمتی {renderSortIndicator('department')}
                </th>
                <th onClick={() => handleSort('location')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  موقعیت استقرار {renderSortIndicator('location')}
                </th>
                <th onClick={() => handleSort('status')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  وضعیت فعالیت {renderSortIndicator('status')}
                </th>
                <th className="p-2.5 font-bold text-right select-none">
                  حساب کاربری سیستم
                </th>
                <th onClick={() => handleSort('hardware')} className="p-2.5 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition">
                  سخت‌افزارهای تحویل‌شده {renderSortIndicator('hardware')}
                </th>
                <th className="p-2.5 font-bold text-center select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody>
              {sortedPersonnel.length === 0 ? (
                <tr>
                   <td colSpan={9} className="p-6 text-center text-slate-400">
                    هیچ کاربری در سامانه یافت نشد. جهت افزودن پرسنل، روی ثبت جدید کلیک کنید.
                  </td>
                </tr>
              ) : (
                sortedPersonnel.map((p) => {
                  const assigns = getAssignedEquipmentCount(p.code);
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition whitespace-nowrap">
                      <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-2.5 font-mono text-slate-500">{p.code}</td>
                      <td className="p-2.5 text-slate-600">{p.title}</td>
                      <td className="p-2.5 text-slate-600">{p.department}</td>
                      <td className="p-2.5 text-slate-600">{p.location}</td>
                      <td className="p-2.5">
                        {p.status === 'terminated' ? (
                          <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            🔴 خاتمه همکاری
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            🟢 شاغل (فعال)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-sans">
                        {p.username || p.password ? (
                          <div className="space-y-0.5 max-w-[150px]">
                            {p.username && (
                              <div className="text-[11px] font-mono" dir="ltr">
                                <span className="text-slate-400 select-none">U: </span>
                                <span className="font-bold text-slate-800">{p.username}</span>
                              </div>
                            )}
                            {p.password && (
                              <div className="text-[11px] font-mono" dir="ltr">
                                <span className="text-slate-400 select-none">P: </span>
                                <span className="text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.2 rounded cursor-pointer select-all font-bold" title="کلیک جهت انتخاب">{p.password}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-2.5 whitespace-normal">
                         <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                          {assigns.cases.map(c => (
                            <div 
                              key={c.code} 
                              className="flex flex-col gap-1 p-1 bg-blue-50/50 border border-blue-100 rounded-lg text-right text-[10px]"
                            >
                              <div className="flex items-center gap-1">
                                <span 
                                  className="bg-blue-100 border border-blue-300 text-blue-800 px-1.5 py-0.5 rounded font-bold"
                                  title={`${c.motherboard} | CPU: ${c.cpu}`}
                                >
                                  🖥️ {c.code}
                                </span>
                                {c.hostName && <span className="text-slate-500 font-bold" title="Host Name">{c.hostName}</span>}
                              </div>
                              {c.ipAddress && <div className="text-blue-600 font-mono" dir="ltr">{c.ipAddress}</div>}
                              
                              {(c.ipAddress || c.hostName) && (
                                <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => downloadRdpFile(c.ipAddress || '', c.hostName || '')}
                                    title="دانلود فایل RDP برای اتصال ریموت"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-1 py-0.5 rounded text-[9px] font-medium transition cursor-pointer"
                                  >
                                    📥 RDP
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`mstsc /v:${c.ipAddress || c.hostName}`);
                                      alert('دستور ریموت کپی شد:\n' + `mstsc /v:${c.ipAddress || c.hostName}`);
                                    }}
                                    title="کپی دستور ریموت (mstsc)"
                                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-1 py-0.5 rounded text-[9px] transition cursor-pointer font-mono"
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
                              className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                              title={m.model}
                            >
                              📺 {m.code}
                            </span>
                          ))}
                          {assigns.printers.map(pr => (
                            <span 
                              key={pr.code} 
                              className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                              title={pr.model}
                            >
                              🖨️ {pr.code}
                            </span>
                          ))}
                          {assigns.mice.map(m => (
                            <span 
                              key={m.code} 
                              className="bg-pink-50 border border-pink-200 text-pink-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                              title={m.model}
                            >
                              🖱️ {m.code}
                            </span>
                          ))}
                          {assigns.keyboards.map(k => (
                            <span 
                              key={k.code} 
                              className="bg-purple-50 border border-purple-200 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                              title={k.model}
                            >
                              ⌨️ {k.code}
                            </span>
                          ))}
                          {assigns.total === 0 && (
                            <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                              بدون سخت‌افزار
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEdit(p)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(p.id!)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onShowCertificate(p.code)}
                            className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] md:text-xs transition font-semibold cursor-pointer"
                          >
                            📜 شناسنامه
                          </button>
                          <button 
                            onClick={() => onSelectTransfer(p.code)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 rounded text-[10px] md:text-xs transition cursor-pointer"
                          >
                            🔄 انتقال
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
