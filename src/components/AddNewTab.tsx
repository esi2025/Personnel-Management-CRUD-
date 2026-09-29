import React, { useState, useMemo } from 'react';
import { EquipmentCategory, SharedEquipmentCategories, createEquipmentCategories, findCategory } from '../utils/categories';

interface AddNewTabProps {
  onSave: (type: any, data: any) => Promise<boolean>;
  onSaveBulk: (items: any[]) => Promise<{ success: boolean; savedCount: number; skipped: string[] }>;
  equipmentCategories?: SharedEquipmentCategories | EquipmentCategory[];
  customCategories?: any[];
}

export default function AddNewTab({ 
  onSave, 
  onSaveBulk, 
  equipmentCategories, 
  customCategories = [] 
}: AddNewTabProps) {
  // Shared equipment categories: single source of truth for standard and custom types
  const categories: SharedEquipmentCategories = useMemo(() => {
    if (equipmentCategories && (equipmentCategories as any).get && (equipmentCategories as any).list) {
      return equipmentCategories as SharedEquipmentCategories;
    }
    if (Array.isArray(equipmentCategories) && equipmentCategories.length > 0) {
      return createEquipmentCategories(equipmentCategories.filter(c => c.isCustom));
    }
    return createEquipmentCategories(customCategories);
  }, [equipmentCategories, customCategories]);

  const [activeType, setActiveType] = useState<string>('personnel');
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Personnel fields
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDept, setPDept] = useState('');
  const [pLoc, setPLoc] = useState('');
  const [pDocNum, setPDocNum] = useState('');
  const [pStatus, setPStatus] = useState<'active' | 'terminated'>('active');
  const [pUsername, setPUsername] = useState('');
  const [pPassword, setPPassword] = useState('');

  // Single Input - Case fields
  const [cCode, setCCode] = useState('');
  const [cMobo, setCMobo] = useState('');
  const [cCpu, setCCpu] = useState('');
  const [cVga, setCVga] = useState('');
  const [cHdd1, setCHdd1] = useState('');
  const [cHdd2, setCHdd2] = useState('');
  const [cRamType, setCRamType] = useState('DDR4');
  const [cRamQty, setCRamQty] = useState('8GB');
  const [cPower, setCPower] = useState('');
  const [cIpAddress, setCIpAddress] = useState('');
  const [cMacAddress, setCMacAddress] = useState('');
  const [cHostName, setCHostName] = useState('');

  // Single Input - Other fields
  const [mCode, setMCode] = useState('');
  const [mModel, setMModel] = useState('');

  const [prCode, setPrCode] = useState('');
  const [prModel, setPrModel] = useState('');
  const [prIpAddress, setPrIpAddress] = useState('');
  const [prMacAddress, setPrMacAddress] = useState('');
  const [prAccessLink, setPrAccessLink] = useState('');

  const [mouCode, setMouCode] = useState('');
  const [mouModel, setMouModel] = useState('');

  const [kbCode, setKbCode] = useState('');
  const [kbModel, setKbModel] = useState('');

  const [radCode, setRadCode] = useState('');
  const [radModel, setRadModel] = useState('');

  // CCTV fields
  const [cctvCode, setCctvCode] = useState('');
  const [cctvBrand, setCctvBrand] = useState('');
  const [cctvModel, setCctvModel] = useState('');
  const [cctvLocation, setCctvLocation] = useState('');
  const [cctvAccessLink, setCctvAccessLink] = useState('');

  // Custom Category State
  const [customEquipCode, setCustomEquipCode] = useState('');
  const [customEquipLoc, setCustomEquipLoc] = useState('کارگاه بوشهر');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // Common Equipment State
  const [equipStatus, setEquipStatus] = useState<'working' | 'repair' | 'retired'>('working');
  const [equipDesc, setEquipDesc] = useState('');
  const [lastServiced, setLastServiced] = useState('');

  // --- BULK MODE STATE ---
  const [bulkType, setBulkType] = useState<string>('case');
  const [bulkMethod, setBulkMethod] = useState<'sequential' | 'pasted'>('sequential');

  // Bulk Sequential Method State
  const [seqPrefix, setSeqPrefix] = useState('CAS-');
  const [seqStartNum, setSeqStartNum] = useState('1001');
  const [seqCount, setSeqCount] = useState(10);

  // Bulk Common Field Values
  const [commonModel, setCommonModel] = useState('');
  const [commonMobo, setCommonMobo] = useState('H510');
  const [commonCpu, setCommonCpu] = useState('Intel Core i5');
  const [commonVga, setCommonVga] = useState('Onboard');
  const [commonHdd1, setCommonHdd1] = useState('256GB SSD');
  const [commonHdd2, setCommonHdd2] = useState('1TB HDD');
  const [commonRamType, setCommonRamType] = useState('DDR4');
  const [commonRamQty, setCommonRamQty] = useState('8GB');
  const [commonPower, setCommonPower] = useState('Green 400W');
  const [radioFreq, setRadioFreq] = useState('UHF');
  const [radioIp, setRadioIp] = useState('IP54');

  // Bulk CCTV State
  const [bulkCctvBrand, setBulkCctvBrand] = useState('داهوا (Dahua)');
  const [bulkCctvModel, setBulkCctvModel] = useState('');
  const [bulkCctvLocation, setBulkCctvLocation] = useState('کارگاه بوشهر');
  const [bulkCctvAccessLink, setBulkCctvAccessLink] = useState('');

  // Bulk Custom Category State
  const [bulkCustomFields, setBulkCustomFields] = useState<Record<string, string>>({});
  const [bulkCustomLocation, setBulkCustomLocation] = useState('کارگاه بوشهر');

  // Helper to change bulkType and set smart prefix using unified categories
  const handleSelectBulkType = (type: string) => {
    setBulkType(type);
    const prefix = categories.getPrefix ? categories.getPrefix(type) : (findCategory(categories, type)?.defaultPrefix || 'EQ-');
    setSeqPrefix(prefix);
  };

  // Bulk Pasted Text Method State
  const [pastedText, setPastedText] = useState('');

  const handleResetForm = () => {
    setPName(''); setPCode(''); setPTitle(''); setPDept(''); setPLoc(''); setPDocNum(''); setPStatus('active');
    setPUsername(''); setPPassword('');
    setCCode(''); setCMobo(''); setCCpu(''); setCVga(''); setCHdd1(''); setCHdd2(''); setCRamType('DDR4'); setCRamQty('8GB'); setCPower('');
    setCIpAddress(''); setCMacAddress(''); setCHostName('');
    setMCode(''); setMModel('');
    setPrCode(''); setPrModel(''); setPrIpAddress(''); setPrMacAddress(''); setPrAccessLink('');
    setMouCode(''); setMouModel('');
    setKbCode(''); setKbModel('');
    setRadCode(''); setRadModel('');
    setCctvCode(''); setCctvBrand(''); setCctvModel(''); setCctvLocation(''); setCctvAccessLink('');
    setCustomEquipCode('');
    setCustomEquipLoc('کارگاه بوشهر');
    setCustomFields({});
    setEquipStatus('working');
    setEquipDesc('');
    setLastServiced('');
    setPastedText('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let data: any = {};

    if (activeType === 'personnel') {
      if (!pName.trim() || !pCode.trim()) {
        alert('وارد کردن نام کامل و کد پرسنلی الزامی است.');
        return;
      }
      data = { name: pName, code: pCode, title: pTitle, department: pDept, location: pLoc, documentNumber: pDocNum, status: pStatus, username: pUsername, password: pPassword };
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
        power: cPower,
        status: equipStatus,
        description: equipDesc,
        lastServiced: lastServiced,
        ipAddress: cIpAddress,
        macAddress: cMacAddress,
        hostName: cHostName
      };
    } else if (activeType === 'monitor') {
      if (!mCode.trim() || !mModel.trim()) {
        alert('کد مانیتور و نام مدل مانیتور الزامی هستند.');
        return;
      }
      data = { code: mCode, model: mModel, status: equipStatus, description: equipDesc, lastServiced: lastServiced };
    } else if (activeType === 'printer') {
      if (!prCode.trim() || !prModel.trim()) {
        alert('کد چاپگر و نام مدل چاپگر الزامی هستند.');
        return;
      }
      data = { 
        code: prCode, 
        model: prModel, 
        status: equipStatus, 
        description: equipDesc, 
        lastServiced: lastServiced,
        ipAddress: prIpAddress,
        macAddress: prMacAddress,
        accessLink: prAccessLink
      };
    } else if (activeType === 'mouse') {
      if (!mouCode.trim() || !mouModel.trim()) {
        alert('کد ماوس و نام مدل ماوس الزامی هستند.');
        return;
      }
      data = { code: mouCode, model: mouModel, status: equipStatus, description: equipDesc, lastServiced: lastServiced };
    } else if (activeType === 'keyboard') {
      if (!kbCode.trim() || !kbModel.trim()) {
        alert('کد کیبورد و نام مدل کیبورد الزامی هستند.');
        return;
      }
      data = { code: kbCode, model: kbModel, status: equipStatus, description: equipDesc, lastServiced: lastServiced };
    } else if (activeType === 'radio') {
      if (!radCode.trim() || !radModel.trim()) {
        alert('کد بی‌سیم و نام مدل بی‌سیم الزامی هستند.');
        return;
      }
      data = { code: radCode.trim().toUpperCase(), model: radModel, status: equipStatus, description: equipDesc, lastServiced: lastServiced };
    } else if (activeType === 'cctv') {
      if (!cctvCode.trim() || !cctvBrand.trim() || !cctvModel.trim()) {
        alert('کد اموال، مارک و مدل دوربین مداربسته الزامی هستند.');
        return;
      }
      data = {
        code: cctvCode.trim().toUpperCase(),
        brand: cctvBrand.trim(),
        model: cctvModel.trim(),
        location: cctvLocation.trim(),
        accessLink: cctvAccessLink.trim(),
        status: equipStatus,
        description: equipDesc,
        lastServiced: lastServiced
      };
    } else {
      // Custom category equipment submission
      const cat = findCategory(categories, activeType);
      if (cat && cat.isCustom) {
        if (!customEquipCode.trim()) {
          alert(`کد اموال برای سخت‌افزار «${cat.name}» الزامی است.`);
          return;
        }
        data = {
          code: customEquipCode.trim().toUpperCase(),
          location: customEquipLoc.trim(),
          status: equipStatus,
          description: equipDesc.trim(),
          lastServiced: lastServiced,
          ...customFields
        };
      } else {
        alert('دسته‌بندی تجهیز انتخاب شده نامعتبر است.');
        return;
      }
    }

    const success = await onSave(activeType, data);
    if (success) {
      alert('اطلاعات با موفقیت ذخیره گردید.');
      handleResetForm();
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let itemsToSave: any[] = [];

    if (bulkMethod === 'sequential') {
      const startNum = parseInt(seqStartNum, 10);
      if (isNaN(startNum)) {
        alert('شماره شروع متوالی معتبر نیست.');
        return;
      }
      if (seqCount <= 0 || seqCount > 500) {
        alert('تعداد مجاز تعریف همزمان بین ۱ تا ۵۰۰ عدد می‌باشد.');
        return;
      }

      // Format pad lengths based on inputted startNum length (e.g. 001 gets padded to length 3)
      const padLen = seqStartNum.length;

      for (let i = 0; i < seqCount; i++) {
        const numStr = String(startNum + i).padStart(padLen, '0');
        const generatedCode = `${seqPrefix}${numStr}`;

        let itemObj: any = {
          type: bulkType,
          code: generatedCode.toUpperCase(),
          status: 'working',
          description: equipDesc.trim() || 'ثبت متوالی گروهی انبار'
        };

        if (bulkType === 'case') {
          itemObj = {
            ...itemObj,
            motherboard: commonMobo || '—',
            cpu: commonCpu || '—',
            vga: commonVga || '—',
            hdd1: commonHdd1 || '—',
            hdd2: commonHdd2 || '—',
            ramType: commonRamType,
            ramQty: commonRamQty,
            power: commonPower || '—'
          };
        } else if (bulkType === 'radio') {
          itemObj = {
            ...itemObj,
            model: commonModel || 'Motorola GP338',
            frequencyRange: radioFreq || 'UHF',
            ipRating: radioIp || 'IP54'
          };
        } else if (bulkType === 'cctv') {
          itemObj = {
            ...itemObj,
            brand: bulkCctvBrand || 'داهوا (Dahua)',
            model: bulkCctvModel || commonModel || 'سایر',
            location: bulkCctvLocation || 'کارگاه بوشهر',
            accessLink: bulkCctvAccessLink || ''
          };
        } else {
          const customCat = findCategory(categories, bulkType);
          if (customCat && customCat.isCustom) {
            itemObj = {
              ...itemObj,
              type: customCat.id,
              categorySlug: customCat.id,
              ...bulkCustomFields,
              location: bulkCustomLocation || 'کارگاه بوشهر'
            };
          } else {
            // monitor, printer, keyboard, mouse, etc.
            itemObj = {
              ...itemObj,
              model: commonModel || 'سایر'
            };
          }
        }

        itemsToSave.push(itemObj);
      }
    } else {
      // Pasted Text / TSV / CSV method
      if (!pastedText.trim()) {
        alert('لطفاً اطلاعات را در قسمت متنی وارد کنید.');
        return;
      }

      const lines = pastedText.split('\n');
      lines.forEach((line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return; // Skip empty lines

        // Split by Tab, Comma, or Semicolon
        const parts = cleanLine.split(/[\t,;]/);
        const code = parts[0].trim();
        if (!code) return;

        let modelOrSpec = parts[1] ? parts[1].trim() : commonModel;

        let itemObj: any = {
          type: bulkType,
          code: code.toUpperCase(),
          status: 'working',
          description: equipDesc.trim() || 'ایمپورت متنی انبار'
        };

        if (bulkType === 'case') {
          itemObj = {
            ...itemObj,
            motherboard: parts[1]?.trim() || commonMobo,
            cpu: parts[2]?.trim() || commonCpu,
            vga: parts[3]?.trim() || commonVga,
            hdd1: parts[4]?.trim() || commonHdd1,
            ramQty: parts[5]?.trim() || commonRamQty,
            ramType: commonRamType,
            hdd2: commonHdd2,
            power: commonPower
          };
        } else if (bulkType === 'radio') {
          itemObj = {
            ...itemObj,
            model: modelOrSpec || 'Motorola GP338',
            frequencyRange: parts[2]?.trim() || radioFreq,
            ipRating: parts[3]?.trim() || radioIp
          };
        } else if (bulkType === 'cctv') {
          itemObj = {
            ...itemObj,
            brand: parts[1]?.trim() || bulkCctvBrand || 'سایر',
            model: parts[2]?.trim() || bulkCctvModel || commonModel || 'سایر',
            location: parts[3]?.trim() || bulkCctvLocation || 'کارگاه بوشهر',
            accessLink: parts[4]?.trim() || bulkCctvAccessLink || ''
          };
        } else {
          const customCat = findCategory(categories, bulkType);
          if (customCat && customCat.isCustom) {
            const parsedCustoms: Record<string, string> = { ...bulkCustomFields };
            if (customCat.fields && customCat.fields.length > 0) {
              customCat.fields.forEach((f: any, idx: number) => {
                if (parts[idx + 1]) {
                  parsedCustoms[f.key] = parts[idx + 1].trim();
                }
              });
            }
            itemObj = {
              ...itemObj,
              type: customCat.id,
              categorySlug: customCat.id,
              ...parsedCustoms,
              location: bulkCustomLocation || 'کارگاه بوشهر'
            };
          } else {
            // monitor, printer, keyboard, mouse
            itemObj = {
              ...itemObj,
              model: modelOrSpec || 'سایر'
            };
          }
        }

        itemsToSave.push(itemObj);
      });
    }

    if (itemsToSave.length === 0) {
      alert('هیچ آیتم معتبری برای ذخیره یافت نشد.');
      return;
    }

    const confirmSave = window.confirm(`تعداد ${itemsToSave.length} آیتم گروهی به شکل خودکار ثبت و مستقیماً به موجودی بخش "انبار کارگاه" الحاق خواهد شد.\nآیا مطمئن هستید؟`);
    if (!confirmSave) return;

    const res = await onSaveBulk(itemsToSave);
    if (res.success) {
      let alertMsg = `فرآیند ثبت گروهی تکمیل شد!\nتعداد کل موفق: ${res.savedCount}`;
      if (res.skipped && res.skipped.length > 0) {
        alertMsg += `\nتعداد کدهای تکراری نادیده گرفته شده: ${res.skipped.length}\nکدهای تکراری: ${res.skipped.join(', ')}`;
      }
      alert(alertMsg);
      handleResetForm();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6 text-right" dir="rtl">
      
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-800">➕ ورود و ثبت تجهیزات و پرسنل کارگاه</h3>
          <p className="text-xs text-slate-500 mt-0.5">ثبت تکی پرسنل و سخت‌افزار یا ایمپورت گروهی و تعداد زیاد اقلام کارگاهی به حساب انبار</p>
        </div>

        {/* Mode Toggle Switch */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200 w-fit self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsBulkMode(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              !isBulkMode ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 ثبت واحد (تکی)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBulkMode(true);
              const targetType = activeType === 'personnel' ? 'case' : activeType;
              setBulkType(targetType);
              handleSelectBulkType(targetType);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              isBulkMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ ایمپورت گروهی (تعداد زیاد)
          </button>
        </div>
      </div>

      {!isBulkMode ? (
        /* ================== SINGLE MODE FORM ================== */
        <form onSubmit={handleFormSubmit} className="space-y-5">
          
          {/* Select active type */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            <button
              type="button"
              onClick={() => { setActiveType('personnel'); }}
              className={`p-2.5 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeType === 'personnel' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-sm">👥</span>
              <span>پرسنل</span>
            </button>
            {categories.map((cat) => {
              const isActive = activeType === cat.id || 
                (cat.isCustom && (activeType === `custom_${cat.id}` || cat.id === activeType.replace(/^custom_/, '')));
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setActiveType(cat.id); }}
                  className={`p-2.5 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isActive 
                      ? cat.isCustom 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                        : 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : cat.isCustom 
                        ? 'bg-emerald-50/60 border border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="truncate max-w-[85px]">{cat.shortName || cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100/70 pt-4">
            
            {/* Render Form 1: Personnel Add */}
            {activeType === 'personnel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm animate-fade-in">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">نام و نام خانوادگی:</label>
                  <input 
                    type="text" required value={pName} onChange={(e) => setPName(e.target.value)}
                    placeholder="مثال: علی احمدی"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">کد پرسنلی اختصاصی:</label>
                  <input 
                    type="text" required value={pCode} onChange={(e) => setPCode(e.target.value)}
                    placeholder="مثال: AZ-14023"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">عنوان شغلی/سمت:</label>
                  <input 
                    type="text" value={pTitle} onChange={(e) => setPTitle(e.target.value)}
                    placeholder="مثال: سرپرست کارگاه بوشهر"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">واحد / دپارتمان دفتری:</label>
                  <input 
                    type="text" value={pDept} onChange={(e) => setPDept(e.target.value)}
                    placeholder="مثال: واحد لجستیک و اجرایی"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">موقعیت استقرار فیزیکی:</label>
                  <input 
                    type="text" value={pLoc} onChange={(e) => setPLoc(e.target.value)}
                    placeholder="مثال: بوشهر - کمپ ساحلی"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 font-sans">
                  <label className="font-semibold text-slate-700">شماره سند الحاقی / قرار داد صادر شده:</label>
                  <input 
                    type="text" value={pDocNum} onChange={(e) => setPDocNum(e.target.value)}
                    placeholder="مثال: D-6380-405"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 font-sans">
                  <label className="font-semibold text-slate-700">نام کاربری سیستم (Username):</label>
                  <input 
                    type="text" value={pUsername} onChange={(e) => setPUsername(e.target.value)}
                    placeholder="مثال: a.ahmadi"
                    className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5 font-sans">
                  <label className="font-semibold text-slate-700">رمز عبور سیستم (Password):</label>
                  <input 
                    type="text" value={pPassword} onChange={(e) => setPPassword(e.target.value)}
                    placeholder="مثال: P@ssw0rd123"
                    className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Render Form 2: Case Add */}
            {activeType === 'case' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm animate-fade-in">
                <div className="space-y-1.5 col-span-1 sm:col-span-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <label className="font-bold text-blue-900">کد کیس (برچسب اموال کارگاه):</label>
                  <input 
                    type="text" required value={cCode} onChange={(e) => setCCode(e.target.value)}
                    placeholder="مثال: CASE-101"
                    className="w-full text-right p-2.5 bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">مادربورد (Motherboard):</label>
                  <input 
                    type="text" value={cMobo} onChange={(e) => setCMobo(e.target.value)}
                    placeholder="مثال: ASUS Prime H510M-K"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">پردازنده مرکزی (CPU):</label>
                  <input 
                    type="text" value={cCpu} onChange={(e) => setCCpu(e.target.value)}
                    placeholder="مثال: Intel Core i5-11400"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">کارت گرافیک (GPU):</label>
                  <input 
                    type="text" value={cVga} onChange={(e) => setCVga(e.target.value)}
                    placeholder="مثال: NVIDIA GTX 1650 4GB / Intel UHD"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">پاور / منبع تغذیه (Power):</label>
                  <input 
                    type="text" value={cPower} onChange={(e) => setCPower(e.target.value)}
                    placeholder="مثال: Green GP400A-ECO"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">نوع رم (RAM Type):</label>
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
                  <label className="font-semibold text-slate-700">ظرفیت رم (RAM Qty):</label>
                  <select 
                    value={cRamQty} onChange={(e) => setCRamQty(e.target.value)}
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="4GB">4 GB</option>
                    <option value="8GB">8 GB</option>
                    <option value="16GB">16 GB</option>
                    <option value="32GB">32 GB</option>
                    <option value="64GB">64 GB</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">حافظه اصلی (SSD/HDD 1):</label>
                  <input 
                    type="text" value={cHdd1} onChange={(e) => setCHdd1(e.target.value)}
                    placeholder="مثال: 256GB SSD NVMe"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">حافظه دوم (SSD/HDD 2):</label>
                  <input 
                    type="text" value={cHdd2} onChange={(e) => setCHdd2(e.target.value)}
                    placeholder="مثال: 1TB HDD WD Blue"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 font-sans">
                  <label className="font-semibold text-slate-700">آدرس IP (IP Address):</label>
                  <input 
                    type="text" value={cIpAddress} onChange={(e) => setCIpAddress(e.target.value)}
                    placeholder="مثال: 192.168.1.15"
                    className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5 font-sans">
                  <label className="font-semibold text-slate-700">آدرس فیزیکی (MAC Address):</label>
                  <input 
                    type="text" value={cMacAddress} onChange={(e) => setCMacAddress(e.target.value)}
                    placeholder="مثال: 00:1A:2B:3C:4D:5E"
                    className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5 font-sans">
                  <label className="font-semibold text-slate-700">نام کامپیوتر (Host Name):</label>
                  <input 
                    type="text" value={cHostName} onChange={(e) => setCHostName(e.target.value)}
                    placeholder="مثال: HR-PC-02"
                    className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Render Form 3: Monitor Add */}
            {activeType === 'monitor' && (
              <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in col-span-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">کد مانیتور (برچسب اموال):</label>
                  <input 
                    type="text" required value={mCode} onChange={(e) => setMCode(e.target.value)}
                    placeholder="مثال: MON-101"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">مدل و برند مانیتور:</label>
                  <input 
                    type="text" required value={mModel} onChange={(e) => setMModel(e.target.value)}
                    placeholder="مثال: LG 24-inch IPS Full HD"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Render Form 4: Printer Add */}
            {activeType === 'printer' && (
              <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">کد چاپگر (برچسب اموال):</label>
                  <input 
                    type="text" required value={prCode} onChange={(e) => setPrCode(e.target.value)}
                    placeholder="مثال: PRN-101"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">قالب و مدل چاپگر:</label>
                  <input 
                    type="text" required value={prModel} onChange={(e) => setPrModel(e.target.value)}
                    placeholder="مثال: HP LaserJet Pro M402d"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">آدرس IP شبکه پرینتر (اختیاری):</label>
                  <input 
                    type="text" value={prIpAddress} onChange={(e) => setPrIpAddress(e.target.value)}
                    placeholder="مثال: 192.168.1.50"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">آدرس فیزیکی MAC پرینتر (اختیاری):</label>
                  <input 
                    type="text" value={prMacAddress} onChange={(e) => setPrMacAddress(e.target.value)}
                    placeholder="مثال: 00:11:22:33:44:55"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">لینک صفحه وب مدیریت یا ریموت پرینتر (اختیاری):</label>
                  <input 
                    type="text" value={prAccessLink} onChange={(e) => setPrAccessLink(e.target.value)}
                    placeholder="مثال: http://192.168.1.50"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
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

            {/* Render Form 7: Radio Add */}
            {activeType === 'radio' && (
              <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in text-right">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">کد بی‌سیم (اموال اختصاصی بی‌سیم):</label>
                  <input 
                    type="text" required value={radCode} onChange={(e) => setRadCode(e.target.value)}
                    placeholder="مثال: R-750"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">سازنده و مدل بی‌سیم:</label>
                  <input 
                    type="text" required value={radModel} onChange={(e) => setRadModel(e.target.value)}
                    placeholder="مثال: Motorola GP338"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Render Form 8: CCTV Add */}
            {activeType === 'cctv' && (
              <div className="grid grid-cols-1 gap-4 text-xs md:text-sm animate-fade-in text-right font-sans">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">کد اموال دوربین مداربسته:</label>
                  <input 
                    type="text" required value={cctvCode} onChange={(e) => setCctvCode(e.target.value)}
                    placeholder="مثال: CAM-801"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">مارک دوربین مداربسته:</label>
                  <input 
                    type="text" required value={cctvBrand} onChange={(e) => setCctvBrand(e.target.value)}
                    placeholder="مثال: هایک‌ویژن (Hikvision)"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">مدل دوربین مداربسته:</label>
                  <input 
                    type="text" required value={cctvModel} onChange={(e) => setCctvModel(e.target.value)}
                    placeholder="مثال: DS-2CD1123G0E-I"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">موقعیت استقرار:</label>
                  <input 
                    type="text" value={cctvLocation} onChange={(e) => setCctvLocation(e.target.value)}
                    placeholder="مثال: درب ورودی کانکس نگهبانی"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">لینک دسترسی / آدرس IP (جهت مشاهده پخش زنده):</label>
                  <input 
                    type="text" value={cctvAccessLink} onChange={(e) => setCctvAccessLink(e.target.value)}
                    placeholder="مثال: http://192.168.1.100 یا لینک دامنه پخش زنده"
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Render Form for Custom Hardware Category */}
            {(() => {
              const currentCat = categories.get ? categories.get(activeType) : findCategory(categories, activeType);
              if (!currentCat || !currentCat.isCustom) return null;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm animate-fade-in text-right font-sans">
                  <div className="space-y-1.5 sm:col-span-2 bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentCat.icon || '⚙️'}</span>
                      <div>
                        <span className="font-bold text-slate-800">ثبت تجهیز جدید در دسته سفارشی «{currentCat.name}»</span>
                        <p className="text-[10px] text-slate-500">مشخصات انحصاری تعریف شده برای این سخت‌افزار را تکمیل نمایید.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">کد سخت‌افزار (اموال) <span className="text-red-500">*</span>:</label>
                    <input 
                      type="text" required value={customEquipCode} onChange={(e) => setCustomEquipCode(e.target.value)}
                      placeholder="مثال: ATT-101 یا SW-201"
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">موقعیت استقرار فیزیکی:</label>
                    <input 
                      type="text" value={customEquipLoc} onChange={(e) => setCustomEquipLoc(e.target.value)}
                      placeholder="مثال: درب ورودی سایت بوشهر یا اتاق سرور"
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {currentCat.fields && currentCat.fields.map((f: any) => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="font-semibold text-slate-700">{f.name}:</label>
                      <input 
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={customFields[f.key] || ''}
                        onChange={(e) => setCustomFields({ ...customFields, [f.key]: e.target.value })}
                        placeholder={`وارد کردن ${f.name}...`}
                        className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Status & Desc inside single form */}
            {activeType !== 'personnel' && (
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5 p-3 bg-blue-50/45 rounded-lg border border-blue-100/60 animate-fade-in text-xs md:text-sm">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>🩺 وضعیت سلامت و کارکرد دستگاه:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-1 font-sans">
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

                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-lg border border-slate-200 text-xs md:text-sm">
                  <label className="font-semibold text-slate-800">
                    📝 توضیحات تکمیلی و ضمیمه:
                  </label>
                  <textarea
                    value={equipDesc}
                    onChange={(e) => setEquipDesc(e.target.value)}
                    placeholder="دلیل اختصاص، ایرادات برچسب اموال یا یادداشت..."
                    rows={2}
                    className="w-full text-right p-2.5 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-lg border border-slate-200 text-xs md:text-sm animate-fade-in">
                  <label className="font-semibold text-slate-800">
                    ⚠️ تاریخ آخرین سرویس (خورشیدی YYYY/MM/DD):
                  </label>
                  <input
                    type="text"
                    value={lastServiced}
                    onChange={(e) => setLastServiced(e.target.value)}
                    placeholder="مثال: 1404/03/15"
                    className="w-full text-right p-2.5 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none text-xs font-mono"
                  />
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
                پاک کردن فرم
              </button>
            </div>

          </div>
        </form>
      ) : (
        /* ================== BULK IMPORT MODE FORM ================== */
        <form onSubmit={handleBulkSubmit} className="space-y-5 animate-fade-in text-right">
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-[11px] leading-relaxed">
            💡 <strong>اطلاعیه انبار لجستیک:</strong> تمامی کدهای وارد شده در فرآیند ایمپورت گروهی با وضعیت 
            <span className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 mx-1 font-bold">🟢 سالم</span> و به حساب 
            <span className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 mx-1 font-bold">🏢 موجود در انبار (امانت انباردار)</span> ثبت خواهند شد. 
            شما قادر خواهید بود در گام بعدی هر زمان لازم بود از طریق زبانه <strong>🔄 جابجایی هوشمند</strong> اقلام را تفکیک و به افراد تحویل کنید.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Select Equipment Type to Bulk-Add */}
            <div className="space-y-1.5 ms-0 md:border-l md:border-slate-100 md:pl-4">
              <label className="font-semibold text-slate-700 block">۱. انتخاب نوع تجهیز هدف:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                {(categories.list || categories).map((item) => {
                  const isSelected = bulkType === item.id || 
                    bulkType === `custom_${item.id}` || 
                    item.id === `custom_${bulkType}` ||
                    (item.id && bulkType && String(bulkType).replace(/^custom_/, '') === String(item.id).replace(/^custom_/, ''));
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { handleSelectBulkType(item.id); }}
                      className={`p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isSelected 
                          ? item.isCustom 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : item.isCustom
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="truncate">{item.shortName || item.name}</span>
                      {item.isCustom && (
                        <span className={`text-[8px] px-1 py-0.5 rounded font-black ${
                          isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-200/80 text-emerald-900'
                        }`}>
                          سفارشی
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {(categories.custom?.length ?? customCategories.length) > 0 ? (
                <div className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                  <span>✨</span>
                  <span>تعداد {categories.custom?.length ?? customCategories.length} سخت‌افزار سفارشی تعریف‌شده نیز در این بخش جهت ایمپورت گروهی در دسترس است.</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 mt-1">
                  💡 با تعریف هر سخت‌افزار جدید در زبانه «تعریف سخت افزار جدید»، آن دسته نیز بلافاصله در گزینه‌های فوق قرار خواهد گرفت.
                </div>
              )}
            </div>

            {/* 2. Select Method */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">۲. شیوه وارد کردن کدهای اموال:</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setBulkMethod('sequential')}
                  className={`p-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    bulkMethod === 'sequential' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  🔢 کدهای متوالی (پشت‌سرهم)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMethod('pasted')}
                  className={`p-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                    bulkMethod === 'pasted' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📄 کپی-پیست گروهی (از اکسل/فایل)
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100/70 pt-4 space-y-4">

            {/* Input fields based on METHOD */}
            {bulkMethod === 'sequential' ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm animate-fade-in">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600">پیشوند کدهای اموال (Prefix):</label>
                  <input
                    type="text"
                    value={seqPrefix}
                    onChange={(e) => setSeqPrefix(e.target.value)}
                    placeholder="مثال: CASE-"
                    className="w-full text-right p-2.5 bg-white border border-slate-300 rounded font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600">عددی شروع (Start Number):</label>
                  <input
                    type="text"
                    value={seqStartNum}
                    onChange={(e) => setSeqStartNum(e.target.value)}
                    placeholder="مثال: 1001"
                    className="w-full text-right p-2.5 bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600">تعداد کل تجهیزات جهت تولید:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={seqCount}
                    onChange={(e) => setSeqCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-right p-2.5 bg-white border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-3 text-[11px] text-slate-500 mt-1">
                  کدهای تولیدی پیشنهادی: <span className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-black">
                    {`${seqPrefix}${seqStartNum}`}
                  </span> تا <span className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-black">
                    {`${seqPrefix}${String(parseInt(seqStartNum, 10) + seqCount - 1).padStart(seqStartNum.length, '0')}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2 text-xs md:text-sm animate-fade-in">
                <label className="font-semibold text-slate-700 block">محتوای نوشتاری یا کپی شده از فایل اکسل:</label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`MNT-101\tLG IPS 24\nMNT-102\tSamsung Smart 22\nMNT-103\tLG IPS 24\n...\nیا به سادگی لیست کدها را به صورت خط‌به‌خط جایگذاری کنید`}
                  className="w-full text-right p-3 bg-white border border-slate-300 rounded font-mono focus:border-indigo-500 focus:outline-none leading-relaxed placeholder:text-slate-400"
                />
                <div className="text-[10px] text-slate-400">
                  ⚡ از چسباندن (Ctrl+V) مستقیم ستون‌های اکسل پشتیبانی می‌شود (ستون اول: کد اموال، ستون دوم: مدل/مشخصات دستگاه).
                </div>
              </div>
            )}

            {/* Common Specs forms for BULK items */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">📋 مشخصات عمومی و فنی مشترک برای این گروه:</h4>
              
              {bulkType === 'case' ? (
                /* Specs for Cases */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">مادربورد (Motherboard):</label>
                    <input
                      type="text" value={commonMobo} onChange={(e) => setCommonMobo(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">پردازنده مرکزی (CPU):</label>
                    <input
                      type="text" value={commonCpu} onChange={(e) => setCommonCpu(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">کارت گرافیک (GPU):</label>
                    <input
                      type="text" value={commonVga} onChange={(e) => setCommonVga(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">پاور (Power):</label>
                    <input
                      type="text" value={commonPower} onChange={(e) => setCommonPower(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">نوع رم (RAM Type):</label>
                    <select
                      value={commonRamType} onChange={(e) => setCommonRamType(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    >
                      <option value="DDR3">DDR3</option>
                      <option value="DDR4">DDR4</option>
                      <option value="DDR5">DDR5</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">حجم رم (RAM Qty):</label>
                    <select
                      value={commonRamQty} onChange={(e) => setCommonRamQty(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    >
                      <option value="4GB">4 GB</option>
                      <option value="8GB">8 GB</option>
                      <option value="16GB">16 GB</option>
                      <option value="32GB">32 GB</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">حافظه SSD / اول:</label>
                    <input
                      type="text" value={commonHdd1} onChange={(e) => setCommonHdd1(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">حافظه HDD / دوم:</label>
                    <input
                      type="text" value={commonHdd2} onChange={(e) => setCommonHdd2(e.target.value)}
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              ) : bulkType === 'radio' ? (
                /* Specs for Wireless Radio */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">سازنده و مدل بی‌سیم:</label>
                    <input
                      type="text" value={commonModel} onChange={(e) => setCommonModel(e.target.value)}
                      placeholder="مثال: Motorola GP338"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">باند فرکانسی (Frequency):</label>
                    <input
                      type="text" value={radioFreq} onChange={(e) => setRadioFreq(e.target.value)}
                      placeholder="مثال: UHF / VHF"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">درجه حفاظت (IP Rating):</label>
                    <input
                      type="text" value={radioIp} onChange={(e) => setRadioIp(e.target.value)}
                      placeholder="مثال: IP54"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              ) : bulkType === 'cctv' ? (
                /* Specs for CCTV Camera */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">برند دوربین مداربسته:</label>
                    <input
                      type="text" value={bulkCctvBrand} onChange={(e) => setBulkCctvBrand(e.target.value)}
                      placeholder="مثال: داهوا (Dahua) یا هایک‌ویژن"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">مدل دوربین مداربسته:</label>
                    <input
                      type="text" value={bulkCctvModel} onChange={(e) => setBulkCctvModel(e.target.value)}
                      placeholder="مثال: DH-IPC-HFW1230S"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">موقعیت استقرار فیزیکی پیش‌فرض:</label>
                    <input
                      type="text" value={bulkCctvLocation} onChange={(e) => setBulkCctvLocation(e.target.value)}
                      placeholder="مثال: محوطه کارگاه بوشهر"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold">لینک وب دسترسی (اختیاری):</label>
                    <input
                      type="text" value={bulkCctvAccessLink} onChange={(e) => setBulkCctvAccessLink(e.target.value)}
                      placeholder="مثال: http://192.168.1.100"
                      className="w-full text-right p-2 bg-white border border-slate-200 rounded font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (categories.get ? categories.get(bulkType)?.isCustom : categories.some((c: any) => c.id === bulkType && c.isCustom)) ? (
                /* Specs for Custom Hardware Category */
                (() => {
                  const currentCat = categories.get ? categories.get(bulkType) : findCategory(categories, bulkType);
                  if (!currentCat) return null;
                  return (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 font-bold">
                        <span>{currentCat?.icon || '⚙️'}</span>
                        <span>تنظیم پارامترهای مشترک برای دسته سخت‌افزاری «{currentCat?.name}»</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-600 font-semibold">موقعیت استقرار فیزیکی پیش‌فرض:</label>
                          <input
                            type="text" value={bulkCustomLocation} onChange={(e) => setBulkCustomLocation(e.target.value)}
                            placeholder="مثال: کارگاه بوشهر"
                            className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                          />
                        </div>
                        {currentCat?.fields && currentCat.fields.map((f: any) => (
                          <div key={f.key} className="space-y-1">
                            <label className="text-slate-600 font-semibold">{f.name}:</label>
                            <input
                              type={f.type === 'number' ? 'number' : 'text'}
                              value={bulkCustomFields[f.key] || ''}
                              onChange={(e) => setBulkCustomFields({ ...bulkCustomFields, [f.key]: e.target.value })}
                              placeholder={`مقدار مشترک برای ${f.name}...`}
                              className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Specs for Monitor / Printer / Keyboard / Mouse */
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-600 font-semibold">
                    {bulkType === 'keyboard' 
                      ? 'مدل و مارک کیبورد:' 
                      : bulkType === 'mouse' 
                      ? 'مدل و مارک ماوس:' 
                      : 'مدل و برند مشترک دستگاه:'}
                  </label>
                  <input
                    type="text"
                    required={bulkMethod === 'sequential'}
                    value={commonModel}
                    onChange={(e) => setCommonModel(e.target.value)}
                    placeholder={
                      bulkType === 'monitor' 
                        ? 'مثال: LG 24MK600-H' 
                        : bulkType === 'printer' 
                        ? 'مثال: HP LaserJet Pro M402dn' 
                        : bulkType === 'keyboard' 
                        ? 'مثال: فراسو FCR-8900 USB' 
                        : 'مثال: لاجیتک B100 USB'
                    }
                    className="w-full text-right p-2 bg-white border border-slate-200 rounded"
                  />
                  {bulkMethod === 'pasted' && (
                    <span className="text-[10px] text-slate-400">
                      (در صورت کپی-پیست از فایل، اگر مدل هر دستگاه در ستون دوم وارد شده باشد، همان مقدار استفاده شده و فیلد بالا نادیده گرفته می‌شود)
                    </span>
                  )}
                </div>
              )}

              {/* Common Description */}
              <div className="space-y-1 text-xs">
                <label className="text-slate-600 font-semibold">یادداشت دفتری / توضیحات گروهی:</label>
                <input
                  type="text"
                  value={equipDesc}
                  onChange={(e) => setEquipDesc(e.target.value)}
                  placeholder="مثال: خرید دوره‌ای خرداد ۱۴۰۵ کارخانه"
                  className="w-full text-right p-2 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold p-3.5 rounded-lg text-xs md:text-sm shadow-md transition cursor-pointer text-center"
              >
                📥 تایید و ایمپورت مستقیم به لیست انبار کارگاه
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 rounded-lg text-xs md:text-sm transition cursor-pointer"
              >
                بازنشانی فرم
              </button>
            </div>

          </div>
        </form>
      )}

    </div>
  );
}
