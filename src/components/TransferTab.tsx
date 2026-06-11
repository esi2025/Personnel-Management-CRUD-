import React, { useState, useEffect, useMemo } from 'react';
import { Case, Monitor, Printer, Personnel, Mouse, Keyboard, Radio } from '../types';
import { getPersianDateString } from '../utils/date';
import AutocompleteInput, { AutocompleteOption } from './AutocompleteInput';

interface TransferTabProps {
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  radios?: Radio[];
  personnel: Personnel[];
  onTransfer: (equipmentCode: string, targetPersonnelCode: string | null, documentNumber?: string, dateStr?: string) => Promise<void>;
  onLocationTransfer?: (equipmentCode: string, targetLocation: string, documentNumber?: string, dateStr?: string) => Promise<void>;
  prefilledEquipmentCode?: string;
  prefilledPersonnelCode?: string;
}

export default function TransferTab({
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  radios = [],
  personnel,
  onTransfer,
  onLocationTransfer,
  prefilledEquipmentCode = '',
  prefilledPersonnelCode = ''
}: TransferTabProps) {
  // Transfer Mode: 'ownership' (جابجایی مالکیت) or 'location' (جابجایی فیزیکی موقعیت)
  const [transferMode, setTransferMode] = useState<'ownership' | 'location'>('ownership');

  const [equipCode, setEquipCode] = useState(prefilledEquipmentCode);
  const [persCode, setPersCode] = useState(prefilledPersonnelCode);

  // Physical Location target
  const [targetLocation, setTargetLocation] = useState('دفتر فنی مهندسی');
  const [customLocation, setCustomLocation] = useState('');

  // Document details 
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState('');

  // Active Draft / Permit Preview Modal
  const [showPermit, setShowPermit] = useState(false);

  // Common location presets for the workshop
  const locationPresets = [
    'دفتر فنی مهندسی',
    'بخش مدیریت مالی و اداری',
    'اتاق مانیتورینگ و سرور',
    'کانکس سرپرست کارگاه',
    'بخش ماشین‌آلات و ترابری',
    'کانکس نگهبانی ورودی اصلی',
    'انبار قطعات یدکی و سخت‌افزار',
    'بخش آزمون بتن و آزمایشگاه',
    'واحد HSE و ایمنی کارگاه',
    'خوابگاه پرسنل و مهندسین',
    'سایر موقعیت‌ها (تایپ دستی)'
  ];

  // Initialize doc details on load/mode switch
  useEffect(() => {
    if (!docDate) {
      setDocDate(getPersianDateString());
    }
    // Generate a beautiful unique permit number
    const prefix = transferMode === 'ownership' ? 'AZ-OWN-' : 'AZ-LOC-';
    const num = Math.floor(1000 + Math.random() * 9000);
    setDocNumber(`${prefix}${num}`);
  }, [transferMode]);

  const [matchedEquip, setMatchedEquip] = useState<{
    code: string;
    type: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio';
    typeNameFa: string;
    info: string;
    owner: string | null;
    location?: string;
    originalItem?: any;
  } | null>(null);

  const [matchedPers, setMatchedPers] = useState<Personnel | null>(null);

  // Memoized Autocomplete options for all equipment
  const equipmentOptions = useMemo<AutocompleteOption[]>(() => {
    const opts: AutocompleteOption[] = [];

    cases.forEach(c => {
      opts.push({
        value: c.code,
        label: `کیس - ${c.code}`,
        sublabel: `${c.motherboard} / ${c.cpu} / RAM: ${c.ramQty} - تحویل: ${c.assignedTo || 'انبار'}`,
        icon: '🖥️',
        searchTerms: [c.code, 'کیس', 'کیس کامپیوتر', c.motherboard, c.cpu, c.assignedTo || '']
      });
    });

    monitors.forEach(m => {
      opts.push({
        value: m.code,
        label: `مانیتور - ${m.code}`,
        sublabel: `${m.model || 'نامشخص'} - تحویل: ${m.assignedTo || 'انبار'}`,
        icon: '📺',
        searchTerms: [m.code, 'مانیتور', 'نمایشگر', m.model, m.assignedTo || '']
      });
    });

    printers.forEach(p => {
      opts.push({
        value: p.code,
        label: `پرینتر - ${p.code}`,
        sublabel: `${p.model || 'نامشخص'} - تحویل: ${p.assignedTo || 'انبار'}`,
        icon: '🖨️',
        searchTerms: [p.code, 'پرینتر', 'چاپگر', p.model, p.assignedTo || '']
      });
    });

    (mice || []).forEach(m => {
      opts.push({
        value: m.code,
        label: `ماوس - ${m.code}`,
        sublabel: `${m.model || 'نامشخص'} - تحویل: ${m.assignedTo || 'انبار'}`,
        icon: '🖱️',
        searchTerms: [m.code, 'ماوس', 'موس', m.model, m.assignedTo || '']
      });
    });

    (keyboards || []).forEach(k => {
      opts.push({
        value: k.code,
        label: `کیبورد - ${k.code}`,
        sublabel: `${k.model || 'نامشخص'} - تحویل: ${k.assignedTo || 'انبار'}`,
        icon: '⌨️',
        searchTerms: [k.code, 'کیبورد', 'صفحه کلید', k.model, k.assignedTo || '']
      });
    });

    (radios || []).forEach(r => {
      opts.push({
        value: r.code,
        label: `بیسیم - ${r.code}`,
        sublabel: `${r.model || 'نامشخص'} (${r.frequencyRange || ''}) - تحویل: ${r.assignedTo || 'انبار'}`,
        icon: '📻',
        searchTerms: [r.code, 'بیسیم', 'بی سیم', 'رادیو', r.model, r.assignedTo || '']
      });
    });

    return opts;
  }, [cases, monitors, printers, mice, keyboards, radios]);

  // Memoized Autocomplete options for personnel (can match code or name)
  const personnelOptions = useMemo<AutocompleteOption[]>(() => {
    return personnel.map(p => ({
      value: p.code,
      label: p.name,
      sublabel: `${p.title || ''} / ${p.department || ''} - محل: ${p.location || 'کارگاه'}`,
      icon: '👤',
      searchTerms: [p.code, p.name, p.title || '', p.department || '', p.location || '']
    }));
  }, [personnel]);

  // Memoized Autocomplete options for locations
  const locationOptions = useMemo<AutocompleteOption[]>(() => {
    const locsSet = new Set<string>();
    
    // Add presets except 'other'
    locationPresets.forEach(p => {
      if (p !== 'سایر موقعیت‌ها (تایپ دستی)') {
        locsSet.add(p);
      }
    });

    // Add personnel locations
    personnel.forEach(p => {
      if (p.location) locsSet.add(p.location);
    });

    // Add equipment locations
    cases.forEach(c => { if (c.location) locsSet.add(c.location); });
    monitors.forEach(m => { if (m.location) locsSet.add(m.location); });
    printers.forEach(p => { if (p.location) locsSet.add(p.location); });

    return Array.from(locsSet).map(l => ({
      value: l,
      label: l,
      icon: '📍',
      searchTerms: [l]
    }));
  }, [personnel, cases, monitors, printers, locationPresets]);

  // Sync with prefilled props
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
        typeNameFa: 'کیس کامپیوتر',
        info: `${foundCase.motherboard} | ${foundCase.cpu} | RAM: ${foundCase.ramQty} | VGA: ${foundCase.vga}`,
        owner: foundCase.assignedTo,
        location: foundCase.location,
        originalItem: foundCase
      });
      return;
    }

    // 2. Check Monitors
    const foundMonitor = monitors.find(m => m.code.toUpperCase() === code);
    if (foundMonitor) {
      setMatchedEquip({
        code: foundMonitor.code,
        type: 'monitor',
        typeNameFa: 'نمایشگر (مانیتور)',
        info: foundMonitor.model,
        owner: foundMonitor.assignedTo,
        location: foundMonitor.location,
        originalItem: foundMonitor
      });
      return;
    }

    // 3. Check Printers
    const foundPrinter = printers.find(p => p.code.toUpperCase() === code);
    if (foundPrinter) {
      setMatchedEquip({
        code: foundPrinter.code,
        type: 'printer',
        typeNameFa: 'چاپگر (پرینتر)',
        info: foundPrinter.model,
        owner: foundPrinter.assignedTo,
        location: foundPrinter.location,
        originalItem: foundPrinter
      });
      return;
    }

    // 4. Check Mice
    const foundMouse = mice.find(m => m.code.toUpperCase() === code);
    if (foundMouse) {
      setMatchedEquip({
        code: foundMouse.code,
        type: 'mouse',
        typeNameFa: 'ماوس رایانه',
        info: foundMouse.model,
        owner: foundMouse.assignedTo,
        location: foundMouse.location,
        originalItem: foundMouse
      });
      return;
    }

    // 5. Check Keyboards
    const foundKeyboard = keyboards.find(k => k.code.toUpperCase() === code);
    if (foundKeyboard) {
      setMatchedEquip({
        code: foundKeyboard.code,
        type: 'keyboard',
        typeNameFa: 'صفحه‌کلید (کیبورد)',
        info: foundKeyboard.model,
        owner: foundKeyboard.assignedTo,
        location: foundKeyboard.location,
        originalItem: foundKeyboard
      });
      return;
    }

    // 6. Check Radios
    const foundRadio = radios.find(r => r.code.toUpperCase() === code);
    if (foundRadio) {
      setMatchedEquip({
        code: foundRadio.code,
        type: 'radio',
        typeNameFa: 'بی‌سیم کارگاهی',
        info: `${foundRadio.model} ${foundRadio.frequencyRange ? `(${foundRadio.frequencyRange})` : ''}`,
        owner: foundRadio.assignedTo,
        location: foundRadio.location,
        originalItem: foundRadio
      });
      return;
    }

    setMatchedEquip(null);
  }, [equipCode, cases, monitors, printers, mice, keyboards, radios]);

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

  // Resolve current physical location of the equipment
  const getCurrentPhysicalLocation = (): string => {
    if (!matchedEquip) return '';
    if (matchedEquip.location) return matchedEquip.location;
    if (matchedEquip.owner) {
      const p = personnel.find(user => user.code === matchedEquip.owner);
      if (p && p.location) return p.location;
    }
    return matchedEquip.type === 'radio' ? 'انبار مرکزی سخت‌افزار' : 'انبار کارگاه بوشهر';
  };

  // Get active selected destination location
  const getSelectedDestinationLocation = (): string => {
    if (targetLocation === 'سایر موقعیت‌ها (تایپ دستی)') {
      return customLocation.trim() || 'نامشخص فیزیکی';
    }
    return targetLocation;
  };

  // Run final database save of ownership transfer
  const submitFinalOwnershipTransfer = async () => {
    if (!matchedEquip) return;
    try {
      const isRet = !persCode.trim();
      const codeToAssign = isRet ? null : persCode.trim();
      
      await onTransfer(matchedEquip.code, codeToAssign, docNumber, docDate);
      
      setShowPermit(false);
      setEquipCode('');
      setPersCode('');
      alert(`سند انتقال مالکیت شماره ${docNumber} با موفقیت ثبت نهایی شد و در کارتابل پرسنل بروزرسانی گردید.`);
    } catch (e) {
      alert('خطا در ثبت نهایی سند انتقال.');
    }
  };

  // Run final database save of location transfer
  const submitFinalLocationTransfer = async () => {
    if (!matchedEquip || !onLocationTransfer) return;
    try {
      const destLoc = getSelectedDestinationLocation();
      await onLocationTransfer(matchedEquip.code, destLoc, docNumber, docDate);

      setShowPermit(false);
      setEquipCode('');
      setCustomLocation('');
      alert(`سند جابجایی مکانی فیزیکی شماره ${docNumber} با موفقیت ثبت نهایی شد و موقعیت دستگاه تغییر یافت.`);
    } catch (e) {
      alert('خطا در ثبت نهایی جابجایی مکانی.');
    }
  };

  // Prepare & download CSV/Excel file of this permit
  const exportPermitToExcel = () => {
    if (!matchedEquip) return;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'سند ابلاغیه انتقال و جابجایی کالا و تجهیزات ICT کارگاه بوشهر\n';
    csvContent += `شماره سند,${docNumber}\n`;
    csvContent += `تاریخ ثبت,${docDate}\n`;
    csvContent += `نوع عملیات جابجایی,${transferMode === 'ownership' ? 'واگذاری و تغییر مالکیت پرسنلی' : 'جابجایی موقعیت فیزیکی مکانی'}\n`;
    csvContent += '\n';
    csvContent += 'مشخصات سخت افزار,کد اموال,مبداء قبلی,مقصد نهایی,موقعیت فیزیکی جدید,وضعیت امضاء\n';

    const equipTypeStr = matchedEquip.typeNameFa;
    const equipSpecs = matchedEquip.info.replace(/,/g, ' - ');
    const srcStr = matchedEquip.owner 
      ? `${personnel.find(p => p.code === matchedEquip.owner)?.name || 'نامشخص'} (${matchedEquip.owner})` 
      : 'انبار کارگاه بوشهر';

    let destStr = '';
    let locStr = '';

    if (transferMode === 'ownership') {
      destStr = matchedPers ? `${matchedPers.name} (${matchedPers.code})` : 'عودت به انبار کارگاه';
      locStr = matchedPers ? matchedPers.location : 'انبار مرکزی سخت‌افزار';
    } else {
      destStr = matchedEquip.owner ? `دارای واگذارنده: ${personnel.find(p => p.code === matchedEquip.owner)?.name || matchedEquip.owner}` : 'بدون تحویل‌گیرنده فردی';
      locStr = getSelectedDestinationLocation();
    }

    csvContent += `"${equipTypeStr} [${equipSpecs}]","${matchedEquip.code}","${srcStr}","${destStr}","${locStr}","تایید دیجیتال واحد ICT"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `Permit_${docNumber}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentPhysLoc = getCurrentPhysicalLocation();

  return (
    <div className="space-y-6">
      
      {/* Dynamic printing style sheet used to isolate and print only the permit card inside browser */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-permit-layout, #print-permit-layout * {
            visibility: visible !important;
          }
          #print-permit-layout {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            direction: rtl !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Mode selectors */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full max-w-xl mx-auto shadow-inner no-print">
        <button
          onClick={() => { setTransferMode('ownership'); setShowPermit(false); }}
          className={`flex-1 transition duration-150 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            transferMode === 'ownership'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>👤</span> ۱. جابجایی مالکیت و تحویل سخت‌افزار
        </button>
        <button
          onClick={() => { setTransferMode('location'); setShowPermit(false); }}
          className={`flex-1 transition duration-150 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            transferMode === 'location'
              ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📍</span> ۲. جابجایی موقعیت فیزیکی و مکانی
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start no-print">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {transferMode === 'ownership' ? '🔄 سند انتقال مالکیت و واگذاری تجهیز' : '📍 سند جابجایی فیزیکی موقعیت کالا'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {transferMode === 'ownership' 
                  ? 'ثبت و واگذاری تجهیزات بین پرسنل آذرستان همراه با صدور برگه ترخیص محلی' 
                  : 'اصلاح موقعیت فیزیکی استقرار کالا در سطح کارگاه و ثبت مجوز تردد فیزیکی'}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              transferMode === 'ownership' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {transferMode === 'ownership' ? 'تغییر مالکیت' : 'تغییر موقعیت'}
            </span>
          </div>

          <div className="space-y-2">
              <label className="text-xs md:text-sm font-semibold text-slate-700 block">
                کد اموال سخت‌افزار مورد جابجایی:
              </label>
              <AutocompleteInput 
                value={equipCode}
                onChange={setEquipCode}
                options={equipmentOptions}
                placeholder="مثال: C-201, M-301, P-401, MOU-101, KEY-201, R-101..."
              />
            </div>

            {/* Live Preview Equipment */}
            {matchedEquip && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs md:text-sm space-y-2.5">
                <div className="text-blue-700 font-bold flex items-center gap-1">
                  <span>🖥️</span> مشخصات سخت‌افزار شناسایی شده:
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>کد اموال: <span className="font-mono font-bold text-slate-900">{matchedEquip.code}</span></div>
                  <div>نوع در شناسایی: <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">{matchedEquip.typeNameFa}</span></div>
                  <div className="col-span-2">مشخصات/مدل فنی: <span className="text-slate-900 font-medium">{matchedEquip.info}</span></div>
                  <div className="col-span-2 border-t border-slate-200/50 pt-2 flex flex-col gap-1 text-[11px] md:text-xs">
                    <div>👤 دارنده فعلی: {matchedEquip.owner ? (
                      <span className="text-red-600 font-bold">👤 {personnel.find(p => p.code === matchedEquip.owner)?.name || matchedEquip.owner} ({matchedEquip.owner})</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">📦 مستقر در انبار کارگاه (بدون مالک فردی)</span>
                    )}</div>
                    <div className="mt-1">📍 موقعیت فیزیکی فعلی کالا: <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-bold">{currentPhysLoc}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Ownership Destination */}
            {transferMode === 'ownership' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs md:text-sm font-semibold text-slate-700 block">
                  کد پرسنلی تحویل‌گیرنده جدید (مقصد مالکیت):
                </label>
                <AutocompleteInput 
                  value={persCode}
                  onChange={setPersCode}
                  options={personnelOptions}
                  placeholder="کد پرسنلی کاربر مقصد واگذاری جدید..."
                />
                <p className="text-[11px] text-slate-400">توجه: در صورتی که تمایل به بازگرداندن رسمی این کالا به موجودی آزاد انبار را دارید، این بخش را خالی بگذارید.</p>

                {/* Live Preview Personnel */}
                {matchedPers && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs md:text-sm space-y-2.5 mt-2 animate-fade-in">
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <span>👤</span> مشخصات پرسنل تحویل‌گیرنده مقصد:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>نام کامل: <span className="font-bold text-slate-900">{matchedPers.name}</span></div>
                      <div>کد پرسنلی: <span className="font-mono text-slate-900">{matchedPers.code}</span></div>
                      <div>واحد خدمتی: <span className="text-slate-900">{matchedPers.department}</span></div>
                      <div>سمت سازمانی: <span className="text-slate-900">{matchedPers.title}</span></div>
                      <div className="col-span-2 text-slate-500 text-[11px]">محل استقرار پیش‌فرض کاربر: <span className="text-blue-700 font-semibold">{matchedPers.location}</span></div>
                    </div>
                  </div>
                )}
                {!matchedPers && persCode.trim() && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs">
                     پرسنلی با کد "{persCode}" یافت نشد. در صورت عدم اصلاح، انتقال به انبار کارگاه تلقی خواهد شد.
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Location Destination */}
            {transferMode === 'location' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs md:text-sm font-semibold text-slate-700 block">
                  موقعیت مکانی فیزیکی مقصد (نقطه استقرار یا محل نصب جدید کالا):
                </label>
                <select
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-blue-500 focus:outline-none dark:text-slate-100"
                >
                  {locationPresets.map((preset, idx) => (
                    <option key={idx} value={preset}>{preset}</option>
                  ))}
                </select>

                {targetLocation === 'سایر موقعیت‌ها (تایپ دستی)' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[11px] text-slate-500 font-bold block">موقعیت فیزیکی سفارشی جدید را تایپ کنید:</label>
                    <AutocompleteInput 
                      value={customLocation}
                      onChange={setCustomLocation}
                      options={locationOptions}
                      placeholder="مانند: اتاق حسابداری کانکس ۲، مانیتورینگ کارگاه ماشین آلات و ..."
                    />
                  </div>
                )}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl text-[11px] md:text-xs">
                  <span>ℹ️</span> <strong>انتقال مکانی فیزیکی:</strong> سخت‌افزار از لحاظ پرونده اموال همچنان به نام تحویل‌گیرنده قبلی باقی مانده اما لوکیشن استقرار آن به مقصد انتخابی تغییر یافته و مجوز تردد ترافیکی آن به نگهبانی ابلاغ خواهد شد.
                </div>
              </div>
            )}

            {/* Draft / Issue Permit button */}
            <div className="pt-3 border-t border-dashed border-slate-100">
              <button
                onClick={() => {
                  if (!matchedEquip) {
                    alert('ابتدا کد اموال سخت‌افزار معتبری وارد نمایید.');
                    return;
                  }
                  if (transferMode === 'ownership' && !persCode.trim() && !window.confirm('کادر کد پرسنلی مقصد خالی است. این کار تجهیز را به "انبار مرکزی کارگاه" باز می‌گرداند. ادامه می‌دهید؟')) {
                    return;
                  }
                  setShowPermit(true);
                }}
                disabled={!matchedEquip}
                className={`w-full p-3 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                  matchedEquip 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>📄</span> پیش‌نویس و صدور رسمی مجوز جابجایی سخت‌افزار
              </button>
            </div>

          </div>

        {/* Right Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 self-start space-y-4 shadow-sm no-print">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1">
             دستورالعمل نظارتی نقل و انتقالات کارگاه بوشهر
          </h4>
          <div className="text-xs text-slate-600 leading-relaxed space-y-3">
            <div className="p-2.5 bg-white rounded-lg border border-slate-100">
              <span className="font-bold text-blue-700 block mb-0.5">১. مجوز تردد گیت نگهبانی:</span>
              خروج هرگونه کالای رایانه‌ای، بی‌سیم یا اداری از محدوده و فنس‌های فیزیکی کارگاه منوط به رویت برگه پرینت شده این سیستم ممهور به امضای سرپرست ICT می‌باشد.
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-100">
              <span className="font-bold text-orange-700 block mb-0.5">۲. تعیین توالی اسناد:</span>
              شماره مجوزها به صورت خودکار و بر اساس الگوی ایمن شرکت عمران آذرستان تنظیم می‌شوند؛ از ویرایش سلیقه‌ای شماره‌ها مگر طبق دستورالعمل خودداری کنید.
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-100">
              <span className="font-bold text-emerald-800 block mb-0.5">۳. جابجایی ترابری و ابزار آلات:</span>
              در جابجایی مکانی، فیلد لوکیشن کالا تغییر کرده و در تمامی خروجی‌ها و لیست‌ها قابل پیگیری است.
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center font-semibold">
            مدیریت لجستیک شناسنامه ICT - شرکت عمران آذرستان
          </div>
        </div>

      </div>

      {/* --- OFFICIAL MOVE PERMIT PREVIEW & MODAL --- */}
      {showPermit && matchedEquip && (
        <div className="bg-slate-100 border border-slate-300 rounded-2xl p-6 shadow-md space-y-6 animate-fade-in relative">
          
          <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm no-print">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">پیش‌نویس نهایی سند رسمی جابجایی</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">لطفاً پیش از تایید نهایی و به‌روزرسانی سیستم، نسخه مورد نیاز را چاپ یا اکسل بگیرید.</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={exportPermitToExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                📥 خروجی اکسل (CSV)
              </button>
              <button
                onClick={() => window.print()}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                🖨️ چاپ مجوز فیزیکی (PDF)
              </button>
              <button
                onClick={() => setShowPermit(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition border border-slate-300/45"
              >
                بستن پیش‌نویس
              </button>
            </div>
          </div>

          {/* THE PRINTABLE FORMAL PERMIT */}
          <div 
            id="print-permit-layout"
            className="bg-white border-2 border-double border-slate-800 p-8 rounded-lg shadow-sm text-slate-900 font-sans mx-auto max-w-4xl tracking-tight leading-relaxed text-right relative"
          >
            {/* Watermark Logo styling or background badge */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-8xl font-black rotate-12">AZARESTAN</span>
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              {/* Right side Metadata */}
              <div className="space-y-1">
                <h1 className="text-base font-black text-slate-900">شرکت عمران آذرستان</h1>
                <p className="text-xs font-medium text-slate-600">پروژه احداث و تجهیزات کارگاه بوشهر</p>
                <p className="text-[11px] text-slate-500">واحد مدیریت فناوری اطلاعات و لجستیک سخت‌افزاری</p>
              </div>

              {/* Center Title */}
              <div className="text-center self-center bg-slate-50 border border-slate-400/70 px-6 py-2 rounded-lg">
                <span className="text-xs text-slate-500 block mb-0.5">بسمه تعالی</span>
                <span className="text-sm md:text-base font-bold text-slate-900">
                  {transferMode === 'ownership' ? 'برگه ابلاغ ترخیص و واگذاری مالکیت تجهیز' : 'مجوز جابجایی مکانی میزکار کارگاهی کالا'}
                </span>
              </div>

              {/* Left Side Details */}
              <div className="text-left space-y-1 text-xs font-bold font-mono">
                <div>شماره سند: <span className="text-slate-800 text-sm font-semibold">{docNumber}</span></div>
                <div>تاریخ صدور: <span className="text-slate-800 text-sm font-semibold">{docDate}</span></div>
                <div className="text-[10px] text-slate-400 font-sans">طبقه بندی: محرمانه داخلی</div>
              </div>
            </div>

            {/* Introductory Text */}
            <p className="my-5 text-xs text-slate-800 leading-6">
              بدینوسیله به پیوست این سند، مشخصات سخت‌افزار/کالای مشروح در ذیل که در تملک معنوی پروژه بوشهر می‌باشد، تایید می‌گردد جهت مصارف کارگاهی طبق ضوابط مالی و اداری، از مبدأ اول به مقصد دوم انتقال، ردیابی فیزیکی یا تغییر مالکیت یابد. دستور است واحد نگهبانی نسبت به تردد آن همکاری لازم بعمل آورد.
            </p>

            {/* Core Item Details Table */}
            <div className="border border-slate-700/80 overflow-hidden rounded mb-6">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-700 text-slate-900 text-[11px]">
                    <th className="p-2 border-l border-slate-700 font-black">کالای سخت‌افزار</th>
                    <th className="p-2 border-l border-slate-700 font-black">کد اموال امانت</th>
                    <th className="p-2 border-l border-slate-700 font-black">مشخصات فنی و مدل کالا</th>
                    <th className="p-2 border-l border-slate-700 font-black bg-orange-50/50">شرایط مبدأ (تحویل‌دهنده فیزیکی)</th>
                    <th className="p-2 bg-emerald-50/50 font-black">شرایط مقصد (تحویل‌گیرنده نهایی جدید)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="p-2.5 border-l border-slate-700 font-bold text-slate-900">
                      {matchedEquip.typeNameFa} 🖥️
                    </td>
                    <td className="p-2.5 border-l border-slate-700 font-mono font-bold text-sm text-slate-900">
                      {matchedEquip.code}
                    </td>
                    <td className="p-2.5 border-l border-slate-700 text-slate-700 font-mono text-[11px]">
                      {matchedEquip.info}
                    </td>
                    <td className="p-2.5 border-l border-slate-700 text-slate-800 bg-orange-50/30 font-medium">
                      <div className="space-y-1">
                        <div>نام: {matchedEquip.owner ? (personnel.find(p => p.code === matchedEquip.owner)?.name || 'نامشخص') : 'انبار آزاد'}</div>
                        <div className="text-[10px] text-slate-500">کد: {matchedEquip.owner || 'W-HOUSE'}</div>
                        <div className="text-[10px] text-slate-600 font-bold">موقعیت شروع: {currentPhysLoc}</div>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-800 bg-emerald-50/30 font-medium">
                      {transferMode === 'ownership' ? (
                        <div className="space-y-1">
                          {matchedPers ? (
                            <>
                              <div className="font-bold text-slate-900">تحویل به: {matchedPers.name}</div>
                              <div className="text-[10px] text-slate-500">کد پرسنلی: {matchedPers.code}</div>
                              <div className="text-[10px] text-slate-600 font-bold">موقعیت مقصد: {matchedPers.location}</div>
                            </>
                          ) : (
                            <span className="text-emerald-700 font-bold block">عودت به موجودی انبار بوشهر 📦</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-neutral-500">مسئول پرونده: {matchedEquip.owner ? personnel.find(p => p.code === matchedEquip.owner)?.name : 'انبار بوشهر'}</div>
                          <div className="text-xs text-emerald-800 font-black">موقعیت مکار مقصد جدید: {getSelectedDestinationLocation()} 📍</div>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures Panel */}
            <div className="mt-8 border-t border-slate-300 pt-6">
              <div className="grid grid-cols-4 gap-4 text-center text-xs text-slate-700 font-bold">
                <div className="space-y-10 border-l border-slate-200">
                  <span>امضاء تحویل‌دهنده کالا</span>
                  <div className="text-[10px] text-slate-400 font-normal">نام و امضاء تاریخ</div>
                </div>
                <div className="space-y-10 border-l border-slate-200">
                  <span>تایید ناظر گیت نگهبانی کارگاه</span>
                  <div className="text-[10px] text-slate-400 font-normal">واحد حفاظت فیزیکی ورودی</div>
                </div>
                <div className="space-y-10 border-l border-slate-200">
                  <span>تایید سرپرستی ICT کارگاه</span>
                  <div className="text-[10px] text-blue-900 font-bold font-mono">تایید شد - مهدی اسماعیلی</div>
                </div>
                <div className="space-y-10">
                  <span>امضاء تحویل‌گیرنده اصلی</span>
                  <div className="text-[10px] text-slate-400 font-normal">اعمال در سیستم کارتابل اموال</div>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-10 pt-4 border-t border-dashed border-slate-300 text-[9px] text-slate-400 text-center flex justify-between items-center no-print">
              <span>برنامه مدیریت دارایی شرکت عمران آذرستان - نسخه وبسایت کارپوشه کارپورت بوشهر</span>
              <span>کد رهگیری امنیتی سند: Hash-{docNumber}-{docDate.replace(/\//g, '')}</span>
            </div>

          </div>

          {/* Action Execution Button */}
          <div className="flex justify-center pt-3 no-print">
            <button
              onClick={transferMode === 'ownership' ? submitFinalOwnershipTransfer : submitFinalLocationTransfer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <span>✔️</span> تایید نهایی سند و ثبت قطعی جابجایی در پایگاه داده کارگاه
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
