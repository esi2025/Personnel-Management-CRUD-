import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Eye, EyeOff, Save, Trash2, Plus, Info, Check, Lock, ShieldAlert } from 'lucide-react';
import { SystemUser } from '../types';

interface UsersTabProps {
  currentUser: SystemUser;
}

export default function UsersTab({ currentUser }: UsersTabProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConnectionIp, setCurrentConnectionIp] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer' | 'editor_equipment' | 'custom'>('viewer');
  const [canEditPersonnel, setCanEditPersonnel] = useState(false);
  const [canEditEquipment, setCanEditEquipment] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [canBackup, setCanBackup] = useState(false);
  const [allowedIPs, setAllowedIPs] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const loadUsersAndSession = () => {
    setLoading(true);
    setError(null);
    
    // Fetch users list from server
    fetch('/api/users')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`خطای پاسخ سرور با کد وضعیت ${res.status}`);
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          console.error("Non-JSON Response:", text);
          throw new Error("قالب داده برگشتی سرور JSON نیست. احتمالاً مسیر یابی وب‌سرور (IIS/XAMPP) اشتباه است و فایل index.html برگردانده شده است.");
        }
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading users:", err);
        setError(`خطا در بارگذاری لیست کاربران: ${err.message || err}. مطمئن شوید بک‌اند سیستم (Node.js) روی پورت 3000 فعال است و ماژول URL Rewrite روی وب‌سرور تنظیم شده است.`);
        setLoading(false);
      });

    // Fetch session details to display connection IP
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (data.ip) {
          setCurrentConnectionIp(data.ip);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUsersAndSession();
  }, []);

  // Update toggles based on role templates automatically
  useEffect(() => {
    if (role === 'admin') {
      setCanEditPersonnel(true);
      setCanEditEquipment(true);
      setCanExport(true);
      setCanBackup(true);
    } else if (role === 'viewer') {
      setCanEditPersonnel(false);
      setCanEditEquipment(false);
      setCanExport(false);
      setCanBackup(false);
    } else if (role === 'editor_equipment') {
      setCanEditPersonnel(false);
      setCanEditEquipment(true);
      setCanExport(true);
      setCanBackup(false);
    }
  }, [role]);

  const handleEditTrigger = (user: SystemUser) => {
    setEditingId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '');
    setRole(user.role);
    setCanEditPersonnel(user.canEditPersonnel);
    setCanEditEquipment(user.canEditEquipment);
    setCanExport(user.canExport);
    setCanBackup(user.canBackup);
    setAllowedIPs(user.allowedIPs || '');
    setError(null);
    setSuccess(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('viewer');
    setCanEditPersonnel(false);
    setCanEditEquipment(false);
    setCanExport(false);
    setCanBackup(false);
    setAllowedIPs('');
    setError(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("لطفاً فیلدهای الزامی نام، نام کاربری و رمز عبور را پر نمایید.");
      return;
    }

    try {
      const response = await fetch('/api/users/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-operator-username': currentUser?.username || 'admin',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({
          id: editingId,
          username: username.trim(),
          password: password,
          role,
          name: name.trim(),
          canEditPersonnel,
          canEditEquipment,
          canExport,
          canBackup,
          allowedIPs: allowedIPs.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(editingId ? "اطلاعات کاربر با موفقیت ویرایش گردید." : "کاربر جدید با موفقیت به سیستم اضافه گردید.");
        resetForm();
        loadUsersAndSession();
      } else {
        setError(data.error || "خطا در ذخیره‌سازی اطلاعات کاربر.");
      }
    } catch (err) {
      console.error(err);
      setError("خطای ارتباط با سرور پایگاه داده.");
    }
  };

  const handleDeleteUser = async (id: string, usernameStr: string) => {
    if (usernameStr === 'admin') {
      alert("حذف کاربر ارشد ادمین سیستم مسدود است!");
      return;
    }

    if (!confirm(`آیا مایل به حذف کاربری «${usernameStr}» هستید؟`)) {
      return;
    }

    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-operator-username': currentUser?.username || 'admin',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("کاربر مدنظر با موفقیت از سیستم حذف گردید.");
        loadUsersAndSession();
      } else {
        setError(data.error || "خطا در عملکرد حذف کاربر.");
      }
    } catch (err) {
      console.error(err);
      setError("خطا در ارتباط با سرور.");
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-8 rounded-xl text-center border border-red-200" dir="rtl">
        <ShieldAlert size={48} className="mx-auto mb-3 text-red-500" />
        <h3 className="font-bold text-base">دسترسی محدود شده است!</h3>
        <p className="text-sm mt-1.5 leading-relaxed">
          فقط کاربری مدیریت کل (Admin) مجاز به ورود و ویرایش در پنل مدیریت پرسنل و دسترسی‌های کاربران سیستم می‌باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none leading-relaxed text-right font-sans" dir="rtl">
      
      {/* Upper informational bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black">پنل مدیریت دسترسی کاربران امنیتی سیستم</h3>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium">امکان تعریف نقش‌های مدیریتی، تخصیص دسترسی تجهیزات و کنترل آی‌پی‌های سفید کارگاهی</p>
          </div>
        </div>
        <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-[11px] flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-slate-400 font-medium">آی‌پی اتصال سرور ادمین:</span>
          <span className="font-mono font-bold text-emerald-400 select-all">{currentConnectionIp || 'در حال شناسایی...'}</span>
        </div>
      </div>

      {/* Alert Boxes */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-400 p-4 rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-xs font-semibold">
          ✅ {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Column */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs md:text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-855 flex items-center gap-2">
            <Plus size={16} className="text-blue-500" />
            <span>{editingId ? '✍️ ویرایش مشخصات کاربر' : '➕ تعریف کاربر امنیتی جدید'}</span>
          </h4>

          <form onSubmit={handleSaveUser} className="space-y-3 text-xs md:text-sm">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">نام کامل پرسنل:</label>
              <input
                type="text"
                placeholder="مثال: مهندس رنجبر"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">نام کاربری (لاتین):</label>
                <input
                  type="text"
                  placeholder="مثال: custom_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={editingId !== null && username === 'admin'}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs tracking-wide font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">کلمه عبور (رمز عبور):</label>
                <input
                  type="text"
                  placeholder="مثال: 123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">نقش از پیش تعریف شده (قالب دسترسی):</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                disabled={editingId !== null && username === 'admin'}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              >
                <option value="admin">ادمین سیستم (Admin - دسترسی کامل)</option>
                <option value="editor_equipment">اپراتور تجهیزات (فقط ویرایش کامپیوترها)</option>
                <option value="viewer">کاربر بازدید کننده (Viewer - فقط ناظر و بازدید)</option>
                <option value="custom">دسته‌بندی اختیاری (سفارشی ساز دستی)</option>
              </select>
            </div>

            {/* Permissions Checkboxes block */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 block border-b border-slate-200/50 pb-1.5">تعیین دقیق سطوح دسترسی (سخت‌افزار و عملیات):</span>
              
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={canEditPersonnel}
                  onChange={(e) => setCanEditPersonnel(e.target.checked)}
                  disabled={role !== 'custom'}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>افزودن و ویرایش پرونده پرسنلی دارد</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={canEditEquipment}
                  onChange={(e) => setCanEditEquipment(e.target.checked)}
                  disabled={role !== 'custom'}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>افزودن و ویرایش تجهیزات (کیس، مانیتور و...) دارد</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={canExport}
                  onChange={(e) => setCanExport(e.target.checked)}
                  disabled={role !== 'custom'}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>استخراج و خروجی اکسل و پیش‌نمایش شناسنامه دارد</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={canBackup}
                  onChange={(e) => setCanBackup(e.target.checked)}
                  disabled={role !== 'custom'}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>پشتیبان‌گیری، مدیریت دیتابیس و دانلود کد ZIP دارد</span>
              </label>
            </div>

            {/* IP Whitelist System Configuration */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block mr-1">محدود کردن دسترسی به IP سیستمی خاص (سفید):</label>
              <input
                type="text"
                placeholder="مثال: 192.168.1.15, 127.0.0.1 (خالی یعنی آزاد برای همه)"
                value={allowedIPs}
                onChange={(e) => setAllowedIPs(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tracking-wider text-left"
                dir="ltr"
              />
              <span className="text-[9px] text-slate-400 block leading-normal mt-1">
                📌 چنانچه می‌خواهید این سیستم فقط از آی‌پی خاصی باز شود، آن آی‌پی را درج کنید. برای وارد کردن بیش از یک آی‌پی، از کاما ( , ) استفاده کنید.
              </span>
            </div>

            {/* Bottom Actions Form */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                <span>ذخیره تنظیمات کاربر</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition"
                >
                  انصراف
                </button>
              )}
            </div>

          </form>
        </div>

        {/* User Table Grid Column */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <h4 className="text-xs md:text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-800 flex justify-between items-center">
            <span>👥 لیست کاربران و پرسنل دسترسی سیستم</span>
            <span className="text-[10px] text-slate-400 font-medium">مجموع کل: {users.length} کاربر</span>
          </h4>

          {loading ? (
            <p className="text-center text-slate-450 py-10">در حال دریافت اطلاعات پرسنل دسترسی...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="p-3">پرسنل سیستم</th>
                    <th className="p-3">نام کاربری</th>
                    <th className="p-3">کلمه عبور</th>
                    <th className="p-3">قالب نقش</th>
                    <th className="p-3">صلاحیت دسترسی‌ها</th>
                    <th className="p-3">ای‌پی مجاز (سفید)</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 font-medium">
                  {users.map(u => {
                    const isPassShown = !!showPasswords[u.id];
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                        </td>
                        <td className="p-3 font-mono font-bold select-all">{u.username}</td>
                        <td className="p-3 font-mono">
                          <div className="flex items-center gap-1 bg-slate-50/50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/50 p-1 px-1.5 rounded select-all max-w-[110px]">
                            <span>{isPassShown ? u.password : '••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer max-xs:hidden mr-auto"
                            >
                              {isPassShown ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          {u.role === 'admin' ? (
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold p-1 px-2 border border-rose-200 rounded">مدیریت کل (Ad)</span>
                          ) : u.role === 'editor_equipment' ? (
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold p-1 px-2 border border-blue-200 rounded">اپراتور تجهیزات</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold p-1 px-2 border border-slate-200 rounded">ناظر فقط بازدید</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {u.canEditPersonnel && <span className="bg-emerald-50 text-emerald-700 text-[9px] p-0.5 px-1 rounded font-bold border border-emerald-150">کارکنان</span>}
                            {u.canEditEquipment && <span className="bg-emerald-50 text-emerald-700 text-[9px] p-0.5 px-1 rounded font-bold border border-emerald-150">تجهیزات</span>}
                            {u.canExport && <span className="bg-emerald-50 text-emerald-700 text-[9px] p-0.5 px-1 rounded font-bold border border-emerald-150">خروجی</span>}
                            {u.canBackup && <span className="bg-emerald-50 text-emerald-700 text-[9px] p-0.5 px-1 rounded font-bold border border-emerald-150">پشتیبان</span>}
                            {!u.canEditPersonnel && !u.canEditEquipment && !u.canExport && !u.canBackup && <span className="text-slate-400 text-[10px] font-medium">— فاقد صلاحیت —</span>}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[10px] select-all max-w-[130px] truncate" title={u.allowedIPs || 'آزاد برای همگان'}>
                          {u.allowedIPs ? (
                            <span className="text-slate-800 font-bold bg-slate-50 p-1 rounded border border-slate-200 text-left" dir="ltr">{u.allowedIPs}</span>
                          ) : (
                            <span className="text-slate-400 font-medium">🔓 آزاد (هر آی‌پی)</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleEditTrigger(u)}
                              className="text-indigo-650 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer text-xs"
                              title="ویرایش مشخصات"
                            >
                              ✍️ ویرایش
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              disabled={u.username === 'admin'}
                              className={`p-1.5 rounded-lg cursor-pointer text-xs ${u.username === 'admin' ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                              title="حذف کاربر"
                            >
                              🗑️ حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
