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
  model: string; // مدل
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface Printer {
  code: string; // کد چاپگر (unique)
  model: string; // مدل
  assignedTo: string | null; // کد پرسنلی تخصیص یافته یا null
}

export interface Assignment {
  id: string; // شناسه تاریخچه
  equipmentCode: string; // کد تجهیز
  equipmentType: 'case' | 'monitor' | 'printer'; // نوع تجهیز
  personnelCode: string | null; // کد پرسنلی (یا null برای خروج به انبار)
  personnelName: string | null; // نام پرسنل
  startDate: string; // تاریخ شروع (خورشیدی یا میلادی - ما خورشیدی کنونی را استفاده می‌کنیم)
  endDate: string | null; // تاریخ پایان یا null (به عنوان فعلی)
}

export interface BackupData {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  assignments: Assignment[];
}
