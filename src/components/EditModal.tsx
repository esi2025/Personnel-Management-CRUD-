import React, { useState, useEffect } from 'react';

interface EditModalProps {
  item: any;
  type: 'personnel' | 'case' | 'monitor' | 'printer' | null;
  onClose: () => void;
  onSave: (type: 'personnel' | 'case' | 'monitor' | 'printer', data: any) => Promise<boolean>;
}

export default function EditModal({ item, type, onClose, onSave }: EditModalProps) {
  if (!item || !type) return null;

  // Personnel states
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDept, setPDept] = useState('');
  const [pLoc, setPLoc] = useState('');

  // Case states
  const [cCode, setCCode] = useState('');
  const [cMobo, setCMobo] = useState('');
  const [cCpu, setCCpu] = useState('');
  const [cVga, setCVga] = useState('');
  const [cHdd1, setCHdd1] = useState('');
  const [cHdd2, setCHdd2] = useState('');
  const [cRamType, setCRamType] = useState('DDR4');
  const [cRamQty, setCRamQty] = useState('8GB');

  // Monitor/Printer states
  const [equipCode, setEquipCode] = useState('');
  const [equipModel, setEquipModel] = useState('');

  // Sync inputs with item when mounted
  useEffect(() => {
    if (type === 'personnel') {
      setPName(item.name || '');
      setPCode(item.code || '');
      setPTitle(item.title || '');
      setPDept(item.department || '');
      setPLoc(item.location || '');
    } else if (type === 'case') {
      setCCode(item.code || '');
      setCMobo(item.motherboard || '');
      setCCpu(item.cpu || '');
      setCVga(item.vga || '');
      setCHdd1(item.hdd1 || '');
      setCHdd2(item.hdd2 || '');
      setCRamType(item.ramType || 'DDR4');
      setCRamQty(item.ramQty || '8GB');
    } else if (type === 'monitor' || type === 'printer') {
      setEquipCode(item.code || '');
      setEquipModel(item.model || '');
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
      data.assignedTo = item.assignedTo;
    } else if (type === 'monitor' || type === 'printer') {
      data.code = equipCode;
      data.oldCode = item.code;
      data.model = equipModel;
      data.assignedTo = item.assignedTo;
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
            ✏️ ویرایش مشخصات {type === 'personnel' ? 'پرسنل' : type === 'case' ? 'کیس کامپیوتر' : type === 'monitor' ? 'مانیتور' : 'پرینتر'}
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
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">حافظه ثانویه HDD:</label>
                <input 
                  type="text" value={cHdd2} onChange={(e) => setCHdd2(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                />
              </div>
            </div>
          )}

          {(type === 'monitor' || type === 'printer') && (
            <div className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">کد اموال تجهیز:</label>
                <input 
                  type="text" required value={equipCode} onChange={(e) => setEquipCode(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نام مدل و سازنده:</label>
                <input 
                  type="text" required value={equipModel} onChange={(e) => setEquipModel(e.target.value)}
                  className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
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
