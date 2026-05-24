import React from 'react';
import { Personnel, Case, Monitor, Printer, Mouse, Keyboard } from '../types';

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
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-3.5 font-bold">نام کامل</th>
                <th className="p-3.5 font-bold">کد پرسنلی</th>
                <th className="p-3.5 font-bold">سمت سازمانی</th>
                <th className="p-3.5 font-bold">واحد خدمتی</th>
                <th className="p-3.5 font-bold">موقعیت استقرار</th>
                <th className="p-3.5 font-bold">سخت‌افزارهای تحویل‌شده</th>
                <th className="p-3.5 font-bold text-center">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody>
              {personnel.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    هیچ کاربری در سامانه یافت نشد. جهت افزودن پرسنل، روی ثبت جدید کلیک کنید.
                  </td>
                </tr>
              ) : (
                personnel.map((p) => {
                  const assigns = getAssignedEquipmentCount(p.code);
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3.5 font-mono text-slate-500">{p.code}</td>
                      <td className="p-3.5 text-slate-600">{p.title}</td>
                      <td className="p-3.5 text-slate-600">{p.department}</td>
                      <td className="p-3.5 text-slate-600">{p.location}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {assigns.cases.map(c => (
                            <span 
                              key={c.code} 
                              className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium"
                              title={`${c.motherboard} | CPU: ${c.cpu}`}
                            >
                              🖥️ کیس: {c.code}
                            </span>
                          ))}
                          {assigns.monitors.map(m => (
                            <span 
                              key={m.code} 
                              className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-medium"
                              title={m.model}
                            >
                              📺 مانیتور: {m.code}
                            </span>
                          ))}
                          {assigns.printers.map(pr => (
                            <span 
                              key={pr.code} 
                              className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded text-[11px] font-medium"
                              title={pr.model}
                            >
                              🖨️ پرینتر: {pr.code}
                            </span>
                          ))}
                          {assigns.mice.map(m => (
                            <span 
                              key={m.code} 
                              className="bg-pink-50 border border-pink-200 text-pink-700 px-2 py-0.5 rounded text-[11px] font-medium"
                              title={m.model}
                            >
                              🖱️ ماوس: {m.code}
                            </span>
                          ))}
                          {assigns.keyboards.map(k => (
                            <span 
                              key={k.code} 
                              className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded text-[11px] font-medium"
                              title={k.model}
                            >
                              ⌨️ کیبورد: {k.code}
                            </span>
                          ))}
                          {assigns.total === 0 && (
                            <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[11px]">
                              بدون سخت‌افزار
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => onEdit(p)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(p.id!)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onShowCertificate(p.code)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-xs transition font-semibold cursor-pointer"
                          >
                            📜 شناسنامه
                          </button>
                          <button 
                            onClick={() => onSelectTransfer(p.code)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded text-xs transition cursor-pointer"
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
