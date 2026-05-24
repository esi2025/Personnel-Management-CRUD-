import React, { useState } from 'react';
import { CatalogItem } from '../types';

interface PartsCatalogTabProps {
  catalog: CatalogItem[];
  onSave: (type: 'catalog', data: any) => Promise<boolean>;
  onDelete: (type: 'catalog', id: string) => Promise<void>;
}

const CATEGORIES = {
  cpu: { label: 'پردازنده (CPU)', icon: '⚙️' },
  motherboard: { label: 'مادربرد (Motherboard)', icon: '🔌' },
  vga: { label: 'کارت گرافیک (GPU)', icon: '🎮' },
  ramType: { label: 'نوع رم (RAM)', icon: '⚡' },
  monitorBrand: { label: 'برند و سایز مانیتور', icon: '📺' },
  printerBrand: { label: 'مارک پرینتر', icon: '🖨️' },
  printerFeature: { label: 'قابلیت و تنوع چاپ (تک/چند کاره)', icon: '📄' }
};

export default function PartsCatalogTab({ catalog = [], onSave, onDelete }: PartsCatalogTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState<keyof typeof CATEGORIES>('cpu');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleResetForm = () => {
    setCategory('cpu');
    setName('');
    setDescription('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (item: CatalogItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setName(item.name);
    setDescription(item.description);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفا نام قطعه یا مدل مرجع را وارد نمایید.');
      return;
    }

    const payload: any = {
      isEdit: !!editingId,
      category,
      name,
      description
    };
    if (editingId) {
      payload.id = editingId;
      payload.code = 'catalog-fixed-code'; // redundant but needed by schema guarding
    } else {
      payload.code = 'catalog-fixed-code';
    }

    const success = await onSave('catalog', payload);
    if (success) {
      alert('بخش معرفی قطعه با موفقیت به‌روزرسانی شد.');
      handleResetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این قطعه مرجع از کاتالوگ اطمینان دارید؟')) return;
    await onDelete('catalog', id);
    alert('قطعه با موفقیت از سیستم حذف شد.');
  };

  const filteredCatalog = selectedCategory === 'all'
    ? catalog
    : catalog.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">🛠️ کاتالوگ و معرفی قطعات اصلی (مرجع فناوری اطلاعات)</h3>
          <p className="text-slate-500 text-xs mt-1">بخش استانداردسازی و معرفی قطعات کارگاه بوشهر - شرکت عمران آذرستان</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition cursor-pointer"
          >
            ➕ معرفی قطعه جدید
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800">
            {editingId ? '✏️ ویرایش قطعه مرجع معرفی‌شده' : '➕ معرفی مشخصات قطعه جدید'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">دسته‌بندی قطعه/ویژگی:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-right p-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">نام دقیق قطعه / مارک / مدل:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً AMD Ryzen 5 5600X یا ASUS ROG STRIX B550"
                className="w-full text-right p-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">سایر مشخصات فنی / سایز / قابلیت‌ها:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثلاً فرکانس 3.7GHz یا کپی/اسکن رنگی، سایز مانیتور ۲۴ اینچ و..."
                className="w-full text-right p-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              ذخیره و انتشار در کاتالوگ
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      {/* Categories Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'all' 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📂 همه موارد ({catalog.length})
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const count = catalog.filter(item => item.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 text-xs rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Catalog Render Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
            هیچ قطعه‌ای در این دسته‌بندی معرفی نگردیده است.
          </div>
        ) : (
          filteredCatalog.map((item) => {
            const catMeta = CATEGORIES[item.category] || { label: 'غیره', icon: '❓' };
            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition relative group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded flex items-center gap-1">
                      <span>{catMeta.icon}</span>
                      <span>{catMeta.label}</span>
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm md:text-base mb-1">{item.name}</h5>
                  {item.description && (
                    <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded transition cursor-pointer"
                  >
                    ✏️ ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded transition cursor-pointer"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 text-xs text-blue-900 leading-relaxed mb-6">
        <h4 className="font-bold mb-1.5 flex items-center gap-1">
          <span>ℹ️</span>
          <span>راهنمای بخش قطعات مرجع کارگاه (سخت‌افزار استاندارد کارگاهی)</span>
        </h4>
        <p className="mb-1">
          این کاتالوگ جهت ایجاد شناسنامه هماهنگ سخت‌افزاری، معرفی مدل‌های دقیق قطعات اصلی رایانه‌ها مانند: پردازنده‌های مرکزی، مادربوردها، کارت‌های گرافیک، مشخصات رم‌ها، انواع مانیتور، مارک پرینترها و چندکاره‌ها (پرینتر/کپی/اسکن) تدارک دیده شده است.
        </p>
        <p>
          پرسنل فناوری اطلاعات کارگاه بوشهر می‌توانند از این مرجع برای معرفی قطعات مجاز و شناسایی ویژگی‌های استاندارد استفاده نمایند.
        </p>
      </div>
    </div>
  );
}
