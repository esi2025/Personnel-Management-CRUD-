import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard } from '../types';
import Logo from './Logo';
import EquipmentPieChart from './EquipmentPieChart';
import EquipmentStatusBarChart from './EquipmentStatusBarChart';

interface ReportingTabProps {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
  assignments: Assignment[];
  prefilledPersonnelCode?: string;
  onSaveItem?: (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog', data: any) => Promise<boolean>;
}

export default function ReportingTab({
  personnel,
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = [],
  assignments,
  prefilledPersonnelCode,
  onSaveItem
}: ReportingTabProps) {
  // Checkbox states
  const [secPers, setSecPers] = useState(true);
  const [secCases, setSecCases] = useState(true);
  const [secMons, setSecMons] = useState(true);
  const [secPris, setSecPris] = useState(true);
  const [secHis, setSecHis] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterPers, setFilterPers] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [onlyNeedsRepair, setOnlyNeedsRepair] = useState(false);

  // Special System Certificate profile state
  const [certCode, setCertCode] = useState('');

  // Filtering calculations based on user filters & Needs Repair flag
  const filteredCases = cases.filter(c => {
    if (onlyNeedsRepair && c.status !== 'repair') return false;
    if (filterEquip.trim() && !c.code.toLowerCase().includes(filterEquip.toLowerCase().trim())) return false;
    if (filterPers.trim() && c.assignedTo) {
      const owner = personnel.find(p => p.code === c.assignedTo);
      const query = filterPers.toLowerCase().trim();
      if (owner && !owner.name.toLowerCase().includes(query) && !owner.code.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const filteredMonitors = monitors.filter(m => {
    if (onlyNeedsRepair && m.status !== 'repair') return false;
    if (filterEquip.trim() && !m.code.toLowerCase().includes(filterEquip.toLowerCase().trim())) return false;
    if (filterPers.trim() && m.assignedTo) {
      const owner = personnel.find(p => p.code === m.assignedTo);
      const query = filterPers.toLowerCase().trim();
      if (owner && !owner.name.toLowerCase().includes(query) && !owner.code.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const filteredPrinters = printers.filter(p => {
    if (onlyNeedsRepair && p.status !== 'repair') return false;
    if (filterEquip.trim() && !p.code.toLowerCase().includes(filterEquip.toLowerCase().trim())) return false;
    if (filterPers.trim() && p.assignedTo) {
      const owner = personnel.find(prs => prs.code === p.assignedTo);
      const query = filterPers.toLowerCase().trim();
      if (owner && !owner.name.toLowerCase().includes(query) && !owner.code.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const [reportType, setReportType] = useState<'none' | 'general' | 'certificate'>('none');
  const [certificatePers, setCertificatePers] = useState<Personnel | null>(null);

  // Helper to format sequence to 4 digits padded
  const padZero = (num: number, size = 4) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  };

  // Next sequence state
  const [nextDocSeq, setNextDocSeq] = useState<number>(() => {
    const saved = localStorage.getItem('next_document_sequence');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingDocPersonnelId, setEditingDocPersonnelId] = useState<string | null>(null);
  const [editingDocNumVal, setEditingDocNumVal] = useState<string>('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [seqStartInputValue, setSeqStartInputValue] = useState<string>('');

  // Handle self-healing/updating sequence counter from maximum custom number
  useEffect(() => {
    const assignedNums = personnel
      .map(p => p.documentNumber ? parseInt(p.documentNumber.replace(/\D/g, ''), 10) : 0)
      .filter(num => !isNaN(num) && num > 0);
    const maxAssigned = assignedNums.length > 0 ? Math.max(...assignedNums) : 0;
    
    const saved = localStorage.getItem('next_document_sequence');
    const currentStoredSeq = saved ? parseInt(saved, 10) : 1;
    
    const resolvedNext = Math.max(currentStoredSeq, maxAssigned + 1);
    if (resolvedNext !== currentStoredSeq) {
      localStorage.setItem('next_document_sequence', String(resolvedNext));
      setNextDocSeq(resolvedNext);
    }
  }, [personnel]);

  // Find live personnel object in props to ensure documentNumber update displays instantly!
  const liveCertificatePers = certificatePers 
    ? (personnel.find(p => p.code === certificatePers.code) || certificatePers) 
    : null;

  // Auto-allocate next sequence number if user views their certificate and has no document number
  useEffect(() => {
    if (reportType === 'certificate' && liveCertificatePers && !liveCertificatePers.documentNumber && onSaveItem && !isProcessing) {
      const assignedNum = padZero(nextDocSeq);
      const updatedPers = { ...liveCertificatePers, documentNumber: assignedNum, isEdit: true };
      
      setIsProcessing(true);
      onSaveItem('personnel', updatedPers).then(success => {
        if (success) {
          const nextVal = nextDocSeq + 1;
          localStorage.setItem('next_document_sequence', String(nextVal));
          setNextDocSeq(nextVal);
        }
        setIsProcessing(false);
      }).catch(err => {
        console.error(err);
        setIsProcessing(false);
      });
    }
  }, [reportType, liveCertificatePers, nextDocSeq, onSaveItem, isProcessing]);

  // Auto-fill and generate report when a prefilled personnel code is passed
  useEffect(() => {
    if (prefilledPersonnelCode) {
      setCertCode(prefilledPersonnelCode);
      const found = personnel.find(p => p.code === prefilledPersonnelCode);
      if (found) {
        setCertificatePers(found);
        setReportType('certificate');
      }
    }
  }, [prefilledPersonnelCode, personnel]);

  const triggerGeneralReport = () => {
    setReportType('general');
  };

  const triggerCertificateReport = () => {
    const code = certCode.trim();
    if (!code) {
      alert('لطفاً جهت صدور شناسنامه، ابتدا کد پرسنلی را وارد کنید.');
      return;
    }
    const found = personnel.find(p => p.code === code);
    if (!found) {
      alert('پرسنلی با این کد پرسنلی در سیستم یافت نشد.');
      return;
    }
    setCertificatePers(found);
    setReportType('certificate');
  };

  // Get current assignment equipment items for user code
  const getAssignedEquipments = (userCode: string) => {
    const userCases = cases.filter(c => c.assignedTo === userCode);
    const userMonitors = monitors.filter(m => m.assignedTo === userCode);
    const userPrinters = printers.filter(p => p.assignedTo === userCode);
    const userMice = (mice || []).filter(m => m.assignedTo === userCode);
    const userKeyboards = (keyboards || []).filter(k => k.assignedTo === userCode);
    return {
      cases: userCases,
      monitors: userMonitors,
      printers: userPrinters,
      mice: userMice,
      keyboards: userKeyboards,
      totalCount: userCases.length + userMonitors.length + userPrinters.length + userMice.length + userKeyboards.length
    };
  };

  const exportToExcel = () => {
    if (reportType === 'none') return;

    let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>گزارش هوشمند</x:Name>
          <x:WorksheetOptions>
            <x:DisplayRightToLeft/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Tahoma, Arial, sans-serif; direction: rtl; text-align: right; }
    table { border-collapse: collapse; margin-bottom: 20px; width: 100%; direction: rtl; text-align: right; }
    th { background-color: #f1f5f9; border: 1px solid #718096; font-weight: bold; padding: 10px; text-align: right; font-size: 12px; }
    td { border: 1px solid #cbd5e0; padding: 10px; text-align: right; font-size: 11px; vertical-align: middle; }
    .title-cell { font-size: 18px; font-weight: bold; color: #1a365d; text-align: center; padding: 15px 0; background-color: #ebf8ff; border: 1px solid #718096; }
    .subtitle-cell { font-size: 13px; font-weight: bold; color: #2b6cb0; text-align: center; padding: 8px 0; background-color: #f7fafc; border: 1px solid #718096; }
    .meta-cell { font-size: 11px; color: #4a5568; text-align: right; border: 1px solid #cbd5e0; background-color: #edf2f7; }
    .section-header { font-size: 14px; font-weight: bold; color: #ffffff; background-color: #2b6cb0; text-align: right; padding: 8px; }
    .card-header { font-size: 12px; font-weight: bold; color: #ffffff; background-color: #4a5568; text-align: center; }
    .signature-title { font-weight: bold; font-size: 11px; background-color: #edf2f7; text-align: center; padding: 8px; }
    .signature-body { height: 80px; font-size: 11px; text-align: center; vertical-align: bottom; padding: 5px; }
    .badge { font-size: 10px; font-weight: bold; padding: 2px 6px; text-align: center; border-radius: 4px; }
    .badge-ok { background-color: #c6f6d5; color: #22543d; }
    .badge-repair { background-color: #feebc8; color: #744210; }
    .badge-retired { background-color: #fed7d7; color: #742a2a; }
  </style>
</head>
<body>
`;

    if (reportType === 'general') {
      html += `
  <table>
    <tr>
      <td colspan="10" class="title-cell">شرکت عمران آذرستان</td>
    </tr>
    <tr>
      <td colspan="10" class="subtitle-cell">واحد فناوری اطلاعات و ارتباطات (ICT) — گزارش ترکیبی تجهیزات کل سامانه</td>
    </tr>
    <tr>
      <td colspan="10" class="meta-cell">تاریخ گزارش: ۱۴۰۵/۰۳/۰۳ | فیلتر اعمال شده: بر اساس درخواست کاربر</td>
    </tr>
  </table>

  <table>
    <tr style="background-color: #f7fafc;">
      <td colspan="4" style="font-weight: bold; text-align: center; border: 1px solid #718096; background-color: #ebf8ff; color: #2c5282;">آمار توزیع تجهیزات</td>
      <td colspan="6" style="border: none;"></td>
    </tr>
    <tr>
      <td colspan="2" style="font-weight: bold; background-color: #f7fafc;">کیس‌های کارگاهی / اداری:</td>
      <td colspan="2" style="font-weight: bold; color: #84141A;">${filteredCases.length} عدد</td>
      <td colspan="6" style="border: none;"></td>
    </tr>
    <tr>
      <td colspan="2" style="font-weight: bold; background-color: #f7fafc;">دستگاه‌های مانیتور:</td>
      <td colspan="2" style="font-weight: bold; color: #2563eb;">${filteredMonitors.length} عدد</td>
      <td colspan="6" style="border: none;"></td>
    </tr>
    <tr>
      <td colspan="2" style="font-weight: bold; background-color: #f7fafc;">پرینتر و ملزومات چاپ:</td>
      <td colspan="2" style="font-weight: bold; color: #059669;">${filteredPrinters.length} عدد</td>
      <td colspan="6" style="border: none;"></td>
    </tr>
  </table>
`;

      if (secPers) {
        html += `
  <table>
    <tr>
      <td colspan="6" class="section-header">👥 گزارش کاربران و پرسنل</td>
    </tr>
    <thead>
      <tr>
        <th style="width: 5%">ردیف</th>
        <th style="width: 25%">نام کامل</th>
        <th style="width: 15%">کد پرسنلی</th>
        <th style="width: 20%">سمت</th>
        <th style="width: 15%">بخش</th>
        <th style="width: 20%">موقعیت استقرار</th>
      </tr>
    </thead>
    <tbody>
`;
        personnel.forEach((p, idx) => {
          html += `
      <tr>
        <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="font-weight: bold; color: #1a202c;">${p.name || ''}</td>
        <td style="font-family: monospace;">${p.code || ''}</td>
        <td>${p.title || ''}</td>
        <td>${p.department || ''}</td>
        <td>${p.location || ''}</td>
      </tr>
`;
        });
        html += `
    </tbody>
  </table>
`;
      }

      if (secCases) {
        html += `
  <table>
    <tr>
      <td colspan="10" class="section-header" style="background-color: #1a365d;">🖥️ گزارش فنی کیس‌ها</td>
    </tr>
    <thead>
      <tr>
        <th>ردیف</th>
        <th>کد کیس</th>
        <th>مادربورد</th>
        <th>پردازنده</th>
        <th>نوع رم</th>
        <th>گرافیک</th>
        <th>ذخیره سازی</th>
        <th>پاور (PSU)</th>
        <th>وضعیت سلامت</th>
        <th>کاربر تحویل گیرنده</th>
      </tr>
    </thead>
    <tbody>
`;
        if (filteredCases.length === 0) {
          html += `<tr><td colspan="10" style="text-align: center; color: #a0aec0; padding: 20px;">موردی یافت نشد.</td></tr>`;
        } else {
          filteredCases.forEach((c, idx) => {
            const statusLabel = c.status === 'repair' ? '⚠️ نیاز به تعمیر' : c.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم';
            const ownerName = c.assignedTo ? `${personnel.find(p => p.code === c.assignedTo)?.name || 'کد نامعتبر'} (${c.assignedTo})` : '📦 داخل انبار';
            html += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold; color: #111827;">${c.code || ''}</td>
          <td>${c.motherboard || ''}</td>
          <td>${c.cpu || ''}</td>
          <td style="font-family: monospace;">${c.ramType || ''} / ${c.ramQty || ''}</td>
          <td>${c.vga || ''}</td>
          <td>${c.hdd1 || ''} | ${c.hdd2 || ''}</td>
          <td style="font-family: monospace;">${c.power || '—'}</td>
          <td>${statusLabel}</td>
          <td style="font-weight: bold;">${ownerName}</td>
        </tr>
`;
          });
        }
        html += `
    </tbody>
  </table>
`;
      }

      if (secMons) {
        html += `
  <table>
    <tr>
      <td colspan="5" class="section-header" style="background-color: #2b6cb0;">📺 گزارش دستگاه‌های مانیتور</td>
    </tr>
    <thead>
      <tr>
        <th>ردیف</th>
        <th>کد دستگاه اموال</th>
        <th>سازنده / مدل</th>
        <th>اندازه صفحه (inch)</th>
        <th>وضعیت سلامت</th>
        <th>کاربر واگذار شده</th>
      </tr>
    </thead>
    <tbody>
`;
        if (filteredMonitors.length === 0) {
          html += `<tr><td colspan="6" style="text-align: center; color: #a0aec0; padding: 20px;">موردی یافت نشد.</td></tr>`;
        } else {
          filteredMonitors.forEach((m, idx) => {
            const statusLabel = m.status === 'repair' ? '⚠️ نیاز به تعمیر' : m.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم';
            const ownerName = m.assignedTo ? `${personnel.find(p => p.code === m.assignedTo)?.name || 'کد نامعتبر'} (${m.assignedTo})` : '📦 داخل انبار';
            html += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold; color: #111827;">${m.code || ''}</td>
          <td>${m.model || ''}</td>
          <td>${m.description || '—'}</td>
          <td>${statusLabel}</td>
          <td style="font-weight: bold;">${ownerName}</td>
        </tr>
`;
          });
        }
        html += `
    </tbody>
  </table>
`;
      }

      if (secPris) {
        html += `
  <table>
    <tr>
      <td colspan="6" class="section-header" style="background-color: #2c5282;">🖨️ گزارش پرینتر و ملزومات چاپ</td>
    </tr>
    <thead>
      <tr>
        <th>ردیف</th>
        <th>کد دستگاه اموال</th>
        <th>سازنده / مدل</th>
        <th>پورت اتصال</th>
        <th>وضعیت سلامت</th>
        <th>کاربر واگذار شده</th>
      </tr>
    </thead>
    <tbody>
`;
        if (filteredPrinters.length === 0) {
          html += `<tr><td colspan="6" style="text-align: center; color: #a0aec0; padding: 20px;">موردی یافت نشد.</td></tr>`;
        } else {
          filteredPrinters.forEach((pr, idx) => {
            const statusLabel = pr.status === 'repair' ? '⚠️ نیاز به تعمیر' : pr.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم';
            const ownerName = pr.assignedTo ? `${personnel.find(p => p.code === pr.assignedTo)?.name || 'کد نامعتبر'} (${pr.assignedTo})` : '📦 داخل انبار';
            html += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold; color: #111827;">${pr.code || ''}</td>
          <td>${pr.model || ''}</td>
          <td>${pr.description || '—'}</td>
          <td>${statusLabel}</td>
          <td style="font-weight: bold;">${ownerName}</td>
        </tr>
`;
          });
        }
        html += `
    </tbody>
  </table>
`;
      }

    } else if (reportType === 'certificate' && certificatePers) {
      const assets = getAssignedEquipments(certificatePers.code);
      
      html += `
  <table>
    <tr>
      <td colspan="4" class="title-cell">شرکت عمران آذرستان</td>
    </tr>
    <tr>
      <td colspan="4" class="subtitle-cell">واحد فناوری اطلاعات و ارتباطات (ICT) — برگ واگذاری سخت‌افزار کارگاهی</td>
    </tr>
    <tr>
      <td colspan="4" class="meta-cell">کد سند تولیدی: ICT-CERT-${certificatePers.documentNumber || "----"}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f7fafc; width: 20%;">نام و نام خانوادگی تحویل‌گیرنده:</td>
      <td style="font-weight: bold; width: 30%; color: #2b6cb0;">${certificatePers.name || ''}</td>
      <td style="font-weight: bold; background-color: #f7fafc; width: 20%;">کد پرسنلی پرسنل:</td>
      <td style="font-family: monospace; width: 30%; font-weight: bold;">${certificatePers.code || ''}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f7fafc;">سمت اداری:</td>
      <td>${certificatePers.title || 'کارمند پروژه'}</td>
      <td style="font-weight: bold; background-color: #f7fafc;">بخش مربوطه و مستقر:</td>
      <td>${certificatePers.department || 'دفتر کارگاه'}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; background-color: #f7fafc;">محل استقرار فیزیکی:</td>
      <td>${certificatePers.location || 'کارگاه بوشهر'}</td>
      <td style="font-weight: bold; background-color: #f7fafc;">تاریخ تنظیم نهایی سند:</td>
      <td>۱۴۰۵/۰۳/۰۳</td>
    </tr>
  </table>

  <table>
    <tr>
      <td colspan="4" class="section-header">📁 لیست اقلام و قطعات سخت‌افزاری اختصاص یافته</td>
    </tr>
    <thead>
      <tr style="background-color: #edf2f7;">
        <th style="width: 10%">ردیف</th>
        <th style="width: 25%">نوع دستگاه سخت‌افزار</th>
        <th style="width: 30%">کد اموال املاک آذرستان</th>
        <th style="width: 35%">مدل و مشخصات محوری</th>
      </tr>
    </thead>
    <tbody>
`;
      let counter = 1;
      
      if (assets.cases.length > 0) {
        assets.cases.forEach(item => {
          html += `
      <tr>
        <td style="text-align: center;">${counter++}</td>
        <td style="font-weight: bold;">💻 کیس سیستم</td>
        <td style="font-family: monospace; font-weight: bold; color: #84141A;">${item.code}</td>
        <td>پردازنده: ${item.cpu} | رم: ${item.ramQty || ''} ${item.ramType || ''}</td>
      </tr>
`;
        });
      }

      if (assets.monitors.length > 0) {
        assets.monitors.forEach(item => {
          html += `
      <tr>
        <td style="text-align: center;">${counter++}</td>
        <td style="font-weight: bold;">📺 مانیتور تصویر</td>
        <td style="font-family: monospace; font-weight: bold; color: #1a202c;">${item.code}</td>
        <td>مدل: ${item.model} | توضیحات: ${item.description || '—'}</td>
      </tr>
`;
        });
      }

      if (assets.printers.length > 0) {
        assets.printers.forEach(item => {
          html += `
      <tr>
        <td style="text-align: center;">${counter++}</td>
        <td style="font-weight: bold;">🖨️ پرینتر تحویلی</td>
        <td style="font-family: monospace; font-weight: bold; color: #1a202c;">${item.code}</td>
        <td>مدل: ${item.model} | توضیحات: ${item.description || '—'}</td>
      </tr>
`;
        });
      }

      if (assets.mice.length > 0) {
        assets.mice.forEach(item => {
          html += `
      <tr>
        <td style="text-align: center;">${counter++}</td>
        <td style="font-weight: bold;">🖱️ ماوس پرونده</td>
        <td style="font-family: monospace; font-weight: bold; color: #1a202c;">${item.code}</td>
        <td>مدل ${item.model}</td>
      </tr>
`;
        });
      }

      if (assets.keyboards.length > 0) {
        assets.keyboards.forEach(item => {
          html += `
      <tr>
        <td style="text-align: center;">${counter++}</td>
        <td style="font-weight: bold;">⌨️ کیبورد پرونده</td>
        <td style="font-family: monospace; font-weight: bold; color: #1a202c;">${item.code}</td>
        <td>مدل ${item.model}</td>
      </tr>
`;
        });
      }

      html += `
    </tbody>
  </table>
`;
    }

    html += `
  <table style="margin-top: 40px;">
    <tr>
      <td class="signature-title" style="width: 33.3%;">امضا تحویل گیرنده (استفاده‌کننده):</td>
      <td class="signature-title" style="width: 33.3%;">واحد انبار پروژه:</td>
      <td class="signature-title" style="width: 33.3%;">واحد فناوری اطلاعات (ICT):</td>
    </tr>
    <tr>
      <td class="signature-body">${certificatePers ? certificatePers.name : ''} <br><br> امضا و تایید تحویل سخت‌افزار</td>
      <td class="signature-body">امضا و تایید صدور فیزیکی کالا</td>
      <td class="signature-body">ثبت سیستم شناسنامه مکتوب</td>
    </tr>
  </table>

  <table>
    <tr>
      <td style="text-align: center; font-size: 10px; color: #718096; border: none; padding-top: 20px;">
        سامانه هوشمند صدور شناسنامه تجهیزات کارگاهی شرکت عمران آذرستان سال ۱۴۰۵ | واحد فناوری اطلاعات و ارتباطات
      </td>
    </tr>
  </table>
`;

    html += `
</body>
</html>
`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    const filename = reportType === 'general' 
      ? `general_it_report_${new Date().toISOString().slice(0,10)}.xls`
      : `certificate_${liveCertificatePers?.code || 'user'}_${new Date().toISOString().slice(0,10)}.xls`;
      
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchAllocate = async () => {
    if (!onSaveItem) return;
    const unassigned = personnel.filter(p => !p.documentNumber);
    if (unassigned.length === 0) {
      alert("تمامی پرسنل دارای شماره سند هستند.");
      return;
    }
    if (!confirm(`آیا مایلید به تعداد ${unassigned.length} پرسنل فاقد شماره سند، به صورت خودکار از شماره ${padZero(nextDocSeq)} عدددهی انجام شود؟`)) {
      return;
    }
    
    setIsProcessing(true);
    let currentSeq = nextDocSeq;
    const sorted = [...unassigned].sort((a, b) => a.code.localeCompare(b.code));
    
    try {
      for (const p of sorted) {
        const docNum = padZero(currentSeq);
        await onSaveItem('personnel', { ...p, documentNumber: docNum, isEdit: true });
        currentSeq++;
      }
      localStorage.setItem('next_document_sequence', String(currentSeq));
      setNextDocSeq(currentSeq);
      alert("تخصیص خودکار شماره اسناد با موفقیت پایان یافت.");
    } catch (e) {
      console.error(e);
      alert("خطایی در حین فرآیند رخ داد.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAll = async () => {
    if (!onSaveItem) return;
    if (!confirm("⚠️ هشدار جدی: آیا مطمئن هستید که می‌خواهید شماره سند تمام پرسنل را پاک کنید و توالی را از 0001 مجدداً شروع کنید؟")) {
      return;
    }
    
    setIsProcessing(true);
    try {
      for (const p of personnel) {
        if (p.documentNumber) {
          await onSaveItem('personnel', { ...p, documentNumber: "", isEdit: true });
        }
      }
      localStorage.setItem('next_document_sequence', "1");
      setNextDocSeq(1);
      alert("تمامی فایل سندها پاکسازی شده و توالی به 0001 بازنشانی شد.");
    } catch (e) {
      console.error(e);
      alert("خطایی رخ داد.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveInlineDocNum = async (p: Personnel) => {
    if (!onSaveItem) return;
    setIsProcessing(true);
    try {
      await onSaveItem('personnel', { ...p, documentNumber: editingDocNumVal.trim(), isEdit: true });
      setEditingDocPersonnelId(null);
      setEditingDocNumVal('');
      alert(`شماره سند جدید برای ${p.name} با موفقیت ثبت شد.`);
    } catch (e) {
      console.error(e);
      alert("خطا در ذخیره‌سازی شماره سند رخ داد.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" dir="rtl">
      
      {/* Left controls bar */}
      <div className="no-print bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        
        {/* Controls Block A: General Reports */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">📊 کنترل پنل گزارش‌های اداری</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">بخش‌ها و فیلترهای مدنظر را برای خروجی چاپی تنظیم فرمایید</p>
          </div>

          {/* Section selections */}
          <div className="space-y-2 border-b border-dashed border-slate-100 dark:border-slate-800 pb-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">انتخاب جداول و رده‌های گزارش:</label>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secPers} onChange={(e) => setSecPers(e.target.checked)} />
                لیست پرسنل فعال
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secCases} onChange={(e) => setSecCases(e.target.checked)} />
                لیست مشخصات مانیفست کیس‌ها
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secMons} onChange={(e) => setSecMons(e.target.checked)} />
                لیست مانیتورها
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secPris} onChange={(e) => setSecPris(e.target.checked)} />
                لیست پرینترها
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={secHis} onChange={(e) => setSecHis(e.target.checked)} />
                سوابق کامل فلو و ترانسفر کالا
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">فیلتر پرسنل (نام یا کد):</label>
              <input 
                type="text" 
                value={filterPers} 
                onChange={(e) => setFilterPers(e.target.value)} 
                placeholder="بر اساس کادر خاص..." 
                className="w-full text-right p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:border-blue-500 focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">فیلتر کد اموال سخت‌افزار:</label>
              <input 
                type="text" 
                value={filterEquip} 
                onChange={(e) => setFilterEquip(e.target.value)} 
                placeholder="بر اساس کد اموال کالا..." 
                className="w-full text-right p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:border-blue-500 focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">دامنه تاریخ تحویل (از تـا):</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input 
                  type="text" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  placeholder="از (مثال: ۱۴۰۵/۰۱/۰۱)" 
                  className="w-full text-right p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] focus:outline-none text-slate-800 dark:text-white"
                />
                <input 
                  type="text" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  placeholder="تا (مثال: ۱۴۰۵/۰۳/۰۱)" 
                  className="w-full text-right p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-1.5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-710 dark:text-amber-200 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-955/10 dark:hover:bg-amber-950/20 p-2 rounded border border-amber-250 dark:border-amber-900/40 shadow-xs transition select-none">
                <input 
                  type="checkbox" 
                  checked={onlyNeedsRepair} 
                  onChange={(e) => setOnlyNeedsRepair(e.target.checked)} 
                  className="accent-amber-600 scale-105 cursor-pointer"
                />
                <span className="text-amber-805 dark:text-amber-300 text-xs font-bold">🛠️ فقط تجهیزات نیازمند تعمیر (Needs Repair)</span>
              </label>
            </div>
          </div>

          <button
            onClick={triggerGeneralReport}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg text-xs md:text-sm font-bold transition shadow-sm cursor-pointer"
          >
            📊 نمایش گزارش ترکیبی
          </button>
        </div>

        {/* Controls Block B: Official Certificate Identity Profiles */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">📋 صدور سند شناسنامه رسمی قطعات (سه برگی)</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">تولید خودکار سند امضای سخت‌افزارهای یک پرسنل جهت تحویل کالا</p>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">کد پرسنلی تحویل گیرنده:</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={certCode}
                onChange={(e) => setCertCode(e.target.value)}
                placeholder="وارد کردن کد پرسنلی برای استعلام..."
                className="flex-1 text-right p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:border-blue-500 focus:outline-none text-slate-850 dark:text-white"
              />
              <button
                onClick={triggerCertificateReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded text-xs font-bold transition cursor-pointer"
              >
                📜 صدور شناسنامه
              </button>
            </div>
          </div>
        </div>

        {/* Controls Block B.2: Document Sequence & Serial Admin Panel */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          <button
            onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
            className="w-full flex justify-between items-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition select-none cursor-pointer text-right"
          >
            <span className="flex items-center gap-1.5 font-bold text-slate-750 dark:text-slate-200">⚙️ مدیریت شماره اسناد (ادمین)</span>
            <span className="font-mono text-xs text-slate-500">{isAdminPanelOpen ? '▼' : '▲'}</span>
          </button>

          {isAdminPanelOpen && (
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-4">
              
              {/* Part 1: Change next Start index */}
              <div className="space-y-1 bg-white dark:bg-slate-950 p-2 rounded-md border border-slate-100 dark:border-slate-805">
                <label className="font-bold text-slate-705 dark:text-slate-300 block text-[11px]">عدد شروع توالی بعدی:</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="1"
                    value={seqStartInputValue}
                    onChange={(e) => setSeqStartInputValue(e.target.value)}
                    placeholder={`فعلی: ${padZero(nextDocSeq)}`}
                    className="w-24 text-center p-1.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded font-mono text-[11px] focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(seqStartInputValue, 10);
                      if (!isNaN(val) && val > 0) {
                        localStorage.setItem('next_document_sequence', String(val));
                        setNextDocSeq(val);
                        alert(`توالی مجاز بعدی روی ${padZero(val)} با موفقیت تنظیم شد.`);
                        setSeqStartInputValue('');
                      } else {
                        alert('لطفاً یک عدد معتبر بزرگتر از صفر وارد کنید.');
                      }
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-2.5 py-1.5 rounded font-bold transition cursor-pointer text-[11px]"
                  >
                    ثبت شروع بعدی
                  </button>
                </div>
              </div>

              {/* Part 2: Quick ops */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  disabled={isProcessing}
                  onClick={handleBatchAllocate}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-900/40 p-2 rounded font-bold transition cursor-pointer text-center flex flex-col justify-center items-center gap-0.5 disabled:opacity-50"
                >
                  <span>🔢 تولید شماره برای بقیه</span>
                  <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-normal">(فاقد شماره سند)</span>
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleResetAll}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 dark:bg-red-955/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-900/40 p-2 rounded font-bold transition cursor-pointer text-center flex flex-col justify-center items-center gap-0.5 disabled:opacity-50"
                >
                  <span>⚠️ ریست کامل شماره‌ها</span>
                  <span className="text-[9px] text-red-500 dark:text-red-400 font-normal">(پاکسازی و شروع مجدد)</span>
                </button>
              </div>

              {/* Part 3: Compact scrollable personnel editor */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-205 block text-[11px]">جدول تعیین مستقیم شماره سند:</span>
                <div className="border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg max-h-[160px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 text-[11px] shadow-inner">
                  {personnel.map(p => {
                    const mappedPers = personnel.find(prs => prs.code === p.code) || p;
                    return (
                      <div key={p.id} className="p-2 flex justify-between items-center gap-1 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <div className="truncate flex-1">
                          <strong className="text-slate-900 dark:text-white block truncate">{mappedPers.name}</strong>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px]">کد پرسنلی: {mappedPers.code}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {editingDocPersonnelId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingDocNumVal}
                                onChange={(e) => setEditingDocNumVal(e.target.value)}
                                placeholder="مثال: 0001"
                                className="w-16 p-1 border border-indigo-500 rounded text-center font-mono text-[10px] bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveInlineDocNum(mappedPers)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded p-1 w-6 h-6 flex items-center justify-center font-bold cursor-pointer transition text-xs"
                                title="ذخیره"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDocPersonnelId(null);
                                  setEditingDocNumVal('');
                                }}
                                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded p-1 w-6 h-6 flex items-center justify-center font-bold cursor-pointer transition text-xs"
                                title="انصراف"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-1 py-0.5 rounded">
                              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-[10px]" dir="ltr">
                                {mappedPers.documentNumber ? `CERT-${mappedPers.documentNumber}` : 'ثبت نشده 🛑'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingDocPersonnelId(p.id || null);
                                  setEditingDocNumVal(mappedPers.documentNumber || '');
                                }}
                                className="text-slate-400 hover:text-indigo-650 font-medium p-0.5 rounded cursor-pointer transition text-[10px]"
                                title="ویرایش مستقیم"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {personnel.length === 0 && (
                    <div className="p-3 text-center text-slate-400 dark:text-slate-500 text-[10px]">هیچ پرسنلی ثبت نشده است.</div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Controls Block C: Interactive Stats */}
        <EquipmentPieChart 
          casesCount={cases.length} 
          monitorsCount={monitors.length} 
          printersCount={printers.length} 
        />

        {/* Controls Block D: Interactive Status Distribution */}
        <EquipmentStatusBarChart 
          cases={cases}
          monitors={monitors}
          printers={printers}
          mice={mice}
          keyboards={keyboards}
        />

      </div>

      {/* Right report view area (printable format) */}
      <div className="lg:col-span-2 print:col-span-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col h-[700px] overflow-hidden print:h-auto print:overflow-visible print:bg-white print:border-none print:p-0">
        
        <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-3 gap-2">
          <h4 className="text-slate-800 dark:text-slate-200 font-bold text-xs md:text-sm">📋 پیش‌نمایش زنده و چاپ مستقیم سند</h4>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => window.print()}
              disabled={reportType === 'none'}
              className={`flex-1 md:flex-none px-3 py-1.5 md:py-2 rounded-lg text-[11px] md:text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                reportType !== 'none' 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed'
              }`}
            >
              🖨️ چاپگر / ذخیره PDF مکتوب
            </button>
            <button
              onClick={exportToExcel}
              disabled={reportType === 'none'}
              className={`flex-1 md:flex-none px-3 py-1.5 md:py-2 rounded-lg text-[11px] md:text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                reportType !== 'none' 
                  ? 'bg-[#107c41] hover:bg-[#0b592e] text-white shadow'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed'
              }`}
            >
              📥 فایل شکیل اکسل (RTL Excel)
            </button>
          </div>
        </div>

        {/* Informational guide banner regarding browser iframe permissions for printing */}
        <div className="no-print bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/40 text-amber-850 dark:text-amber-400 text-[11px] md:text-xs rounded-lg p-3 text-right leading-relaxed flex gap-2.5 items-start mb-4">
          <span className="text-base leading-none">💡</span>
          <div>
            <p className="font-bold mb-0.5 text-amber-900 dark:text-amber-300">راهنمای چاپ مستقیم در سند:</p>
            <p className="text-slate-600 dark:text-slate-350">
              چنانچه با کلیک بر روی دکمه فوق واکنشی از چاپگر سیستم مشاهده نمی‌کنید، به دلیل محدودیت‌های امنیتی پیش‌نمایش در محیط ویرایشگر (Iframe) است. لطفاً دکمه آبی‌رنگ <strong className="text-blue-800 dark:text-blue-400">«Open in new tab»</strong> را در منوی بالایی صفحه فشار داده تا سیستم در تب مستقل مرورگر شما اجرا شود و دکمه چاپگر فوری فعال گردد.
            </p>
          </div>
        </div>

        <div className="printable-document bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg flex-1 overflow-y-auto p-8 shadow-inner text-right leading-relaxed text-sm print:overflow-visible print:h-auto print:p-0 print:shadow-none border border-slate-150 dark:border-slate-800/80">
          {reportType === 'none' && (
            <p className="text-slate-400 text-center py-20">
              گزارشی تولید نشده است. فیلترها را تنظیم کرده یا روی یکی از دکمه‌های گزارش‌گیری کلیک کنید.
            </p>
          )}

          {/* Render 1: Combined General Report */}
          {reportType === 'general' && (
            <div className="space-y-6 text-slate-900 dark:text-white leading-relaxed font-sans">
              <div className="text-center border-b-2 border-slate-350 dark:border-slate-750 pb-4 mb-4 space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-105">شرکت عمران آذرستان</h2>
                <h3 className="text-sm text-slate-800 dark:text-slate-200 font-bold">واحد فناوری اطلاعات و ارتباطات (ICT)</h3>
                <h4 className="text-xs text-slate-600 dark:text-slate-400 font-medium">گزارش ترکیبی تجهیزات کل سامانه</h4>
                <p className="text-[11px] text-slate-500 mt-2 pb-2">تاریخ گزارش: ۱۴۰۵/۰۳/۰۳ | فیلتر اعمال شده: بر اساس درخواست کاربر</p>
                
                {/* Print & Screen Distribution stats */}
                <div className="grid grid-cols-3 gap-3 text-right mt-3 text-xs font-sans">
                  <div className="border border-slate-200 dark:border-slate-800 rounded p-2.5 bg-slate-50 dark:bg-slate-900">
                    <div className="text-slate-500 font-medium mb-1 text-[11px]">کیس‌های لود شده</div>
                    <div className="font-bold text-[#84141A] dark:text-red-400 text-xs">
                      {filteredCases.length} عدد ({filteredCases.length + filteredMonitors.length + filteredPrinters.length > 0 ? Math.round((filteredCases.length / (filteredCases.length + filteredMonitors.length + filteredPrinters.length)) * 100) : 0}٪)
                    </div>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded p-2.5 bg-slate-50 dark:bg-slate-900">
                    <div className="text-slate-500 font-medium mb-1 text-[11px]">دستگاه‌های مانیتور</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                      {filteredMonitors.length} عدد ({filteredCases.length + filteredMonitors.length + filteredPrinters.length > 0 ? Math.round((filteredMonitors.length / (filteredCases.length + filteredMonitors.length + filteredPrinters.length)) * 100) : 0}٪)
                    </div>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded p-2.5 bg-slate-50 dark:bg-slate-900">
                    <div className="text-slate-500 font-medium mb-1 text-[11px]">دستگاه‌های پرینتر</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      {filteredPrinters.length} عدد ({filteredCases.length + filteredMonitors.length + filteredPrinters.length > 0 ? Math.round((filteredPrinters.length / (filteredCases.length + filteredMonitors.length + filteredPrinters.length)) * 100) : 0}٪)
                    </div>
                  </div>
                </div>
              </div>

              {/* Personnel Block */}
              {secPers && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-white py-1 bg-slate-100 dark:bg-slate-900 px-2 rounded">👥 گزارش کاربران و پرسنل</h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-350 dark:border-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">نام کامل</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کد پرسنلی</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">سمت</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">بخش</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">موقعیت استقرار</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personnel.map((p, idx) => (
                        <tr key={p.id}>
                          <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-300 dark:border-slate-800 p-2 font-bold">{p.name}</td>
                          <td className="border border-slate-300 dark:border-slate-800 p-2 font-mono">{p.code}</td>
                          <td className="border border-slate-300 dark:border-slate-800 p-2">{p.title}</td>
                          <td className="border border-slate-300 dark:border-slate-800 p-2">{p.department}</td>
                          <td className="border border-slate-300 dark:border-slate-800 p-2">{p.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Case Block */}
              {secCases && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white py-1 bg-slate-100 dark:bg-slate-900 px-2 rounded flex justify-between items-center">
                    <span>🖥️ گزارش فنی کیس‌ها</span>
                    {onlyNeedsRepair && <span className="text-[10px] bg-amber-550 text-white px-2 py-0.5 rounded font-bold">فیلتر شده: نیاز به تعمیر</span>}
                  </h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-350 dark:border-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کد کیس</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">مادربورد</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">پردازنده</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">نوع رم</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">گرافیک</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">ذخیره سازی</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">پاور (PSU)</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کاربر تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="border border-slate-300 dark:border-slate-800 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredCases.map((c, idx) => (
                          <tr key={c.code}>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-mono font-bold text-slate-900 dark:text-slate-100">{c.code}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{c.motherboard}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{c.cpu}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-mono">{c.ramType} / {c.ramQty}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{c.vga}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{c.hdd1} | {c.hdd2}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{c.power || "—"}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">
                              {c.status === 'repair' ? '⚠️ نیاز به تعمیر' : c.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم'}
                            </td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-semibold">
                              {c.assignedTo ? `${personnel.find(p=>p.code===c.assignedTo)?.name || 'کد نامعتبر'}(${c.assignedTo})` : '📦 داخل انبار'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Monitors Block */}
              {secMons && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white py-1 bg-slate-100 dark:bg-slate-900 px-2 rounded flex justify-between items-center">
                    <span>📺 گزارش مانیتورها</span>
                    {onlyNeedsRepair && <span className="text-[10px] bg-amber-550 text-white px-2 py-0.5 rounded font-bold">فیلتر شده: نیاز به تعمیر</span>}
                  </h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-350 dark:border-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کد اموال مانیتور</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">سازنده / مدل</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">توضیحات تکمیلی</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کاربر تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonitors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="border border-slate-300 dark:border-slate-800 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredMonitors.map((m, idx) => (
                          <tr key={m.code}>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-mono font-bold text-slate-900 dark:text-slate-100">{m.code}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{m.model}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{m.description || "—"}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">
                              {m.status === 'repair' ? '⚠️ نیاز به تعمیر' : m.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم'}
                            </td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-semibold">
                              {m.assignedTo ? `${personnel.find(p=>p.code===m.assignedTo)?.name || 'کد نامعتبر'}(${m.assignedTo})` : '📦 داخل انبار'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Printers Block */}
              {secPris && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white py-1 bg-slate-100 dark:bg-slate-900 px-2 rounded flex justify-between items-center">
                    <span>🖨️ گزارش پرینترها</span>
                    {onlyNeedsRepair && <span className="text-[10px] bg-amber-550 text-white px-2 py-0.5 rounded font-bold">فیلتر شده: نیاز به تعمیر</span>}
                  </h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-350 dark:border-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold w-12 text-center">ردیف</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کد اموال پرینتر</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">سازنده / مدل</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">توضیحات تکمیلی</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">وضعیت سلامت</th>
                        <th className="border border-slate-300 dark:border-slate-800 p-2 font-bold">کاربر تحویل گیرنده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrinters.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="border border-slate-300 dark:border-slate-800 p-4 text-center text-slate-400">موردی با این مشخصات یافت نشد.</td>
                        </tr>
                      ) : (
                        filteredPrinters.map((pr, idx) => (
                          <tr key={pr.code}>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-mono font-bold text-slate-900 dark:text-slate-100">{pr.code}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{pr.model}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">{pr.description || "—"}</td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2">
                              {pr.status === 'repair' ? '⚠️ نیاز به تعمیر' : pr.status === 'retired' ? '❌ اسقاط شده' : '✅ سالم'}
                            </td>
                            <td className="border border-slate-300 dark:border-slate-800 p-2 font-semibold">
                              {pr.assignedTo ? `${personnel.find(p=>p.code===pr.assignedTo)?.name || 'کد نامعتبر'}(${pr.assignedTo})` : '📦 داخل انبار'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History Block */}
              {secHis && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white py-1 bg-slate-100 dark:bg-slate-900 px-2 rounded">📂 سوابق تغییر و انتقال پرونده‌ها</h4>
                  <p className="text-[10px] text-slate-500">برای ردیابی ریزتغییرات به زبانه اصلی پشتیبان‌گیری / سوابق مراجعه کنید.</p>
                </div>
              )}

              <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between items-center text-[10px] text-slate-450">
                <span>تایید نهایی: واحد فناوری اطلاعات ICT</span>
                <span>بایگانی اسناد الکترونیک آذرستان</span>
              </div>
            </div>
          )}

          {/* Render 2: Official Certificate Document */}
          {reportType === 'certificate' && liveCertificatePers && (() => {
            const certificatePers = liveCertificatePers;
            const assignedAssets = getAssignedEquipments(certificatePers.code);

            return (
              <div className="space-y-8 text-slate-900 leading-relaxed font-sans">
                
                {/* --- PAGE 1: Identity & Assignment Cover --- */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white space-y-6 break-inside-avoid shadow-sm relative overflow-hidden text-right">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full -mr-12 -mt-12 pointer-events-none" />
                  
                  {/* Letterhead Header */}
                  <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                    <div className="text-[10px] flex flex-col font-medium text-slate-500">
                      <span>تاریخ سند: ۱۴۰۵/۰۳/۰۳</span>
                      <span>تاییدیه شماره: CERT-{certificatePers.documentNumber || "تولید خودکار"}</span>
                      <span>پیوست: دارد</span>
                    </div>
                    <div className="text-center">
                      <h2 className="text-base font-black text-slate-900">شرکت عمران آذرستان (اداری / کارگاهی)</h2>
                      <h4 className="text-xs text-indigo-750 font-bold">برگ تحویل سخت‌افزار و واگذاری نهایی اموال</h4>
                    </div>
                    <Logo />
                  </div>

                  {/* Body Intro */}
                  <div className="text-xs text-slate-700 leading-relaxed text-justify">
                    بدین‌وسیله قطعات و دستگاه‌های مشروحه ذیل طبق قوانین حاکمیتی واحد فناوری اطلاعات (IT) شرکت عمران آذرستان، به صورت امانتی متعهد با مسئولیت حفظ فیزیکی به همکار گرامی تحویل گردیده و در پرونده پرسنلی ایشان به صورت سیستماتیک بارگذاری و ثبت نهایی شد.
                  </div>

                  {/* Recipient Details Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">تحویل‌گیرنده اقلام:</span>
                      <strong className="text-slate-800 mr-1.5">{certificatePers.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">کد پرسنلی مستقل:</span>
                      <strong className="text-slate-800 mr-1.5 font-mono">{certificatePers.code}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">سمت سازمانی:</span>
                      <strong className="text-slate-800 mr-1.5">{certificatePers.title || "کارشناس کارگاه"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">بخش / موقعیت:</span>
                      <strong className="text-slate-800 mr-1.5">{certificatePers.department || "امور دفتری کارگاه"}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-medium">موقعیت استقرار فیزیکی:</span>
                      <strong className="text-slate-800 mr-1.5">{certificatePers.location || "کارگاه بوشهر"}</strong>
                    </div>
                  </div>

                  {/* Asset Surcharges Section */}
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-slate-800 block">⚙️ تجهیزات تحویل داده شده:</span>
                    <table className="w-full text-xs border-collapse border border-slate-350 text-right">
                      <thead className="bg-slate-50 font-bold text-slate-700">
                        <tr>
                          <th className="border border-slate-300 p-2 w-12 text-center">ردیف</th>
                          <th className="border border-slate-300 p-2">نوع دستگاه سخت‌افزار</th>
                          <th className="border border-slate-300 p-2">کد اموال آذرستان</th>
                          <th className="border border-slate-300 p-2">برند / مشخصات محوری</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedAssets.totalCount === 0 ? (
                          <tr>
                            <td colSpan={4} className="border border-slate-300 p-3 text-center text-slate-400">هیچ تجهیزی به نام این کاربر واگذار نشده است.</td>
                          </tr>
                        ) : (
                          (() => {
                            let counter = 1;
                            const rows: React.ReactNode[] = [];
                            assignedAssets.cases.forEach(item => {
                              rows.push(
                                <tr key={item.code}>
                                  <td className="border border-slate-300 p-2 text-center font-mono">{counter++}</td>
                                  <td className="border border-slate-305 p-2 font-bold">💻 کیس سیستم کامپیوتر</td>
                                  <td className="border border-slate-305 p-2 font-mono font-bold text-[#84141A]">{item.code}</td>
                                  <td className="border border-slate-305 p-2">مادربورد: {item.motherboard} | پردازنده: {item.cpu} | رم: {item.ramQty} {item.ramType}</td>
                                </tr>
                              );
                            });
                            assignedAssets.monitors.forEach(item => {
                              rows.push(
                                <tr key={item.code}>
                                  <td className="border border-slate-300 p-2 text-center font-mono">{counter++}</td>
                                  <td className="border border-slate-305 p-2 font-bold">📺 مانیتور تصویر نماینده</td>
                                  <td className="border border-slate-305 p-2 font-mono font-bold text-slate-900">{item.code}</td>
                                  <td className="border border-slate-305 p-2">مدل: {item.model} | توضیحات: {item.description || "—"}</td>
                                </tr>
                              );
                            });
                            assignedAssets.printers.forEach(item => {
                              rows.push(
                                <tr key={item.code}>
                                  <td className="border border-slate-300 p-2 text-center font-mono">{counter++}</td>
                                  <td className="border border-slate-305 p-2 font-bold">🖨️ دستگاه پرینتر / چاپگر</td>
                                  <td className="border border-slate-305 p-2 font-mono font-bold text-slate-900">{item.code}</td>
                                  <td className="border border-slate-305 p-2">مدل: {item.model} | توضیحات: {item.description || "—"}</td>
                                </tr>
                              );
                            });
                            assignedAssets.mice.forEach(item => {
                              rows.push(
                                <tr key={item.code}>
                                  <td className="border border-slate-300 p-2 text-center font-mono">{counter++}</td>
                                  <td className="border border-slate-305 p-2 font-semibold">🖱️ ماوس و موس‌پد تحویلی</td>
                                  <td className="border border-slate-305 p-2 font-mono text-slate-600">{item.code}</td>
                                  <td className="border border-slate-305 p-2">مدل و سازنده: {item.model}</td>
                                </tr>
                              );
                            });
                            assignedAssets.keyboards.forEach(item => {
                              rows.push(
                                <tr key={item.code}>
                                  <td className="border border-slate-300 p-2 text-center font-mono">{counter++}</td>
                                  <td className="border border-slate-305 p-2 font-semibold">⌨️ کیبورد صفحه کلید</td>
                                  <td className="border border-slate-305 p-2 font-mono text-slate-600">{item.code}</td>
                                  <td className="border border-slate-305 p-2">مدل و دکمه‌ها: {item.model}</td>
                                </tr>
                              );
                            });
                            return rows;
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Standard Signatures line for Cover */}
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-dashed border-slate-200 text-center text-[10px] font-bold">
                    <div className="space-y-4">
                      <span>تعهد و امضای دریافت کننده:</span>
                      <p className="font-normal text-slate-500 pt-6">جناب آقای / سرکار خانم<br /> <strong>{certificatePers.name}</strong></p>
                    </div>
                    <div className="space-y-4">
                      <span>امضای مسئول انبار کارگاه:</span>
                      <p className="font-normal text-slate-500 pt-12">مهر و امضا خروج فیزیکی کالا</p>
                    </div>
                    <div className="space-y-4">
                      <span>مهر و تایید واحد فناوری اطلاعات (ICT):</span>
                      <p className="font-normal text-slate-500 pt-12">تایید سیستم و الصاق نهایی تگ هویت</p>
                    </div>
                  </div>
                </div>

                {/* --- PAGE 2: Legal Regulations Page --- */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white space-y-6 break-before-page break-inside-avoid shadow-sm text-right">
                  <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                    <span className="text-[10px] font-mono text-slate-400">ICT-RULE-PAGE-2</span>
                    <strong className="text-xs text-slate-800">قوانین و آیین‌نامه‌های انضباطی واگذاری سخت‌افزار شرکت عمران آذرستان</strong>
                    <Logo />
                  </div>

                  <div className="space-y-4 text-xs text-justify text-slate-700 leading-relaxed font-sans">
                    <p className="font-bold text-slate-900 border-r-4 border-[#84141A] pr-2 bg-slate-50 py-1">قوانین نگهداری از تجهیزات و حریم خصوصی داده‌ها:</p>
                    
                    <ul className="list-decimal list-inside space-y-2 pr-2 text-slate-600">
                      <li>
                        سخت‌افزار اختصاص یافته منحصراً جهت کارهای دفتری و کارگاهی شرکت عمران آذرستان بوده و استفاده شخصی یا به امانت دادن آن به افراد غیر مسئول خارج از شبکه عمران ممیزی و خلاف مقررات است.
                      </li>
                      <li>
                        مسئولیت حفظ فیزیکی سخت‌افزار، نظافت قطعات داخلی، جلوگیری از صدمات ناشی از ریختن مایعات و جابجایی غیراصولی بر عهده شخص تحویل‌گیرنده می‌باشد.
                      </li>
                      <li>
                        ایجاد هرگونه خدمات تعمیر شخصی، بازکردن درب کیس با پلمپ معتبر، تعویض مستقیم قطعات، یا جابجا کردن قطعات بین سیستم‌های کارگاهی بدون هماهنگی کتبی و قبلی با واحد فناوری اطلاعات (IT) مطلقاً ممنوع می‌باشد.
                      </li>
                      <li>
                        در صورت خرابی سخت‌افزار، همکار موظف است مراتب را بلافاصله از طریق پرونده زبانه <strong>«درخواست تعمیرات»</strong> در این پلتفرم ثبت نموده تا تکنسین مقیم یا ارشد کارگاه در اسرع وقت اقدام نمایند.
                      </li>
                      <li>
                        هنگام تسویه حساب نهایی پروژه، تحویل سالم این تجهیزات دقیقاً منطبق بر کدهای اموال الصاق شده در صفحه بعد، به مدیر انبار کارگاه و اخذ تاییدیه از واحد IT جهت خروج کتبی الزامی است.
                      </li>
                    </ul>

                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-[10px] leading-normal font-sans">
                      ⚠️ <strong>تذکر مهم امنیتی:</strong> به منظور حفظ حریم خصوصی و امنیت کل شبکه، نصب هرگونه نرم‌افزار متکی به ابزارهای فیلترشکن، ابزارهای دانلود مشکوک، بازی‌های سنگین، ابزارهای ردیابی و کرک‌های مخرب بر روی سیستم اداری ممنوع بوده و کشف موارد مشکوک منجر به مسدودسازی پورت دسترسی کلاینت در فایروال مرکز عمران خواهد شد.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-10 text-center text-[10px] font-bold">
                    <div className="space-y-3">
                      <span>محل اثر انگشت و امضای تحویل‌گیرنده متعهد:</span>
                      <div className="h-20" />
                      <span className="font-normal text-slate-500">موافقت با آیین‌نامه انضباطی فوق</span>
                    </div>
                    <div className="space-y-3">
                      <span>تاییدیه نهایی واحد مدیریت فناوری اطلاعات دفتر مرکزی:</span>
                      <div className="h-20" />
                      <span className="font-normal text-slate-500">واحد هماهنگی و پشتیبانی شبکه‌های سراسری</span>
                    </div>
                  </div>
                </div>

                {/* --- PAGE 3: Physical Label Attachments Page (QR Codes) --- */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white space-y-6 break-before-page break-inside-avoid shadow-sm text-right">
                  <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                    <div className="text-[10px] flex flex-col font-medium text-slate-400">
                      <span>پیوست شماره ۳</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xs text-slate-800 font-bold">پیوست برچسب‌های رهگیری شناسنامه (QR Codes)</h3>
                    </div>
                    <div className="text-[10px] flex flex-col items-end mr-auto">
                      <span>کد سند: 37-FO-IT-01-01</span>
                      <span dir="ltr" className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 rounded">ICT-CERT-{certificatePers.documentNumber || "----"}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-normal">
                    📌 <strong>راهنمای الصاق و نگهداری برچسب بارکد:</strong> این برگه حاوی کدهای پاسخ سریع (QR Code) اختصاصی تجهیزات واگذار شده به جناب آقای/سرکار خانم <strong>{certificatePers.name}</strong> می‌باشد. این بارکدها نشان‌دهنده هویت ثبت شده کالا در انبار ICT کارگاه بوشهر است. همکاران محترم موظفند برچسب‌های تولید شده را بر روی کیس، مانیتور و سایر سخت‌افزارها الصاق نمودن و از مخدوش کردن یا کندن آنها خودداری فرمایند.
                  </div>

                  {(() => {
                    const assignedAssetsObj = getAssignedEquipments(certificatePers.code);
                    const assignedList: { type: string; categoryName: string; code: string; brand: string; model: string }[] = [];
                    
                    assignedAssetsObj.cases.forEach(c => {
                      assignedList.push({ type: 'case', categoryName: '💻 کیس کامپیوتر', code: c.code, brand: 'Intel/AMD', model: c.cpu });
                    });
                    assignedAssetsObj.monitors.forEach(m => {
                      assignedList.push({ type: 'monitor', categoryName: '📺 مانیتور اداری', code: m.code, brand: 'مانیتور', model: m.model });
                    });
                    assignedAssetsObj.printers.forEach(p => {
                      assignedList.push({ type: 'printer', categoryName: '🖨️ چاپگر تحویلی', code: p.code, brand: 'چاپگر', model: p.model });
                    });
                    assignedAssetsObj.mice.forEach(m => {
                      assignedList.push({ type: 'mouse', categoryName: '鼠标 ماوس پرونده', code: m.code, brand: 'ماوس', model: m.model });
                    });
                    assignedAssetsObj.keyboards.forEach(k => {
                      assignedList.push({ type: 'keyboard', categoryName: '⌨️ کیبورد پرونده', code: k.code, brand: 'کیبورد', model: k.model });
                    });

                    if (assignedList.length === 0) {
                      return (
                        <p className="text-center py-10 text-xs text-slate-400 bg-slate-50 rounded border border-dashed">
                          هیچ سخت‌افزاری در واگذاری این شخص ثبت نگردیده است؛ پیوست بارکد خالی می‌باشد.
                        </p>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-2">
                        {assignedList.map(item => (
                          <div 
                             key={item.code} 
                             className="bg-white border-2 border-black rounded-xl p-2.5 print:p-2 flex flex-col items-center justify-between text-center relative overflow-hidden break-inside-avoid shadow-sm min-h-[145px]"
                          >
                             <div className="bg-slate-100 text-[8px] print:text-[7.5px] font-black py-0.5 rounded w-full text-slate-700 truncate leading-none">
                               {item.categoryName}
                             </div>

                             {/* Quick QR Generator */}
                             <div className="my-1.5 p-1 bg-white border border-slate-150 rounded">
                               <QRCodeSVG
                                 value={`ITEM|${item.type}|${item.code}`}
                                 size={72}
                                 level="H"
                               />
                             </div>

                             <div className="w-full">
                               <span className="font-mono block text-[9px] print:text-[8.5px] font-black tracking-widest text-[#84141A] border-t border-dashed border-slate-300 pt-0.5 pb-0.5">
                                 {item.code}
                               </span>
                               <span className="text-[7.5px] print:text-[7px] text-slate-500 font-bold block truncate">
                                 {item.brand} {item.model}
                               </span>
                             </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Footer Signature approval notes */}
                  <div className="pt-8 text-[9px] text-slate-450 text-left border-t border-dashed border-slate-200 mt-6 font-medium">
                    تاریخ تاییدیه و ثبت سیستم: ۱۴۰۵/۰۳/۰۳ | واحد فناوری اطلاعات و ارتباطات (ICT) عمران آذرستان
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
