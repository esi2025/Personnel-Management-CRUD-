import React, { useState, useMemo } from 'react';

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

interface CustomEquipmentSubTabProps {
  category: CustomCategory;
  equipmentList: any[];
  personnel: any[];
  onSaveItem: (type: string, data: any) => Promise<boolean>;
  onDeleteItem: (type: string, id: string) => Promise<void>;
  onTransfer: (code: string) => void;
  onShowQR: (code: string, type: string, data: any) => void;
  currentUser: any;
}

export default function CustomEquipmentSubTab({
  category,
  equipmentList,
  personnel,
  onSaveItem,
  onDeleteItem,
  onTransfer,
  onShowQR,
  currentUser,
}: CustomEquipmentSubTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('کارگاه بوشهر');
  const [status, setStatus] = useState('working');
  const [description, setDescription] = useState('');
  const [lastServiced, setLastServiced] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedEquipment = useMemo(() => {
    if (!sortField) return equipmentList;
    return [...equipmentList].sort((a: any, b: any) => {
      let valA = String(a[sortField] || '');
      let valB = String(b[sortField] || '');
      return sortAsc ? valA.localeCompare(valB, 'fa') : valB.localeCompare(valA, 'fa');
    });
  }, [equipmentList, sortField, sortAsc]);

  const getOwnerName = (assignedToCode: string | null) => {
    if (!assignedToCode) return 'انبار مرکزی کارگاه';
    const found = personnel.find((p) => p.code === assignedToCode);
    return found ? `${found.name} (${found.department})` : assignedToCode;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCode('');
    setLocation('کارگاه بوشهر');
    setStatus('working');
    setDescription('');
    setLastServiced('');
    
    const initialCustoms: Record<string, string> = {};
    category.fields.forEach((f) => {
      initialCustoms[f.key] = '';
    });
    setCustomValues(initialCustoms);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setCode(item.code);
    setLocation(item.location || 'کارگاه بوشهر');
    setStatus(item.status || 'working');
    setDescription(item.description || '');
    setLastServiced(item.lastServiced || '');

    const currentCustoms: Record<string, string> = {};
    category.fields.forEach((f) => {
      currentCustoms[f.key] = item[f.key] || '';
    });
    setCustomValues(currentCustoms);
    setShowModal(true);
  };

  const handleCustomChange = (key: string, value: string) => {
    setCustomValues({
      ...customValues,
      [key]: value,
    });
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('کد اموال الزامی است.');
      return;
    }

    const itemData = {
      id: editingItem ? editingItem.id : undefined,
      isEdit: !!editingItem,
      code: code.trim(),
      location,
      status,
      description,
      lastServiced,
      assignedTo: editingItem ? editingItem.assignedTo : null,
      ...customValues,
    };

    const success = await onSaveItem(category.id, itemData);
    if (success) {
      setShowModal(false);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl p-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs select-none">
            {category.icon || '⚙️'}
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-800">تجهیزات دسته: {category.name}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">دسته‌بندی سخت‌افزاری سفارشی فعال</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
        >
          ➕ ثبت تجهیز جدید در {category.name}
        </button>
      </div>

      {/* Table Panel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 whitespace-nowrap">
                <th
                  onClick={() => handleSort('code')}
                  className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition"
                >
                  کد سخت‌افزار (اموال)
                </th>
                
                {/* Dynamically render headers for custom fields */}
                {category.fields.map((field) => (
                  <th
                    key={field.key}
                    onClick={() => handleSort(field.key)}
                    className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition"
                  >
                    {field.name}
                  </th>
                ))}

                <th
                  onClick={() => handleSort('location')}
                  className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition"
                >
                  موقعیت استقرار
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="p-3 font-bold text-right cursor-pointer hover:bg-slate-100 select-none transition"
                >
                  وضعیت سلامت
                </th>
                <th className="p-3 font-bold text-right select-none">توضیحات</th>
                <th className="p-3 font-bold text-right select-none">تحویل به (مسئول مربوطه)</th>
                <th className="p-3 font-bold text-center select-none">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody>
              {sortedEquipment.length === 0 ? (
                <tr>
                  <td colSpan={6 + category.fields.length} className="p-8 text-center text-slate-400">
                    هیچ سخت‌افزاری در دسته <span className="font-bold text-slate-700">"{category.name}"</span> ثبت نگردیده است. نسبت به ثبت تجهیز اقدام نمایید.
                  </td>
                </tr>
              ) : (
                sortedEquipment.map((item) => {
                  const isIp = category.fields.some(f => f.key === 'ipAddress' || f.name.includes('آی پی') || f.name.toLowerCase().includes('ip'));
                  const ipVal = isIp ? (item.ipAddress || item[category.fields.find(f => f.key === 'ipAddress' || f.name.includes('آی پی') || f.name.toLowerCase().includes('ip'))?.key || '']) : '';
                  const hostVal = item.hostName || item.brand || item.model || '';

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer whitespace-nowrap"
                      onClick={() => onShowQR(item.code, category.id, item)}
                      title="کلیک جهت مشاهده بارکد اموال"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 select-none">
                            📸 QR
                          </span>
                          <span>{item.code}</span>
                        </div>
                      </td>

                      {/* Render custom values dynamically */}
                      {category.fields.map((field) => (
                        <td key={field.key} className="p-3 text-slate-700">
                          {item[field.key] !== undefined && item[field.key] !== '' ? (
                            <span className={field.key.toLowerCase().includes('ip') || field.key.toLowerCase().includes('mac') ? 'font-mono' : ''}>
                              {item[field.key]}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}

                      <td className="p-3 text-slate-600">{item.location || 'کارگاه بوشهر'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'working'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'repair'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.status === 'working' ? 'فعال و سالم' : item.status === 'repair' ? 'در دست تعمیر' : 'اسقاط شده'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{item.description || '—'}</td>
                      <td className="p-3 font-medium text-slate-800">
                        {getOwnerName(item.assignedTo)}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onTransfer(item.code)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                          >
                            🔄 انتقال هوشمند
                          </button>
                          
                          {ipVal && (
                            <a
                              href={`http://${ipVal}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                              title="ورود به پنل وب ریموت دستگاه"
                            >
                              🌐 اتصال ریموت
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                          >
                            📝 ویرایش
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('آیا مطمئن هستید که می‌خواهید این تجهیز را به طور کامل حذف کنید؟')) {
                                onDeleteItem(category.id, item.id);
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon || '⚙️'}</span>
                <span className="font-black text-sm">
                  {editingItem ? `ویرایش اطلاعات تجهیز در ${category.name}` : `ثبت تجهیز جدید در ${category.name}`}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold transition text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {/* Property code */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد اموال (یکتا) *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="مثال: EQ-9821"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    required
                    disabled={!!editingItem}
                  />
                </div>

                {/* Dynamically generate inputs for category custom fields */}
                {category.fields.map((field) => (
                  <div key={field.key} className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">{field.name}</label>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={customValues[field.key] || ''}
                      onChange={(e) => handleCustomChange(field.key, e.target.value)}
                      placeholder={`وارد کنید...`}
                      className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden ${
                        field.key.toLowerCase().includes('ip') || field.key.toLowerCase().includes('mac') ? 'font-mono' : ''
                      }`}
                    />
                  </div>
                ))}

                {/* Location */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">موقعیت استقرار</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: ساختمان اداری"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">وضعیت سلامت</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="working">فعال و سالم</option>
                    <option value="repair">در دست تعمیر</option>
                    <option value="retired">اسقاط شده</option>
                  </select>
                </div>

                {/* Last serviced date */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ آخرین سرویس دوره‌ای</label>
                  <input
                    type="text"
                    value={lastServiced}
                    onChange={(e) => setLastServiced(e.target.value)}
                    placeholder="مثال: ۱۴۰۵/۰۲/۱۵"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 font-sans focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات و یادداشت‌ها</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="توضیحات تکمیلی پیرامون وضعیت فیزیکی..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden h-16"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  💾 ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
