export interface Personnel {
  id?: string; // unique ID
  name: string; // نام کامل
  code: string; // کد پرسنلی (unique)
  title: string; // سمت
  department: string; // واحد خدمتی
  location: string; // موقعیت استقرار
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
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface Monitor {
  code: string; // کد مانیتور (unique)
  model: string; // مدل (شامل مارک و سایز)
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface Printer {
  code: string; // کد چاپگر (unique)
  model: string; // مدل
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface Mouse {
  code: string; // کد ماوس (unique)
  model: string; // مدل/برند
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface Keyboard {
  code: string; // کد کیبورد (unique)
  model: string; // مدل/برند
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface CatalogItem {
  id: string;
  category: 'cpu' | 'motherboard' | 'vga' | 'ramType' | 'monitorBrand' | 'printerBrand' | 'printerFeature';
  name: string; // نام قطعه / برند / مدل دقیق
  description: string; // توضیحات، ویژگی‌ها یا سایز
}

export interface Assignment {
  id: string; // شناسه تاریخچه
  equipmentCode: string; // کد تجهیز
  equipmentType: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard'; // نوع تجهیز
  personnelCode: string | null; // کد پرسنلی (یا null برای خروج به انبار)
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
  partsCatalog?: CatalogItem[];
  assignments: Assignment[];
}

