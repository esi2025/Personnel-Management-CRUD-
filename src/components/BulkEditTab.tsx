import React, { useState, useMemo, useRef } from 'react';
import { Case, Monitor, Printer, Mouse, Keyboard, Radio, Personnel } from '../types';

interface BulkEditTabProps {
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice: Mouse[];
  keyboards: Keyboard[];
  radios: Radio[];
  personnel: Personnel[];
  onSaveBulkEdit: (updates: { type: string, code: string, fields: any }[]) => Promise<{ success: boolean; updatedCount: number }>;
}

export function BulkEditTab({
  cases,
  monitors,
  printers,
  mice,
  keyboards,
  radios,
  personnel,
  onSaveBulkEdit
}: BulkEditTabProps) {
  const [rawInput, setRawInput] = useState('');
  const [matchedItems, setMatchedItems] = useState<{ type: string; code: string; original: any }[]>([]);
  const [unmatchedCodes, setUnmatchedCodes] = useState<string[]>([]);
  const [isFetched, setIsFetched] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success indicator message after saving
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<{ type: string, code: string, fields: any }[]>([]);

  // Form edit fields with their enable checkbox
  const [editedFields, setEditedFields] = useState({
    // Common fields
    status: { enabled: false, value: 'working' },
    description: { enabled: false, value: '' },
    lastServiced: { enabled: false, value: '' },
    model: { enabled: false, value: '' },
    
    // Case fields
    motherboard: { enabled: false, value: '' },
    cpu: { enabled: false, value: '' },
    vga: { enabled: false, value: '' },
    hdd1: { enabled: false, value: '' },
    hdd2: { enabled: false, value: '' },
    ramType: { enabled: false, value: 'DDR4' },
    ramQty: { enabled: false, value: '8GB' },
    power: { enabled: false, value: '' },

    // Radio fields
    frequencyRange: { enabled: false, value: 'UHF' },
    ipRating: { enabled: false, value: 'IP54' },
  });

  // Helper to convert Persian/Arabic numerals to standard digits
  const toEnglishDigits = (str: string): string => {
    const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let result = str;
    for (let i = 0; i < 10; i++) {
      result = result.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
    }
    return result;
  };

  // Handle parse/fetch
  const handleFetchDetails = (inputText: string) => {
    setSaveStatus(null);
    setValidationError(null);
    setIsFetched(false);
    const text = inputText || rawInput;
    if (!text.trim()) {
      setValidationError('لطفاً ابتدا کدهای اموال مورد نظر را وارد یا فایل متنی را آپلود کنید.');
      return;
    }

    // Convert digits and split by newlines, commas, or spaces
    const codes = toEnglishDigits(text)
      .split(/[\n,; \t]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    // Filter unique codes
    const uniqueCodes: string[] = Array.from(new Set(codes));

    const found: typeof matchedItems = [];
    const notFound: string[] = [];

    uniqueCodes.forEach((code: string) => {
      // Look up across all lists
      const cItem = cases.find((c) => c.code.toUpperCase() === code);
      if (cItem) {
        found.push({ type: 'case', code, original: cItem });
        return;
      }

      const mItem = monitors.find((m) => m.code.toUpperCase() === code);
      if (mItem) {
        found.push({ type: 'monitor', code, original: mItem });
        return;
      }

      const prItem = printers.find((pr) => pr.code.toUpperCase() === code);
      if (prItem) {
        found.push({ type: 'printer', code, original: prItem });
        return;
      }

      const mouItem = mice.find((m) => m.code.toUpperCase() === code);
      if (mouItem) {
        found.push({ type: 'mouse', code, original: mouItem });
        return;
      }

      const kbItem = keyboards.find((k) => k.code.toUpperCase() === code);
      if (kbItem) {
        found.push({ type: 'keyboard', code, original: kbItem });
        return;
      }

      const radItem = radios.find((r) => r.code.toUpperCase() === code);
      if (radItem) {
        found.push({ type: 'radio', code, original: radItem });
        return;
      }

      notFound.push(code);
    });

    setMatchedItems(found);
    setUnmatchedCodes(notFound);
    setIsFetched(true);
  };

  // Helper to translate code to Persian label
  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'case': return '🖥️ کیس';
      case 'monitor': return '📺 مانیتور';
      case 'printer': return '🖨️ چاپگر';
      case 'mouse': return '🖱️ ماوس';
      case 'keyboard': return '⌨️ کیبورد';
      case 'radio': return '📻 بی‌سیم';
      default: return 'سایر';
    }
  };

  // Helper to get owner name if assigned
  const getOwnerName = (personnelCode: string | null) => {
    if (!personnelCode) return <span className="text-slate-400">انبار انباشت کارگاه</span>;
    const p = personnel.find(x => x.code === personnelCode);
    return p ? (
      <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name} ({p.department})</span>
    ) : (
      <span className="text-slate-500 font-mono">{personnelCode}</span>
    );
  };

  // File Upload handling (.txt files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndSetFile(file);
  };

  const readAndSetFile = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('لطفاً فقط فایل متنی با پسوند .txt آپلود نمایید.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawInput(text);
      handleFetchDetails(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readAndSetFile(file);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Handle Field value changes
  const updateFieldState = (key: keyof typeof editedFields, updates: { enabled?: boolean; value?: string }) => {
    setEditedFields(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates
      }
    }));
  };

  // Check if there is any Case or Radio in matched list to highlight field types
  const hasCases = useMemo(() => matchedItems.some(i => i.type === 'case'), [matchedItems]);
  const hasRadios = useMemo(() => matchedItems.some(i => i.type === 'radio'), [matchedItems]);
  const hasOnlyModelables = useMemo(() => matchedItems.every(i => i.type !== 'case'), [matchedItems]);
  const hasModelables = useMemo(() => matchedItems.some(i => i.type !== 'case'), [matchedItems]);

  // Handle Submission of edits (Prepares changes and triggers confirmation modal)
  const handleApplyBulkChanges = () => {
    setValidationError(null);
    setSaveStatus(null);

    if (matchedItems.length === 0) {
      setValidationError('هیچ تجهیزاتی جهت ویرایش گروهی بارگذاری نشده است.');
      return;
    }

    // Build fields changes object
    const fieldsToApply: Record<string, any> = {};
    let anyFieldSelected = false;

    Object.entries(editedFields).forEach(([fieldName, config]: [string, any]) => {
      if (config.enabled) {
        fieldsToApply[fieldName] = config.value;
        anyFieldSelected = true;
      }
    });

    if (!anyFieldSelected) {
      setValidationError('لطفاً چک‌باکس حداقل یکی از گزینه‌های روبه‌رو را جهت اعمال تغییر بپذیرید.');
      return;
    }

    // Map matchedItems to their update queries
    const updates = matchedItems.map((item) => {
      // Build fields to save specific to that equipment type
      const targetFields: Record<string, any> = {};

      Object.keys(fieldsToApply).forEach((key) => {
        // Only apply fields relevant to types
        if (item.type !== 'case' && [
          'motherboard', 'cpu', 'vga', 'hdd1', 'hdd2', 'ramType', 'ramQty', 'power'
        ].includes(key)) {
          return; // skip case fields
        }
        if (item.type !== 'radio' && ['frequencyRange', 'ipRating'].includes(key)) {
          return; // skip radio fields
        }
        if (item.type === 'case' && key === 'model') {
          return; // skip model field for Case (Case has specialized fields instead)
        }

        targetFields[key] = fieldsToApply[key];
      });

      return {
        type: item.type,
        code: item.code,
        fields: targetFields
      };
    });

    setPendingUpdates(updates);
    setShowConfirmModal(true);
  };

  // Real execution of bulk changes triggered after customer confirmed modal
  const proceedApplyBulkChanges = async () => {
    setShowConfirmModal(false);
    setValidationError(null);
    setSaveStatus(null);
    
    const updates = pendingUpdates;
    const res = await onSaveBulkEdit(updates);
    if (res.success) {
      setSaveStatus({
        success: true,
        message: `تغییرات گروهی با موفقیت ثبت شد! تعداد ${res.updatedCount} تجهیز ارتقا یا اصلاح گردید.`
      });
      // Clear fetch results so user can do next bulk operation
      setRawInput('');
      setMatchedItems([]);
      setUnmatchedCodes([]);
      setIsFetched(false);
      // Reset enable checkboxes
      setEditedFields(prev => {
        const reset: any = {};
        Object.keys(prev).forEach((k) => {
          reset[k] = { ...(prev as any)[k], enabled: false };
        });
        return reset;
      });
    } else {
      setSaveStatus({
        success: false,
        message: 'خطایی در ثبت گروهی اطلاعات توسط سرور بوجود آمد.'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-right">
      
      {/* Title & Explainer block */}
      <div className="bg-gradient-to-l from-indigo-900 to-slate-900 border border-indigo-850 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-10 hidden sm:block">
          <span className="text-[120px] font-black leading-none select-none">EDIT</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">🛠️</span>
            <h2 className="text-lg md:text-xl font-black">پنل هوشمند ویرایش و اصلاح گروهی مشخصات تجهیزات</h2>
          </div>
          <p className="text-slate-300 text-xs md:text-sm max-w-4xl leading-relaxed">
            کاربر محترم سخت‌افزار، با وارد کردن لیستی از کدهای اموال به صورت متن یا آپلود فایل صادر شده انبار (<span className="font-mono text-amber-300">.txt</span>)، می‌توانید مشخصات سخت‌افزاری، تاریخ‌های سرویس و شرایط استقرار تجهیزات گوناگون (مانند تغییر دسته جمعی حافظه رم تعدادی کیس یا وضعیت کیبوردها) را به صورت یک‌جا بروزرسانی و سازماندهی کنید.
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl border flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border-red-250 text-red-800 dark:text-red-300">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-black text-xs md:text-sm">خطای اعتبارسنجی عملیات:</h4>
            <p className="text-[11px] md:text-xs mt-1">{validationError}</p>
          </div>
          <button 
            onClick={() => setValidationError(null)} 
            className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 cursor-pointer"
          >
            ✖
          </button>
        </div>
      )}

      {saveStatus && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 animate-bounce ${
          saveStatus.success 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-700 dark:text-red-300'
        }`}>
          <span className="text-xl">{saveStatus.success ? '✅' : '🔴'}</span>
          <div>
            <h4 className="font-black text-xs md:text-sm">نتیجه عملیات گروهی:</h4>
            <p className="text-[11px] md:text-xs mt-1">{saveStatus.message}</p>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-right space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100">تأییدیه عملیات تغییر گروهی</h3>
            </div>
            
            <p className="text-xs md:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا از اعمال پرسرعت تغییرات مشخص شده گروهی بر روی <strong className="text-indigo-600 dark:text-indigo-400 font-black">{matchedItems.length}</strong> قلم تجهیز سخت‌افزاری فعال در سامانه اطمینان قطعی دارید؟ 
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-700 dark:text-amber-400">
              توجه: این عملیات مشخصات فنی، آخرین وضعیت و تاریخ‌های مربوط به تمام سخت‌افزارهای تطبیق‌یافته را همزمان بازنویسی خواهد کرد.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                انصراف و بازگشت
              </button>
              <button
                onClick={proceedApplyBulkChanges}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <span>✅ بله، بروزرسانی شوند</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row: Input File Area & Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Col (8): File/Code Input */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black text-slate-800 dark:text-slate-100 text-xs md:text-xs flex items-center gap-1.5">
                <span>📁 گام اول: کد اموال تجهیزات را در کادر زیر قرار دهید یا فایل پیوست کنید</span>
              </label>
              <button 
                type="button"
                onClick={triggerSelectFile}
                className="text-[10px] md:text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-md transition font-extrabold cursor-pointer text-slate-600 dark:text-slate-300"
              >
                📎 بارگذاری فایل TXT اموال
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt" 
                className="hidden" 
              />
            </div>

            {/* Drag & Drop TextArea */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl border transition-all duration-200 ${
                dragOver 
                  ? 'border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="کدهای اموال را وارد نمایید. (هر خط یک کد اموال، یا با کاما جدا شوند)&#10;مثال:&#10;C-201&#10;C-202&#10;M-501&#10;R-920"
                className="w-full min-h-[160px] p-3.5 bg-slate-50/50 dark:bg-slate-900/40 text-right font-mono text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none rounded-xl"
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              {dragOver && (
                <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-xs flex items-center justify-center rounded-xl pointer-events-none">
                  <div className="text-center p-4 bg-white dark:bg-slate-900 border border-indigo-200 rounded-lg shadow-lg">
                    <span className="text-2xl block mb-1">📥</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">فایل متنی را رها کنید تا پردازش شود</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => { setRawInput(''); setMatchedItems([]); setUnmatchedCodes([]); setIsFetched(false); setSaveStatus(null); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-black cursor-pointer transition"
            >
              پاک‌سازی فرم
            </button>
            <button
              onClick={() => handleFetchDetails(rawInput)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-sm shrink-0 cursor-pointer transition flex items-center gap-1.5"
            >
              🔍 فراخوانی و اعتبارسنجی کدها
            </button>
          </div>
        </div>

        {/* Right Col (4): Quick Statistics of Loaded Assets */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs mb-3 flex items-center gap-1.5">
              <span>📊 آمار تجهیزات فراخوانی‌شده</span>
            </h4>

            {!isFetched ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                کدهای اموال را وارد کرده و دکمه فراخوانی را بزنید تا وضعیت انبار را ببینید.
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-250/50 rounded-lg shadow-2xs">
                    <span className="text-[10px] text-slate-400 block mb-0.5">تعداد کل کدهای ورودی</span>
                    <strong className="text-lg font-black font-mono text-slate-800 dark:text-white">
                      {matchedItems.length + unmatchedCodes.length}
                    </strong>
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-lg shadow-2xs">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mb-0.5">تعداد یافت‌شده در سیستم</span>
                    <strong className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {matchedItems.length}
                    </strong>
                  </div>
                </div>

                {unmatchedCodes.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-850 dark:text-amber-400 rounded-lg text-xs">
                    <h5 className="font-bold flex items-center gap-1 mb-1 text-[11px]">
                      <span>⚠️ {unmatchedCodes.length} کد در بانک اطلاعاتی یافت نشد:</span>
                    </h5>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px] bg-white/60 dark:bg-slate-950/40 p-1.5 rounded-md mt-1 border border-amber-100 max-h-[80px] overflow-y-auto">
                      {unmatchedCodes.map((code) => (
                        <span key={code} className="bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded font-bold">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategory split counts */}
                <div className="text-[11px] space-y-1.5 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                  <span className="font-black text-slate-600 dark:text-slate-400 block pb-1 border-b text-[10px] mb-1">تفکیک اقلام بارگذاری شده:</span>
                  {[
                    { type: 'case', name: 'کیس‌های کامپیوتر', color: 'text-blue-600' },
                    { type: 'monitor', name: 'مانیتورهای کارگاه', color: 'text-indigo-600' },
                    { type: 'printer', name: 'چاپگرهای مستقر', color: 'text-purple-600' },
                    { type: 'mouse', name: 'ماوس انبار سخت‌افزار', color: 'text-teal-600' },
                    { type: 'keyboard', name: 'کیبوردهای ساماندهی', color: 'text-rose-600' },
                    { type: 'radio', name: 'بی‌سیم‌های کارگاهی دستی', color: 'text-amber-600' }
                  ].map((cat) => {
                    const count = matchedItems.filter(i => i.type === cat.type).length;
                    if (count === 0) return null;
                    return (
                      <div key={cat.type} className="flex justify-between items-center text-xs">
                        <span className="font-bold">{getCategoryLabel(cat.type)}:</span>
                        <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-black text-slate-700 dark:text-slate-200">
                          {count} عدد
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 text-center select-none font-bold">
            شرکت عمران آذرستان - سامانه شناسنامه تجهیزات بوشهر
          </div>
        </div>

      </div>

      {/* Gifting details of parsed items to the operator */}
      {isFetched && matchedItems.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h3 className="font-black text-slate-800 dark:text-slate-200 text-xs md:text-sm">
            🖥️ لیست تجهیزات انطباق‌یافته آماده ویرایش:
          </h3>
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-lg max-h-[250px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold sticky top-0 border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="p-2">ردیف</th>
                  <th className="p-2">نوع تجهيز</th>
                  <th className="p-2">کد اموال سخت‌افزار</th>
                  <th className="p-2">مدل / پردازنده فعلی</th>
                  <th className="p-2">کاربر جاری دستگاه</th>
                  <th className="p-2">وضعیت سلامت</th>
                  <th className="p-2 text-center">آخرین سرویس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {matchedItems.map((item, index) => {
                  let modelLabel = item.original.model || '-';
                  if (item.type === 'case') {
                    modelLabel = `${item.original.cpu} / ${item.original.ramQty} RAM / ${item.original.ramType}`;
                  }
                  
                  return (
                    <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="p-2 text-slate-400 font-mono">{index + 1}</td>
                      <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{getCategoryLabel(item.type)}</td>
                      <td className="p-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.code}</td>
                      <td className="p-2 text-slate-500 max-w-[200px] truncate" title={modelLabel}>{modelLabel}</td>
                      <td className="p-2 text-[11px]">{getOwnerName(item.original.assignedTo)}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.original.status === 'retired' 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                            : item.original.status === 'repair'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                        }`}>
                          {item.original.status === 'retired' ? 'اسقاط/غیرفعال' : item.original.status === 'repair' ? 'در دست تعمیر' : 'سالم و فعال'}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono text-[10px] text-slate-400">{item.original.lastServiced || 'ثبت‌نشده'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gstep 2: Form to Batch Apply Edits */}
      {isFetched && matchedItems.length > 0 && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm bg-blue-500/10 p-1.5 rounded text-blue-500">⚙️</span>
            <h3 className="font-black text-slate-850 dark:text-slate-100 text-xs md:text-sm">
              گام دوم: فیلدهای تغییر را انتخاب کرده و مقدار جدید را مشخص کنید:
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Block A: Common Fields (Status, Desc, lastServiced) */}
            <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
              <h4 className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 border-b pb-1">
                ⚙️ فیلدهای عمومی (قابل اعمال بر روی همگی)
              </h4>

              {/* Status Change checkbox & select */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedFields.status.enabled}
                    onChange={(e) => updateFieldState('status', { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span>تغییر وضعیت بهره‌برداری</span>
                </label>
                <select
                  disabled={!editedFields.status.enabled}
                  value={editedFields.status.value}
                  onChange={(e) => updateFieldState('status', { value: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-550 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                >
                  <option value="working">سالم و فعال (working)</option>
                  <option value="repair">در حال تعمیر/نیاز به سرویس (repair)</option>
                  <option value="retired">اسقاط/فروش رفته (retired)</option>
                </select>
              </div>

              {/* Description Change checkbox & input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedFields.description.enabled}
                    onChange={(e) => updateFieldState('description', { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span>تغییر جزئیات و شرح انبار</span>
                </label>
                <input
                  type="text"
                  disabled={!editedFields.description.enabled}
                  value={editedFields.description.value}
                  onChange={(e) => updateFieldState('description', { value: e.target.value })}
                  placeholder="مثال: ارتقای سخت‌افزاری کارگاه بوشهر"
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-550 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                />
              </div>

              {/* lastServiced change checkbox & input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedFields.lastServiced.enabled}
                    onChange={(e) => updateFieldState('lastServiced', { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span>تغییر تاریخ آخرین سرویس</span>
                </label>
                <input
                  type="text"
                  disabled={!editedFields.lastServiced.enabled}
                  value={editedFields.lastServiced.value}
                  onChange={(e) => updateFieldState('lastServiced', { value: e.target.value })}
                  placeholder="مثال: 1405/03/10"
                  className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:border-indigo-550 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50 text-left"
                  style={{ direction: 'ltr' }}
                />
              </div>

              {/* Model Change checkbox & input (Monitor, Printer, Mouse, Keyboard, Radio) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer" title="مخصوص مانیتور، پرینتر، ماوس و بی‌سیم">
                  <input
                    type="checkbox"
                    disabled={!hasModelables}
                    checked={editedFields.model.enabled && hasModelables}
                    onChange={(e) => updateFieldState('model', { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span>تغییر نام و مدل دستگاه</span>
                  {hasCases && hasModelables && <span className="text-[9px] text-amber-500 font-bold">(مخصوص تجهیزات غیرکیس)</span>}
                </label>
                <input
                  type="text"
                  disabled={!editedFields.model.enabled || !hasModelables}
                  value={editedFields.model.value}
                  onChange={(e) => updateFieldState('model', { value: e.target.value })}
                  placeholder="مثال: HP LaserJet Pro 402dn"
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-550 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Block B: Case Specific Fields (Motherboard, CPU, RAM, Power...) */}
            <div className={`space-y-4 p-4 rounded-xl border transition-opacity ${
              hasCases 
                ? 'bg-blue-50/20 dark:bg-slate-900/10 border-blue-200/60 dark:border-slate-800' 
                : 'opacity-40 bg-slate-50 dark:bg-slate-900/5 border-slate-200'
            }`}>
              <h4 className="font-extrabold text-xs text-blue-600 dark:text-blue-400 border-b pb-1 flex justify-between items-center">
                <span>🖥️ فیلدهای اختصاصی کیس کامپیوتر</span>
                {!hasCases && <span className="text-[10px] bg-slate-200 dark:bg-slate-850 px-1 rounded text-slate-500 font-bold">غیرفعال (بدون کیس)</span>}
              </h4>

              {/* Motherboard */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.motherboard.enabled && hasCases}
                      onChange={(e) => updateFieldState('motherboard', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>مادربورد</span>
                  </label>
                  <input
                    type="text"
                    disabled={!editedFields.motherboard.enabled || !hasCases}
                    value={editedFields.motherboard.value}
                    onChange={(e) => updateFieldState('motherboard', { value: e.target.value })}
                    placeholder="مثال: ASUS H610"
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>

                {/* CPU */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.cpu.enabled && hasCases}
                      onChange={(e) => updateFieldState('cpu', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>پردازنده CPU</span>
                  </label>
                  <input
                    type="text"
                    disabled={!editedFields.cpu.enabled || !hasCases}
                    value={editedFields.cpu.value}
                    onChange={(e) => updateFieldState('cpu', { value: e.target.value })}
                    placeholder="مثال: Core i7 12700"
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* RAM Type & RAM Qty (THE MEMO EXPLAINER EXAMPLE MATCHES!) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.ramType.enabled && hasCases}
                      onChange={(e) => updateFieldState('ramType', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span className="text-amber-650 dark:text-amber-450 font-black">نوع رم RAM Type</span>
                  </label>
                  <select
                    disabled={!editedFields.ramType.enabled || !hasCases}
                    value={editedFields.ramType.value}
                    onChange={(e) => updateFieldState('ramType', { value: e.target.value })}
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50 font-mono"
                  >
                    <option value="DDR3">DDR3</option>
                    <option value="DDR4">DDR4</option>
                    <option value="DDR5">DDR5</option>
                    <option value="DDR2">DDR2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.ramQty.enabled && hasCases}
                      onChange={(e) => updateFieldState('ramQty', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>میزان رم (ظرفیت)</span>
                  </label>
                  <select
                    disabled={!editedFields.ramQty.enabled || !hasCases}
                    value={editedFields.ramQty.value}
                    onChange={(e) => updateFieldState('ramQty', { value: e.target.value })}
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50 font-mono"
                  >
                    <option value="4GB">4 GB</option>
                    <option value="8GB">8 GB</option>
                    <option value="16GB">16 GB</option>
                    <option value="32GB">32 GB</option>
                    <option value="64GB">64 GB</option>
                    <option value="2GB">2 GB</option>
                  </select>
                </div>
              </div>

              {/* Storage Disks (hdd1 / hdd2) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.hdd1.enabled && hasCases}
                      onChange={(e) => updateFieldState('hdd1', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>هارد اول (حجم/نوع)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!editedFields.hdd1.enabled || !hasCases}
                    value={editedFields.hdd1.value}
                    onChange={(e) => updateFieldState('hdd1', { value: e.target.value })}
                    placeholder="مثال: 512GB SSD"
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.hdd2.enabled && hasCases}
                      onChange={(e) => updateFieldState('hdd2', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>هارد دوم (آرشیو)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!editedFields.hdd2.enabled || !hasCases}
                    value={editedFields.hdd2.value}
                    onChange={(e) => updateFieldState('hdd2', { value: e.target.value })}
                    placeholder="مثال: 2TB HDD"
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Power Support & VGA */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.power.enabled && hasCases}
                      onChange={(e) => updateFieldState('power', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>پاور (وات)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!editedFields.power.enabled || !hasCases}
                    value={editedFields.power.value}
                    onChange={(e) => updateFieldState('power', { value: e.target.value })}
                    placeholder="مثال: Green GP480A"
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!hasCases}
                      checked={editedFields.vga.enabled && hasCases}
                      onChange={(e) => updateFieldState('vga', { enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span>گرافیک VGA</span>
                  </label>
                  <input
                    type="text"
                    disabled={!editedFields.vga.enabled || !hasCases}
                    value={editedFields.vga.value}
                    onChange={(e) => updateFieldState('vga', { value: e.target.value })}
                    placeholder="مثال: Nvidia GT730 2GB"
                    className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Block C: Radio Specific Fields (Frequency, IP rating) */}
            <div className={`space-y-4 p-4 rounded-xl border transition-opacity ${
              hasRadios 
                ? 'bg-amber-50/20 dark:bg-slate-900/10 border-amber-250 dark:border-slate-800' 
                : 'opacity-40 bg-slate-50 dark:bg-slate-900/5 border-slate-200'
            }`}>
              <h4 className="font-extrabold text-xs text-amber-600 dark:text-amber-400 border-b pb-1 flex justify-between items-center">
                <span>📻 فیلدهای اختصاصی بی‌سیم دستی</span>
                {!hasRadios && <span className="text-[10px] bg-slate-200 dark:bg-slate-850 px-1 rounded text-slate-500 font-bold">غیرفعال (بدون بی‌سیم)</span>}
              </h4>

              {/* Frequency Range */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!hasRadios}
                    checked={editedFields.frequencyRange.enabled && hasRadios}
                    onChange={(e) => updateFieldState('frequencyRange', { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                  />
                  <span>محدوده فرکانس تخصصی (Frequency Range)</span>
                </label>
                <select
                  disabled={!editedFields.frequencyRange.enabled || !hasRadios}
                  value={editedFields.frequencyRange.value}
                  onChange={(e) => updateFieldState('frequencyRange', { value: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50 font-mono"
                >
                  <option value="UHF">UHF (300 - 470 MHz)</option>
                  <option value="VHF">VHF (136 - 174 MHz)</option>
                  <option value="HF">HF (3 - 30 MHz)</option>
                </select>
              </div>

              {/* IP rating */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!hasRadios}
                    checked={editedFields.ipRating.enabled && hasRadios}
                    onChange={(e) => updateFieldState('ipRating', { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-40"
                  />
                  <span>درجه حفاظت فیزیکی (IP Rating ضدآب/گردوغبار)</span>
                </label>
                <select
                  disabled={!editedFields.ipRating.enabled || !hasRadios}
                  value={editedFields.ipRating.value}
                  onChange={(e) => updateFieldState('ipRating', { value: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50 font-mono"
                >
                  <option value="IP54">IP54 (مقاوم در برابر غبار و پاشش آب)</option>
                  <option value="IP67">IP67 (کاملاً ضدگردوغبار و غوطه‌وری تا ۱ متر آب)</option>
                  <option value="IP68">IP68 (مقاومت کامل مستمر در برابر فشار آب)</option>
                  <option value="IP43">IP43 (معمولی)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Apply edit button */}
          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={handleApplyBulkChanges}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-black text-xs md:text-sm rounded-xl hover:from-emerald-700 hover:to-indigo-700 transition cursor-pointer shadows-sm flex items-center gap-2"
            >
              🚀 اعمال نهایی تغییرات گروهی بر روی سخت‌افزارها ({matchedItems.length} قلم دستگاه)
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
