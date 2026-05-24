import React, { useState, useEffect } from 'react';
import { Case, Monitor, Printer, Personnel, Mouse, Keyboard } from '../types';

interface TransferTabProps {
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  personnel: Personnel[];
  onTransfer: (equipmentCode: string, targetPersonnelCode: string | null) => Promise<void>;
  prefilledEquipmentCode?: string;
  prefilledPersonnelCode?: string;
}

export default function TransferTab({
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  personnel,
  onTransfer,
  prefilledEquipmentCode = '',
  prefilledPersonnelCode = ''
}: TransferTabProps) {
  const [equipCode, setEquipCode] = useState(prefilledEquipmentCode);
  const [persCode, setPersCode] = useState(prefilledPersonnelCode);

  const [matchedEquip, setMatchedEquip] = useState<{
    code: string;
    type: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard';
    info: string;
    owner: string | null;
  } | null>(null);

  const [matchedPers, setMatchedPers] = useState<Personnel | null>(null);

  // Sync with props
  useEffect(() => {
    if (prefilledEquipmentCode) setEquipCode(prefilledEquipmentCode);
    if (prefilledPersonnelCode) setPersCode(prefilledPersonnelCode);
  }, [prefilledEquipmentCode, prefilledPersonnelCode]);

  // Handle Equipment live look up
  useEffect(() => {
    const code = equipCode.trim().toUpperCase();
    if (!code) {
      setMatchedEquip(null);
      return;
    }

    // 1. Check Cases
    const foundCase = cases.find(c => c.code.toUpperCase() === code);
    if (foundCase) {
      setMatchedEquip({
        code: foundCase.code,
        type: 'case',
        info: `${foundCase.motherboard} | ${foundCase.cpu} | RAM: ${foundCase.ramQty}`,
        owner: foundCase.assignedTo
      });
      return;
    }

    // 2. Check Monitors
    const foundMonitor = monitors.find(m => m.code.toUpperCase() === code);
    if (foundMonitor) {
      setMatchedEquip({
        code: foundMonitor.code,
        type: 'monitor',
        info: foundMonitor.model,
        owner: foundMonitor.assignedTo
      });
      return;
    }

    // 3. Check Printers
    const foundPrinter = printers.find(p => p.code.toUpperCase() === code);
    if (foundPrinter) {
      setMatchedEquip({
        code: foundPrinter.code,
        type: 'printer',
        info: foundPrinter.model,
        owner: foundPrinter.assignedTo
      });
      return;
    }

    // 4. Check Mice
    const foundMouse = mice.find(m => m.code.toUpperCase() === code);
    if (foundMouse) {
      setMatchedEquip({
        code: foundMouse.code,
        type: 'mouse',
        info: foundMouse.model,
        owner: foundMouse.assignedTo
      });
      return;
    }

    // 5. Check Keyboards
    const foundKeyboard = keyboards.find(k => k.code.toUpperCase() === code);
    if (foundKeyboard) {
      setMatchedEquip({
        code: foundKeyboard.code,
        type: 'keyboard',
        info: foundKeyboard.model,
        owner: foundKeyboard.assignedTo
      });
      return;
    }

    setMatchedEquip(null);
  }, [equipCode, cases, monitors, printers, mice, keyboards]);

  // Handle Personnel live look up
  useEffect(() => {
    const code = persCode.trim();
    if (!code) {
      setMatchedPers(null);
      return;
    }

    const foundPers = personnel.find(p => p.code === code);
    setMatchedPers(foundPers || null);
  }, [persCode, personnel]);

  const handleExecuteTransfer = async () => {
    if (!matchedEquip) {
      alert('لطفاً کد اموال سخت‌افزار صحیحی وارد کنید.');
      return;
    }
    if (!persCode.trim()) {
      alert('جهت واگذاری وارد کردن کد پرسنلی الزامی است. جهت خروج به انبار دکمه عزل را فشار دهید.');
      return;
    }
    if (!matchedPers) {
      alert('کاربر هدفی با این کد پرسنلی یافت نشد.');
      return;
    }
    if (matchedEquip.owner === persCode.trim()) {
      alert('این تجهیز در حال حاضر نیز تحت تصرف و واگذاری همین شخص می‌باشد.');
      return;
    }

    await onTransfer(matchedEquip.code, persCode.trim());
    setEquipCode('');
    setPersCode('');
    alert('تخصیص تجهیز با موفقیت انجام شد و در سوابق آرشیو گردید.');
  };

  const handleReturnToWarehouse = async () => {
    if (!matchedEquip) {
      alert('لطفاً کد اموال کالا را برای عودت مشخص نمایید.');
      return;
    }
    if (!matchedEquip.owner) {
      alert('این کالا در حال حاضر هم در انبار کارگاه بوشهر قرار دارد.');
      return;
    }

    if (window.confirm(`آیا تمایل به عودت کالا با کد اموال ${matchedEquip.code} به انبار کارگاه بوشهر دارید؟`)) {
      await onTransfer(matchedEquip.code, null);
      setEquipCode('');
      setPersCode('');
      alert('تجهیز از پرونده پرسنل خارج و به وضعیت آزاد تغییر یافت.');
    }
  };

  const getOwnerDetails = (ownerCode: string | null) => {
    if (!ownerCode) return <span className="text-emerald-600 font-bold">📦 مستقر در انبار کارگاه</span>;
    const p = personnel.find(user => user.code === ownerCode);
    return p 
      ? <span className="text-red-600 font-bold">👥 {p.name} ({p.code}) - مستقر در {p.location}</span>
      : <span className="text-red-600">کد پرسنلی نامشخص: {ownerCode}</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left panel form */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">🔄 جابجایی هوشمند و ترانسفر سخت‌افزارها</h3>
          <p className="text-xs text-slate-500 mt-1">امکان واگذاری کالا به پرسنل جدید یا ثبت استرداد فیزیکی به انبار</p>
        </div>

        <div className="space-y-4">
          
          {/* Step 1: Equipment */}
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-semibold text-slate-700 block">
              کد اموال تجهیز اصلی (کیس، مانیتور، چاپگر، ماوس یا کیبورد):
            </label>
            <input 
              type="text"
              value={equipCode}
              onChange={(e) => setEquipCode(e.target.value)}
              placeholder="مثال: C-201, M-301, P-401, MOU-101, KEY-201..."
              className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Live Preview Equipment */}
          {matchedEquip && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs md:text-sm space-y-2.5 animate-fade-in">
              <div className="text-blue-700 font-bold flex items-center gap-1">
                <span>🖥️</span> مشخصات سخت‌افزار شناسایی شده:
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>کد اموال: <span className="font-mono font-bold text-slate-900">{matchedEquip.code}</span></div>
                <div>نوع دسته: <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  {matchedEquip.type === 'case' ? 'کیس کامپیوتر' : matchedEquip.type === 'monitor' ? 'نمایشگر' : matchedEquip.type === 'printer' ? 'چاپگر' : matchedEquip.type === 'mouse' ? 'ماوس' : 'کیبورد'}
                </span></div>
                <div className="col-span-2">مشخصات/مدل: <span className="text-slate-900 font-medium">{matchedEquip.info}</span></div>
                <div className="col-span-2 border-t border-slate-200/50 pt-2">
                  تحویل گیرنده کنونی: {getOwnerDetails(matchedEquip.owner)}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target User */}
          <div className="space-y-2 pt-2">
            <label className="text-xs md:text-sm font-semibold text-slate-700 block">
              کد پرسنلی تحویل‌گیرنده جدید:
            </label>
            <input 
              type="text"
              value={persCode}
              onChange={(e) => setPersCode(e.target.value)}
              placeholder="کد پرسنلی کاربر هدف..."
              className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">برای استرداد یا تحویل کالا به انبار کارگاه، این کادر را خالی بگذارید.</p>
          </div>

          {/* Live Preview Personnel */}
          {matchedPers && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs md:text-sm space-y-2.5 animate-fade-in">
              <div className="text-emerald-700 font-bold flex items-center gap-1">
                <span>👥</span> مشخصات تحویل‌گیرنده هدف:
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>نام پرسنل: <span className="font-bold text-slate-900">{matchedPers.name}</span></div>
                <div>واحد: <span className="text-slate-900">{matchedPers.department}</span></div>
                <div>سمت: <span className="text-slate-900">{matchedPers.title}</span></div>
                <div>محل اسقرار: <span className="text-slate-900">{matchedPers.location}</span></div>
              </div>
            </div>
          )}

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-dashed border-slate-200">
            <button
              onClick={handleReturnToWarehouse}
              disabled={!matchedEquip || !matchedEquip.owner}
              className={`p-3 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer text-center flex-1 ${
                matchedEquip && matchedEquip.owner 
                  ? 'bg-slate-700 hover:bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              📥 ترخیص به انبار بوشهر
            </button>
            <button
              onClick={handleExecuteTransfer}
              disabled={!matchedEquip || !matchedPers}
              className={`p-3 rounded-lg text-xs md:text-sm font-bold transition flex-[2] cursor-pointer text-center ${
                matchedEquip && matchedPers 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              🔄 ثبت انتقال کالا به کاربر هدف
            </button>
          </div>

        </div>
      </div>

      {/* Right instruction box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 self-start space-y-3 font-medium text-xs md:text-sm text-blue-900 leading-relaxed shadow-sm">
        <h4 className="font-bold text-base flex items-center gap-1 text-blue-950">
          ℹ️ دستورالعمل لجستیکی جابجایی
        </h4>
        <ul className="space-y-3.5 list-none pr-3">
          <li className="relative pr-5">
            <span className="absolute right-0 text-blue-500">◀</span>
            با ثبت هر جابجایی هوشمند، پرونده استفاده قبلی به صورت خودکار با درج تاریخ پایان همان روز آرشیو می‌گردد.
          </li>
          <li className="relative pr-5">
            <span className="absolute right-0 text-blue-500">◀</span>
            تجهیزات عزل شده با قرارگیری به صورت وضعیت <strong className="text-blue-950 font-bold">داخل انبار</strong> کماکان در چرخه قطعات سالم انبار قرار خواهند داشت.
          </li>
          <li className="relative pr-5">
            <span className="absolute right-0 text-blue-500">◀</span>
            سوابق دقیق جابجایی‌ها به صورت کامل در زبانه «تاریخچه جابجایی» ضبط شده و قابل گزارش‌گیری می‌باشد.
          </li>
          <li className="relative pr-5">
            <span className="absolute right-0 text-blue-500">◀</span>
            بکاو و امانت‌دهی برون کارگاهی، نیازمند هماهنگی نهایی با واحد ICT انبار آذرستان می‌باشد.
          </li>
        </ul>
        <div className="pt-4 border-t border-blue-200/50 text-[11px] text-blue-700 text-left">
          سامانه هوشمند شناسنامه شرکت عمران آذرستان
        </div>
      </div>

    </div>
  );
}
