import React from 'react';
import { Case, Monitor, Printer, Personnel } from '../types';

interface CasesSubTabProps {
  cases: Case[];
  personnel: Personnel[];
  onEdit: (c: Case) => void;
  onDelete: (code: string) => void;
  onTransfer: (code: string) => void;
  onTabChange: (tabId: string) => void;
}

export function CasesSubTab({
  cases,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange
}: CasesSubTabProps) {
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
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-3.5 font-bold">کد کیس (شماره اموال)</th>
                <th className="p-3.5 font-bold">مادربورد</th>
                <th className="p-3.5 font-bold">پردازنده (CPU)</th>
                <th className="p-3.5 font-bold">رم (RAM)</th>
                <th className="p-3.5 font-bold">کارت گرافیک</th>
                <th className="p-3.5 font-bold">فضای هارد (HDD/SSD)</th>
                <th className="p-3.5 font-bold">تحویل به</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    کیسی در سامانه ثبت نگردیده است. نسبت به افزودن از تب ثبت جدید اقدام فرمایید.
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const owner = personnel.find(p => p.code === c.assignedTo);
                  return (
                    <tr key={c.code} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="p-3.5 text-slate-600">{c.motherboard}</td>
                      <td className="p-3.5 text-slate-600">{c.cpu}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-mono">
                          {c.ramType} - {c.ramQty}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{c.vga}</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">{c.hdd1} | {c.hdd2}</td>
                      <td className="p-3.5">
                        {owner ? (
                          <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => onEdit(c)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(c.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(c.code)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-xs transition font-semibold cursor-pointer"
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
}

export function MonitorsSubTab({
  monitors,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange
}: MonitorsSubTabProps) {
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
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-3.5 font-bold">کد مانیتور (اموال)</th>
                <th className="p-3.5 font-bold">نام مدل و مشخصات فنی</th>
                <th className="p-3.5 font-bold">کاربر تحویل گیرنده</th>
                <th className="p-3.5 text-center font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {monitors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    مانیتوری در سامانه ثبت نگردیده است.
                  </td>
                </tr>
              ) : (
                monitors.map((m) => {
                  const owner = personnel.find(p => p.code === m.assignedTo);
                  return (
                    <tr key={m.code} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{m.code}</td>
                      <td className="p-3.5 text-slate-600">{m.model}</td>
                      <td className="p-3.5">
                        {owner ? (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => onEdit(m)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(m.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(m.code)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-xs transition font-semibold cursor-pointer"
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
}

export function PrintersSubTab({
  printers,
  personnel,
  onEdit,
  onDelete,
  onTransfer,
  onTabChange
}: PrintersSubTabProps) {
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
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-3.5 font-bold">کد پرینتر (اموال)</th>
                <th className="p-3.5 font-bold">مدل و سازنده</th>
                <th className="p-3.5 font-bold">تحویل به کاربر کارگاه</th>
                <th className="p-3.5 text-center font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {printers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    پرینتری در سیستم ثبت نگردیده است.
                  </td>
                </tr>
              ) : (
                printers.map((pr) => {
                  const owner = personnel.find(p => p.code === pr.assignedTo);
                  return (
                    <tr key={pr.code} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{pr.code}</td>
                      <td className="p-3.5 text-slate-600">{pr.model}</td>
                      <td className="p-3.5">
                        {owner ? (
                          <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            👥 {owner.name} ({owner.code})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs">
                            📦 مستقر در انبار کارگاه
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => onEdit(pr)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            onClick={() => onDelete(pr.code)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded text-xs transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                          <button 
                            onClick={() => onTransfer(pr.code)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-xs transition font-semibold cursor-pointer"
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
