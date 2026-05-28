import React, { useRef, useState } from 'react';
import { Personnel, Case, Monitor, Printer, Assignment } from '../types';

interface BackupTabProps {
  onRestore: (backupData: any) => Promise<void>;
  onReload: () => void;
  currentData?: {
    personnel: Personnel[];
    cases: Case[];
    monitors: Monitor[];
    printers: Printer[];
    mice?: any[];
    keyboards?: any[];
    partsCatalog?: any[];
    assignments: Assignment[];
  };
}

export default function BackupTab({ onRestore, onReload, currentData }: BackupTabProps) {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Download entire database JSON Backup
  const handleDownloadBackup = async () => {
    try {
      let data = currentData;
      if (!data) {
        const res = await fetch('/api/data');
        data = await res.json();
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ict_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('خطا در بارگیری نسخه پشتیبان.');
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
        
        setLoading(true);
        await onRestore(parsed);
        alert('پایگاه داده شبیه‌ساز با موفقیت بر مبنای فایل بکاپ بازیابی شد.');
        onReload();
      } catch (err) {
        alert('خطا در خواندن یا تحلیل فایل فایل پشتیبان. بررسی کنید ساختار JSON معتبر باشد.');
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
    // Header
    csv += 'نام پرسنل,کد پرسنلی,سمت شغلی,واحد خدمتی,محل استقرار,کد کیس,مادربرد,سی پی یو CPU,کارت گرافیک VGA,هارد اصلی SSD,هارد ثانویه HDD,نوع رم,حجم رم,کد مانیتور ۱,مدل مانیتور ۱,کد مانیتور ۲,مدل مانیتور ۲,کد پرینتر ۱,مدل پرینتر ۱,کد پرینتر ۲,مدل پرینتر ۲\n';
    // Sample Row
    csv += 'رضا محمدی,1050,سرپرست کارگاه,عمران,کانکس اداری,C-888,Gigabyte H510,Intel i3-10100f,GT 730 2GB,SSD 256GB,HDD 1TB,DDR4,16GB,M-991,AOC 22",M-992,AOC 20",P-901,HP LaserJet Pro,P-902,-\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'azarestan_ict_import_template.csv';
    link.click();
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
        
        let personnelList: Personnel[] = [];
        let casesList: Case[] = [];
        let monitorsList: Monitor[] = [];
        let printersList: Printer[] = [];
        let assignmentsList: Assignment[] = [];

        // Parse lines skipping header (index 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Split fields on comma (handle quotes if they are complex, otherwise simple values is ok for CSV in workshop)
          const cols = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length < 3) continue;

          const pName = cols[0];
          const pCode = cols[1];
          const pTitle = cols[2] || 'کارمند';
          const pDept = cols[3] || 'عمران';
          const pLoc = cols[4] || 'دفتر پروژه';

          if (!pName || !pCode) continue;

          // 1. Create personnel profile
          personnelList.push({
            id: `csv_p_${i}_${Date.now()}`,
            name: pName,
            code: pCode,
            title: pTitle,
            department: pDept,
            location: pLoc
          });

          // 2. Case Spec
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
              assignedTo: pCode
            });

            // Start log assignment history
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

          // 3. Monitor 1 & 2
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

          // 4. Printer 1 & 2
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
          assignments: assignmentsList
        };

        if (confirm('توجه: بارگذاری فایل اکسل تمامی دیتابیس فعلی و شبیه‌ساز را پاک کرده و با اطلاعات این کدهای جدید جایگزین می‌کند. آیا مطمئن هستید؟')) {
          setLoading(true);
          await onRestore(fullDumpPayload);
          alert(`بارگذاری موفق! تعداد ${personnelList.length} پرسنل به همراه سخت‌افزارهای ذوب شده با موفقیت وارد سامانه گردید.`);
          onReload();
        }

      } catch (err) {
        alert('خطای مهندسی در خواندن اطلاعات اکسل. فرمت فایل CSV مجدداً استعلام گردد.');
      } finally {
        setLoading(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* PHP standalone ZIP source download invitation banner */}
      <div className="bg-slate-900 border-l-4 border-yellow-500 text-white rounded-xl p-6 shadow-md grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        <div className="md:col-span-2 space-y-2">
          <div className="inline-block bg-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
            مخصوص پروژه - تحویل به مدیر پروژه
          </div>
          <h3 className="text-base md:text-lg font-bold">📦 دانلود پروژه سورس کامل و مستقل PHP به صورت ZIP</h3>
          <p className="text-xs text-slate-300">
            شامل پرونده‌های کامل کامپایل شده مستقل <code className="text-yellow-400 font-mono">index.php</code>، استایل‌های مستقل <code className="text-yellow-400 font-mono">style.css</code> و تمام وب‌سرویس‌های ذخیره محلی با تکنولوژی فلو و قفل فایل. آماده استقرار مستقیم روی وب‌سرور آفلاین XAMPP کارگاهی.
          </p>
        </div>
        <div className="text-center md:text-left">
          <a
            href="/api/download-zip"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 rounded-lg shadow-lg hover:shadow-yellow-500/10 transition cursor-pointer"
          >
            📥 دانلود پوشه نهایی PHP (فایل ZIP)
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card JSON backup */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
              <span>💾</span> پشتیبان‌گیری و بازیابی پایگاه داده (JSON)
            </h4>
            <p className="text-xs text-slate-500 mt-1">امکان جابجایی کل اطلاعات سیستم فیمابین رایانه‌های مختلف کارگاه‌ها</p>
          </div>

          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 block">پشتیبان‌گیری از اطلاعات فعلی:</span>
              <button
                onClick={handleDownloadBackup}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-sm"
              >
                📥 پشتیبان‌گیری آفلاین از دیتابیس (JSON)
              </button>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-600 block">بازیابی اطلاعات از فایل پشتیبان:</span>
              <input
                type="file"
                ref={jsonInputRef}
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
              />
              <button
                onClick={() => jsonInputRef.current?.click()}
                disabled={loading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs md:text-sm px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 w-full border border-slate-300 pointer-events-auto cursor-pointer"
              >
                📤 انتخاب و بارگذاری فایل پشتیبان JSON
              </button>
            </div>

          </div>
        </div>

        {/* Card Bulk Excel/CSV upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
              <span>📊</span> ورود اطلاعات گروهی از فایل اکسل (CSV)
            </h4>
            <p className="text-xs text-slate-500 mt-1">ثبت یکباره تمامی مشخصات سخت‌افزاری بر اساس فایل مرجع کدهای کارگاه</p>
          </div>

          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 block">دانلود الگوی ورودی استاندارد:</span>
              <button
                onClick={handleDownloadTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs md:text-sm px-4 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 w-full border border-slate-300 cursor-pointer"
              >
                📥 دریافت نمونه الگوی آماده اکسل (CSV)
              </button>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-600 block">بارگذاری و جایگزینی کل دیتابیس بر اساس کادر:</span>
              <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
              <button
                onClick={() => csvInputRef.current?.click()}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-md"
              >
                📤 بارگذاری جدول کامل و بازنشانی دیتابیس (Reset)
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
