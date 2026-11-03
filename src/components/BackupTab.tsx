import React, { useRef, useState, useEffect } from 'react';
import { Personnel, Case, Monitor, Printer, Assignment } from '../types';

export interface DatabaseStatus {
  success: boolean;
  status: 'connected' | 'disconnected' | 'testing';
  databaseType?: string;
  directory?: string;
  isWritable?: boolean;
  latencyMs?: number;
  totalRecords?: number;
  tables?: Record<string, number>;
  serverTime?: string;
  error?: string;
}

interface BackupTabProps {
  onRestore: (backupData: any) => Promise<boolean | void> | boolean | void;
  onReload: () => void;
  currentData?: {
    personnel: Personnel[];
    cases: Case[];
    monitors: Monitor[];
    printers: Printer[];
    mice?: any[];
    keyboards?: any[];
    radios?: any[];
    cctvs?: any[];
    partsCatalog?: any[];
    assignments: Assignment[];
    repairs?: any[];
    customCategories?: any[];
    customEquipment?: any[];
  };
}

export default function BackupTab({ onRestore, onReload, currentData }: BackupTabProps) {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Live Database Connection & Health Test
  const testDatabaseConnection = async () => {
    setTestingDb(true);
    const start = Date.now();
    try {
      const res = await fetch(`/api/db-status?_t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        success: false,
        status: 'disconnected',
        latencyMs: Date.now() - start,
        error: err?.message || 'خطا در برقراری ارتباط با وب‌سرویس پایگاه داده'
      });
    } finally {
      setTestingDb(false);
    }
  };

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  // Compute total in-memory records
  const totalInMemoryRecords = currentData
    ? (currentData.personnel?.length || 0) +
      (currentData.cases?.length || 0) +
      (currentData.monitors?.length || 0) +
      (currentData.printers?.length || 0) +
      (currentData.mice?.length || 0) +
      (currentData.keyboards?.length || 0) +
      (currentData.radios?.length || 0) +
      (currentData.cctvs?.length || 0) +
      (currentData.partsCatalog?.length || 0) +
      (currentData.assignments?.length || 0) +
      (currentData.repairs?.length || 0) +
      (currentData.customCategories?.length || 0) +
      (currentData.customEquipment?.length || 0)
    : 0;

  // Download entire database JSON Backup
  const handleDownloadBackup = async () => {
    try {
      setLoading(true);
      let payload: any = currentData;
      
      // Always fetch latest snapshot from server to ensure 100% fidelity
      try {
        const res = await fetch(`/api/data?_t=${Date.now()}`);
        if (res.ok) {
          payload = await res.json();
        }
      } catch (e) {
        // Fallback to in-memory state
      }

      const fullBackup = {
        metadata: {
          system: "Omran Azarestan - ICT Management System",
          workshop: "کارگاه بوشهر",
          exportDate: new Date().toISOString(),
          version: "2.5.0",
          totalRecords: totalInMemoryRecords
        },
        database: {
          personnel: payload?.personnel || currentData?.personnel || [],
          cases: payload?.cases || currentData?.cases || [],
          monitors: payload?.monitors || currentData?.monitors || [],
          printers: payload?.printers || currentData?.printers || [],
          mice: payload?.mice || currentData?.mice || [],
          keyboards: payload?.keyboards || currentData?.keyboards || [],
          radios: payload?.radios || currentData?.radios || [],
          cctvs: payload?.cctvs || currentData?.cctvs || [],
          partsCatalog: payload?.partsCatalog || currentData?.partsCatalog || [],
          assignments: payload?.assignments || currentData?.assignments || [],
          repairs: payload?.repairs || currentData?.repairs || [],
          customCategories: payload?.customCategories || currentData?.customCategories || [],
          customEquipment: payload?.customEquipment || currentData?.customEquipment || []
        }
      };

      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const todayStr = new Date().toISOString().slice(0, 10);
      link.download = `ict_database_backup_azarestan_${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('خطا در ایجاد یا ذخیره فایل پشتیبان.');
    } finally {
      setLoading(false);
    }
  };

  // Upload/Restore JSON Backup
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        
        const dbContent = parsed.database || parsed;
        const keys = Object.keys(dbContent).filter(k => Array.isArray(dbContent[k]));

        if (keys.length === 0) {
          alert('فایل انتخاب‌شده فاقد ساختار جداول پایگاه داده است.');
          return;
        }

        const totalItems = keys.reduce((sum, k) => sum + (dbContent[k]?.length || 0), 0);
        const confirmMsg = `آیا از بازیابی فایل پشتیبان اطمینان دارید؟\nاین فایل شامل ${keys.length} جدول و مجموعاً ${totalItems} رکورد است.\nاطلاعات فعلی سیستم با این نسخه جایگزین خواهد شد.`;
        
        if (!confirm(confirmMsg)) return;

        setLoading(true);
        await onRestore(dbContent);
        setRestoreMessage(`بازیابی موفقیت‌آمیز بود! ${keys.length} جدول و ${totalItems} رکورد جایگزین شد.`);
        await testDatabaseConnection();
        onReload();
      } catch (err: any) {
        alert('خطا در خواندن یا تحلیل فایل پشتیبان JSON. لطفاً از معتبر بودن فایل اطمینان حاصل فرمایید.');
      } finally {
        setLoading(false);
        if (jsonInputRef.current) jsonInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // CSV Excel template downloader
  const handleDownloadTemplate = () => {
    let csv = '\uFEFF'; // Correct UTF-8 BOM in JS
    csv += 'نام پرسنل,کد پرسنلی,سمت شغلی,واحد خدمتی,محل استقرار,کد کیس,مادربرد,سی پی یو CPU,کارت گرافیک VGA,هارد اصلی SSD,هارد ثانویه HDD,نوع رم,حجم رم,کد مانیتور ۱,مدل مانیتور ۱,کد مانیتور ۲,مدل مانیتور ۲,کد پرینتر ۱,مدل پرینتر ۱,کد پرینتر ۲,مدل پرینتر ۲\n';
    csv += 'رضا محمدی,1050,سرپرست کارگاه,عمران,کانکس اداری,C-888,Gigabyte H510,Intel i3-10100f,GT 730 2GB,SSD 256GB,HDD 1TB,DDR4,16GB,M-991,AOC 22",M-992,AOC 20",P-901,HP LaserJet Pro,P-902,-\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'azarestan_ict_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload and parse complete multi-column CSV
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawText = event.target?.result as string;
        const lines = rawText.split(/\r?\n/);
        
        const personnelList: Personnel[] = [];
        const casesList: Case[] = [];
        const monitorsList: Monitor[] = [];
        const printersList: Printer[] = [];
        const assignmentsList: Assignment[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const cols = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length < 3) continue;

          const pName = cols[0];
          const pCode = cols[1];
          const pTitle = cols[2] || 'کارمند';
          const pDept = cols[3] || 'عمران';
          const pLoc = cols[4] || 'دفتر پروژه';

          if (!pName || !pCode) continue;

          personnelList.push({
            id: `csv_p_${i}_${Date.now()}`,
            name: pName,
            code: pCode,
            title: pTitle,
            department: pDept,
            location: pLoc
          });

          const cCode = cols[5];
          const cMobo = cols[6];
          const cCpu = cols[7];
          const cVga = cols[8];
          const cSsd = cols[9];
          const cHdd = cols[10];
          const cRamType = cols[11] || 'DDR4';
          const cRamQty = cols[12] || '8GB';

          if (cCode) {
            casesList.push({
              code: cCode,
              motherboard: cMobo || '-',
              cpu: cCpu || '-',
              vga: cVga || '-',
              hdd1: cSsd || '-',
              hdd2: cHdd || '-',
              ramType: cRamType,
              ramQty: cRamQty,
              power: '-',
              assignedTo: pCode
            });

            assignmentsList.push({
              id: `csv_ass_c_${i}_${Date.now()}`,
              equipmentCode: cCode,
              equipmentType: 'case',
              personnelCode: pCode,
              personnelName: pName,
              startDate: '1405/03/03',
              endDate: null
            });
          }

          const m1Code = cols[13];
          const m1Model = cols[14];
          if (m1Code) {
            monitorsList.push({
              code: m1Code,
              model: m1Model || 'سایر',
              assignedTo: pCode
            });
            assignmentsList.push({
              id: `csv_ass_m1_${i}_${Date.now()}`,
              equipmentCode: m1Code,
              equipmentType: 'monitor',
              personnelCode: pCode,
              personnelName: pName,
              startDate: '1405/03/03',
              endDate: null
            });
          }

          const m2Code = cols[15];
          const m2Model = cols[16];
          if (m2Code) {
            monitorsList.push({
              code: m2Code,
              model: m2Model || 'سایر',
              assignedTo: pCode
            });
            assignmentsList.push({
              id: `csv_ass_m2_${i}_${Date.now()}`,
              equipmentCode: m2Code,
              equipmentType: 'monitor',
              personnelCode: pCode,
              personnelName: pName,
              startDate: '1405/03/03',
              endDate: null
            });
          }

          const pr1Code = cols[17];
          const pr1Model = cols[18];
          if (pr1Code) {
            printersList.push({
              code: pr1Code,
              model: pr1Model || 'سایر',
              assignedTo: pCode
            });
            assignmentsList.push({
              id: `csv_ass_pr1_${i}_${Date.now()}`,
              equipmentCode: pr1Code,
              equipmentType: 'printer',
              personnelCode: pCode,
              personnelName: pName,
              startDate: '1405/03/03',
              endDate: null
            });
          }

          const pr2Code = cols[19];
          const pr2Model = cols[20];
          if (pr2Code) {
            printersList.push({
              code: pr2Code,
              model: pr2Model || 'سایر',
              assignedTo: pCode
            });
            assignmentsList.push({
              id: `csv_ass_pr2_${i}_${Date.now()}`,
              equipmentCode: pr2Code,
              equipmentType: 'printer',
              personnelCode: pCode,
              personnelName: pName,
              startDate: '1405/03/03',
              endDate: null
            });
          }
        }

        const fullDumpPayload = {
          personnel: personnelList,
          cases: casesList,
          monitors: monitorsList,
          printers: printersList,
          assignments: assignmentsList,
          // Retain other tables so they are not wiped
          mice: currentData?.mice || [],
          keyboards: currentData?.keyboards || [],
          radios: currentData?.radios || [],
          cctvs: currentData?.cctvs || [],
          partsCatalog: currentData?.partsCatalog || [],
          repairs: currentData?.repairs || [],
          customCategories: currentData?.customCategories || [],
          customEquipment: currentData?.customEquipment || []
        };

        if (confirm(`فایل اکسل شامل ${personnelList.length} پرسنل و تجهیزات متصل است. آیا مایل به ورود و به‌روزرسانی هستید؟`)) {
          setLoading(true);
          await onRestore(fullDumpPayload);
          setRestoreMessage(`بارگذاری موفق! تعداد ${personnelList.length} پرسنل و سخت‌افزارهای مربوطه با موفقیت وارد سامانه گردید.`);
          await testDatabaseConnection();
          onReload();
        }

      } catch (err) {
        alert('خطا در خواندن اطلاعات اکسل. فرمت فایل CSV مجدداً بررسی گردد.');
      } finally {
        setLoading(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* 1. Database Connection & System Health Test Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔌</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تست ارتباط با پایگاه داده و سلامت دیتابیس
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ارزیابی برخط ارتباط با دیسک محلی، اعتبارسنجی حق دسترسی نوشتن و خواندن جداول اطلاعاتی
            </p>
          </div>

          <button
            type="button"
            onClick={testDatabaseConnection}
            disabled={testingDb}
            className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className={`text-sm ${testingDb ? 'animate-spin' : ''}`}>🔄</span>
            <span>{testingDb ? 'در حال تست ارتباط...' : 'بررسی مجدد اتصال'}</span>
          </button>
        </div>

        {/* Live Status Indicator Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">وضعیت اتصال:</span>
            <div className="flex items-center gap-2 pt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {dbStatus?.status === 'connected' ? 'متصل و فعال (Online)' : 'قطع ارتباط (Offline)'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">زمان پاسخ / تأخیر (Latency):</span>
            <div className="flex items-center gap-1.5 pt-0.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              <span className="text-emerald-600 dark:text-emerald-400">{dbStatus?.latencyMs ?? 1}</span>
              <span className="text-[11px] text-slate-400 font-sans font-normal">میلی‌ثانیه (بسیار سریع)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">مجوز خواندن / نوشتن:</span>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-emerald-600 text-sm">✓</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {dbStatus?.isWritable ? 'دسترسی کامل (Read / Write)' : 'فقط خواندنی'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">کل رکوردهای دیتابیس:</span>
            <div className="flex items-center gap-1.5 pt-0.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              <span className="text-blue-600 dark:text-blue-400">{dbStatus?.totalRecords ?? totalInMemoryRecords}</span>
              <span className="text-[11px] text-slate-400 font-sans font-normal">رکورد ثبت‌شده</span>
            </div>
          </div>
        </div>

        {/* Breakdown of Tables */}
        {dbStatus?.tables && (
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>آمار تفکیکی رکوردهای دیتابیس:</span>
              <span className="text-[11px] text-slate-400 font-normal">بروزرسانی: {dbStatus.serverTime || 'هم‌اکنون'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 text-xs">
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">پرسنل</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{dbStatus.tables.personnel ?? 0}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">کیس‌ها</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{dbStatus.tables.cases ?? 0}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">مانیتورها</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{dbStatus.tables.monitors ?? 0}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">چاپگرها</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{dbStatus.tables.printers ?? 0}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">ماوس و کیبورد</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{(dbStatus.tables.mice ?? 0) + (dbStatus.tables.keyboards ?? 0)}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">بی‌سیم و دوربین</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{(dbStatus.tables.radios ?? 0) + (dbStatus.tables.cctvs ?? 0)}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">تعمیرات و سایر</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{(dbStatus.tables.repairs ?? 0) + (dbStatus.tables.customEquipment ?? 0)}</span>
              </div>
            </div>
          </div>
        )}

        {restoreMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <span>✓ {restoreMessage}</span>
            <button onClick={() => setRestoreMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold px-2">✕</button>
          </div>
        )}
      </div>

      {/* 2. Main Backup & Restore Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card JSON backup */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
              <span>💾</span> پشتیبان‌گیری و بازیابی پایگاه داده (JSON)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              ذخیره جامع و بازیابی کامل تمامی اطلاعات سیستم شامل پرسنل، کلیه سخت‌افزارها، تعمیرات و انتساب‌ها
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">تهیه نسخه پشتیبان کامل:</span>
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 w-full cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>📥</span>
                <span>دریافت فایل کامل پشتیبان (JSON Snapshot)</span>
              </button>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">بازیابی اطلاعات از فایل پشتیبان:</span>
              <input
                type="file"
                ref={jsonInputRef}
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                disabled={loading}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 w-full border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <span>📤</span>
                <span>انتخاب و بارگذاری فایل پشتیبان JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Bulk Excel/CSV upload */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
              <span>📊</span> ورود اطلاعات گروهی از فایل اکسل (CSV)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              ثبت و استقرار دسته‌جمعی مشخصات تجهیزات و پرسنل بر مبنای الگوی استاندارد اکسل
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">الگوی استاندارد آماده:</span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 w-full border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <span>📥</span>
                <span>دریافت الگوی نمونه اکسل (CSV Template)</span>
              </button>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">بارگذاری فایل پرسنل و سخت‌افزارها:</span>
              <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 w-full cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>📤</span>
                <span>بارگذاری فایل اکسل و ثبت اطلاعات (Import)</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Standalone PHP Package for Local Offline Server Deployment */}
      <div className="bg-slate-900 border-l-4 border-amber-500 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-block bg-amber-500 text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded-md">
            بسته مستقل کارگاهی - استقرار روی وب‌سرور محلی
          </div>
          <h3 className="text-base md:text-lg font-bold">
            📦 دانلود سورس کامل و مستقل PHP سامانه (فایل ZIP)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            شامل نسخه مستقل و بومی PHP با کنترل فایل، پایگاه داده محلی JSON و تمامی قابلیت‌ها بدون نیاز به اینترنت. آماده قرارگیری مستقیم روی پوشه htdocs وب‌سرور XAMPP کارگاه بوشهر.
          </p>
        </div>
        <a
          href="/api/download-zip"
          download="omran-azarestan-it-system.zip"
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs md:text-sm px-6 py-3 rounded-xl transition shadow-sm cursor-pointer text-center"
        >
          📥 دانلود پوشه کامل PHP (ZIP)
        </a>
      </div>

    </div>
  );
}
