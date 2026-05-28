import React, { useState, useEffect } from 'react';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard } from '../types';
import Logo from './Logo';
import EquipmentPieChart from './EquipmentPieChart';

interface ReportingTabProps {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  assignments: Assignment[];
  prefilledPersonnelCode?: string;
}

export default function ReportingTab({
  personnel,
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  assignments,
  prefilledPersonnelCode
}: ReportingTabProps) {
  // Checkbox states
  const [secPers, setSecPers] = useState(true);
  const [secCases, setSecCases] = useState(true);
  const [secMons, setSecMons] = useState(true);
  const [secPris, setSecPris] = useState(true);
  const [secHis, setSecHis] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterPers, setFilterPers] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [onlyNeedsRepair, setOnlyNeedsRepair] = useState(false);

  // Special System Certificate profile state
  const [certCode, setCertCode] = useState('');

  // Filtering calculations based on user filters & Needs Repair flag
  const filteredCases = cases.filter(c => {
    if (onlyNeedsRepair && c.status !== 'repair') return false;
    if (filterEquip.trim() && !c.code.toLowerCase().includes(filterEquip.toLowerCase().trim())) return false;
    if (filterPers.trim() && c.assignedTo) {
      const owner = personnel.find(p => p.code === c.assignedTo);
      const query = filterPers.toLowerCase().trim();
      if (owner && !owner.name.toLowerCase().includes(query) && !owner.code.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const filteredMonitors = monitors.filter(m => {
    if (onlyNeedsRepair && m.status !== 'repair') return false;
    if (filterEquip.trim() && !m.code.toLowerCase().includes(filterEquip.toLowerCase().trim())) return false;
    if (filterPers.trim() && m.assignedTo) {
      const owner = personnel.find(p => p.code === m.assignedTo);
      const query = filterPers.toLowerCase().trim();
      if (owner && !owner.name.toLowerCase().includes(query) && !owner.code.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const filteredPrinters = printers.filter(p => {
    if (onlyNeedsRepair && p.status !== 'repair') return false;
    if (filterEquip.trim() && !p.code.toLowerCase().includes(filterEquip.toLowerCase().trim())) return false;
    if (filterPers.trim() && p.assignedTo) {
      const owner = personnel.find(prs => prs.code === p.assignedTo);
      const query = filterPers.toLowerCase().trim();
      if (owner && !owner.name.toLowerCase().includes(query) && !owner.code.toLowerCase().includes(query)) return false;
    }
    return true;
  });
  const [reportType, setReportType] = useState<'none' | 'general' | 'certificate'>('none');
  const [certificatePers, setCertificatePers] = useState<Personnel | null>(null);

  // Auto-fill and generate report when a prefilled personnel code is passed
  useEffect(() => {
    if (prefilledPersonnelCode) {
      setCertCode(prefilledPersonnelCode);
      const found = personnel.find(p => p.code === prefilledPersonnelCode);
      if (found) {
        setCertificatePers(found);
        setReportType('certificate');
      }
    }
  }, [prefilledPersonnelCode, personnel]);

  const triggerGeneralReport = () => {
    setReportType('general');
  };

  const triggerCertificateReport = () => {
    const code = certCode.trim();
    if (!code) {
      alert('لطفاً جهت صدور شناسنامه، ابتدا کد پرسنلی را وارد کنید.');
      return;
    }
    const found = personnel.find(p => p.code === code);
    if (!found) {
      alert('پرسنلی با این کد پرسنلی در سیستم یافت نشد.');
      return;
    }
    setCertificatePers(found);
    setReportType('certificate');
  };

  // Get current assignment equipment items for user code
  const getAssignedEquipments = (userCode: string) => {
    const userCases = cases.filter(c => c.assignedTo === userCode);
    const userMonitors = monitors.filter(m => m.assignedTo === userCode);
    const userPrinters = printers.filter(p => p.assignedTo === userCode);
    const userMice = (mice || []).filter(m => m.assignedTo === userCode);
    const userKeyboards = (keyboards || []).filter(k => k.assignedTo === userCode);
    return {
      cases: userCases,
      monitors: userMonitors,
      printers: userPrinters,
      mice: userMice,
      keyboards: userKeyboards,
      totalCount: userCases.length + userMonitors.length + userPrinters.length + userMice.length + userKeyboards.length
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left controls bar */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        
        {/* Controls Block A: General Reports */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">📊 کنترل پنل گزارش‌های اداری</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">بخش‌ها و فیلترهای مدنظر را برای خروجی چاپی تنظیم فرمایید</p>
          </div>

          {/* Section selections */}
          <div className="space-y-2 border-b border-dashed border-slate-100 pb-3">
            <label className="text-xs font-bold text-slate-700 block">انتخاب جداول و رده‌های گزارش:</label>
            <div className="space-y-1.5 text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secPers} onChange={(e) => setSecPers(e.target.checked)} />
                لیست پرسنل فعال
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secCases} onChange={(e) => setSecCases(e.target.checked)} />
                لیست مشخصات مانیفست کیس‌ها
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secMons} onChange={(e) => setSecMons(e.target.checked)} />
                لیست مانیتورهای کارگاه
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secPris} onChange={(e) => setSecPris(e.target.checked)} />
                لیست پرینترها و دستگاه‌های چاپ
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secHis} onChange={(e) => setSecHis(e.target.checked)} />
                سوابق کامل فلو و ترانسفر کالا
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">فیلتر پرسنل (نام یا کد):</label>
              <input 
                type="text" 
                value={filterPers} 
                onChange={(e) => setFilterPers(e.target.value)} 
                placeholder="بر اساس کادر خاص..." 
                className="w-full text-right p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">فیلتر کد اموال سخت‌افزار:</label>
              <input 
                type="text" 
                value={filterEquip} 
                onChange={(e) => setFilterEquip(e.target.value)} 
                placeholder="بر اساس کد اموال کالا..." 
                className="w-full text-right p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">دامنه تاریخ تحویل (از تـا):</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input 
                  type="text" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  placeholder="از (مثال: ۱۴۰۵/۰۱/۰۱)" 
                  className="w-full text-right p-2 border border-slate-200 rounded text-[11px] focus:outline-none"
                />
                <input 
                  type="text" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  placeholder="تا (مثال: ۱۴۰۵/۰۳/۰۱)" 
                  className="w-full text-right p-2 border border-slate-200 rounded text-[11px] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-1.5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 bg-amber-50/50 hover:bg-amber-50 p-2 rounded border border-amber-200 shadow-xs transition select-none">
                <input 
                  type="checkbox" 
                  checked={onlyNeedsRepair} 
                  onChange={(e) => setOnlyNeedsRepair(e.target.checked)} 
                  className="accent-amber-600 scale-105 cursor-pointer"
                />
                <span className="text-amber-800 text-xs font-bold">🛠️ فقط تجهیزات نیازمند تعمیر (Needs Repair)</span>
              </label>
            </div>
          </div>

          <button
            onClick={triggerGeneralReport}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg text-xs md:text-sm font-bold transition shadow-sm cursor-pointer"
          >
            📊 نمایش گزارش ترکیبی
          </button>
        </div>

        {/* Controls Block B: Official Certificate Identity Profiles */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-indigo-950">📋 صدور سند شناسنامه رسمی قطعات (سه برگی)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">تولید خودکار سند امضای سخت‌افزارهای یک پرسنل جهت تحویل کالا</p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 block">کد پرسنلی تحویل گیرنده:</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={certCode}
                onChange={(e) => setCertCode(e.target.value)}
                placeholder="وارد کردن کد پرسنلی برای استعلام..."
                className="flex-1 text-right p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={triggerCertificateReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded text-xs font-bold transition cursor-pointer"
              >
                📜 صدور شناسنامه
              </button>
            </div>
          </div>
        </div>

        {/* Controls Block C: Interactive Stats */}
        <EquipmentPieChart 
          casesCount={cases.length} 
          monitorsCount={monitors.length} 
          printersCount={printers.length} 
        />

      </div>

      {/* Right report view area (printable format) */}
      <div className="lg:col-span-2 print:col-span-3 bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col h-[700px] overflow-hidden print:h-auto print:overflow-visible print:bg-white print:border-none print:p-0">
        
        <div className="no-print flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
          <h4 className="text-slate-800 font-bold text-xs md:text-sm">📋 پیش‌نمایش زنده و چاپ مستقیم سند</h4>
          <button
            onClick={() => window.print()}
            disabled={reportType === 'none'}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition cursor-pointer ${
              reportType !== 'none' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            🖨️ چاپ مستقیم گزارش / ذخیره PDF مکتوب
          </button>
        </div>

        {/* Informational guide banner regarding browser iframe permissions for printing */}
        <div className="no-print bg-amber-50 border border-amber-200 text-amber-800 text-[11px] md:text-xs rounded-lg p-3 text-right leading-relaxed flex gap-2.5 items-start mb-4">
          <span className="text-base leading-none">💡</span>
          <div>
            <p className="font-bold mb-0.5">راهنمای چاپ مستقیم در سند:</p>
            <p className="text-slate-600">
              چنانچه با کلیک بر روی دکمه فوق واکنشی از چاپگر سیستم مشاهده نمی‌کنید، به دلیل محدودیت‌های امنیتی پیش‌نمایش در محیط ویرایشگر (Iframe) است. لطفاً دکمه آبی‌رنگ <strong className="text-blue-800">«Open in new tab»</strong> را در منوی بالایی صفحه فشار داده تا سیستم در تب مستقل مرورگر شما اجرا شود و دکمه چاپگر فوری فعال گردد.
            </p>
          </div>
        </div>

        <div className="printable-document bg-white rounded-lg flex-1 overflow-y-auto p-8 shadow-inner text-right leading-relaxed text-sm print:overflow-visible print:h-auto print:p-0 print:shadow-none">
          {reportType === 'none' && (
            <p className="text-slate-400 text-center py-20">
              گزارشی تولید نشده است. فیلترها را تنظیم کرده یا روی یکی از دکمه‌های گزارش‌گیری کلیک کنید.
            </p>
          )}

          {/* Render 1: Combined General Report */}
          {reportType === 'general' && (
            <div className="space-y-6 text-slate-900 leading-relaxed font-sans">
              <div className="text-center border-b-2 border-black pb-4 mb-4">
                <h2 className="text-xl font-bold">گزارش ترکیبی تجهیزات کل واحد فناوری اطلاعات و ارتباطات</h2>
                <h3 className="text-sm text-slate-600 mt-1">شرکت عمران آذرستان - کارگاه بوشهر (آفلاین)</h3>
                <p className="text-[11px] text-slate-500 mt-2 pb-2">تاریخ گزارش: ۱۴۰۵/۰۳/۰۳ | فیلتر اعمال شده: بر اساس درخواست کاربر</p>
                
                {/* Print & Screen Distribution stats */}
                <div className="grid grid-cols-3 gap-3 text-right mt-3 text-xs font-sans">
                  <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
                    <div className="text-slate-500 font-medium mb-1 text-[11px]">کیس‌های کارگاهی / اداری</div>
                    <div className="font-bold text-[#84141A] text-xs">
                      {filteredCases.length} عدد ({filteredCases.length + filteredMonitors.length + filteredPrinters.length > 0 ? Math.round((filteredCases.length / (filteredCases.length + filteredMonitors.length + filteredPrinters.length)) * 100) : 0}٪)
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
                    <div className="text-slate-500 font-medium mb-1 text-[11px]">دستگاه‌های مانیتور</div>
                    <div className="font-bold text-blue-600 text-xs">
                      {filteredMonitors.length} عدد ({filteredCases.length + filteredMonitors.length + filteredPrinters.length > 0 ? Math.round((filteredMonitors.length / (filteredCases.length + filteredMonitors.length + filteredPrinters.length)) * 100) : 0}٪)
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
                    <div className="text-slate-500 font-medium mb-1 text-[11px]">پرینتر و ملزومات چاپ</div>
                    <div className="font-bold text-emerald-600 text-xs">
                      {filteredPrinters.length} عدد ({filteredCases.length + filteredMonitors.length + filteredPrinters.length > 0 ? Math.round((filteredPrinters.length / (filteredCases.length + filteredMonitors.length + filteredPrinters.length)) * 100) : 0}٪)
                    </div>
                  </div>
                </div>
              </div>

              {/* Personnel Block */}
              {secPers && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 py-1 bg-slate-100 px-2 rounded">👥 گزارش کاربران و پرسنل</h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-300">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 p-2 font-bold">نام کامل</th>
                        <th className="border border-slate-300 p-2 font-bold">کد پرسنلی</th>
                        <th className="border border-slate-300 p-2 font-bold">سمت</th>
                        <th className="border border-slate-300 p-2 font-bold">بخش</th>
                        <th className="border border-slate-300 p-2 font-bold">موقعیت استقرار</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personnel.map(p => (
                        <tr key={p.id}>
                          <td className="border border-slate-300 p-2 font-bold">{p.name}</td>
                          <td className="border border-slate-300 p-2 font-mono">{p.code}</td>
                          <td className="border border-slate-300 p-2">{p.title}</td>
                          <td className="border border-slate-300 p-2">{p.department}</td>
                          <td className="border border-slate-300 p-2">{p.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Case Block */}
              {secCases && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 py-1 bg-slate-100 px-2 rounded flex justify-between items-center">
                    <span>🖥️ گزارش فنی کیس‌ها</span>
                    {onlyNeedsRepair && <span className="text-[10px] bg-amber-550 text-white px-2 py-0.5 rounded font-bold">فیلتر شده: نیاز به تعمیر</span>}
                  </h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-300">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 p-2 font-bold">کد کیس</th>
                        <th className="border border-slate-300 p-2 font-bold">مادربورد</th>
                        <th className="border border-slate-300 p-2 font-bold">پردازنده</th>
                        <th className="border border-slate-300 p-2 font-bold">نوع رم</th>
                        <th className="border border-slate-300 p-2 font-bold">گرافیک</th>
                        <th className="border border-slate-300 p-2 font-bold">ذخیره سازی</th>
                        <th className="border border-slate-300 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 p-2 font-bold">کاربر تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="border border-slate-300 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredCases.map(c => (
                          <tr key={c.code}>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">{c.code}</td>
                            <td className="border border-slate-300 p-2">{c.motherboard}</td>
                            <td className="border border-slate-300 p-2">{c.cpu}</td>
                            <td className="border border-slate-300 p-2 font-mono">{c.ramType} / {c.ramQty}</td>
                            <td className="border border-slate-300 p-2">{c.vga}</td>
                            <td className="border border-slate-300 p-2">{c.hdd1} | {c.hdd2}</td>
                            <td className="border border-slate-300 p-2">
                              {c.status === 'repair' ? '⚠️ نیاز به تعمیر' : c.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم'}
                            </td>
                            <td className="border border-slate-300 p-2 font-semibold">
                              {c.assignedTo ? `${personnel.find(p=>p.code===c.assignedTo)?.name || 'کد نامعتبر'}(${c.assignedTo})` : '📦 داخل انبار'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Monitors Block */}
              {secMons && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 py-1 bg-slate-100 px-2 rounded flex justify-between items-center">
                    <span>📺 گزارش مانیتورها</span>
                    {onlyNeedsRepair && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold">فیلتر شده: نیاز به تعمیر</span>}
                  </h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-300 font-sans">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 p-2 font-bold">کد مانیتور</th>
                        <th className="border border-slate-300 p-2 font-bold">مدل و مشخصات فنی</th>
                        <th className="border border-slate-300 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 p-2 font-bold">تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonitors.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="border border-slate-300 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredMonitors.map(m => (
                          <tr key={m.code}>
                            <td className="border border-slate-300 p-2 font-mono font-bold">{m.code}</td>
                            <td className="border border-slate-300 p-2">{m.model}</td>
                            <td className="border border-slate-300 p-2">
                              {m.status === 'repair' ? '⚠️ نیاز به تعمیر' : m.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم'}
                            </td>
                            <td className="border border-slate-300 p-2 font-semibold">
                              {m.assignedTo ? `${personnel.find(p=>p.code===m.assignedTo)?.name || 'کد نامعتبر'}(${m.assignedTo})` : '📦 انبار کارگاه'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Printers Block */}
              {secPris && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 py-1 bg-slate-100 px-2 rounded flex justify-between items-center">
                    <span>🖨️ گزارش پرینترها</span>
                    {onlyNeedsRepair && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold">فیلتر شده: نیاز به تعمیر</span>}
                  </h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-300 font-sans">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 p-2 font-bold">کد پرینتر</th>
                        <th className="border border-slate-300 p-2 font-bold">مدل کالا</th>
                        <th className="border border-slate-300 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 p-2 font-bold">تحویل گیرنده جدید</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrinters.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="border border-slate-300 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredPrinters.map(pr => (
                          <tr key={pr.code}>
                            <td className="border border-slate-300 p-2 font-mono font-bold">{pr.code}</td>
                            <td className="border border-slate-300 p-2">{pr.model}</td>
                            <td className="border border-slate-300 p-2">
                              {pr.status === 'repair' ? '⚠️ نیاز به تعمیر' : pr.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم'}
                            </td>
                            <td className="border border-slate-300 p-2 font-semibold">
                              {pr.assignedTo ? `${personnel.find(p=>p.code===pr.assignedTo)?.name || 'کد نامعتبر'}(${pr.assignedTo})` : '📦 انبار'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History Block */}
              {secHis && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 py-1 bg-slate-100 px-2 rounded">📜 گزارش کلی ترانسفر کل تاریخچه‌ها</h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-300">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 p-2 font-bold">نوع تجهیز</th>
                        <th className="border border-slate-300 p-2 font-bold">کد اموال</th>
                        <th className="border border-slate-300 p-2 font-bold">تحویل گیرنده</th>
                        <th className="border border-slate-300 p-2 font-bold">تاریخ واگذاری (شروع)</th>
                        <th className="border border-slate-300 p-2 font-bold">تاریخ پایان (استرداد)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(ass => (
                        <tr key={ass.id}>
                          <td className="border border-slate-300 p-2 font-bold">{ass.equipmentType === 'case' ? 'کیس کامپیوتر' : ass.equipmentType === 'monitor' ? 'مانیتور' : 'پرینتر'}</td>
                          <td className="border border-slate-300 p-2 font-mono">{ass.equipmentCode}</td>
                          <td className="border border-slate-300 p-2 font-semibold">{ass.personnelName || 'انبار مرکزی'}</td>
                          <td className="border border-slate-300 p-2">{ass.startDate}</td>
                          <td className="border border-slate-300 p-2">{ass.endDate || 'در دست اقدام (فعلی)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Render 2: Official System Profile Certificate (سه برگی) */}
          {reportType === 'certificate' && certificatePers && (
            <div className="space-y-6 text-black font-sans print:p-0">
              
              {/* Header Certificate corporate titles */}
              <div className="grid grid-cols-3 items-center border-b-2 border-black pb-4">
                {/* Right side: Logo */}
                <div className="flex justify-start">
                  <Logo size="h-12" />
                </div>
                
                {/* Center: Corporate Titles (Centered) */}
                <div className="text-center space-y-1">
                  <h2 className="text-base md:text-lg font-black leading-tight text-black">شرکت عمران آذرستان</h2>
                  <h3 className="text-xs text-slate-800 font-bold">واحد فناوری اطلاعات و ارتباطات (ICT)</h3>
                </div>
                
                {/* Left side: Code & Document metadata */}
                <div className="text-left text-[10px] md:text-xs space-y-1">
                  <div>کد سند: <span dir="ltr" className="font-mono font-bold select-all">37-FO-IT-01-01</span></div>
                  <div>شماره سند: <strong className="font-mono">ICT-CERT-{certificatePers.code}</strong></div>
                  <div>تاریخ صدور سند: <span className="font-mono">۱۴۰۵/۰۳/۰۳</span></div>
                </div>
              </div>

              {/* Title Certificate */}
              <div className="bg-slate-100 text-center font-bold text-sm md:text-base border border-black p-2 mt-2">
                سند اداری شناسنامه هوشمند و تاییدیه تحویل تجهیزات رایانه‌ای پرسنل
              </div>

              {/* BLOCK 1: Profile Users */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs md:text-sm">۱. مشخصات کامل تحویل‌گیرنده کالا:</h4>
                <table className="w-full text-xs text-right border-collapse border border-black text-slate-800">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 bg-slate-50 font-bold w-[18%]">نام و نام خانوادگی:</td>
                      <td className="border border-black p-2 w-[32%] font-extrabold text-black">{certificatePers.name}</td>
                      <td className="border border-black p-2 bg-slate-50 font-bold w-[18%]">کد پرسنلی پرسنل:</td>
                      <td className="border border-black p-2 w-[32%] font-mono font-bold text-black">{certificatePers.code}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 bg-slate-50 font-bold">سمت اداری/واحد:</td>
                      <td className="border border-black p-2">{certificatePers.title}</td>
                      <td className="border border-black p-2 bg-slate-50 font-bold">واحد خدمتی:</td>
                      <td className="border border-black p-2">{certificatePers.department}</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 bg-slate-50 font-bold">نشانی محل استقرار دارد:</td>
                      <td colSpan={3} className="border border-black p-2">{certificatePers.location}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BLOCK 2: Equipments specs listing */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-xs md:text-sm">۲. مشخصات سخت‌افزارهای ثبت شده در آلبوم و تحویل شده به فرد:</h4>
                
                {getAssignedEquipments(certificatePers.code).totalCount === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-500 border border-dashed border-red-200 bg-red-50/20 rounded">
                    در حال حاضر هیچگونه تجهیزات فعالی به نام این شخص واگذار و ثبت نگردیده است.
                  </p>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Cases details list */}
                    {getAssignedEquipments(certificatePers.code).cases.map(c => (
                      <table key={c.code} className="w-full text-xs text-right border-collapse border border-black">
                        <thead>
                          <tr className="bg-slate-200">
                            <th colSpan={4} className="border border-black p-2 text-center font-bold">
                              🔵 کیس کامپیوتر (سخت‌افزار اصلی) - کد اموال: {c.code}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-black p-2 bg-slate-50 font-bold w-[20%]">مادربورد:</td>
                            <td className="border border-black p-2 w-[30%]">{c.motherboard}</td>
                            <td className="border border-black p-2 bg-slate-50 font-bold w-[20%]">پردازنده (CPU):</td>
                            <td className="border border-black p-2 w-[30%]">{c.cpu}</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 bg-slate-50 font-bold">نوع رم:</td>
                            <td className="border border-black p-2 font-mono">{c.ramType} / {c.ramQty}</td>
                            <td className="border border-black p-2 bg-slate-50 font-bold">گرافیک VGA:</td>
                            <td className="border border-black p-2">{c.vga}</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-2 bg-slate-50 font-bold">هارد اصلی SSD/HDD:</td>
                            <td className="border border-black p-2">{c.hdd1}</td>
                            <td className="border border-black p-2 bg-slate-50 font-bold">هارد ثانویه:</td>
                            <td className="border border-black p-2">{c.hdd2}</td>
                          </tr>
                        </tbody>
                      </table>
                    ))}

                    {/* Monitors and Printers spec table */}
                    {(getAssignedEquipments(certificatePers.code).monitors.length > 0 || 
                      getAssignedEquipments(certificatePers.code).printers.length > 0 ||
                      getAssignedEquipments(certificatePers.code).mice.length > 0 ||
                      getAssignedEquipments(certificatePers.code).keyboards.length > 0) && (
                      <table className="w-full text-xs text-right border-collapse border border-black">
                        <thead>
                          <tr className="bg-slate-200">
                            <th className="border border-black p-2 font-bold w-[35%]">دسته سخت‌افزار</th>
                            <th className="border border-black p-2 font-bold w-[25%] font-mono">کد اموال و ردیاب</th>
                            <th className="border border-black p-2 font-bold w-[40%]">سازنده و مدل دقیق کالا تحویل شده</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getAssignedEquipments(certificatePers.code).monitors.map(m => (
                            <tr key={m.code}>
                              <td className="border border-black p-2 font-bold">📺 نمایشگر (مانیتور اداری)</td>
                              <td className="border border-black p-2 font-mono font-bold text-slate-800">{m.code}</td>
                              <td className="border border-black p-2">{m.model}</td>
                            </tr>
                          ))}
                          {getAssignedEquipments(certificatePers.code).printers.map(pr => (
                            <tr key={pr.code}>
                              <td className="border border-black p-2 font-bold">🖨️ پرینتر / چاپگر کارگاهی</td>
                              <td className="border border-black p-2 font-mono font-bold text-slate-800">{pr.code}</td>
                              <td className="border border-black p-2">{pr.model}</td>
                            </tr>
                          ))}
                          {getAssignedEquipments(certificatePers.code).mice.map(m => (
                            <tr key={m.code}>
                              <td className="border border-black p-2 font-bold">🖱️ ماوس (پرونده پرسنلی)</td>
                              <td className="border border-black p-2 font-mono font-bold text-slate-800">{m.code}</td>
                              <td className="border border-black p-2">{m.model}</td>
                            </tr>
                          ))}
                          {getAssignedEquipments(certificatePers.code).keyboards.map(k => (
                            <tr key={k.code}>
                              <td className="border border-black p-2 font-bold">⌨️ کیبورد (پرونده پرسنلی)</td>
                              <td className="border border-black p-2 font-mono font-bold text-slate-800">{k.code}</td>
                              <td className="border border-black p-2">{k.model}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              {/* THREE SIGNATURE BOXES */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="border border-dashed border-black p-3 rounded min-h-[100px] flex flex-col justify-between">
                  <span className="font-bold text-black border-b border-dashed border-slate-300 pb-1">امضا تحویل گیرنده (استفاده‌کننده):</span>
                  <span className="text-[10px] text-slate-500">{certificatePers.name}</span>
                </div>
                <div className="border border-dashed border-black p-3 rounded min-h-[100px] flex flex-col justify-between">
                  <span className="font-bold text-black border-b border-dashed border-slate-300 pb-1">واحد انبار کارگاه بوشهر:</span>
                  <span className="text-[10px] text-slate-500">امضا و تایید صدور فیزیکی</span>
                </div>
                <div className="border border-dashed border-black p-3 rounded min-h-[100px] flex flex-col justify-between">
                  <span className="font-bold text-black border-b border-dashed border-slate-300 pb-1">واحد فناوری اطلاعات (ICT):</span>
                  <span className="text-[10px] text-slate-500">امضا و ثبت در سامانه شناسنامه</span>
                </div>
              </div>

              {/* Legal Footer Info */}
              <div className="pt-6 border-t border-black text-center text-[10px] text-slate-500">
                سامانه هوشمند صدور شناسنامه تجهیزات کارگاهی شرکت عمران آذرستان سال ۱۴۰۵ | واحد فناوری اطلاعات و ارتباطات
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
