import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, CheckCircle, Tag, User, Layers, Info } from 'lucide-react';
import { Personnel, Case, Monitor, Printer as PrinterType, Mouse, Keyboard } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentCode: string;
  equipmentType: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard';
  equipmentData: Case | Monitor | PrinterType | Mouse | Keyboard | null;
  personnel: Personnel[];
}

export default function QRCodeModal({
  isOpen,
  onClose,
  equipmentCode,
  equipmentType,
  equipmentData,
  personnel,
}: QRCodeModalProps) {
  if (!isOpen || !equipmentCode || !equipmentData) return null;

  // Find owner/assigned person
  const owner = personnel.find((p) => p.code === equipmentData.assignedTo);

  // Helper translations for Farsi types
  const getFarsiType = (type: string) => {
    switch (type) {
      case 'case':
        return 'کیس رایانه‌ای';
      case 'monitor':
        return 'نمایشگر (مانیتور)';
      case 'printer':
        return 'پرینتر/چاپگر';
      case 'mouse':
        return 'ماوس جانبی';
      case 'keyboard':
        return 'کیبورد جانبی';
      default:
        return 'سخت‌افزار';
    }
  };

  // Build the QR code string payload
  // We can serialize as JSON or write a user-friendly text that scanners immediately read cleanly
  const qrString = `[عمران آذرستان - واحد ICT]
کد اموال: ${equipmentCode}
نوع سخت‌افزار: ${getFarsiType(equipmentType)}
مشخصات: ${'model' in equipmentData ? (equipmentData as any).model : `${(equipmentData as Case).cpu} | ${(equipmentData as Case).motherboard} | ${(equipmentData as Case).power || '—'}`}
وضعیت تحویل: ${owner ? `تحویل به ${owner.name} (${owner.code})` : 'مستقر در انبار کارگاه'}`;

  // Helper to convert to Persian digits
  const toPersianNum = (num: string | number) => {
    const poms = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/[0-9]/g, (w) => poms[parseInt(w)]);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div
      id="qr-code-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 font-sans"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        id="qr-modal-dialog"
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200/80 shadow-2xl overflow-hidden relative transition-all transform scale-100 flex flex-col no-print"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header decor */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Tag size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black">بارکد هوشمند اموال (QR Code)</h3>
              <p className="text-[10px] text-slate-400">شناسایی سریع در انبار و کارگاه بوشهر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition duration-150 p-1 rounded-full hover:bg-slate-800/80 cursor-pointer"
            title="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Visual interactive QR code center card */}
          <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-inner relative">
            <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-md">
              <QRCodeSVG
                value={qrString}
                size={160}
                level="Q"
                includeMargin={false}
                fgColor="#0f172a" // Deep slate
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 px-3 py-1 rounded-full mt-3.5 tracking-wider select-all transition">
              {equipmentCode}
            </span>
          </div>

          {/* Details Specifications Grid */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Info size={13} className="text-slate-400" />
              مشخصات و مکان‌یابی سخت‌افزار
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">دسته‌بندی تجهیز</span>
                <span className="text-slate-800 font-bold flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {getFarsiType(equipmentType)}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] block mb-0.5 font-medium">کد اموال ICT</span>
                <span className="text-slate-800 font-mono font-black">{equipmentCode}</span>
              </div>
            </div>

            {/* Spec details depending on category */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <span className="text-slate-400 text-[10px] block mb-1 font-medium">مشخصات اصلی دستگاه</span>
              {equipmentType === 'case' ? (
                <div className="space-y-1.5 text-slate-800 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">مادربورد:</span>
                    <span className="font-bold">{(equipmentData as Case).motherboard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">پردازنده (CPU):</span>
                    <span className="font-bold">{(equipmentData as Case).cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">حافظه رم:</span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100">
                      {(equipmentData as Case).ramType} - {(equipmentData as Case).ramQty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">منبع تغذیه (پاور):</span>
                    <span className="font-bold font-mono">{(equipmentData as Case).power || "—"}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                    <span>ذخیره‌سازی HDD-SSD:</span>
                    <span>{(equipmentData as Case).hdd1} | {(equipmentData as Case).hdd2}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-800 font-bold">
                  {(equipmentData as any).model || 'فاقد مشخصات تفصیلی'}
                </div>
              )}
            </div>

            {/* Deliverer location info */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs flex items-center gap-2.5">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-slate-400 text-[10px] block font-medium">تحویل گیرنده فعلی</span>
                {owner ? (
                  <div className="text-slate-800 font-bold truncate">
                    {owner.name} <span className="font-mono text-slate-500 text-[11px]">({owner.code})</span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      واحد: {owner.department} | موقعیت: {owner.location}
                    </span>
                  </div>
                ) : (
                  <div className="text-amber-700 font-bold flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    موجود در انبار تجهیزات اصلی کارگاه بوشهر
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-150 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            بستن پنجره
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            <Printer size={14} />
            <span>چاپ برچسب اموال کارگاه</span>
          </button>
        </div>
      </div>

      {/* RENDER DEDICATED PRINTABLE DOCUMENT IN MAIN DOM SO THAT IT CAN BE CAUGHT BY MEDIA PRINT RULES WITHOUT INTERFERENCE */}
      <div className="printable-document hidden print:block bg-white p-6 font-sans border-2 border-black rounded-lg max-w-[280px] text-right" style={{ width: '280px', height: '170px', direction: 'rtl' }}>
        <div className="flex gap-3 h-full items-center">
          {/* Logo & Content details */}
          <div className="flex-1 flex flex-col justify-between h-full text-[9px] text-black">
            <div>
              <div className="font-black text-[10px] border-b border-black pb-0.5 mb-1 text-slate-900 leading-tight">
                برچسب اموال واحد ICT
              </div>
              <div className="font-bold text-black flex justify-between">
                <span>دستگاه:</span>
                <span>{getFarsiType(equipmentType).slice(0, 15)}</span>
              </div>
              <div className="font-bold text-black flex justify-between mt-0.5">
                <span>کد اموال:</span>
                <span className="font-mono text-[10px]">{equipmentCode}</span>
              </div>
              <div className="font-bold text-black flex justify-between mt-0.5 truncate">
                <span>تحویل به:</span>
                <span>{owner ? owner.name.slice(0, 18) : 'انبار کارگاه'}</span>
              </div>
            </div>
            
            <div className="text-[7px] text-slate-500 font-mono mt-2 border-t border-dashed border-black pt-1 leading-none">
              عمران آذرستان - کارگاه بوشهر (۱۴۰۵)
            </div>
          </div>

          {/* QR Code Graphic Column */}
          <div className="w-[85px] h-[85px] border border-slate-400 p-1 bg-white rounded flex items-center justify-center shrink-0">
            <QRCodeSVG
              value={qrString}
              size={75}
              level="Q"
              includeMargin={false}
              fgColor="#000000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
