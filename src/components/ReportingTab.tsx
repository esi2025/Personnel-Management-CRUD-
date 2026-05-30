import React, { useState, useEffect } from 'react';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard } from '../types';
import Logo from './Logo';
import EquipmentPieChart from './EquipmentPieChart';
import EquipmentStatusBarChart from './EquipmentStatusBarChart';

interface ReportingTabProps {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  assignments: Assignment[];
  prefilledPersonnelCode?: string;
  onSaveItem?: (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog', data: any) => Promise<boolean>;
}

export default function ReportingTab({
  personnel,
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  assignments,
  prefilledPersonnelCode,
  onSaveItem
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

  // Helper to format sequence to 4 digits padded
  const padZero = (num: number, size = 4) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  // Next sequence state
  const [nextDocSeq, setNextDocSeq] = useState<number>(() => {
    const saved = localStorage.getItem('next_document_sequence');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingDocPersonnelId, setEditingDocPersonnelId] = useState<string | null>(null);
  const [editingDocNumVal, setEditingDocNumVal] = useState<string>('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [seqStartInputValue, setSeqStartInputValue] = useState<string>('');

  // Handle self-healing/updating sequence counter from maximum custom number
  useEffect(() => {
    const assignedNums = personnel
      .map(p => p.documentNumber ? parseInt(p.documentNumber.replace(/\D/g, ''), 10) : 0)
      .filter(num => !isNaN(num) && num > 0);
    const maxAssigned = assignedNums.length > 0 ? Math.max(...assignedNums) : 0;
    
    const saved = localStorage.getItem('next_document_sequence');
    const currentStoredSeq = saved ? parseInt(saved, 10) : 1;
    
    const resolvedNext = Math.max(currentStoredSeq, maxAssigned + 1);
    if (resolvedNext !== currentStoredSeq) {
      localStorage.setItem('next_document_sequence', String(resolvedNext));
      setNextDocSeq(resolvedNext);
    }
  }, [personnel]);

  // Find live personnel object in props to ensure documentNumber update displays instantly!
  const liveCertificatePers = certificatePers 
    ? (personnel.find(p => p.code === certificatePers.code) || certificatePers) 
    : null;

  // Auto-allocate next sequence number if user views their certificate and has no document number
  useEffect(() => {
    if (reportType === 'certificate' && liveCertificatePers && !liveCertificatePers.documentNumber && onSaveItem && !isProcessing) {
      const assignedNum = padZero(nextDocSeq);
      const updatedPers = { ...liveCertificatePers, documentNumber: assignedNum, isEdit: true };
      
      setIsProcessing(true);
      onSaveItem('personnel', updatedPers).then(success => {
        if (success) {
          const nextVal = nextDocSeq + 1;
          localStorage.setItem('next_document_sequence', String(nextVal));
          setNextDocSeq(nextVal);
        }
        setIsProcessing(false);
      }).catch(err => {
        console.error(err);
        setIsProcessing(false);
      });
    }
  }, [reportType, liveCertificatePers, nextDocSeq, onSaveItem, isProcessing]);

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

  const handleBatchAllocate = async () => {
    if (!onSaveItem) return;
    const unassigned = personnel.filter(p => !p.documentNumber);
    if (unassigned.length === 0) {
      alert("تمامی پرسنل دارای شماره سند هستند.");
      return;
    }
    if (!confirm(`آیا مایلید به تعداد ${unassigned.length} پرسنل فاقد شماره سند، به صورت خودکار از شماره ${padZero(nextDocSeq)} عدددهی انجام شود؟`)) {
      return;
    }
    
    setIsProcessing(true);
    let currentSeq = nextDocSeq;
    const sorted = [...unassigned].sort((a, b) => a.code.localeCompare(b.code));
    
    try {
      for (const p of sorted) {
        const docNum = padZero(currentSeq);
        await onSaveItem('personnel', { ...p, documentNumber: docNum, isEdit: true });
        currentSeq++;
      }
      localStorage.setItem('next_document_sequence', String(currentSeq));
      setNextDocSeq(currentSeq);
      alert("تخصیص خودکار شماره اسناد با موفقیت پایان یافت.");
    } catch (e) {
      console.error(e);
      alert("خطایی در حین فرآیند رخ داد.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAll = async () => {
    if (!onSaveItem) return;
    if (!confirm("⚠️ هشدار جدی: آیا مطمئن هستید که می‌خواهید شماره سند تمام پرسنل را پاک کنید و توالی را از 0001 مجدداً شروع کنید؟")) {
      return;
    }
    
    setIsProcessing(true);
    try {
      for (const p of personnel) {
        if (p.documentNumber) {
          await onSaveItem('personnel', { ...p, documentNumber: "", isEdit: true });
        }
      }
      localStorage.setItem('next_document_sequence', "1");
      setNextDocSeq(1);
      alert("تمامی شماره سندها پاکسازی شده و توالی به 0001 بازنشانی شد.");
    } catch (e) {
      console.error(e);
      alert("خطایی رخ داد.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveInlineDocNum = async (p: Personnel) => {
    if (!onSaveItem) return;
    setIsProcessing(true);
    try {
      await onSaveItem('personnel', { ...p, documentNumber: editingDocNumVal.trim(), isEdit: true });
      setEditingDocPersonnelId(null);
      setEditingDocNumVal('');
      alert(`شماره سند جدید برای ${p.name} با موفقیت ثبت شد.`);
    } catch (e) {
      console.error(e);
      alert("خطا در ذخیره‌سازی شماره سند رخ داد.");
    } finally {
      setIsProcessing(false);
    }
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

        {/* Controls Block B.2: Document Sequence & Serial Admin Panel */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <button
            onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
            className="w-full flex justify-between items-center bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold transition select-none cursor-pointer text-right"
          >
            <span className="flex items-center gap-1.5">⚙️ مدیریت شماره اسناد (ادمین)</span>
            <span className="font-mono text-xs text-slate-500">{isAdminPanelOpen ? '▼' : '▲'}</span>
          </button>

          {isAdminPanelOpen && (
            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200 text-xs space-y-4">
              
              {/* Part 1: Change next Start index */}
              <div className="space-y-1 bg-white p-2 rounded-md border border-slate-100">
                <label className="font-bold text-slate-700 block text-[11px]">عدد شروع توالی بعدی:</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="1"
                    value={seqStartInputValue}
                    onChange={(e) => setSeqStartInputValue(e.target.value)}
                    placeholder={`فعلی: ${padZero(nextDocSeq)}`}
                    className="w-24 text-center p-1.5 border border-slate-200 bg-white rounded font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(seqStartInputValue, 10);
                      if (!isNaN(val) && val > 0) {
                        localStorage.setItem('next_document_sequence', String(val));
                        setNextDocSeq(val);
                        alert(`توالی مجاز بعدی روی ${padZero(val)} با موفقیت تنظیم شد.`);
                        setSeqStartInputValue('');
                      } else {
                        alert('لطفاً یک عدد معتبر بزرگتر از صفر وارد کنید.');
                      }
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded font-bold transition cursor-pointer text-[11px]"
                  >
                    ثبت شروع بعدی
                  </button>
                </div>
              </div>

              {/* Part 2: Quick ops */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  disabled={isProcessing}
                  onClick={handleBatchAllocate}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 p-2 rounded font-bold transition cursor-pointer text-center flex flex-col justify-center items-center gap-0.5 disabled:opacity-50"
                >
                  <span>🔢 تولید شماره برای بقیه</span>
                  <span className="text-[9px] text-indigo-500 font-normal">(فاقد شماره سند)</span>
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleResetAll}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-2 rounded font-bold transition cursor-pointer text-center flex flex-col justify-center items-center gap-0.5 disabled:opacity-50"
                >
                  <span>⚠️ ریست کامل شماره‌ها</span>
                  <span className="text-[9px] text-red-500 font-normal">(پاکسازی و شروع مجدد)</span>
                </button>
              </div>

              {/* Part 3: Compact scrollable personnel editor */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px]">جدول تعیین مستقیم شماره سند:</span>
                <div className="border border-slate-250 bg-white rounded-lg max-h-[160px] overflow-y-auto divide-y divide-slate-100 text-[11px] shadow-inner">
                  {personnel.map(p => {
                    const mappedPers = personnel.find(prs => prs.code === p.code) || p;
                    return (
                      <div key={p.id} className="p-2 flex justify-between items-center gap-1 hover:bg-slate-50/50">
                        <div className="truncate flex-1">
                          <strong className="text-slate-900 block truncate">{mappedPers.name}</strong>
                          <span className="text-slate-400 font-mono text-[9px]">کد پرسنلی: {mappedPers.code}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {editingDocPersonnelId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingDocNumVal}
                                onChange={(e) => setEditingDocNumVal(e.target.value)}
                                placeholder="مثال: 0001"
                                className="w-16 p-1 border border-indigo-500 rounded text-center font-mono text-[10px]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveInlineDocNum(mappedPers)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded p-1 w-6 h-6 flex items-center justify-center font-bold cursor-pointer transition text-xs"
                                title="ذخیره"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDocPersonnelId(null);
                                  setEditingDocNumVal('');
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded p-1 w-6 h-6 flex items-center justify-center font-bold cursor-pointer transition text-xs"
                                title="انصراف"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">
                              <span className="font-mono font-bold text-indigo-700 text-[10px]" dir="ltr">
                                {mappedPers.documentNumber ? `CERT-${mappedPers.documentNumber}` : 'ثبت نشده 🛑'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingDocPersonnelId(p.id || null);
                                  setEditingDocNumVal(mappedPers.documentNumber || '');
                                }}
                                className="text-slate-400 hover:text-indigo-600 font-medium p-0.5 rounded cursor-pointer transition text-[10px]"
                                title="ویرایش مستقیم"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {personnel.length === 0 && (
                    <div className="p-3 text-center text-slate-400 text-[10px]">هیچ پرسنلی ثبت نشده است.</div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Controls Block C: Interactive Stats */}
        <EquipmentPieChart 
          casesCount={cases.length} 
          monitorsCount={monitors.length} 
          printersCount={printers.length} 
        />

        {/* Controls Block D: Interactive Status Distribution */}
        <EquipmentStatusBarChart 
          cases={cases}
          monitors={monitors}
          printers={printers}
          mice={mice}
          keyboards={keyboards}
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
              <div className="text-center border-b-2 border-black pb-4 mb-4 space-y-1">
                <h2 className="text-xl font-black text-black">شرکت عمران آذرستان</h2>
                <h3 className="text-sm text-slate-800 font-bold">واحد فناوری اطلاعات و ارتباطات (ICT)</h3>
                <h4 className="text-xs text-slate-600 font-medium">گزارش ترکیبی تجهیزات کل سامانه</h4>
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
                        <th className="border border-slate-300 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 p-2 font-bold">نام کامل</th>
                        <th className="border border-slate-300 p-2 font-bold">کد پرسنلی</th>
                        <th className="border border-slate-300 p-2 font-bold">سمت</th>
                        <th className="border border-slate-300 p-2 font-bold">بخش</th>
                        <th className="border border-slate-300 p-2 font-bold">موقعیت استقرار</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personnel.map((p, idx) => (
                        <tr key={p.id}>
                          <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
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
                        <th className="border border-slate-300 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 p-2 font-bold">کد کیس</th>
                        <th className="border border-slate-300 p-2 font-bold">مادربورد</th>
                        <th className="border border-slate-300 p-2 font-bold">پردازنده</th>
                        <th className="border border-slate-300 p-2 font-bold">نوع رم</th>
                        <th className="border border-slate-300 p-2 font-bold">گرافیک</th>
                        <th className="border border-slate-300 p-2 font-bold">ذخیره سازی</th>
                        <th className="border border-slate-300 p-2 font-bold">پاور (PSU)</th>
                        <th className="border border-slate-300 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 p-2 font-bold">کاربر تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="border border-slate-300 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredCases.map((c, idx) => (
                          <tr key={c.code}>
                            <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">{c.code}</td>
                            <td className="border border-slate-300 p-2">{c.motherboard}</td>
                            <td className="border border-slate-300 p-2">{c.cpu}</td>
                            <td className="border border-slate-300 p-2 font-mono">{c.ramType} / {c.ramQty}</td>
                            <td className="border border-slate-300 p-2">{c.vga}</td>
                            <td className="border border-slate-300 p-2">{c.hdd1} | {c.hdd2}</td>
                            <td className="border border-slate-300 p-2">{c.power || "—"}</td>
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
                        <th className="border border-slate-300 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 p-2 font-bold">کد مانیتور</th>
                        <th className="border border-slate-300 p-2 font-bold">مدل و مشخصات فنی</th>
                        <th className="border border-slate-300 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 p-2 font-bold">تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonitors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="border border-slate-300 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredMonitors.map((m, idx) => (
                          <tr key={m.code}>
                            <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
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
                        <th className="border border-slate-300 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 p-2 font-bold">کد پرینتر</th>
                        <th className="border border-slate-300 p-2 font-bold">مدل کالا</th>
                        <th className="border border-slate-300 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 p-2 font-bold">تحویل گیرنده جدید</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrinters.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="border border-slate-300 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredPrinters.map((pr, idx) => (
                          <tr key={pr.code}>
                            <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
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
                        <th className="border border-slate-300 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 p-2 font-bold">نوع تجهیز</th>
                        <th className="border border-slate-300 p-2 font-bold">کد اموال</th>
                        <th className="border border-slate-300 p-2 font-bold">تحویل گیرنده</th>
                        <th className="border border-slate-300 p-2 font-bold">تاریخ واگذاری (شروع)</th>
                        <th className="border border-slate-300 p-2 font-bold">تاریخ پایان (استرداد)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((ass, idx) => (
                        <tr key={ass.id}>
                          <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
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
          {reportType === 'certificate' && liveCertificatePers && (() => {
            const certificatePers = liveCertificatePers;
            const secondaryList = [
              ...getAssignedEquipments(certificatePers.code).monitors.map(m => ({ type: '📺 نمایشگر (مانیتور اداری)', code: m.code, model: m.model })),
              ...getAssignedEquipments(certificatePers.code).printers.map(pr => ({ type: '🖨️ پرینتر / چاپگر کارگاهی', code: pr.code, model: pr.model })),
              ...getAssignedEquipments(certificatePers.code).mice.map(m => ({ type: '🖱️ ماوس (پرونده پرسنلی)', code: m.code, model: m.model })),
              ...getAssignedEquipments(certificatePers.code).keyboards.map(k => ({ type: '⌨️ کیبورد (پرونده پرسنلی)', code: k.code, model: k.model })),
            ];
            return (
              <div className="space-y-6 text-black font-sans print:p-0">
              
              {/* Header Certificate corporate titles */}
              <div className="grid grid-cols-3 items-center border-b-2 border-black pb-4">
                {/* Right side: Logo */}
                <div className="flex justify-start">
                  <Logo size="h-[62px]" />
                </div>
                
                {/* Center: Corporate Titles (Centered) */}
                <div className="text-center space-y-1">
                  <h2 className="text-base md:text-lg font-black leading-tight text-black">شرکت عمران آذرستان</h2>
                  <h3 className="text-xs text-slate-800 font-bold">واحد فناوری اطلاعات و ارتباطات (ICT)</h3>
                </div>
                
                {/* Left side: Code & Document metadata */}
                <div className="text-xs space-y-1.5 flex flex-col items-end mr-auto">
                  <div className="w-[215px] flex items-center justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-slate-500 font-bold">کد سند:</span>
                    <span dir="ltr" className="font-mono font-bold select-all text-slate-800">37-FO-IT-01-01</span>
                  </div>
                  <div className="w-[215px] flex items-center justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-slate-500 font-bold">شماره سند:</span>
                    <span dir="ltr" className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 pb-0.5 rounded">ICT-CERT-{certificatePers.documentNumber || "----"}</span>
                  </div>
                  <div className="w-[215px] flex items-center justify-between">
                    <span className="text-slate-500 font-bold">تاریخ صدور سند:</span>
                    <span className="font-mono font-bold text-slate-800">۱۴۰۵/۰۳/۰۳</span>
                  </div>
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
                          <tr>
                            <td className="border border-black p-2 bg-slate-50 font-bold">منبع تغذیه (پاور):</td>
                            <td className="border border-black p-2 font-mono">{c.power || "—"}</td>
                            <td className="border border-black p-2 bg-slate-50 font-bold">وضعیت سلامت:</td>
                            <td className="border border-black p-2">
                              {c.status === 'repair' ? 'نیاز به تعمیر (کارگاهی)' : c.status === 'retired' ? 'اسقاط شده' : 'سالم و فعال'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ))}

                    {/* Monitors and Printers spec table */}
                    {secondaryList.length > 0 && (
                      <table className="w-full text-xs text-right border-collapse border border-black">
                        <thead>
                          <tr className="bg-slate-200">
                            <th className="border border-black p-2 font-bold w-[10%] text-center">ردیف</th>
                            <th className="border border-black p-2 font-bold w-[35%]">دسته سخت‌افزار</th>
                            <th className="border border-black p-2 font-bold w-[20%] font-mono">کد اموال و ردیاب</th>
                            <th className="border border-black p-2 font-bold w-[35%]">سازنده و مدل دقیق کالا تحویل شده</th>
                          </tr>
                        </thead>
                        <tbody>
                          {secondaryList.map((item, idx) => (
                            <tr key={item.code}>
                              <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                              <td className="border border-black p-2 font-bold">{item.type}</td>
                              <td className="border border-black p-2 font-mono font-bold text-slate-800">{item.code}</td>
                              <td className="border border-black p-2">{item.model}</td>
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
                  <span className="font-bold text-black border-b border-dashed border-slate-300 pb-1">واحد انبار پروژه:</span>
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
          );
        })()}
        </div>
      </div>

    </div>
  );
}
