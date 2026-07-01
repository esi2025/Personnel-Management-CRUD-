import React, { useState, useEffect } from 'react';

interface EditModalProps {
  item: any;
  type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv' | null;
  onClose: () => void;
  onSave: (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv', data: any) => Promise<boolean>;
}

export default function EditModal({ item, type, onClose, onSave }: EditModalProps) {
  if (!item || !type) return null;

  // Personnel states
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDept, setPDept] = useState('');
  const [pLoc, setPLoc] = useState('');
  const [pDocNum, setPDocNum] = useState('');
  const [pStatus, setPStatus] = useState<'active' | 'terminated'>('active');
  const [pUsername, setPUsername] = useState('');
  const [pPassword, setPPassword] = useState('');

  // Case states
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

  // Monitor/Printer/Mouse/Keyboard/Radio/CCTV states
  const [equipCode, setEquipCode] = useState('');
  const [equipModel, setEquipModel] = useState('');

  // Radio-specific states
  const [radioFreq, setRadioFreq] = useState('');
  const [radioIp, setRadioIp] = useState('');

  // CCTV-specific states
  const [cctvBrand, setCctvBrand] = useState('');
  const [cctvLocation, setCctvLocation] = useState('');
  const [cctvAccessLink, setCctvAccessLink] = useState('');

  // Printer-specific states
  const [printerIp, setPrinterIp] = useState('');
  const [printerMac, setPrinterMac] = useState('');
  const [printerLink, setPrinterLink] = useState('');

  // Status state
  const [equipStatus, setEquipStatus] = useState<'working' | 'repair' | 'retired'>('working');
  const [equipDesc, setEquipDesc] = useState('');
  const [lastServiced, setLastServiced] = useState('');

  // Sync inputs with item when mounted
  useEffect(() => {
    if (type === 'personnel') {
      setPName(item.name || '');
      setPCode(item.code || '');
      setPTitle(item.title || '');
      setPDept(item.department || '');
      setPLoc(item.location || '');
      setPDocNum(item.documentNumber || '');
      setPStatus(item.status || 'active');
      setPUsername(item.username || '');
      setPPassword(item.password || '');
    } else if (type === 'case') {
      setCCode(item.code || '');
      setCMobo(item.motherboard || '');
      setCCpu(item.cpu || '');
      setCVga(item.vga || '');
      setCHdd1(item.hdd1 || '');
      setCHdd2(item.hdd2 || '');
      setCRamType(item.ramType || 'DDR4');
      setCRamQty(item.ramQty || '8GB');
      setCPower(item.power || '');
      setCIpAddress(item.ipAddress || '');
      setCMacAddress(item.macAddress || '');
      setCHostName(item.hostName || '');
    } else if (type === 'monitor' || type === 'printer' || type === 'mouse' || type === 'keyboard' || type === 'radio' || type === 'cctv') {
      setEquipCode(item.code || '');
      setEquipModel(item.model || '');
      if (type === 'radio') {
        setRadioFreq(item.frequencyRange || '');
        setRadioIp(item.ipRating || '');
      } else if (type === 'cctv') {
        setCctvBrand(item.brand || '');
        setCctvLocation(item.location || '');
        setCctvAccessLink(item.accessLink || '');
      } else if (type === 'printer') {
        setPrinterIp(item.ipAddress || '');
        setPrinterMac(item.macAddress || '');
        setPrinterLink(item.accessLink || '');
      }
    }

    if (type && type !== 'personnel') {
      setEquipStatus(item.status || 'working');
      setEquipDesc(item.description || '');
      setLastServiced(item.lastServiced || '');
    }
  }, [item, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let data: any = { isEdit: true };

    if (type === 'personnel') {
      data.id = item.id;
      data.name = pName;
      data.code = pCode;
      data.title = pTitle;
      data.department = pDept;
      data.location = pLoc;
      data.documentNumber = pDocNum;
      data.status = pStatus;
      data.username = pUsername;
      data.password = pPassword;
    } else if (type === 'case') {
      data.code = cCode;
      data.oldCode = item.code; // Track old code if user modifies Case Code ID
      data.motherboard = cMobo;
      data.cpu = cCpu;
      data.vga = cVga;
      data.hdd1 = cHdd1;
      data.hdd2 = cHdd2;
      data.ramType = cRamType;
      data.ramQty = cRamQty;
      data.power = cPower;
      data.assignedTo = item.assignedTo;
      data.status = equipStatus;
      data.description = equipDesc;
      data.lastServiced = lastServiced;
      data.ipAddress = cIpAddress;
      data.macAddress = cMacAddress;
      data.hostName = cHostName;
    } else if (type === 'monitor' || type === 'printer' || type === 'mouse' || type === 'keyboard' || type === 'radio' || type === 'cctv') {
      data.code = equipCode;
      data.oldCode = item.code;
      data.model = equipModel;
      data.assignedTo = item.assignedTo;
      data.status = equipStatus;
      data.description = equipDesc;
      data.lastServiced = lastServiced;
      if (type === 'radio') {
        data.frequencyRange = radioFreq;
        data.ipRating = radioIp;
      } else if (type === 'cctv') {
        data.brand = cctvBrand;
        data.location = cctvLocation;
        data.accessLink = cctvAccessLink;
      } else if (type === 'printer') {
        data.ipAddress = printerIp;
        data.macAddress = printerMac;
        data.accessLink = printerLink;
      }
    }

    const ok = await onSave(type, data);
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs font-sans text-right">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Title */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-bold text-sm md:text-base">
            ✏️ ویرایش مشخصات {type === 'personnel' ? 'پرسنل' : type === 'case' ? 'کیس کامپیوتر' : type === 'monitor' ? 'مانیتور' : type === 'printer' ? 'پرینتر' : type === 'mouse' ? 'ماوس' : type === 'keyboard' ? 'کیبورد' : type === 'radio' ? 'بی‌سیم' : 'دوربین مداربسته'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-200 hover:text-white text-base font-bold bg-slate-800 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {type === 'personnel' && (
            <div className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نام و نام خانوادگی:</label>
                <input 
                  type="text" required value={pName} onChange={(e) => setPName(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">کد پرسنلی (شناسه ردیاب):</label>
                <input 
                  type="text" required value={pCode} onChange={(e) => setPCode(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">سمت شغلی:</label>
                <input 
                  type="text" value={pTitle} onChange={(e) => setPTitle(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">بخش / واحد خدمتی:</label>
                <input 
                  type="text" value={pDept} onChange={(e) => setPDept(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">موقعیت فیزیکی استقرار:</label>
                <input 
                  type="text" value={pLoc} onChange={(e) => setPLoc(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">شماره سند شناسنامه رسمی (۴ رقمی - اختیاری):</label>
                <input 
                  type="text" value={pDocNum} onChange={(e) => setPDocNum(e.target.value)}
                  placeholder="مثال: 0001"
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">وضعیت فعالیت پرسنل:</label>
                <select
                  value={pStatus}
                  onChange={(e) => setPStatus(e.target.value as 'active' | 'terminated')}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                >
                  <option value="active">🟢 شاغل (فعال)</option>
                  <option value="terminated">🔴 خاتمه همکاری (غیرفعال)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نام کاربری سیستم (Username):</label>
                <input 
                  type="text" value={pUsername} onChange={(e) => setPUsername(e.target.value)}
                  placeholder="مثال: a.ahmadi"
                  className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">رمز عبور سیستم (Password):</label>
                <input 
                  type="text" value={pPassword} onChange={(e) => setPPassword(e.target.value)}
                  placeholder="مثال: P@ssw0rd123"
                  className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {type === 'case' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">کد کیس (اموال):</label>
                <input 
                  type="text" required value={cCode} onChange={(e) => setCCode(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">مادربورد:</label>
                <input 
                  type="text" value={cMobo} onChange={(e) => setCMobo(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">پردازنده:</label>
                <input 
                  type="text" value={cCpu} onChange={(e) => setCCpu(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">کارت گرافیک:</label>
                <input 
                  type="text" value={cVga} onChange={(e) => setCVga(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نسل رم:</label>
                <select 
                  value={cRamType} onChange={(e) => setCRamType(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                >
                  <option value="DDR3">DDR3</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">حافظه رم:</label>
                <input 
                  type="text" value={cRamQty} onChange={(e) => setCRamQty(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">حافظه اول SSD:</label>
                <input 
                  type="text" value={cHdd1} onChange={(e) => setCHdd1(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">حافظه ثانویه HDD:</label>
                <input 
                  type="text" value={cHdd2} onChange={(e) => setCHdd2(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1 md:col-span-2 font-sans">
                <label className="font-bold text-slate-700">مدل منبع تغذیه (Power Supply - پاور):</label>
                <input 
                  type="text" value={cPower} onChange={(e) => setCPower(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
              <div className="space-y-1 font-sans">
                <label className="font-bold text-slate-700">آدرس IP (IP Address):</label>
                <input 
                  type="text" value={cIpAddress} onChange={(e) => setCIpAddress(e.target.value)}
                  placeholder="مثال: 192.168.1.15"
                  className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1 font-sans">
                <label className="font-bold text-slate-700">آدرس فیزیکی (MAC Address):</label>
                <input 
                  type="text" value={cMacAddress} onChange={(e) => setCMacAddress(e.target.value)}
                  placeholder="مثال: 00:1A:2B:3C:4D:5E"
                  className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1 md:col-span-2 font-sans">
                <label className="font-bold text-slate-700">نام کامپیوتر (Host Name):</label>
                <input 
                  type="text" value={cHostName} onChange={(e) => setCHostName(e.target.value)}
                  placeholder="مثال: HR-PC-02"
                  className="w-full text-left p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {(type === 'monitor' || type === 'printer' || type === 'mouse' || type === 'keyboard' || type === 'radio' || type === 'cctv') && (
            <div className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">کد اموال تجهیز:</label>
                <input 
                  type="text" required value={equipCode} onChange={(e) => setEquipCode(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              {type === 'cctv' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">مارک دوربین مداربسته:</label>
                  <input 
                    type="text" required value={cctvBrand} onChange={(e) => setCctvBrand(e.target.value)}
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  {type === 'cctv' ? 'مدل دوربین مداربسته:' : 'نام مدل و سازنده:'}
                </label>
                <input 
                  type="text" required value={equipModel} onChange={(e) => setEquipModel(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              {type === 'cctv' && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">موقعیت استقرار دوربین:</label>
                    <input 
                      type="text" value={cctvLocation} onChange={(e) => setCctvLocation(e.target.value)}
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">لینک دسترسی / آدرس IP (جهت پخش زنده):</label>
                    <input 
                      type="text" value={cctvAccessLink} onChange={(e) => setCctvAccessLink(e.target.value)}
                      placeholder="مثال: http://192.168.1.100"
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </>
              )}
              {type === 'radio' && (
                <>
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-bold text-slate-700">باند فرکانسی (بافرض: UHF / VHF):</label>
                    <input 
                      type="text" value={radioFreq} onChange={(e) => setRadioFreq(e.target.value)}
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-bold text-slate-700">درجه حفاظت فیزیکی (IP Rating):</label>
                    <input 
                      type="text" value={radioIp} onChange={(e) => setRadioIp(e.target.value)}
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
              {type === 'printer' && (
                <>
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-bold text-slate-700">آدرس IP پرینتر:</label>
                    <input 
                      type="text" value={printerIp} onChange={(e) => setPrinterIp(e.target.value)}
                      placeholder="مثال: 192.168.1.50"
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-bold text-slate-700">آدرس فیزیکی (MAC Address):</label>
                    <input 
                      type="text" value={printerMac} onChange={(e) => setPrinterMac(e.target.value)}
                      placeholder="مثال: 00:11:22:33:44:55"
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-bold text-slate-700">لینک صفحه وب مدیریت ریموت پرینتر:</label>
                    <input 
                      type="text" value={printerLink} onChange={(e) => setPrinterLink(e.target.value)}
                      placeholder="مثال: http://192.168.1.50"
                      className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status Dropdown - Show for all types except personnel */}
          {type !== 'personnel' && (
            <>
              <div className="space-y-1.5 p-3 bg-blue-50/45 rounded-lg border border-blue-100/60 text-xs md:text-sm animate-fade-in">
                <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>🩺 وضعیت سلامت تغییر یافته:</span>
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
                      {st === 'repair' && <span>🟡 تعمیر</span>}
                      {st === 'retired' && <span>🔴 اسقاط</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs md:text-sm animate-fade-in">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  📝 توضیحات تکمیلی و ضمیمه:
                </label>
                <textarea
                  value={equipDesc}
                  onChange={(e) => setEquipDesc(e.target.value)}
                  placeholder="مثال: تخصیص مجدد داده شده، دارای ایراد جزئی در پورت‌ها، مشخصات فن یا هرگونه یادداشت دفتری دیگر..."
                  rows={3}
                  className="w-full text-right p-2.5 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs md:text-sm animate-fade-in">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  ⚠️ تاریخ آخرین سرویس (خورشیدی YYYY/MM/DD):
                </label>
                <input
                  type="text"
                  value={lastServiced}
                  onChange={(e) => setLastServiced(e.target.value)}
                  placeholder="مثال: 1404/03/15"
                  className="w-full text-right p-2.5 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono"
                />
              </div>
            </>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded text-xs md:text-sm shadow transition cursor-pointer"
            >
              💾 ثبت تغییرات جدید
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded text-xs md:text-sm transition cursor-pointer"
            >
              لغو ویرایش
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
