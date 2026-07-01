import React, { useState } from 'react';

interface Parameter {
  name: string;
  key: string;
  type: 'text' | 'number';
}

interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  fields: Parameter[];
}

interface DefineHardwareTabProps {
  customCategories: CustomCategory[];
  customEquipment: any[];
  onSaveCategory: (categoryData: any) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<void>;
  currentUser: any;
}

const ICON_PRESETS = [
  { char: '📟', label: 'حضور و غیاب' },
  { char: '📶', label: 'بی‌سیم / مودم' },
  { char: '🖧', label: 'سوییچ / شبکه' },
  { char: '📠', label: 'فکس / کپی' },
  { char: '🔌', label: 'یو‌پی‌اس / برق' },
  { char: '🌐', label: 'تجهیز تحت وب' },
  { char: '🔋', label: 'باتری / شارژر' },
  { char: '🖥️', label: 'رایانه' },
  { char: '📱', label: 'موبایل / تبلت' },
  { char: '🎙️', label: 'سیستم صوتی' },
  { char: '📡', label: 'گیرنده / فرستنده' },
  { char: '⚙️', label: 'سایر سخت‌افزارها' },
];

export default function DefineHardwareTab({
  customCategories,
  customEquipment,
  onSaveCategory,
  onDeleteCategory,
  currentUser,
}: DefineHardwareTabProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📟');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [newParamName, setNewParamName] = useState('');
  const [newParamType, setNewParamType] = useState<'text' | 'number'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset loader
  const handleApplyPreset = (presetType: 'attendance' | 'network' | 'blank') => {
    if (presetType === 'attendance') {
      setName('دستگاه حضور و غیاب');
      setIcon('📟');
      setParameters([
        { name: 'مارک دستگاه', key: 'brand', type: 'text' },
        { name: 'مدل دستگاه', key: 'model', type: 'text' },
        { name: 'آی پی آدرس دستگاه', key: 'ipAddress', type: 'text' },
        { name: 'مک آدرس دستگاه', key: 'macAddress', type: 'text' },
      ]);
    } else if (presetType === 'network') {
      setName('سوییچ و تجهیزات شبکه');
      setIcon('🖧');
      setParameters([
        { name: 'برند', key: 'brand', type: 'text' },
        { name: 'مدل', key: 'model', type: 'text' },
        { name: 'تعداد پورت', key: 'portsCount', type: 'number' },
        { name: 'آی پی آدرس مدیریت', key: 'ipAddress', type: 'text' },
        { name: 'مک آدرس دستگاه', key: 'macAddress', type: 'text' },
      ]);
    } else {
      setName('');
      setIcon('⚙️');
      setParameters([]);
    }
  };

  const handleAddParameter = () => {
    if (!newParamName.trim()) return;
    const key = 'field_' + Date.now();
    setParameters([...parameters, { name: newParamName.trim(), key, type: newParamType }]);
    setNewParamName('');
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفاً نام سخت‌افزار جدید را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    const catId = 'custom_' + Date.now();
    const success = await onSaveCategory({
      id: catId,
      name: name.trim(),
      icon,
      fields: parameters,
    });

    setIsSubmitting(false);
    if (success) {
      alert('دسته سخت‌افزاری جدید با موفقیت تعریف گردید و به بخش دوم منوی ناوبری اضافه شد.');
      setName('');
      setIcon('📟');
      setParameters([]);
    }
  };

  const getEquipmentCount = (catId: string) => {
    return customEquipment.filter((item) => item.categorySlug === catId).length;
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">🛠️ تعریف دسته سخت‌افزاری جدید</h3>
          <p className="text-xs text-slate-500 mt-1">
            در این بخش می‌توانید دسته‌بندی‌های جدید و دلخواه سخت‌افزاری (مانند دستگاه حضور و غیاب، روتر، وب‌کم و...) با پارامترهای اختصاصی تعریف نمایید.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleApplyPreset('attendance')}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            📟 الگو: دستگاه حضور و غیاب
          </button>
          <button
            onClick={() => handleApplyPreset('network')}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            🖧 الگو: سوییچ و تجهیزات شبکه
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Create new Category */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h4 className="text-sm font-black text-slate-950 pb-2 border-b border-slate-100">📋 تعریف سخت‌افزار با پارامترهای خاص</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام دسته‌بندی سخت‌افزار (مثال: دستگاه حضور و غیاب)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام سخت‌افزار جدید را بنویسید..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                required
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">انتخاب نماد تصویری (آیکون)</label>
              <div className="grid grid-cols-6 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {ICON_PRESETS.map((preset) => (
                  <button
                    key={preset.char}
                    type="button"
                    onClick={() => setIcon(preset.char)}
                    title={preset.label}
                    className={`p-2 rounded-md text-base transition-all text-center flex items-center justify-center cursor-pointer ${
                      icon === preset.char
                        ? 'bg-blue-600 text-white scale-110 shadow-xs'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {preset.char}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Builder */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">افزودن پارامتر اختصاصی جدید</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newParamName}
                  onChange={(e) => setNewParamName(e.target.value)}
                  placeholder="نام پارامتر (مثال: مارک دستگاه)"
                  className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                />
                <select
                  value={newParamType}
                  onChange={(e: any) => setNewParamType(e.target.value)}
                  className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="text">متن</option>
                  <option value="number">عدد</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddParameter}
                  className="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  افزودن
                </button>
              </div>
            </div>

            {/* List of custom parameters */}
            <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
              <div className="text-[10px] font-black text-slate-500 mb-1">فهرست پارامترهای اختصاصی این سخت‌افزار:</div>
              
              {/* Mandatory fields (automatically added) */}
              <div className="flex flex-wrap gap-1 mb-2 border-b border-dashed border-slate-200 pb-2">
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">📌 کد اموال (یکتا)</span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">📌 موقعیت استقرار</span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">📌 وضعیت سلامت</span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">📌 پرسنل تحویل‌گیرنده</span>
              </div>

              {parameters.length === 0 ? (
                <div className="text-[10px] text-slate-400 py-1 text-center">هیچ پارامتر سفارشی دیگری تعریف نشده است.</div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {parameters.map((param, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-2 py-1.5 rounded-md border border-slate-200 text-[10px] font-bold">
                      <span className="text-slate-800">
                        {param.name} <span className="text-[9px] text-slate-400">({param.type === 'text' ? 'متنی' : 'عددی'})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParameter(index)}
                        className="text-red-500 hover:text-red-700 font-bold px-1 cursor-pointer"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              🚀 ثبت و انتشار دسته‌بندی جدید
            </button>
          </form>
        </div>

        {/* Right Content: Defined Custom Categories list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-black text-slate-950 pb-2 border-b border-slate-100">📋 دسته‌بندی‌های تعریف شده توسط ادمین</h4>

          {customCategories.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <span className="text-3xl block mb-2">⚙️</span>
              هیچ دسته‌بندی سخت‌افزاری سفارشی تاکنون تعریف نشده است.
              <p className="text-[10px] text-slate-400 mt-1">با استفاده از فرم روبرو، اولین دسته‌بندی خود را تعریف کنید تا در بخش دوم ناوبری به صورت پویا ظاهر شود.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customCategories.map((cat) => {
                const count = getEquipmentCount(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 transition hover:shadow-xs flex flex-col justify-between space-y-3 bg-slate-50/40 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-white border border-slate-200 rounded-lg shadow-2xs shrink-0 select-none">
                          {cat.icon || '⚙️'}
                        </span>
                        <div>
                          <h5 className="text-xs font-black text-slate-900">{cat.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {count} عدد تجهیز ثبت شده
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 text-[10px] space-y-1">
                      <div className="font-bold text-slate-500">پارامترهای انحصاری:</div>
                      <div className="flex flex-wrap gap-1">
                        {cat.fields && cat.fields.length > 0 ? (
                          cat.fields.map((f: any, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {f.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">بدون پارامتر اختصاصی اضافه (فقط فیلدهای پیش‌فرض)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
                      <span className="text-[10px] text-slate-400">ثبت در پایگاه داده مرکزی کارگاه</span>
                      <button
                        onClick={async () => {
                          if (confirm(`آیا از حذف دسته‌بندی "${cat.name}" اطمینان کامل دارید؟`)) {
                            await onDeleteCategory(cat.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-[10px] font-bold transition cursor-pointer px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      >
                        🗑️ حذف دسته‌بندی
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
