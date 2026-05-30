import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Search, CheckSquare, Square, RefreshCcw, Minus, Plus, Settings } from 'lucide-react';
import { Case, Monitor, Printer as PrinterType, Mouse, Keyboard, Personnel } from '../types';

interface BulkQRTabProps {
  cases: Case[];
  monitors: Monitor[];
  printers: PrinterType[];
  mice: Mouse[];
  keyboards: Keyboard[];
  personnel: Personnel[];
}

interface PrintableItem {
  id: string;
  type: string;
  categoryName: string;
  code: string;
  brand: string;
  model: string;
  assignedToName: string;
  assignedToCode: string;
}

export default function BulkQRTab({ cases, monitors, printers, mice, keyboards, personnel }: BulkQRTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [barcodeSize, setBarcodeSize] = useState<number>(100); // Default size 100px

  // Map personnels for quick assignee lookup
  const personnelMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    personnel.forEach(p => {
      map[p.code] = p.name;
    });
    return map;
  }, [personnel]);

  // Consolidate all physical equipment assets with valid asset codes that are printable
  const allHardwares = useMemo(() => {
    const list: PrintableItem[] = [];

    // Cases
    cases.forEach(c => {
      list.push({
        id: `case_${c.code}`,
        type: 'case',
        categoryName: '💻 کیس کارگاه',
        code: c.code,
        brand: c.motherboard || 'Intel/AMD',
        model: c.cpu || '—',
        assignedToName: c.assignedTo ? (personnelMap[c.assignedTo] || 'نامشخص') : 'موجود در انبار',
        assignedToCode: c.assignedTo || ''
      });
    });

    // Monitors
    monitors.forEach(m => {
      list.push({
        id: `monitor_${m.code}`,
        type: 'monitor',
        categoryName: '📺 مانیتور سیستم',
        code: m.code,
        brand: 'سخت‌افزار',
        model: m.model || '—',
        assignedToName: m.assignedTo ? (personnelMap[m.assignedTo] || 'نامشخص') : 'موجود در انبار',
        assignedToCode: m.assignedTo || ''
      });
    });

    // Printers
    printers.forEach(p => {
      list.push({
        id: `printer_${p.code}`,
        type: 'printer',
        categoryName: '🖨️ چاپگر تحویلی',
        code: p.code,
        brand: 'چاپگر',
        model: p.model || '—',
        assignedToName: p.assignedTo ? (personnelMap[p.assignedTo] || 'نامشخص') : 'موجود در انبار',
        assignedToCode: p.assignedTo || ''
      });
    });

    // Mice
    mice.forEach(m => {
      list.push({
        id: `mouse_${m.code}`,
        type: 'mouse',
        categoryName: '🖱️ ماوس زاپاس',
        code: m.code,
        brand: 'لوازم جانبی',
        model: m.model || '—',
        assignedToName: m.assignedTo ? (personnelMap[m.assignedTo] || 'نامشخص') : 'موجود در انبار',
        assignedToCode: m.assignedTo || ''
      });
    });

    // Keyboards
    keyboards.forEach(k => {
      list.push({
        id: `keyboard_${k.code}`,
        type: 'keyboard',
        categoryName: '⌨️ کیبورد اداری',
        code: k.code,
        brand: 'لوازم جانبی',
        model: k.model || '—',
        assignedToName: k.assignedTo ? (personnelMap[k.assignedTo] || 'نامشخص') : 'موجود در انبار',
        assignedToCode: k.assignedTo || ''
      });
    });

    return list;
  }, [cases, monitors, printers, mice, keyboards, personnelMap]);

  // Apply filters and searches
  const filteredHardwares = useMemo(() => {
    return allHardwares.filter(item => {
      const matchSearch = 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'all' || item.type === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [allHardwares, searchTerm, selectedCategory]);

  const handleToggleSelect = (codeId: string) => {
    const updated = new Set(selectedCodes);
    if (updated.has(codeId)) {
      updated.delete(codeId);
    } else {
      updated.add(codeId);
    }
    setSelectedCodes(updated);
  };

  const handleSelectAllFiltered = () => {
    const updated = new Set(selectedCodes);
    filteredHardwares.forEach(item => {
      updated.add(item.id);
    });
    setSelectedCodes(updated);
  };

  const handleDeselectAllFiltered = () => {
    const updated = new Set(selectedCodes);
    filteredHardwares.forEach(item => {
      updated.delete(item.id);
    });
    setSelectedCodes(updated);
  };

  const handleResetAll = () => {
    setSelectedCodes(new Set());
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const handlePrint = () => {
    if (selectedCodes.size === 0) {
      alert('لطفاً ابتدا حداقل یک کالا را جهت چاپ بارکد انتخاب نمایید.');
      return;
    }
    // Launch print window
    window.print();
  };

  // Extract selected hardware structures for printing
  const selectedItemsToPrint = useMemo(() => {
    return allHardwares.filter(item => selectedCodes.has(item.id));
  }, [allHardwares, selectedCodes]);

  return (
    <div className="space-y-6 leading-relaxed text-right font-sans select-none" dir="rtl">
      
      {/* 1. Header Options Board (Hides completely in Print Mode) */}
      <div className="no-print bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-black">پنل چاپ گروهی برچسب‌های بارکد هوشمند کالا</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium">امکان انتخاب دسته‌ای اموال، تنظیم زنده ابعاد بارکد و دریافت چاپی دقیق با قالب استاندارد</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={selectedCodes.size === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/15 flex items-center gap-2 cursor-pointer transition duration-200"
            >
              <Printer size={15} />
              <span>چاپ گروهی برچسب‌ها ({selectedCodes.size} عدد)</span>
            </button>
            <button
              onClick={handleResetAll}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center gap-1.5"
            >
              <RefreshCcw size={13} />
              <span>پاکسازی انتخاب‌ها</span>
            </button>
          </div>
        </div>

        {/* 2. Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">جستجوی سریع کالا / اموال:</label>
            <input
              type="text"
              placeholder="بر اساس کد اموال، مدل، شخص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-right p-2.5 bg-slate-50 border border-slate-250 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none pr-9"
            />
            <Search className="absolute bottom-3 right-3 text-slate-400 size-4" />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">دسته‌بندی سخت‌افزار:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-lg text-xs md:text-sm font-bold"
            >
              <option value="all">📁 همه سخت‌افزارهای سامانه</option>
              <option value="case">🖥️ کیس‌های کارگاهی</option>
              <option value="monitor">📺 مانیتور سیستم‌ها</option>
              <option value="printer">🖨️ پرینترها و چندکاره</option>
              <option value="mouse">🖱️ ماوس‌ها</option>
              <option value="keyboard">⌨️ کیبوردها</option>
            </select>
          </div>

          {/* Dynamic Slider size adjustment */}
          <div className="md:col-span-2 bg-blue-50/20 border border-blue-100 p-3 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Settings className="text-blue-500 size-4 shrink-0" />
              <div>
                <span className="text-xs font-black block text-slate-800">تنظیم ابعاد بارکد (QR Code):</span>
                <span className="text-[10px] text-slate-400 font-medium">سایز خروجی: <strong className="font-mono text-blue-650">{barcodeSize}px</strong></span>
              </div>
            </div>
            
            <div className="flex items-center gap-3-3">
              <button 
                onClick={() => setBarcodeSize(prev => Math.max(60, prev - 10))} 
                className="bg-white border rounded shadow p-1 hover:bg-slate-50 font-bold col cursor-pointer"
                title="کوچک‌تر کردن"
              >
                <Minus size={13} />
              </button>
              
              <input
                type="range"
                min="60"
                max="240"
                step="10"
                value={barcodeSize}
                onChange={(e) => setBarcodeSize(Number(e.target.value))}
                className="w-40 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />

              <button 
                onClick={() => setBarcodeSize(prev => Math.min(240, prev + 10))} 
                className="bg-white border rounded shadow p-1 hover:bg-slate-50 font-bold col cursor-pointer"
                title="بزرگ‌تر کردن"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* 3. List of Items */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-250 p-3 flex justify-between items-center text-xs text-slate-500 font-bold">
            <div>
              <span>نمایش {filteredHardwares.length} کالا بر اساس فیلترهای بالا</span>
              <span className="mr-2 text-blue-600">({selectedCodes.size} مورد انتخاب شده)</span>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckSquare size={13} />
                <span>کل این لیست</span>
              </button>
              <button
                type="button"
                onClick={handleDeselectAllFiltered}
                className="text-red-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Square size={13} />
                <span>حذف انتخاب این لیست</span>
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filteredHardwares.length === 0 ? (
              <p className="text-center text-slate-400 py-10">❌ هیچ سخت‌افزاری بر اساس فیلترهای گشته شده یافت نشد.</p>
            ) : (
              filteredHardwares.map(item => {
                const isSelected = selectedCodes.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`p-3 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition ${isSelected ? 'bg-blue-50/15 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-slate-350 bg-white'}`}>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.brand} {item.model}</span>
                          <span className="bg-slate-100 p-0.5 px-2 rounded-full text-[10px] text-slate-650 font-bold border border-slate-205">{item.categoryName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex gap-4 font-medium">
                          <span>کد اموال: <strong className="font-mono text-slate-800 font-bold">{item.code}</strong></span>
                          <span>وضعیت تحویل: <strong className="text-slate-850 font-bold">{item.assignedToName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="no-print">
                      <QRCodeSVG
                        value={`ITEM|${item.type}|${item.code}`}
                        size={30}
                        level="M"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 4. Display of Labels for Print Preview (Shows both on screen as live preview, and prints cleanly) */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 no-print">
        <h4 className="text-xs md:text-sm font-black text-slate-800 flex items-center gap-1.5 border-b pb-2">
          <span>👀 پیش‌نمایش برچسب‌های چاپی قبل از پرینت (Live Label Layout)</span>
        </h4>
        
        {selectedItemsToPrint.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-slate-400 font-medium">
            💡 برای دیدن پیش‌نمایش زنده چیدمان برچسب‌ها، ابتدا کالاهای مورد نظر را تیک بزنید.
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-inner border border-slate-200 overflow-x-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selectedItemsToPrint.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border-2 border-slate-350 dark:border-slate-600 rounded-xl p-3 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-sm"
                  style={{ minHeight: `${barcodeSize + 90}px` }}
                >
                  {/* Category Header label */}
                  <div className="bg-slate-100 w-full text-[9px] font-black py-0.5 rounded text-slate-600 mb-2 truncate">
                    {item.categoryName.split(' ')[1]}
                  </div>

                  {/* QR SVG */}
                  <div className="flex items-center justify-center p-1 bg-white border border-slate-100 rounded">
                    <QRCodeSVG
                      value={`ITEM|${item.type}|${item.code}`}
                      size={barcodeSize}
                      level="H"
                    />
                  </div>

                  {/* Brand and Model Details */}
                  <div className="mt-2.5 space-y-0.5 w-full">
                    <span className="font-mono block text-[10px] font-black text-slate-900 tracking-wider select-all" style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '3px' }}>
                      {item.code}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 block truncate max-w-full">
                      {item.brand} {item.model}
                    </span>
                    <span className="text-[8px] font-medium text-slate-400 block truncate max-w-full">
                      تحویل: {item.assignedToName}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Pure Physical Printable Area (Hidden on screen via standard index.css @media print, and only shown in print) */}
      <div className="only-print block">
        <div 
          className="grid gap-6 text-center text-black" 
          style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', direction: 'rtl' }}
        >
          {selectedItemsToPrint.map(item => (
            <div 
              key={item.id} 
              className="border-2 border-black rounded-lg p-4 flex flex-col items-center justify-between bg-white text-black break-inside-avoid"
              style={{ minHeight: `${barcodeSize + 110}px` }}
            >
              {/* Core header */}
              <div className="text-[10px] font-bold tracking-tight border-b border-black w-full pb-1 mb-2">
                شرکت عمران آذرستان (بوشهر)
              </div>

              {/* QR Code */}
              <div className="flex items-center justify-center bg-white p-1">
                <QRCodeSVG
                  value={`ITEM|${item.type}|${item.code}`}
                  size={barcodeSize}
                  level="H"
                />
              </div>

              {/* Descriptions & Asset label */}
              <div className="mt-2 w-full text-right text-[9px] space-y-0.5 leading-tight font-medium">
                <div className="flex justify-between border-t border-black/30 pt-1 mt-1 font-black">
                  <span>کد اموال:</span>
                  <span className="font-mono select-all font-black text-xs">{item.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>نام سخت‌افزار:</span>
                  <span className="font-bold truncate max-w-[120px]">{item.categoryName.split(' ')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span>مشخصات:</span>
                  <span className="font-bold truncate max-w-[120px]">{item.brand} {item.model}</span>
                </div>
                <div className="flex justify-between text-[8px] italic">
                  <span>محل استقرار:</span>
                  <span className="truncate max-w-[120px]">{item.assignedToName}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
