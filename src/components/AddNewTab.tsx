import React, { useState } from 'react';

interface AddNewTabProps {
  onSave: (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard', data: any) => Promise<boolean>;
}

export default function AddNewTab({ onSave }: AddNewTabProps) {
  const [activeType, setActiveType] = useState<'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard'>('personnel');

  // Personnel fields
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDept, setPDept] = useState('');
  const [pLoc, setPLoc] = useState('');

  // Case fields
  const [cCode, setCCode] = useState('');
  const [cMobo, setCMobo] = useState('');
  const [cCpu, setCCpu] = useState('');
  const [cVga, setCVga] = useState('');
  const [cHdd1, setCHdd1] = useState('');
  const [cHdd2, setCHdd2] = useState('');
  const [cRamType, setCRamType] = useState('DDR4');
  const [cRamQty, setCRamQty] = useState('8GB');

  // Monitor fields
  const [mCode, setMCode] = useState('');
  const [mModel, setMModel] = useState('');

  // Printer fields
  const [prCode, setPrCode] = useState('');
  const [prModel, setPrModel] = useState('');

  // Mouse fields
  const [mouCode, setMouCode] = useState('');
  const [mouModel, setMouModel] = useState('');

  // Keyboard fields
  const [kbCode, setKbCode] = useState('');
  const [kbModel, setKbModel] = useState('');

  // Equipment Status state
  const [equipStatus, setEquipStatus] = useState<'working' | 'repair' | 'retired'>('working');

  const handleResetForm = () => {
    setPName(''); setPCode(''); setPTitle(''); setPDept(''); setPLoc('');
    setCCode(''); setCMobo(''); setCCpu(''); setCVga(''); setCHdd1(''); setCHdd2(''); setCRamType('DDR4'); setCRamQty('8GB');
    setMCode(''); setMModel('');
    setPrCode(''); setPrModel('');
    setMouCode(''); setMouModel('');
    setKbCode(''); setKbModel('');
    setEquipStatus('working');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let data: any = {};

    if (activeType === 'personnel') {
      if (!pName.trim() || !pCode.trim()) {
        alert('وارد کردن نام کامل و کد پرسنلی الزامی است.');
        return;
      }
      data = { name: pName, code: pCode, title: pTitle, department: pDept, location: pLoc };
    } else if (activeType === 'case') {
      if (!cCode.trim()) {
        alert('وارد کردن کد کیس (اموال) الزامی است.');
        return;
      }
      data = {
        code: cCode,
        motherboard: cMobo,
        cpu: cCpu,
        vga: cVga,
        hdd1: cHdd1,
        hdd2: cHdd2,
        ramType: cRamType,
        ramQty: cRamQty,
        status: equipStatus
      };
    } else if (activeType === 'monitor') {
      if (!mCode.trim() || !mModel.trim()) {
        alert('کد مانیتور و نام مدل مانیتور الزامی هستند.');
        return;
      }
      data = { code: mCode, model: mModel, status: equipStatus };
    } else if (activeType === 'printer') {
      if (!prCode.trim() || !prModel.trim()) {
        alert('کد چاپگر و نام مدل چاپگر الزامی هستند.');
        return;
      }
      data = { code: prCode, model: prModel, status: equipStatus };
    } else if (activeType === 'mouse') {
      if (!mouCode.trim() || !mouModel.trim()) {
        alert('کد ماوس و نام مدل ماوس الزامی هستند.');
        return;
      }
      data = { code: mouCode, model: mouModel, status: equipStatus };
    } else if (activeType === 'keyboard') {
      if (!kbCode.trim() || !kbModel.trim()) {
        alert('کد کیبورد و نام مدل کیبورد الزامی هستند.');
        return;
      }
      data = { code: kbCode, model: kbModel, status: equipStatus };
    }

    const success = await onSave(activeType, data);
    if (success) {
      alert('اطلاعات با موفقیت ذخیره گردید.');
      handleResetForm();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
      
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base md:text-lg font-bold text-slate-800">➕ ثبت و الحاق سخت‌افزار یا پرسنل جدید</h3>
        <p className="text-xs text-slate-500 mt-0.5">زیرشاخه مدنظر خود را مشخص نموده و فرم مشخصات آن را تکمیل کنید</p>
      </div>

      {/* Select active type */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(['personnel', 'case', 'monitor', 'printer', 'mouse', 'keyboard'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => { setActiveType(type); }}
            className={`p-2.5 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeType === type 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {type === 'personnel' && <span>👥 پرسنل</span>}
            {type === 'case' && <span>🖥️ کیس</span>}
            {type === 'monitor' && <span>📺 مانیتور</span>}
            {type === 'printer' && <span>🖨️ پرینتر</span>}
            {type === 'mouse' && <span>🖱️ ماوس</span>}
            {type === 'keyboard' && <span>⌨️ کیبورد</span>}
          </button>
        ))}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {/* Render Form 1: Personnel Add */}
        {activeType === 'personnel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">نام و نام خانوادگی کامل:</label>
              <input 
                type="text" required value={pName} onChange={(e) => setPName(e.target.value)}
                placeholder="مثال: محمد علیزاده"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">کد پرسنلی اختصاصی:</label>
              <input 
                type="text" required value={pCode} onChange={(e) => setPCode(e.target.value)}
                placeholder="مثال: 1024"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">سمت شغلی:</label>
              <input 
                type="text" value={pTitle} onChange={(e) => setPTitle(e.target.value)}
                placeholder="مثال: مهندس ناظر مکانیک"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">واحد سازمانی مربوطه:</label>
              <input 
                type="text" value={pDept} onChange={(e) => setPDept(e.target.value)}
                placeholder="مثال: واحد متریال کالا"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">موقعیت استقرار دفتری در کارگاه:</label>
              <input 
                type="text" value={pLoc} onChange={(e) => setPLoc(e.target.value)}
                placeholder="مثال: کانکس کنترل مواد"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Render Form 2: Case Add */}
        {activeType === 'case' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm animate-fade-in">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-700">کد کیس (شماره برچسب اموال کارگاهی):</label>
              <input 
                type="text" required value={cCode} onChange={(e) => setCCode(e.target.value)}
                placeholder="مثال: C-250"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">مدل مادربورد (Motherboard):</label>
              <input 
                type="text" value={cMobo} onChange={(e) => setCMobo(e.target.value)}
                placeholder="مثال: ASUS PRIME H610M-R"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">مدل پردازنده (CPU):</label>
              <input 
                type="text" value={cCpu} onChange={(e) => setCCpu(e.target.value)}
                placeholder="مثال: Intel Core i5-12400"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">مشخصات کارت گرافیک (VGA):</label>
              <input 
                type="text" value={cVga} onChange={(e) => setCVga(e.target.value)}
                placeholder="مثال: Desktop UHD Intel 730"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">رم RAM (نسل و سرعت):</label>
              <select 
                value={cRamType} onChange={(e) => setCRamType(e.target.value)}
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              >
                <option value="DDR3">DDR3</option>
                <option value="DDR4">DDR4</option>
                <option value="DDR5">DDR5</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">حافظه رم (RAM Qty):</label>
              <input 
                type="text" value={cRamQty} onChange={(e) => setCRamQty(e.target.value)}
                placeholder="مثال: 16GB"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">حافظه اول (SSD کتبی مخزن):</label>
              <input 
                type="text" value={cHdd1} onChange={(e) => setCHdd1(e.target.value)}
                placeholder="مثال: SSD 512GB Lexar"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">هارد دوم (ذخیره‌سازی HDD):</label>
              <input 
                type="text" value={cHdd2} onChange={(e) => setCHdd2(e.target.value)}
                placeholder="مثال: HDD 1TB WD Blue"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Render Form 3: Monitor Add */}
        {activeType === 'monitor' && (
          <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">کد مانیتور (اموال کارگاه):</label>
              <input 
                type="text" required value={mCode} onChange={(e) => setMCode(e.target.value)}
                placeholder="مثال: M-350"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">مدل و مشخصات فنی مانیتور:</label>
              <input 
                type="text" required value={mModel} onChange={(e) => setMModel(e.target.value)}
                placeholder="مثال: LG 22-Inch Full-HD LCD"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Render Form 4: Printer Add */}
        {activeType === 'printer' && (
          <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">کد پرینتر (اموال اختصاصی چاپ):</label>
              <input 
                type="text" required value={prCode} onChange={(e) => setPrCode(e.target.value)}
                placeholder="مثال: P-420"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">سازنده و مدل دقیق چاپگر:</label>
              <input 
                type="text" required value={prModel} onChange={(e) => setPrModel(e.target.value)}
                placeholder="مثال: HP LaserJet Pro M402d"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Render Form 5: Mouse Add */}
        {activeType === 'mouse' && (
          <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">کد ماوس (برچسب اموال):</label>
              <input 
                type="text" required value={mouCode} onChange={(e) => setMouCode(e.target.value)}
                placeholder="مثال: MOU-101"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">مدل و برند ماوس:</label>
              <input 
                type="text" required value={mouModel} onChange={(e) => setMouModel(e.target.value)}
                placeholder="مثال: Logitech M170 Wireless"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Render Form 6: Keyboard Add */}
        {activeType === 'keyboard' && (
          <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">کد کیبورد (برچسب اموال):</label>
              <input 
                type="text" required value={kbCode} onChange={(e) => setKbCode(e.target.value)}
                placeholder="مثال: KEY-201"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">مدل و برند کیبورد:</label>
              <input 
                type="text" required value={kbModel} onChange={(e) => setKbModel(e.target.value)}
                placeholder="مثال: A4Tech KR-83 USB"
                className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Status Dropdown - Show for all types except personnel */}
        {activeType !== 'personnel' && (
          <div className="space-y-1.5 p-3 bg-blue-50/45 rounded-lg border border-blue-100/60 animate-fade-in text-xs md:text-sm">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>🩺 وضعیت سلامت و کارکرد دستگاه:</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['working', 'repair', 'retired'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEquipStatus(st)}
                  className={`p-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                    equipStatus === st
                      ? 'text-white font-black'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  style={
                    equipStatus === st
                      ? st === 'working'
                        ? { backgroundColor: '#10b981', borderColor: '#10b981' }
                        : st === 'repair'
                        ? { backgroundColor: '#d97706', borderColor: '#d97706' }
                        : { backgroundColor: '#dc2626', borderColor: '#dc2626' }
                      : {}
                  }
                >
                  {st === 'working' && <span>🟢 سالم</span>}
                  {st === 'repair' && <span>🟡 نیاز به تعمیر</span>}
                  {st === 'retired' && <span>🔴 اسقاط</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg text-xs md:text-sm shadow-md transition cursor-pointer text-center"
          >
            💾 ثبت و افزودن به لیست کارگاه
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-lg text-xs md:text-sm transition cursor-pointer"
          >
            پاک کردن تمایل فرم
          </button>
        </div>

      </form>

    </div>
  );
}
