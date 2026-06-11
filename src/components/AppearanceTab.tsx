import React, { useState, useEffect } from 'react';
import { ThemeSettings, SystemUser } from '../types';

interface AppearanceTabProps {
  currentUser: SystemUser | null;
  currentTheme: ThemeSettings;
  onThemeUpdated: (updatedTheme: ThemeSettings) => void;
}

export default function AppearanceTab({ currentUser, currentTheme, onThemeUpdated }: AppearanceTabProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Local state for form controls
  const [selectedMode, setSelectedMode] = useState<ThemeSettings['themeMode']>(currentTheme.themeMode || 'slate-dark');
  const [selectedFont, setSelectedFont] = useState<ThemeSettings['fontFamily']>(currentTheme.fontFamily || 'Vazirmatn');
  const [accentColor, setAccentColor] = useState(currentTheme.accentColor || '#3b82f6');
  const [containerBg, setContainerBg] = useState(currentTheme.containerBackground || '#0f172a');
  const [cardGlow, setCardGlow] = useState(currentTheme.cardGlow !== false);
  const [welcomeTitle, setWelcomeTitle] = useState(currentTheme.welcomeTitle || 'اموال و تجهیزات فاوا کارگاه بوشهر');
  const [borderRadius, setBorderRadius] = useState<ThemeSettings['appBorderRadius']>(currentTheme.appBorderRadius || 'rounded-xl');
  const [glowStyle, setGlowStyle] = useState<ThemeSettings['workspaceGlowStyle']>(currentTheme.workspaceGlowStyle || 'soft');
  const [navOpacity, setNavOpacity] = useState(currentTheme.navbarOpacity || '90');

  useEffect(() => {
    setIsAdmin(currentUser?.role === 'admin');
  }, [currentUser]);

  // Synchronize local states when prop changes
  useEffect(() => {
    setSelectedMode(currentTheme.themeMode || 'slate-dark');
    setSelectedFont(currentTheme.fontFamily || 'Vazirmatn');
    setAccentColor(currentTheme.accentColor || '#3b82f6');
    setContainerBg(currentTheme.containerBackground || '#0f172a');
    setCardGlow(currentTheme.cardGlow !== false);
    setWelcomeTitle(currentTheme.welcomeTitle || 'اموال و تجهیزات فاوا کارگاه بوشهر');
    setBorderRadius(currentTheme.appBorderRadius || 'rounded-xl');
    setGlowStyle(currentTheme.workspaceGlowStyle || 'soft');
    setNavOpacity(currentTheme.navbarOpacity || '90');
  }, [currentTheme]);

  // Handle color preset selection
  const applyPresetColor = (accent: string, container: string) => {
    setAccentColor(accent);
    setContainerBg(container);
  };

  const saveSettings = async () => {
    if (!isAdmin) {
      setMessage({ text: 'خطای امنیتی: شما دسترسی مدیر سیستم برای انجام تغییرات ظاهری را ندارید.', type: 'danger' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload: ThemeSettings = {
      themeMode: selectedMode,
      fontFamily: selectedFont,
      accentColor: accentColor,
      containerBackground: containerBg,
      cardGlow: cardGlow,
      headingStyle: 'font-black tracking-tight',
      welcomeTitle: welcomeTitle,
      appBorderRadius: borderRadius,
      workspaceGlowStyle: glowStyle,
      navbarOpacity: navOpacity
    };

    try {
      const resp = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-operator-username': currentUser?.username || 'admin',
          'x-operator-name': encodeURIComponent(currentUser?.name || 'مدیریت کل')
        },
        body: JSON.stringify({ theme: payload })
      });

      if (!resp.ok) {
        throw new Error(`شکست در ذخیره‌سازی، کد پاسخ: ${resp.status}`);
      }

      onThemeUpdated(payload);
      setMessage({ text: 'تنظیمات زیبایی و تم ظاهری با موفقیت در پایگاه داده سرور ذخیره شد و در تمامی بخش‌ها اعمال گردید.', type: 'success' });
      
      // Dispatch global event for instant updates across the app environment if needed
      window.dispatchEvent(new CustomEvent('custom-theme-changed', { detail: payload }));
    } catch (err: any) {
      console.error("Error saving theme:", err);
      setMessage({ text: `خطا در برقراری ارتباط با وب‌سرویس بک‌اند: ${err.message || err}`, type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!isAdmin) return;
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید قالب ظاهری برنامه را به حالت اولیه و استاندارد بازنشانی کنید؟")) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const resp = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-operator-username': currentUser?.username || 'admin',
          'x-operator-name': encodeURIComponent(currentUser?.name || 'مدیریت کل')
        },
        body: JSON.stringify({ theme: null }) // explicitly empty deletes config file
      });

      if (!resp.ok) {
        throw new Error("خطا در بازنشانی");
      }

      const defaultTheme: ThemeSettings = {
        themeMode: 'slate-dark',
        fontFamily: 'Vazirmatn',
        accentColor: '#3b82f6',
        containerBackground: '#0f172a',
        cardGlow: true,
        headingStyle: 'font-black tracking-tight',
        welcomeTitle: 'اموال و تجهیزات فاوا کارگاه بوشهر',
        appBorderRadius: 'rounded-xl',
        workspaceGlowStyle: 'soft',
        navbarOpacity: '90'
      };

      onThemeUpdated(defaultTheme);
      setMessage({ text: 'پوسته ظاهری با موفقیت به حالت پیش‌فرض پروژه بازگردانده شد.', type: 'success' });
      window.dispatchEvent(new CustomEvent('custom-theme-changed', { detail: defaultTheme }));
    } catch (err: any) {
      console.error("Error resetting theme:", err);
      setMessage({ text: 'خطا در عملیات بازنشانی تم.', type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  const fontOptions = [
    { value: 'Vazirmatn', label: 'وزیرمتن (خوانا و استاندارد فارسی)', fontClass: 'font-sans' },
    { value: 'Estedad', label: 'استعداد (پویا و جسورانه)', fontClass: 'family-estedad' },
    { value: 'Inter', label: 'Inter (مناسب انگلیسی)', fontClass: 'font-sans' },
    { value: 'JetBrains Mono', label: 'جتبریز مونو (فنی و کدنویسی)', fontClass: 'font-mono' },
    { value: 'Tahoma', label: 'تاهوما نوستالژیک (سیستمی ویندوز)', fontClass: 'font-mono' }
  ];

  const presets = [
    { name: 'امیرکبیر کبود (پیش‌فرض)', accent: '#3b82f6', bg: '#0f172a' },
    { name: 'سبز زمردین هرمز', accent: '#10b981', bg: '#022c22' },
    { name: 'سورمه‌ای لاجوردی بوشهر', accent: '#06b6d4', bg: '#081e3d' },
    { name: 'ارکیده و بادمجان غلیظ', accent: '#a855f7', bg: '#1e113a' },
    { name: 'شکلاتی و نارنجی پاییزه', accent: '#f97316', bg: '#271206' },
    { name: 'تاریکی مطلق (شب بی‌پایان)', accent: '#e2e8f0', bg: '#030712' }
  ];

  if (!isAdmin) {
    return (
      <div className="bg-red-950/40 border border-red-900/40 rounded-xl p-6 text-center text-red-100 max-w-lg mx-auto my-12" id="appearance-unauthorized-card">
        <span className="text-4xl">🔒</span>
        <h3 className="text-sm font-black mt-3">عدم دسترسی به تنظیمات زیبایی</h3>
        <p className="text-xs text-red-300 mt-2 leading-relaxed">
          تنظیمات تغییر تم، رنگ‌بندی، فریم‌ورک‌های بصری و فونت سیستم اختصاصی به دلایل امنیتی و همگام‌سازی، منحصر به **مدیر کل سیستم (Admin)** می‌باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="theme-settings-panel">
      
      {/* Introduction banner */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
            <span>🎨</span>
            <span>بخش شخصی‌سازی ظاهری و زیباسازی پروژه (ویژه ادمین)</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            از این بخش می‌توانید رنگ سازمانی، فونت نوشتاری، متون سرصفحه و افکت‌های پس‌زمینه را در کل سامانه بصورت زنده مدیریت کنید تا پرسنل با ظاهر دلخواه شما کار پینگ تجهیزات را انجام دهند.
          </p>
        </div>
        <button
          onClick={resetToDefault}
          className="px-3 py-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 transition cursor-pointer"
        >
          🔄 بازنشانی به پیش‌فرض اول کارخانه
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-bold border ${
          message.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300' 
            : 'bg-red-950/60 border-red-800/80 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Controls Column */}
        <div className="xl:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-5">
          
          {/* Header custom title */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-bold mb-1">
              ✏️ متن تیتر خوش‌آمدگویی و سربرگ سامانه
            </label>
            <input
              type="text"
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-950/80 border border-slate-800 rounded font-bold text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500 transition"
              placeholder="مثال: اموال و تجهیزات فاوا کارگاه بوشهر"
            />
          </div>

          <hr className="border-slate-800/50" />

          {/* Preset Palettes */}
          <div className="space-y-2">
            <span className="block text-[10px] text-slate-400 font-bold">
              🎭 پالت‌های رنگی آماده و بهینه سازمانی (کلیک جهت اعمال آنی)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPresetColor(preset.accent, preset.bg)}
                  type="button"
                  className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-right cursor-pointer group"
                >
                  <div className="flex shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: preset.accent }} />
                    <span className="w-3.5 h-3.5 rounded-full inline-block -mr-1.5" style={{ backgroundColor: preset.bg }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 group-hover:text-amber-300 transition truncate">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Custom Accent Color */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                🎨 رنگ شاخص دکمه‌ها و المان‌ها (Accent Color)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor.toUpperCase()}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 uppercase focus:outline-hidden"
                />
              </div>
            </div>

            {/* Custom Background Color */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                🖥️ رنگ بک‌گراند منو و میز کار اصلی
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={containerBg}
                  onChange={(e) => setContainerBg(e.target.value)}
                  className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={containerBg.toUpperCase()}
                  onChange={(e) => setContainerBg(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 uppercase focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800/50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Font Family */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                ✍️ قلم نوشتاری کل سایت (Font Family)
              </label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value as ThemeSettings['fontFamily'])}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-hidden"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Application Border Radius */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                📐 تیزی و گردی لبه دکمه‌ها و کارتها (Border Radius)
              </label>
              <select
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value as ThemeSettings['appBorderRadius'])}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-hidden"
              >
                <option value="rounded-none">تیز و چارگوش بدون انحنا (کلاسیک)</option>
                <option value="rounded-md">کمی گرد شده - ۴ پیکسل (فنی)</option>
                <option value="rounded-lg">گردشده - ۸ پیکسل (بهینه)</option>
                <option value="rounded-xl">گردشده مدرن - ۱۲ پیکسل (زیبا)</option>
                <option value="rounded-2xl">بسیار نرم و گرد - ۱۶ پیکسل (فانتزی)</option>
                <option value="rounded-3xl">فوق‌العاده گرد - ۲۴ پیکسل</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-800/50" />

          {/* Layout effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 font-bold">
                ✨ افکت تابندگی فلوئورسنتی کارت‌ها (Card Glow Shadow)
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cardGlow}
                  onChange={(e) => setCardGlow(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300">سایه نئونی درخشان در زیر کادرهای عملیاتی</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                🌅 شدت و استایل گرادینت پس‌زمینه
              </label>
              <select
                value={glowStyle}
                onChange={(e) => setGlowStyle(e.target.value as ThemeSettings['workspaceGlowStyle'])}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-hidden"
              >
                <option value="none">بدون گرادینت (تک رنگ ساده)</option>
                <option value="soft">گرادینت تیره ملایم و نرم</option>
                <option value="aurora">شفق قطبی متغیر (رنگی از پشت کارت)</option>
                <option value="intense">غلیظ نئونی پرکنتراست</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800/40">
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-500 hover:scale-[1.01] text-slate-950 font-black rounded transition-all duration-150 cursor-pointer flex items-center gap-1 shadow-lg disabled:opacity-50"
            >
              {isSaving ? '⏳ در حال فرستادن به سرور...' : '💾 ثبت نهایی تنظیمات ظاهری'}
            </button>
          </div>

        </div>

        {/* Preview Column */}
        <div className="xl:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 block uppercase mb-3">
              🎯 پیش‌نمایش بلادرنگ تغییرات (Real-time Preview)
            </span>

            {/* Interactive mini workspace */}
            <div 
              className="border border-slate-800 p-4 transition-all duration-200 space-y-4 relative overflow-hidden"
              style={{ 
                backgroundColor: containerBg,
                borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '4px' : borderRadius === 'rounded-lg' ? '8px' : borderRadius === 'rounded-xl' ? '12px' : borderRadius === 'rounded-2xl' ? '16px' : '24px',
                fontFamily: selectedFont === 'Tahoma' ? 'Tahoma, Arial' : selectedFont === 'JetBrains Mono' ? 'JetBrains Mono, monospace' : 'Vazirmatn, sans-serif'
              }}
            >
              {/* Aurora light backdrop simulated */}
              {glowStyle !== 'none' && (
                <div 
                  className="absolute pointer-events-none -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30" 
                  style={{ 
                    background: `radial-gradient(circle, ${accentColor} 0%, rgba(0,0,0,0) 70%)` 
                  }} 
                />
              )}

              {/* Header Box preview */}
              <div className="flex items-center justify-between border-b border-slate-700/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🏭</span>
                  <div className="max-w-[200px] truncate">
                    <span className="text-[10px] text-slate-400 block font-bold">پیش‌نمایش سرصفحه:</span>
                    <span className="text-xs font-black text-slate-100 block">{welcomeTitle}</span>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Live Card simulation with options */}
              <div 
                className={`bg-slate-900/90 border border-slate-800 p-3 transition-shadow duration-200 ${
                  borderRadius === 'rounded-none' ? 'rounded-none' : borderRadius === 'rounded-md' ? 'rounded-md' : borderRadius === 'rounded-lg' ? 'rounded-lg' : borderRadius === 'rounded-xl' ? 'rounded-xl' : 'rounded-2xl'
                }`}
                style={{
                  boxShadow: cardGlow ? `0 4px 20px -5px ${accentColor}33` : 'none'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-slate-400 font-bold block">📦 نمونه کارت اموال</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-blue-950/70 text-blue-300 border border-blue-900/30">
                    فعال
                  </span>
                </div>
                
                <h5 className="text-xs font-black text-slate-100">کیس اداری کارگاهی - الگو نویسی</h5>
                <p className="text-[9px] text-slate-400 mt-1 leading-normal">مدل: Motherboard H510M | RAM 16GB</p>

                {/* Sample custom active button */}
                <div className="mt-3 flex gap-1.5 justify-end">
                  <button 
                    type="button" 
                    className="px-2.5 py-1 text-[8px] font-black text-slate-950 cursor-default"
                    style={{ 
                      backgroundColor: accentColor,
                      color: '#000000',
                      borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '3px' : '6px'
                    }}
                  >
                    ⚡ عملیات پینگ سخت‌افزار
                  </button>
                  <button 
                    type="button" 
                    className="px-2.5 py-1 text-[8px] font-bold bg-slate-800 text-slate-300 border border-slate-705 cursor-default"
                    style={{ 
                      borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '3px' : '6px'
                    }}
                  >
                    انصراف
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Useful notes / hints */}
          <div className="bg-slate-900/30 border border-slate-800/40 p-3.5 rounded-lg text-[9px] text-slate-400 leading-relaxed space-y-1">
            <span className="font-extrabold text-amber-500 block mb-1">💡 نکات مهم در شخصی‌سازی:</span>
            <p>۱. انتخاب مابین قلم **وزیرمتن** و **استعداد**، جلوه عالی برای کاربران محلی ویندوزی ایجاد می‌کند.</p>
            <p>۲. این تغییرات بر روی بانک داده سرور ذخیره شده و پس از رفرش مرورگرهای دیگر سیستم‌ها نیز اعمال می‌گردد.</p>
            <p>۳. بازنشانی به پیش‌فرض همیشه کارساز بوده و قالب اصلی را بارگذاری می‌کند.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
