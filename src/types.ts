export interface Personnel {
  id?: string; // unique ID
  name: string; // نام کامل
  code: string; // کد پرسنلی (unique)
  title: string; // سمت
  department: string; // واحد خدمتی
  location: string; // موقعیت استقرار
  documentNumber?: string; // شماره سند خروجی (یکتا و توالی)
  status?: 'active' | 'terminated'; // وضعیت فعالیت (فعال یا خاتمه همکاری)
  username?: string; // نام کاربری سیستم
  password?: string; // رمز عبور سیستم
}

export interface Case {
  code: string; // کد کیس (unique)
  motherboard: string; // مادربورد
  cpu: string; // پردازنده
  vga: string; // کارت گرافیک
  hdd1: string; // دیسک اول
  hdd2: string; // دیسک دوم
  ramType: string; // نوع رم (e.g. DDR4)
  ramQty: string; // مقدار رم (e.g. 16GB)
  power: string; // پاور (منبع تغذیه)
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت سلامت تجهیز
  description?: string; // توضیحات تکمیلی
  location?: string; // موقعیت فیزیکی کالا
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
  ipAddress?: string; // آدرس IP
  macAddress?: string; // آدرس فیزیکی MAC
  hostName?: string; // نام کامپیوتر Host Name
}

export interface Monitor {
  code: string; // کد مانیتور (unique)
  model: string; // مدل (شامل مارک و سایز)
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت سلامت تجهیز
  description?: string; // توضیحات تکمیلی
  location?: string; // موقعیت فیزیکی کالا
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
}

export interface Printer {
  code: string; // کد چاپگر (unique)
  model: string; // مدل
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت سلامت تجهیز
  description?: string; // توضیحات تکمیلی
  location?: string; // موقعیت فیزیکی کالا
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
  ipAddress?: string; // آدرس IP
  macAddress?: string; // آدرس MAC
  accessLink?: string; // لینک دسترسی ریموت یا تحت وب پرینتر
}

export interface Mouse {
  code: string; // کد ماوس (unique)
  model: string; // مدل/برند
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت سلامت تجهیز
  description?: string; // توضیحات تکمیلی
  location?: string; // موقعیت فیزیکی کالا
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
}

export interface Keyboard {
  code: string; // کد کیبورد (unique)
  model: string; // مدل/برند
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت سلامت تجهیز
  description?: string; // توضیحات تکمیلی
  location?: string; // موقعیت فیزیکی کالا
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
}

export interface Radio {
  code: string; // کد بی‌سیم (unique)
  model: string; // مدل
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت سلامت تجهیز
  description?: string; // توضیحات تکمیلی
  frequencyRange?: string; // UHF/VHF
  ipRating?: string; // درجه حفاظت فیزیکی IP
  location?: string; // موقعیت فیزیکی کالا
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
}

export interface Cctv {
  code: string; // کد اموال دوربین مداربسته (unique)
  brand: string; // مارک دوربین
  model: string; // مدل دوربین
  location: string; // موقعیت استقرار
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
  status?: 'working' | 'repair' | 'retired'; // وضعیت فعالیت
  description?: string; // توضیحات
  lastServiced?: string; // تاریخ آخرین سرویس (شمسی YYYY/MM/DD)
  accessLink?: string; // لینک دسترسی زنده یا آدرس IP
}

export interface CatalogItem {
  id: string;
  category: 'cpu' | 'motherboard' | 'vga' | 'ramType' | 'power' | 'monitorBrand' | 'printerBrand' | 'printerFeature';
  name: string; // نام قطعه / برند / مدل دقیق
  description: string; // توضیحات، ویژگی‌ها یا سایز
}

export interface Assignment {
  id: string; // شناسه تاریخچه
  equipmentCode: string; // کد تجهیز
  equipmentType: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv'; // نوع تجهیز
  personnelCode: string | null; // کد پرسنلی (یا null برای عودت به انبار)
  personnelName: string | null; // نام پرسنل
  startDate: string; // تاریخ شروع (خورشیدی)
  endDate: string | null; // تاریخ پایان یا null (به عنوان فعلی)
}

export interface BackupData {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  radios?: Radio[];
  cctvs?: Cctv[];
  partsCatalog?: CatalogItem[];
  assignments: Assignment[];
}

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'viewer' | 'editor_equipment' | 'custom';
  name: string;
  canEditPersonnel: boolean;
  canEditEquipment: boolean;
  canExport: boolean;
  canBackup: boolean;
  allowedIPs?: string;
}

export interface RepairNeededPart {
  id: string;
  name: string;
  source: 'warehouse' | 'salvage';
  salvageEquipmentCode?: string;
  cost: number;
}

export interface Repair {
  id: string;
  equipmentCode: string;
  equipmentType: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv';
  requestDate: string;
  requesterName: string;
  reportedIssue: string;
  diagnosis: string;
  status: 'pending_diagnosis' | 'parts_requested' | 'parts_procured' | 'completed' | 'unrepairable_salvage';
  neededParts: RepairNeededPart[];
  repairFee: number;
  totalCost: number;
  assignedTechnician: string;
  completedDate: string;
  remarks: string;
}

export interface ThemeSettings {
  themeMode: 'slate-dark' | 'emerald' | 'indigo' | 'rose' | 'warm-slate' | 'classic' | 'navy-ocean';
  fontFamily: 'Vazirmatn' | 'Inter' | 'Estedad' | 'JetBrains Mono' | 'Tahoma';
  accentColor: string;
  containerBackground: string;
  cardGlow: boolean;
  headingStyle: string;
  welcomeTitle: string;
  appBorderRadius: 'rounded-none' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  workspaceGlowStyle: 'none' | 'soft' | 'aurora' | 'intense';
  navbarOpacity: string;
  textColor?: string;
  headingColor?: string;
  cardBackground?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  baseFontSize?: 'sm' | 'base' | 'lg';
  lightTextColor?: string;
  lightHeadingColor?: string;
  lightCardBackground?: string;
  lightButtonBackground?: string;
  lightButtonTextColor?: string;
  lightContainerBackground?: string;
}
