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
  
  // Custom Tab State for Color Customizer editing
  const [activeCustomColorTab, setActiveCustomColorTab] = useState<'dark' | 'light'>('dark');

  // Advanced exact customization parameters - DARK Mode
  const [textColor, setTextColor] = useState(currentTheme.textColor || '#cbd5e1');
  const [headingColor, setHeadingColor] = useState(currentTheme.headingColor || '#f8fafc');
  const [cardBg, setCardBg] = useState(currentTheme.cardBackground || 'rgba(15, 23, 42, 0.75)');
  const [buttonBg, setButtonBg] = useState(currentTheme.buttonBackground || '#3b82f6');
  const [buttonTextColor, setButtonTextColor] = useState(currentTheme.buttonTextColor || '#111827');
  const [baseFontSize, setBaseFontSize] = useState<ThemeSettings['baseFontSize']>(currentTheme.baseFontSize || 'base');

  // Advanced exact customization parameters - LIGHT Mode
  const [lightTextColor, setLightTextColor] = useState(currentTheme.lightTextColor || '#334155');
  const [lightHeadingColor, setLightHeadingColor] = useState(currentTheme.lightHeadingColor || '#0f172a');
  const [lightCardBg, setLightCardBg] = useState(currentTheme.lightCardBackground || '#ffffff');
  const [lightButtonBg, setLightButtonBg] = useState(currentTheme.lightButtonBackground || '#3b82f6');
  const [lightButtonTextColor, setLightButtonTextColor] = useState(currentTheme.lightButtonTextColor || '#ffffff');
  const [lightContainerBg, setLightContainerBg] = useState(currentTheme.lightContainerBackground || '#f1f5f9');

  // Double confirmation state for factory reset
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load custom presets from localStorage on mount
  const [userPresets, setUserPresets] = useState<{ id: string; name: string; isFilled: boolean; theme?: ThemeSettings }[]>(() => {
    const saved = localStorage.getItem('user-custom-theme-presets-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed;
        }
      } catch {}
    }
    return [
      { id: '1', name: 'قالب سفارشی ۱ (خالی)', isFilled: false },
      { id: '2', name: 'قالب سفارشی ۲ (خالی)', isFilled: false },
      { id: '3', name: 'قالب سفارشی ۳ (خالی)', isFilled: false },
      { id: '4', name: 'قالب سفارشی ۴ (خالی)', isFilled: false }
    ];
  });

  const saveToCustomPreset = (slotId: string, currentSlotName: string) => {
    const slotName = currentSlotName.trim() || `پوسته شماره ${slotId}`;
    
    const currentThemeState: ThemeSettings = {
      themeMode: selectedMode,
      fontFamily: selectedFont,
      accentColor: accentColor,
      containerBackground: containerBg,
      cardGlow: cardGlow,
      headingStyle: 'font-black tracking-tight',
      welcomeTitle: welcomeTitle,
      appBorderRadius: borderRadius,
      workspaceGlowStyle: glowStyle,
      navbarOpacity: navOpacity,
      textColor: textColor,
      headingColor: headingColor,
      cardBackground: cardBg,
      buttonBackground: buttonBg,
      buttonTextColor: buttonTextColor,
      baseFontSize: baseFontSize,
      lightTextColor: lightTextColor,
      lightHeadingColor: lightHeadingColor,
      lightCardBackground: lightCardBg,
      lightButtonBackground: lightButtonBg,
      lightButtonTextColor: lightButtonTextColor,
      lightContainerBackground: lightContainerBg
    };

    const updated = userPresets.map(preset => {
      if (preset.id === slotId) {
        return {
          ...preset,
          name: slotName,
          isFilled: true,
          theme: currentThemeState
        };
      }
      return preset;
    });

    setUserPresets(updated);
    localStorage.setItem('user-custom-theme-presets-v1', JSON.stringify(updated));
    setMessage({ text: `تنظیمات تم فعلی با موفقیت روی حافظه جانبی قالب شماره [${slotId}] با نام "${slotName}" ذخیره گردید.`, type: 'success' });
  };

  const updatePresetNameSlot = (slotId: string, name: string) => {
    const updated = userPresets.map(preset => {
      if (preset.id === slotId) {
        return { ...preset, name };
      }
      return preset;
    });
    setUserPresets(updated);
    localStorage.setItem('user-custom-theme-presets-v1', JSON.stringify(updated));
  };

  const loadCustomPreset = (theme: ThemeSettings | undefined) => {
    if (!theme) return;
    
    setSelectedMode(theme.themeMode || 'slate-dark');
    setSelectedFont(theme.fontFamily || 'Vazirmatn');
    setAccentColor(theme.accentColor || '#3b82f6');
    setContainerBg(theme.containerBackground || '#0f172a');
    setCardGlow(theme.cardGlow !== false);
    setWelcomeTitle(theme.welcomeTitle || 'اموال و تجهیزات فاوا کارگاه بوشهر');
    setBorderRadius(theme.appBorderRadius || 'rounded-xl');
    setGlowStyle(theme.workspaceGlowStyle || 'soft');
    setNavOpacity(theme.navbarOpacity || '90');
    
    setTextColor(theme.textColor || '#cbd5e1');
    setHeadingColor(theme.headingColor || '#f8fafc');
    setCardBg(theme.cardBackground || 'rgba(15, 23, 42, 0.75)');
    setButtonBg(theme.buttonBackground || '#3b82f6');
    setButtonTextColor(theme.buttonTextColor || '#111827');
    setBaseFontSize(theme.baseFontSize || 'base');

    setLightTextColor(theme.lightTextColor || '#334155');
    setLightHeadingColor(theme.lightHeadingColor || '#0f172a');
    setLightCardBg(theme.lightCardBackground || '#ffffff');
    setLightButtonBg(theme.lightButtonBackground || '#3b82f6');
    setLightButtonTextColor(theme.lightButtonTextColor || '#ffffff');
    setLightContainerBg(theme.lightContainerBackground || '#f1f5f9');

    // Instantly propagate the loaded theme variables to the page live preview
    onThemeUpdated(theme);

    setMessage({ text: 'قالب سفارشی بازخوانی شد. جهت همگام‌سازی و اعمال نهایی کل کلاینت‌ها، حتما دکمه «ثبت نهایی تنظیمات ظاهری» انتهای صفحه را بفشارید.', type: 'success' });
  };

  const clearCustomPreset = (slotId: string) => {
    const updated = userPresets.map(preset => {
      if (preset.id === slotId) {
        return {
          id: slotId,
          name: `قالب سفارشی ${slotId} (خالی)`,
          isFilled: false,
          theme: undefined
        };
      }
      return preset;
    });
    setUserPresets(updated);
    localStorage.setItem('user-custom-theme-presets-v1', JSON.stringify(updated));
    setMessage({ text: `حافظه قالب اسلات شماره ${slotId} پاکسازی شد.`, type: 'success' });
  };

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
    
    setTextColor(currentTheme.textColor || '#cbd5e1');
    setHeadingColor(currentTheme.headingColor || '#f8fafc');
    setCardBg(currentTheme.cardBackground || 'rgba(15, 23, 42, 0.75)');
    setButtonBg(currentTheme.buttonBackground || '#3b82f6');
    setButtonTextColor(currentTheme.buttonTextColor || '#111827');
    setBaseFontSize(currentTheme.baseFontSize || 'base');

    setLightTextColor(currentTheme.lightTextColor || '#334155');
    setLightHeadingColor(currentTheme.lightHeadingColor || '#0f172a');
    setLightCardBg(currentTheme.lightCardBackground || '#ffffff');
    setLightButtonBg(currentTheme.lightButtonBackground || '#3b82f6');
    setLightButtonTextColor(currentTheme.lightButtonTextColor || '#ffffff');
    setLightContainerBg(currentTheme.lightContainerBackground || '#f1f5f9');
  }, [currentTheme]);

  // Handle color preset selection
  const applyPresetColor = (
    accent: string, 
    container: string, 
    text: string, 
    heading: string, 
    card: string, 
    button: string, 
    btnText: string
  ) => {
    setAccentColor(accent);
    setContainerBg(container);
    setTextColor(text);
    setHeadingColor(heading);
    setCardBg(card);
    setButtonBg(button);
    setButtonTextColor(btnText);
    
    // Also apply some logical matching light default presets to keep it beautiful
    setLightButtonBg(accent);
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
      navbarOpacity: navOpacity,
      textColor: textColor,
      headingColor: headingColor,
      cardBackground: cardBg,
      buttonBackground: buttonBg,
      buttonTextColor: buttonTextColor,
      baseFontSize: baseFontSize,
      lightTextColor: lightTextColor,
      lightHeadingColor: lightHeadingColor,
      lightCardBackground: lightCardBg,
      lightButtonBackground: lightButtonBg,
      lightButtonTextColor: lightButtonTextColor,
      lightContainerBackground: lightContainerBg
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
        navbarOpacity: '90',
        textColor: '#cbd5e1',
        headingColor: '#f8fafc',
        cardBackground: 'rgba(15, 23, 42, 0.75)',
        buttonBackground: '#3b82f6',
        buttonTextColor: '#111827',
        baseFontSize: 'base',
        lightTextColor: '#334155',
        lightHeadingColor: '#0f172a',
        lightCardBackground: '#ffffff',
        lightButtonBackground: '#3b82f6',
        lightButtonTextColor: '#ffffff',
        lightContainerBackground: '#f1f5f9'
      };

      // Reset local react state variables instantly
      setSelectedMode('slate-dark');
      setSelectedFont('Vazirmatn');
      setAccentColor('#3b82f6');
      setContainerBg('#0f172a');
      setCardGlow(true);
      setWelcomeTitle('اموال و تجهیزات فاوا کارگاه بوشهر');
      setBorderRadius('rounded-xl');
      setGlowStyle('soft');
      setNavOpacity('90');
      
      setTextColor('#cbd5e1');
      setHeadingColor('#f8fafc');
      setCardBg('rgba(15, 23, 42, 0.75)');
      setButtonBg('#3b82f6');
      setButtonTextColor('#111827');
      setBaseFontSize('base');

      setLightTextColor('#334155');
      setLightHeadingColor('#0f172a');
      setLightCardBg('#ffffff');
      setLightButtonBg('#3b82f6');
      setLightButtonTextColor('#ffffff');
      setLightContainerBg('#f1f5f9');

      onThemeUpdated(defaultTheme);
      setMessage({ text: 'پوسته ظاهری با موفقیت به حالت پیش‌فرض پروژه بازگردانده شد و کنترلرها همگام‌سازی شدند.', type: 'success' });
      window.dispatchEvent(new CustomEvent('custom-theme-changed', { detail: defaultTheme }));
    } catch (err: any) {
      console.error("Error resetting theme:", err);
      setMessage({ text: 'خطا در عملیات بازنشانی تم.', type: 'danger' });
    } finally {
      setIsSaving(false);
      setShowResetConfirm(false); // Close confirmation banner
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
    { name: 'امیرکبیر کبود (پیش‌فرض)', accent: '#3b82f6', bg: '#0f172a', text: '#cbd5e1', heading: '#f8fafc', card: 'rgba(15, 23, 42, 0.75)', button: '#3b82f6', btnText: '#000000' },
    { name: 'سبز زمردین هرمز', accent: '#10b981', bg: '#022c22', text: '#d1fae5', heading: '#ffffff', card: 'rgba(6, 78, 59, 0.5)', button: '#10b981', btnText: '#000000' },
    { name: 'سورمه‌ای لاجوردی بوشهر', accent: '#06b6d4', bg: '#081e3d', text: '#e0f7fa', heading: '#ffffff', card: 'rgba(7, 43, 82, 0.65)', button: '#06b6d4', btnText: '#081e3d' },
    { name: 'ارکیده و بادمجان غلیظ', accent: '#a855f7', bg: '#1e113a', text: '#f3e8ff', heading: '#ffffff', card: 'rgba(49, 28, 92, 0.6)', button: '#a855f7', btnText: '#ffffff' },
    { name: 'شکلاتی و نارنجی پاییزه', accent: '#f97316', bg: '#271206', text: '#ffedd5', heading: '#ffffff', card: 'rgba(67, 30, 8, 0.6)', button: '#f97316', btnText: '#ffffff' },
    { name: 'شب بی‌پایان (تاریک سنتی)', accent: '#f8fafc', bg: '#030712', text: '#bfc9d4', heading: '#f8fafc', card: '#111827', button: '#3b82f6', btnText: '#ffffff' }
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
        {showResetConfirm ? (
          <div className="flex flex-wrap items-center gap-2 bg-red-950/60 border border-red-800/80 p-2.5 rounded-lg shrink-0">
            <span className="text-[10px] text-red-100 font-bold">⚠️ بازنشانی کامل کدهای رنگی و فونت کلاینت و سرور؟</span>
            <div className="flex gap-1.5 matches-nested-reset">
              <button
                type="button"
                onClick={resetToDefault}
                className="px-2.5 py-1 text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white rounded transition cursor-pointer"
              >
                بله، بازنشانی شود
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer border border-slate-700/60"
              >
                انصراف
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 transition cursor-pointer shrink-0"
          >
            🔄 بازنشانی به پیش‌فرض اول کارخانه
          </button>
        )}
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        
        {/* Controls Column */}
        <div className="xl:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-5">
          
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

          {/* User Custom Saved Preset Templates Slots */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60" id="user-theme-presets-manager">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800/40">
              <span className="block text-[11px] text-amber-300 font-extrabold flex items-center gap-1.5">
                <span>💾</span>
                <span>قالب‌های فرعی پس‌انداز شده توسط شما (اسلاتهای ۱ الی ۴)</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium">پشتیبانی کامل از ذخیره ۴ پوسته شخصی‌سازی شده مجزا</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userPresets.map((preset) => (
                <div 
                  key={preset.id} 
                  className={`p-3 rounded-lg border flex flex-col justify-between gap-2.5 transition-all duration-150 ${
                    preset.isFilled 
                      ? 'bg-slate-950/60 border-slate-850' 
                      : 'bg-slate-950/15 border-slate-850 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-900 border border-slate-800/50 text-[10px] font-black shrink-0 text-slate-400">
                      {preset.id}
                    </span>
                    <input 
                      type="text"
                      value={preset.name}
                      onChange={(e) => updatePresetNameSlot(preset.id, e.target.value)}
                      className="flex-1 text-[11px] font-bold bg-transparent border-b border-transparent hover:border-slate-800 focus:border-amber-500 text-slate-200 focus:outline-hidden px-1 py-0.5"
                      placeholder="نام قالب را بنویسید..."
                    />
                  </div>

                  <div className="flex items-center gap-1 text-[9px]">
                    {preset.isFilled && preset.theme ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-700" style={{ backgroundColor: preset.theme.accentColor }} title="رنگ فوکوس" />
                        <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-700" style={{ backgroundColor: preset.theme.containerBackground }} title="رنگ زمینه تیره" />
                        <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-700" style={{ backgroundColor: preset.theme.lightContainerBackground }} title="رنگ زمینه روشن" />
                        <span className="text-slate-500 mr-1 truncate">پوسته به درستی ذخیره شده است</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-medium">سفید و خالی - آماده برای کپی مقادیر رنگبندی بالا</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-850/50">
                    <button
                      type="button"
                      onClick={() => saveToCustomPreset(preset.id, preset.name)}
                      className="px-2 py-1 text-[9px] bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold rounded flex items-center gap-0.5 transition cursor-pointer"
                      title="رنگ‌بندیها و فیلدهای عددی فعلی صفحه بالا را در این خانه ذخیره کن"
                    >
                      💾 پس‌انداز تم فعلی
                    </button>

                    {preset.isFilled && (
                      <>
                        <button
                          type="button"
                          onClick={() => loadCustomPreset(preset.theme)}
                          className="px-2 py-1 text-[9px] bg-amber-600 hover:bg-amber-500 hover:scale-[1.01] text-slate-950 font-black rounded flex items-center gap-0.5 transition cursor-pointer shadow-sm animate-pulse"
                          title="اعلام زنده مشخصات این اسلات روی فیلدها و کادرهای صفحه"
                        >
                          🔄 بازیابی زنده تم
                        </button>
                        <button
                          type="button"
                          onClick={() => clearCustomPreset(preset.id)}
                          className="px-1.5 py-1 text-[9px] bg-red-950/40 hover:bg-red-900 border border-red-900/30 text-red-100 rounded transition cursor-pointer"
                          title="خالی کردن این پوسته"
                        >
                          🗑️ پاکسازی
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                  onClick={() => applyPresetColor(
                    preset.accent, 
                    preset.bg, 
                    preset.text, 
                    preset.heading, 
                    preset.card, 
                    preset.button, 
                    preset.btnText
                  )}
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

          {/* Accent Color and Active customization Mode Tabs */}
          <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[11px] text-slate-300 font-bold pr-2">🎨 انتخاب قالب فعال جهت تعریف و تنظیم دقیق رنگ‌ها:</span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-md border border-slate-850 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveCustomColorTab('dark')}
                className={`flex-1 sm:flex-none px-3.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  activeCustomColorTab === 'dark'
                    ? 'bg-amber-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌌 تم تیره (Dark Mode)
              </button>
              <button
                type="button"
                onClick={() => setActiveCustomColorTab('light')}
                className={`flex-1 sm:flex-none px-3.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  activeCustomColorTab === 'light'
                    ? 'bg-amber-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ☀️ تم روشن (Light Mode)
              </button>
            </div>
          </div>

          {activeCustomColorTab === 'dark' ? (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/60 space-y-3">
                <h4 className="text-xs font-bold text-amber-500 border-b border-slate-800/40 pb-1.5 flex items-center gap-1">
                  <span>🌌</span> کنترل و تنظیم جزئیات رنگ تم تاریک (Dark Mode Customized Colors)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Container Background Color - DARK */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🖥️ رنگ پس‌زمینه اصلی میز کار (Container Background)
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
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#0f172a', '#0b0f19', '#081e3d', '#030712'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setContainerBg(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${containerBg === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body Text Color - DARK */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      📝 رنگ نوشته‌های معمولی و توضیحات (Body Text)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor.toUpperCase()}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#cbd5e1', '#f8fafc', '#a1a1aa', '#94a3b8'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTextColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${textColor === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Heading Color - DARK */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      👑 رنگ عناوین، تیترها و حروف برجسته (Heading Text)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={headingColor}
                        onChange={(e) => setHeadingColor(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headingColor.toUpperCase()}
                        onChange={(e) => setHeadingColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#f8fafc', '#ffffff', '#fbbf24', '#38bdf8'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setHeadingColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${headingColor === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card/Box Background Color - DARK */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🗂️ رنگ پس‌زمینه کادرها و باکس‌های محتوا (Card Background)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={cardBg.startsWith('rgba') ? '#1e293b' : cardBg}
                        onChange={(e) => setCardBg(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={cardBg}
                        onChange={(e) => setCardBg(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['rgba(15, 23, 42, 0.75)', '#1e293b', '#0f172a', '#111827'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCardBg(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${cardBg === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color.startsWith('rgba') ? '#131c2e' : color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Button Background Color - DARK */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🔘 رنگ دکمه‌های اصلی و اقدامات مهم (Button Background)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={buttonBg}
                        onChange={(e) => setButtonBg(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={buttonBg.toUpperCase()}
                        onChange={(e) => setButtonBg(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#3b82f6', '#10b981', '#f59e0b', '#a855f7'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setButtonBg(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${buttonBg === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Button Text Color - DARK */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🖍️ رنگ نوشته‌های درج‌شده داخل دکمه‌های اصلی
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={buttonTextColor}
                        onChange={(e) => setButtonTextColor(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={buttonTextColor.toUpperCase()}
                        onChange={(e) => setButtonTextColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#111827', '#ffffff', '#000000', '#1e293b'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setButtonTextColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${buttonTextColor === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-slate-900/10 rounded-lg border border-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-amber-500 border-b border-slate-800/20 pb-1.5 flex items-center gap-1">
                  <span>☀️</span> کنترل و تنظیم جزئیات رنگ تم روشن (Light Mode Customized Colors)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Container Background Color - LIGHT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🖥️ رنگ پس‌زمینه اصلی میز کار (Container Background)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightContainerBg}
                        onChange={(e) => setLightContainerBg(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightContainerBg.toUpperCase()}
                        onChange={(e) => setLightContainerBg(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#f1f5f9', '#f8fafc', '#e2e8f0', '#ffffff'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLightContainerBg(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${lightContainerBg === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body Text Color - LIGHT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      📝 رنگ نوشته‌های معمولی و توضیحات (Body Text)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightTextColor}
                        onChange={(e) => setLightTextColor(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightTextColor.toUpperCase()}
                        onChange={(e) => setLightTextColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#334155', '#1e293b', '#4b5563', '#27272a'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLightTextColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${lightTextColor === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Heading Color - LIGHT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      👑 رنگ عناوین، تیترها و حروف برجسته (Heading Text)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightHeadingColor}
                        onChange={(e) => setLightHeadingColor(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightHeadingColor.toUpperCase()}
                        onChange={(e) => setLightHeadingColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#0f172a', '#000000', '#1e3a8a', '#111827'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLightHeadingColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${lightHeadingColor === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card/Box Background Color - LIGHT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🗂️ رنگ پس‌زمینه کادرها و باکس‌های محتوا (Card Background)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightCardBg}
                        onChange={(e) => setLightCardBg(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightCardBg}
                        onChange={(e) => setLightCardBg(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#ffffff', '#f8fafc', '#f1f5f9', '#fafaf9'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLightCardBg(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${lightCardBg === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Button Background Color - LIGHT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🔘 رنگ دکمه‌های اصلی و اقدامات مهم (Button Background)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightButtonBg}
                        onChange={(e) => setLightButtonBg(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightButtonBg.toUpperCase()}
                        onChange={(e) => setLightButtonBg(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#3b82f6', '#10b981', '#0284c7', '#5b21b6'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLightButtonBg(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${lightButtonBg === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Button Text Color - LIGHT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-300 font-bold">
                      🖍️ رنگ نوشته‌های درج‌شده داخل دکمه‌های اصلی
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightButtonTextColor}
                        onChange={(e) => setLightButtonTextColor(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightButtonTextColor.toUpperCase()}
                        onChange={(e) => setLightButtonTextColor(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 uppercase focus:outline-hidden"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex gap-1.5 pt-0.5 items-center">
                      <span className="text-[8px] text-slate-500 pr-1">پیشنهادی:</span>
                      {['#ffffff', '#111827', '#000000', '#f8fafc'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLightButtonTextColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer transition ${lightButtonTextColor === color ? 'border-amber-500 ring-1 ring-amber-500/35 scale-110' : 'border-slate-800 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sizing, Font Family & general controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base Font Size */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                🧴 اندازه و سایز عمومی متون کل سایت (Text Size)
              </label>
              <select
                value={baseFontSize}
                onChange={(e) => setBaseFontSize(e.target.value as ThemeSettings['baseFontSize'])}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="sm">ریز و فشرده (مناسب نمایشگر کوچک)</option>
                <option value="base">استاندارد نرمال (پیش‌فرض)</option>
                <option value="lg">بزرگ و خوانا (سهولت استفاده پرسنل)</option>
              </select>
            </div>

            {/* Custom Accent Color picker as supplementary picker */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-400 font-bold mb-1">
                🎨 رنگ کمکی و فکوس فعال (Accent Accent)
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

        {/* Preview Column (Exact 1/5 of layout on XL screen) */}
        <div className="xl:col-span-1 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between space-y-4" id="theme-settings-live-preview">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <span className="text-sm">✨</span>
              <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase">
                پیش‌نمایش زنده بلادرنگ
              </span>
            </div>

            {/* FONT PREVIEW HINT */}
            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 text-center">
              <span className="text-[9px] text-slate-400 block mb-0.5">قلم و ابعاد انتخابی:</span>
              <span className="text-xs font-black text-slate-100 block" style={{
                fontFamily: selectedFont === 'Tahoma' ? 'Tahoma, Arial' : selectedFont === 'JetBrains Mono' ? 'JetBrains Mono, monospace' : 'Vazirmatn, sans-serif'
              }}>
                {selectedFont === 'Tahoma' ? 'تاهوما نوستالژیک' : selectedFont === 'JetBrains Mono' ? 'JetBrains Mono' : 'قلم زیبای وزیرمتن'} ({baseFontSize === 'sm' ? 'ریز' : baseFontSize === 'lg' ? 'بزرگ' : 'استاندارد'})
              </span>
            </div>

            {/* DARK MODE PREVIEW BOX */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                نمونه تم تیره (Dark Mode)
              </span>
              
              <div 
                className="border border-slate-800 p-3 transition-all duration-200 space-y-2.5 relative overflow-hidden"
                style={{ 
                  backgroundColor: containerBg,
                  borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '4px' : borderRadius === 'rounded-lg' ? '8px' : borderRadius === 'rounded-xl' ? '12px' : borderRadius === 'rounded-2xl' ? '16px' : '24px',
                  fontFamily: selectedFont === 'Tahoma' ? 'Tahoma, Arial' : selectedFont === 'JetBrains Mono' ? 'JetBrains Mono, monospace' : 'Vazirmatn, sans-serif'
                }}
              >
                {/* Simulated Glow */}
                {glowStyle !== 'none' && (
                  <div 
                    className="absolute pointer-events-none -top-10 -right-10 w-24 h-24 rounded-full blur-xl opacity-20" 
                    style={{ 
                      background: `radial-gradient(circle, ${accentColor} 0%, rgba(0,0,0,0) 75%)` 
                    }} 
                  />
                )}

                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">📻</span>
                    <span className="text-[8px] font-black" style={{ color: headingColor }}>{welcomeTitle ? (welcomeTitle.length > 18 ? welcomeTitle.substring(0, 15) + '...' : welcomeTitle) : 'سربرگ تیره'}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Simulated Card */}
                <div 
                  className={`border p-2.5 transition-shadow duration-200 ${
                    borderRadius === 'rounded-none' ? 'rounded-none' : borderRadius === 'rounded-md' ? 'rounded-md' : borderRadius === 'rounded-lg' ? 'rounded-lg' : borderRadius === 'rounded-xl' ? 'rounded-xl' : 'rounded-2xl'
                  }`}
                  style={{
                    backgroundColor: cardBg,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: cardGlow ? `0 4px 15px -5px ${buttonBg}44` : 'none',
                    fontSize: baseFontSize === 'sm' ? '10px' : baseFontSize === 'lg' ? '14px' : '11px'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-bold block" style={{ color: textColor }}>کیس کارگاه شماره ۱</span>
                    <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-indigo-950/60 border border-indigo-900/30" style={{ color: accentColor }}>
                      شبکه فعال
                    </span>
                  </div>
                  
                  <h5 className="text-[10px] font-black" style={{ color: headingColor }}>پینگ رادیویی بی‌سیم</h5>
                  <p className="text-[8px] mt-0.5 leading-tight" style={{ color: textColor }}>تست بسته‌های ارسالی موفقیت‌آمیز بود.</p>

                  {/* Simulated button */}
                  <div className="mt-2 flex justify-end">
                    <button 
                      type="button" 
                      className="px-2 py-0.5 text-[8px] font-black cursor-default"
                      style={{ 
                        backgroundColor: buttonBg,
                        color: buttonTextColor,
                        borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '3px' : '6px'
                      }}
                    >
                      تایید پینگ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* LIGHT MODE PREVIEW BOX */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                نمونه تم روشن (Light Mode)
              </span>

              <div 
                className="border border-slate-200 p-3 transition-all duration-200 space-y-2.5 relative overflow-hidden"
                style={{ 
                  backgroundColor: lightContainerBg,
                  borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '4px' : borderRadius === 'rounded-lg' ? '8px' : borderRadius === 'rounded-xl' ? '12px' : borderRadius === 'rounded-2xl' ? '16px' : '24px',
                  fontFamily: selectedFont === 'Tahoma' ? 'Tahoma, Arial' : selectedFont === 'JetBrains Mono' ? 'JetBrains Mono, monospace' : 'Vazirmatn, sans-serif'
                }}
              >
                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">🖥️</span>
                    <span className="text-[8px] font-black" style={{ color: lightHeadingColor }}>{welcomeTitle ? (welcomeTitle.length > 18 ? welcomeTitle.substring(0, 15) + '...' : welcomeTitle) : 'سربرگ روشن'}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                {/* Simulated Card */}
                <div 
                  className={`border p-2.5 transition-shadow duration-200 ${
                    borderRadius === 'rounded-none' ? 'rounded-none' : borderRadius === 'rounded-md' ? 'rounded-md' : borderRadius === 'rounded-lg' ? 'rounded-lg' : borderRadius === 'rounded-xl' ? 'rounded-xl' : 'rounded-2xl'
                  }`}
                  style={{
                    backgroundColor: lightCardBg,
                    borderColor: 'rgba(0,0,0,0.08)',
                    boxShadow: cardGlow ? `0 4px 15px -5px ${lightButtonBg}33` : 'none',
                    fontSize: baseFontSize === 'sm' ? '10px' : baseFontSize === 'lg' ? '14px' : '11px'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-bold block" style={{ color: lightTextColor }}>لیست پرسنل فعال</span>
                    <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-amber-50 border border-amber-200/50" style={{ color: accentColor }}>
                      ناوبری
                    </span>
                  </div>
                  
                  <h5 className="text-[10px] font-black" style={{ color: lightHeadingColor }}>مهندس علوی (ادمین)</h5>
                  <p className="text-[8px] mt-0.5 leading-tight" style={{ color: lightTextColor }}>کاربر ارشد با دسترسی کامل به منابع.</p>

                  {/* Simulated button */}
                  <div className="mt-2 flex justify-end">
                    <button 
                      type="button" 
                      className="px-2 py-0.5 text-[8px] font-black cursor-default"
                      style={{ 
                        backgroundColor: lightButtonBg,
                        color: lightButtonTextColor,
                        borderRadius: borderRadius === 'rounded-none' ? '0px' : borderRadius === 'rounded-md' ? '3px' : '6px'
                      }}
                    >
                      ذخیره کاربر
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Useful notes / hints for the admin */}
          <div className="bg-slate-900/30 border border-slate-800/40 p-3 rounded-lg text-[9px] text-slate-400 leading-relaxed space-y-1">
            <span className="font-extrabold text-amber-500 block mb-0.5">💡 نکات فنی:</span>
            <p>۱. تغییرات تم و اندازه نوشته‌ها بلافاصله پس از ثبت نهایی، روی تمام ایستگاه‌های کاری پروژه اعمال می‌گردند.</p>
            <p>۲. برای گرفتن بهترین بازخورد، رنگ‌ها را با کنتراست مناسب با پس‌زمینه کادرها تطابق دهید.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
