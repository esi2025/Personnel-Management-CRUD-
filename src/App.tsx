import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonnelTab from './components/PersonnelTab';
import { CasesSubTab, MonitorsSubTab, PrintersSubTab, MiceSubTab, KeyboardsSubTab } from './components/EquipmentTabs';
import PartsCatalogTab from './components/PartsCatalogTab';
import TransferTab from './components/TransferTab';
import HistoryTab from './components/HistoryTab';
import ReportingTab from './components/ReportingTab';
import BackupTab from './components/BackupTab';
import AddNewTab from './components/AddNewTab';
import SystemsTreeTab from './components/SystemsTreeTab';
import EditModal from './components/EditModal';
import QRCodeModal from './components/QRCodeModal';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard, CatalogItem } from './types';
import { getPersianDateString } from './utils/date';

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

const INITIAL_DEMO_DATA = {
  personnel: [
    {
      id: "p1",
      name: "علی علوی",
      code: "1001",
      title: "مدیر پروژه",
      department: "مهندسی",
      location: "دفتر فنی کارگاه"
    },
    {
      id: "p2",
      name: "زهرا حسینی",
      code: "1002",
      title: "کارشناس فناوری اطلاعات",
      department: "فناوری اطلاعات و ارتباطات",
      location: "اتاق سرور"
    }
  ],
  cases: [
    {
      code: "C-201",
      motherboard: "ASUS H610M-K",
      cpu: "Intel Core i5-12400",
      vga: "Desktop Intel UHD Graphics",
      hdd1: "SSD 512GB NVMe",
      hdd2: "HDD 1TB WD Blue",
      ramType: "DDR4",
      ramQty: "16GB",
      power: "Green GP400A-ECO 400W",
      assignedTo: "1001"
    },
    {
      code: "C-202",
      motherboard: "MSI B760-P",
      cpu: "Intel Core i7-13700",
      vga: "NVIDIA RTX 3050 8GB",
      hdd1: "SSD 1TB NVMe",
      hdd2: "-",
      ramType: "DDR5",
      ramQty: "32GB",
      power: "Cooler Master MWE 550W Bronz",
      assignedTo: null
    }
  ],
  monitors: [
    {
      code: "M-301",
      model: "Samsung 24\" LF24T350",
      assignedTo: "1001"
    },
    {
      code: "M-302",
      model: "LG 22\" 22MP400",
      assignedTo: "1002"
    }
  ],
  printers: [
    {
      code: "P-401",
      model: "HP LaserJet Pro M402dn",
      assignedTo: "1002"
    },
    {
      code: "P-402",
      model: "Canon LBP6030w",
      assignedTo: null
    }
  ],
  mice: [
    {
      code: "MOU-501",
      model: "A4Tech OP-620D Wired Mouse",
      assignedTo: "1001"
    },
    {
      code: "MOU-502",
      model: "Logitech M170 Wireless Mouse",
      assignedTo: "1002"
    }
  ],
  keyboards: [
    {
      code: "KB-601",
      model: "A4Tech KR-83 Wired Keyboard",
      assignedTo: "1001"
    },
    {
      code: "KB-602",
      model: "Logitech K120 USB Keyboard",
      assignedTo: null
    }
  ],
  partsCatalog: [
    { id: "pc1", category: "cpu" as const, name: "Intel Core i5-12400", description: "6 Cores, 12 Threads, 2.5 GHz Base, LGA1700" },
    { id: "pc2", category: "cpu" as const, name: "Intel Core i7-13700", description: "16 Cores, 24 Threads, 2.1 GHz Base, LGA1700" },
    { id: "pc3", category: "motherboard" as const, name: "ASUS PRIME H610M-R", description: "Intel Socket LGA1700, DDR4 Support, Micro-ATX" },
    { id: "pc5", category: "vga" as const, name: "NVIDIA GeForce RTX 3050 8GB", description: "Dedicated GDDR6 Graphics Card" },
    { id: "pc6", category: "ramType" as const, name: "DDR4", description: "DDR4 Desktop Memory SDRAM" },
    { id: "pc7", category: "ramType" as const, name: "DDR5", description: "DDR5 Next-Gen High Speed Memory" },
    { id: "pc_p1", category: "power" as const, name: "Green GP400A-ECO 400W", description: "Standard 80Plus Eco Power Supply" },
    { id: "pc_p2", category: "power" as const, name: "Cooler Master MWE 550W", description: "550W 80Plus Bronze Power Supply" },
    { id: "pc8", category: "monitorBrand" as const, name: "LG 22MP400 (22 Inch)", description: "22-Inch Full HD (1920x1080) IPS Monitor" },
    { id: "pc9", category: "monitorBrand" as const, name: "Samsung LF24T350 (24 Inch)", description: "24-Inch Full HD IPS 75Hz Bezel-less Monitor" },
    { id: "pc10", category: "printerBrand" as const, name: "HP LaserJet Pro M402dn", description: "Monochrome Laser Printer, Auto Duplex" },
    { id: "pc11", category: "printerBrand" as const, name: "Canon LBP6030w", description: "Compact Wireless Monochrome Laser Printer" }
  ],
  assignments: [
    {
      id: "a1",
      equipmentCode: "C-201",
      equipmentType: "case" as const,
      personnelCode: "1001",
      personnelName: "علی علوی",
      startDate: "1405/01/15",
      endDate: null
    },
    {
      id: "a2",
      equipmentCode: "M-301",
      equipmentType: "monitor" as const,
      personnelCode: "1001",
      personnelName: "علی علوی",
      startDate: "1405/01/15",
      endDate: null
    },
    {
      id: "a3",
      equipmentCode: "M-302",
      equipmentType: "monitor" as const,
      personnelCode: "1002",
      personnelName: "زهرا حسینی",
      startDate: "1405/02/01",
      endDate: null
    },
    {
      id: "a4",
      equipmentCode: "P-401",
      equipmentType: "printer" as const,
      personnelCode: "1002",
      personnelName: "زهرا حسینی",
      startDate: "1405/02/01",
      endDate: null
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('personnel-tab');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Theme states (persisted via localStorage)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Database States
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [mice, setMice] = useState<Mouse[]>([]);
  const [keyboards, setKeyboards] = useState<Keyboard[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<CatalogItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog' | null>(null);

  // Transfer prefill
  const [prefilledEquipCode, setPrefilledEquipCode] = useState('');
  const [prefilledPersCode, setPrefilledPersCode] = useState('');

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrType, setQrType] = useState<'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard'>('case');
  const [qrData, setQrData] = useState<any>(null);

  const handleShowQR = (code: string, type: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard', data: any) => {
    setQrCode(code);
    setQrType(type);
    setQrData(data);
    setQrModalOpen(true);
  };

  // Fetch all databases from Express server imitation with robust localStorage fallback
  const loadDatabase = async () => {
    try {
      if (personnel.length === 0 && cases.length === 0) {
        setLoading(true);
      }
      setError(null);
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('NOT_OK');
      
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('NOT_JSON'); // Cookie check or SPA HTML fallback returned
      }

      const data = await res.json();
      setPersonnel(data.personnel || []);
      setCases(data.cases || []);
      setMonitors(data.monitors || []);
      setPrinters(data.printers || []);
      setMice(data.mice || []);
      setKeyboards(data.keyboards || []);
      setPartsCatalog(data.partsCatalog || []);
      setAssignments(data.assignments || []);

      // Cache locally
      localStorage.setItem('azarestan_ict_db', JSON.stringify({
        personnel: data.personnel || [],
        cases: data.cases || [],
        monitors: data.monitors || [],
        printers: data.printers || [],
        mice: data.mice || [],
        keyboards: data.keyboards || [],
        partsCatalog: data.partsCatalog || [],
        assignments: data.assignments || []
      }));
      setIsOfflineMode(false);
    } catch (err) {
      console.warn('Backend connection issue (cookie block). Loading Local DB from storage.', err);
      const raw = localStorage.getItem('azarestan_ict_db');
      let localDb: any = null;
      if (raw) {
        try {
          localDb = JSON.parse(raw);
        } catch (parseErr) {
          console.error(parseErr);
        }
      }

      if (!localDb) {
        localDb = { ...INITIAL_DEMO_DATA };
        localStorage.setItem('azarestan_ict_db', JSON.stringify(localDb));
      }

      setPersonnel(localDb.personnel || []);
      setCases(localDb.cases || []);
      setMonitors(localDb.monitors || []);
      setPrinters(localDb.printers || []);
      setMice(localDb.mice || []);
      setKeyboards(localDb.keyboards || []);
      setPartsCatalog(localDb.partsCatalog || []);
      setAssignments(localDb.assignments || []);
      
      setIsOfflineMode(true);
      setError(null); // Bypass red screen of death completely
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Save/Edit entity
  const handleSaveItem = async (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog', data: any) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, ...data })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          await loadDatabase();
          return true;
        }
      } catch (err) {
        console.warn('API save failed. Switching to Local fallback.', err);
      }
    }

    // Local / Offline mutate simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    if (type === 'personnel') {
      let list = db.personnel || [];
      if (!data.code) {
        alert("کد پرسنلی الزامی است.");
        return false;
      }
      if (!data.name) {
        alert("نام پرسنل الزامی است.");
        return false;
      }
      const index = list.findIndex((p: any) => p.code === data.code || (data.id && p.id === data.id));
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((p: any) => p.code === data.code)) {
          alert("کد پرسنلی تکراری است.");
          return false;
        }
        list.push({ id: 'p_' + Date.now(), ...data });
      }
      db.personnel = list;
    } 
    else if (type === 'case') {
      let list = db.cases || [];
      if (!data.code) {
        alert("کد کیس الزامی است.");
        return false;
      }
      const index = list.findIndex((c: any) => c.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((c: any) => c.code === data.code)) {
          alert("کد کیس تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.cases = list;
    }
    else if (type === 'monitor') {
      let list = db.monitors || [];
      if (!data.code) {
        alert("کد مانیتور الزامی است.");
        return false;
      }
      const index = list.findIndex((m: any) => m.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((m: any) => m.code === data.code)) {
          alert("کد مانیتور تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.monitors = list;
    }
    else if (type === 'printer') {
      let list = db.printers || [];
      if (!data.code) {
        alert("کد چاپگر الزامی است.");
        return false;
      }
      const index = list.findIndex((p: any) => p.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((p: any) => p.code === data.code)) {
          alert("کد چاپگر تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.printers = list;
    }
    else if (type === 'mouse') {
      let list = db.mice || [];
      if (!data.code) {
        alert("کد ماوس الزامی است.");
        return false;
      }
      const index = list.findIndex((m: any) => m.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((m: any) => m.code === data.code)) {
          alert("کد ماوس تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.mice = list;
    }
    else if (type === 'keyboard') {
      let list = db.keyboards || [];
      if (!data.code) {
        alert("کد کیبورد الزامی است.");
        return false;
      }
      const index = list.findIndex((k: any) => k.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((k: any) => k.code === data.code)) {
          alert("کد کیبورد تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.keyboards = list;
    }
    else if (type === 'catalog') {
      let list = db.partsCatalog || [];
      const index = list.findIndex((c: any) => c.id === data.id);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        list.push({ id: 'pc_' + Date.now(), ...data });
      }
      db.partsCatalog = list;
    }

    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setIsOfflineMode(true);
    await loadDatabase();
    return true;
  };

  // Delete entity
  const handleDeleteItem = async (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog', id: string) => {
    const confirmationMsg = type === 'personnel' 
      ? 'آیا از حذف این پرسنل اطمینان دارید؟ تمامی تجهیزات تحت تصرف وی آزاد شده و به انبار پروژه بازگردانده می‌شوند.'
      : 'آیا از حذف این سخت‌افزار از سامانه اطمینان کامل دارید؟';

    if (!window.confirm(confirmationMsg)) return;

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, id, today: getPersianDateString() })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          alert('مورد با موفقیت از سیستم حذف و بایگانی شد.');
          await loadDatabase();
          return;
        }
      } catch (err) {
        console.warn('API delete failed. Fallback to Local deletion.', err);
      }
    }

    // Local deletion simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };
    const dateStr = getPersianDateString();

    if (type === 'personnel') {
      let list = db.personnel || [];
      const idx = list.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        const codeToClear = list[idx].code;
        list.splice(idx, 1);
        db.personnel = list;

        // Cascade release
        if (codeToClear) {
          (db.cases || []).forEach((c: any) => { if (c.assignedTo === codeToClear) c.assignedTo = null; });
          (db.monitors || []).forEach((m: any) => { if (m.assignedTo === codeToClear) m.assignedTo = null; });
          (db.printers || []).forEach((p: any) => { if (p.assignedTo === codeToClear) p.assignedTo = null; });
          (db.mice || []).forEach((m: any) => { if (m.assignedTo === codeToClear) m.assignedTo = null; });
          (db.keyboards || []).forEach((k: any) => { if (k.assignedTo === codeToClear) k.assignedTo = null; });

          (db.assignments || []).forEach((ass: any) => {
            if (ass.personnelCode === codeToClear && ass.endDate === null) {
              ass.endDate = dateStr;
            }
          });
        }
      }
    } else {
      const keyMap: Record<string, string> = {
        'case': 'cases',
        'monitor': 'monitors',
        'printer': 'printers',
        'mouse': 'mice',
        'keyboard': 'keyboards',
        'catalog': 'partsCatalog'
      };
      const listKey = keyMap[type];
      if (listKey) {
        let list = db[listKey] || [];
        const idx = list.findIndex((x: any) => (type === 'catalog' ? x.id : x.code) === id);
        if (idx !== -1) {
          list.splice(idx, 1);
          db[listKey] = list;

          if (type !== 'catalog') {
            (db.assignments || []).forEach((ass: any) => {
              if (ass.equipmentCode === id && ass.equipmentType === type && ass.endDate === null) {
                ass.endDate = dateStr;
              }
            });
          }
        }
      }
    }

    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setIsOfflineMode(true);
    alert('مورد با موفقیت از سیستم محلی حذف و بایگانی شد.');
    await loadDatabase();
  };

  // Intelligent Equipment Transfer
  const handleTransferItem = async (equipmentCode: string, targetPersonnelCode: string | null) => {
    const today = getPersianDateString();

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ equipmentCode, targetPersonnelCode, today })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          await loadDatabase();
          return;
        }
      } catch (err) {
        console.warn('API transfer failed. Fallback to Local transfer.', err);
      }
    }

    // Local Transfer simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };
    const dateStr = today;

    // Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | null = null;
    let equipItem: any = null;

    const listKeys = ['cases', 'monitors', 'printers', 'mice', 'keyboards'] as const;
    const typesMap = { cases: 'case', monitors: 'monitor', printers: 'printer', mice: 'mouse', keyboards: 'keyboard' } as const;

    for (const key of listKeys) {
      const idx = (db[key] || []).findIndex((x: any) => x.code === equipmentCode);
      if (idx !== -1) {
        equipType = typesMap[key];
        equipItem = db[key][idx];
        break;
      }
    }

    if (!equipItem || !equipType) {
      alert("تجهیزی با این کد اموال یافت نشد.");
      throw new Error("تجهیزی با این کد اموال یافت نشد.");
    }

    const currentOwnerCode = equipItem.assignedTo;

    let targetCode: string | null = targetPersonnelCode;
    if (!targetCode || targetCode === "null" || targetCode === "warehouse") {
      targetCode = null;
    }

    if (currentOwnerCode === targetCode && targetCode !== null) {
      alert("دستگاه در حال حاضر تحویل همین شخص می‌باشد.");
      throw new Error("Duplicate ownership");
    }

    let targetName: string | null = null;
    if (targetCode !== null) {
      const p = (db.personnel || []).find((pers: any) => pers.code === targetCode);
      if (!p) {
        alert("کاربر هدف یافت نشد.");
        throw new Error("User not found");
      }
      targetName = p.name;
    }

    equipItem.assignedTo = targetCode;

    // History log
    const assignments = db.assignments || [];
    if (currentOwnerCode !== null) {
      assignments.forEach((ass: any) => {
        if (ass.equipmentCode === equipmentCode && ass.equipmentType === equipType && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
    }

    if (targetCode !== null) {
      assignments.push({
        id: `ass_${Date.now()}`,
        equipmentCode,
        equipmentType: equipType,
        personnelCode: targetCode,
        personnelName: targetName,
        startDate: dateStr,
        endDate: null
      });
    } else {
      assignments.push({
        id: `ass_${Date.now()}`,
        equipmentCode,
        equipmentType: equipType,
        personnelCode: null,
        personnelName: "خروج به انبار/تحویل به کارگاه",
        startDate: dateStr,
        endDate: dateStr
      });
    }

    db.assignments = assignments;
    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setIsOfflineMode(true);
    await loadDatabase();
  };

  // Restore Entire Database
  const handleRestoreDatabase = async (backupData: any) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backupData)
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          await loadDatabase();
          return;
        }
      } catch (err) {
        console.warn('API restore failed. Fallback to Local restore.', err);
      }
    }

    localStorage.setItem('azarestan_ict_db', JSON.stringify(backupData));
    setIsOfflineMode(true);
    await loadDatabase();
  };

  // Helper callbacks to transition tabs with parameter pre-filling
  const handleTriggerCertificate = (personnelCode: string) => {
    // Open reporting tab and fill cert inputs
    setPrefilledPersCode(personnelCode);
    setActiveTab('reports-tab');
  };

  const handleTriggerTransfer = (code: string) => {
    // Check if it's a personnel code or equipment code
    const isEquip = cases.some(c=>c.code===code) || monitors.some(m=>m.code===code) || printers.some(p=>p.code===code) || mice.some(m=>m.code===code) || keyboards.some(k=>k.code===code);
    if (isEquip) {
      setPrefilledEquipCode(code);
      setPrefilledPersCode('');
    } else {
      setPrefilledPersCode(code);
      setPrefilledEquipCode('');
    }
    setActiveTab('transfer-tab');
  };

  const handleEditTrigger = (item: any, type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog') => {
    setEditItem(item);
    setEditType(type);
  };

  // Filter list based on global search inputs
  const getFilteredPersonnel = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return personnel;
    return personnel.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.code.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) || 
      p.department.toLowerCase().includes(q)
    );
  };

  const getFilteredCases = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cases;
    return cases.filter(c => 
      c.code.toLowerCase().includes(q) || 
      c.cpu.toLowerCase().includes(q) || 
      c.motherboard.toLowerCase().includes(q) ||
      (c.power && c.power.toLowerCase().includes(q)) ||
      (c.assignedTo && c.assignedTo.includes(q))
    );
  };

  const getFilteredMonitors = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return monitors;
    return monitors.filter(m => 
      m.code.toLowerCase().includes(q) || 
      m.model.toLowerCase().includes(q) || 
      (m.assignedTo && m.assignedTo.includes(q))
    );
  };

  const getFilteredPrinters = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return printers;
    return printers.filter(pr => 
      pr.code.toLowerCase().includes(q) || 
      pr.model.toLowerCase().includes(q) || 
      (pr.assignedTo && pr.assignedTo.includes(q))
    );
  };

  const getFilteredMice = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return mice;
    return mice.filter(m => 
      m.code.toLowerCase().includes(q) || 
      m.model.toLowerCase().includes(q) || 
      (m.assignedTo && m.assignedTo.includes(q))
    );
  };

  const getFilteredKeyboards = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return keyboards;
    return keyboards.filter(k => 
      k.code.toLowerCase().includes(q) || 
      k.model.toLowerCase().includes(q) || 
      (k.assignedTo && k.assignedTo.includes(q))
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 font-sans max-w-[1600px] w-full mx-auto print:p-0 print:max-w-none" dir="rtl">
      
      {/* 1. System Header component */}
      <Header isDark={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />

      {isOfflineMode && (
        <div className="no-print mb-6 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">⚡</span>
            <span>
              <strong>اجرای مستقل محلی (LocalStorage DB):</strong> مرورگر شما کوکی‌های امنیتی را در محیط فریم مسدود کرده است. تمامی قابلیت‌های مدیریت سخت‌افزار، گزارش‌ها و جابجایی فعال و روی مرورگر شما ذخیره و آپدیت می‌شوند.
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => window.open(window.location.href, '_blank')} 
            className="shrink-0 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-[10px] transition cursor-pointer"
          >
            🌟 باز کردن در تب جدید جهت اتصال پایگاه ابر
          </button>
        </div>
      )}

      {/* 2. Global search bar (hides in print mode) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex-1 w-full max-w-lg">
          <label className="text-xs font-bold text-slate-700 block mb-1">جستجوی هوشمند در کل آلبوم‌ها:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بر اساس نام شخص، شماره اموال، مدل پردازنده، مانیتور و..."
            className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        {/* Active searches stats indicators */}
        <div className="text-xs text-slate-500 flex gap-2.5 flex-wrap self-end md:self-center font-medium">
          <span className="bg-slate-100 px-2.5 py-1 rounded">👤 پرسنل: {personnel.length}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">🖥️ کیس: {cases.length}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">📺 مانیتور: {monitors.length}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">🖨️ چاپگر: {printers.length}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">🖱️ ماوس: {mice.length}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded">⌨️ کیبورد: {keyboards.length}</span>
        </div>
      </div>

      {/* 3. Navigation tabs bar (hides in print) */}
      <nav className="no-print flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 mb-6">
        {[
          { id: 'personnel-tab', label: '👥 لیست پرسنل' },
          { id: 'cases-tab', label: '🖥️ کیس‌های کارگاه' },
          { id: 'monitors-tab', label: '📺 مانیتورها' },
          { id: 'printers-tab', label: '🖨️ پرینترها' },
          { id: 'mice-tab', label: '🖱️ ماوس‌ها' },
          { id: 'keyboards-tab', label: '⌨️ کیبوردها' },
          { id: 'catalog-tab', label: '🛠️ قطعات مرجع' },
          { id: 'transfer-tab', label: '🔄 جابجایی هوشمند' },
          { id: 'history-tab', label: '📜 تاریخچه لجستیک' },
          { id: 'reports-tab', label: '📋 گزارش و شناسنامه' },
          { id: 'systems-tree-tab', label: '🌳 نمودار درختی سیستم‌ها' },
          { id: 'backup-tab', label: '⚙️ پشتیبان‌گیری و سورس' },
          { id: 'add-new-tab', label: '➕ ثبت جدید' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); }}
            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 4. Display Loading/Errors */}
      {loading && (
        <div className="bg-white border rounded-lg p-12 text-center text-slate-500">
          <span className="text-2xl block mb-2">🔄</span>
          در حال بارگذاری اطلاعات پایگاه داده کارگاه بوشهر...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center font-bold">
          ⚠️ {error}
          <button onClick={loadDatabase} className="mt-4 block mx-auto bg-red-600 text-white px-4 py-2 rounded text-xs">تلاش مجدد اتصال</button>
        </div>
      )}

      {/* 5. Main Panels layout workspace */}
      {!loading && !error && (
        <main className="flex-1">
          {activeTab === 'personnel-tab' && (
            <PersonnelTab 
              personnel={getFilteredPersonnel()} 
              cases={cases}
              monitors={monitors}
              printers={printers}
              mice={mice}
              keyboards={keyboards}
              onEdit={(p) => handleEditTrigger(p, 'personnel')}
              onDelete={(id) => handleDeleteItem('personnel', id)}
              onShowCertificate={handleTriggerCertificate}
              onSelectTransfer={handleTriggerTransfer}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'cases-tab' && (
            <CasesSubTab 
              cases={getFilteredCases()} 
              personnel={personnel}
              onEdit={(c) => handleEditTrigger(c, 'case')}
              onDelete={(code) => handleDeleteItem('case', code)}
              onTransfer={handleTriggerTransfer}
              onTabChange={setActiveTab}
              onShowQR={handleShowQR}
            />
          )}

          {activeTab === 'monitors-tab' && (
            <MonitorsSubTab 
              monitors={getFilteredMonitors()} 
              personnel={personnel}
              onEdit={(m) => handleEditTrigger(m, 'monitor')}
              onDelete={(code) => handleDeleteItem('monitor', code)}
              onTransfer={handleTriggerTransfer}
              onTabChange={setActiveTab}
              onShowQR={handleShowQR}
            />
          )}

          {activeTab === 'printers-tab' && (
            <PrintersSubTab 
              printers={getFilteredPrinters()} 
              personnel={personnel}
              onEdit={(pr) => handleEditTrigger(pr, 'printer')}
              onDelete={(code) => handleDeleteItem('printer', code)}
              onTransfer={handleTriggerTransfer}
              onTabChange={setActiveTab}
              onShowQR={handleShowQR}
            />
          )}

          {activeTab === 'mice-tab' && (
            <MiceSubTab 
              mice={getFilteredMice()} 
              personnel={personnel}
              onEdit={(m) => handleEditTrigger(m, 'mouse')}
              onDelete={(code) => handleDeleteItem('mouse', code)}
              onTransfer={handleTriggerTransfer}
              onTabChange={setActiveTab}
              onShowQR={handleShowQR}
            />
          )}

          {activeTab === 'keyboards-tab' && (
            <KeyboardsSubTab 
              keyboards={getFilteredKeyboards()} 
              personnel={personnel}
              onEdit={(k) => handleEditTrigger(k, 'keyboard')}
              onDelete={(code) => handleDeleteItem('keyboard', code)}
              onTransfer={handleTriggerTransfer}
              onTabChange={setActiveTab}
              onShowQR={handleShowQR}
            />
          )}

          {activeTab === 'catalog-tab' && (
            <PartsCatalogTab 
              catalog={partsCatalog}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
            />
          )}

          {activeTab === 'transfer-tab' && (
            <TransferTab 
              cases={cases}
              monitors={monitors}
              printers={printers}
              mice={mice}
              keyboards={keyboards}
              personnel={personnel}
              onTransfer={handleTransferItem}
              prefilledEquipmentCode={prefilledEquipCode}
              prefilledPersonnelCode={prefilledPersCode}
            />
          )}

          {activeTab === 'history-tab' && (
            <HistoryTab assignments={assignments} />
          )}

          {activeTab === 'reports-tab' && (
            <ReportingTab 
              personnel={personnel}
              cases={cases}
              monitors={monitors}
              printers={printers}
              mice={mice}
              keyboards={keyboards}
              assignments={assignments}
              prefilledPersonnelCode={prefilledPersCode}
              onSaveItem={handleSaveItem}
            />
          )}

          {activeTab === 'systems-tree-tab' && (
            <SystemsTreeTab 
              personnel={personnel}
              cases={cases}
              monitors={monitors}
              printers={printers}
              mice={mice}
              keyboards={keyboards}
            />
          )}

          {activeTab === 'backup-tab' && (
            <BackupTab 
              onRestore={handleRestoreDatabase}
              onReload={loadDatabase}
              currentData={{
                personnel,
                cases,
                monitors,
                printers,
                mice,
                keyboards,
                partsCatalog,
                assignments
              }}
            />
          )}

          {activeTab === 'add-new-tab' && (
            <AddNewTab onSave={handleSaveItem} />
          )}
        </main>
      )}

      {/* 6. Edit Modal */}
      {editItem && editType && (
        <EditModal 
          item={editItem} 
          type={editType} 
          onClose={() => { setEditItem(null); setEditType(null); }}
          onSave={handleSaveItem}
        />
      )}

      {/* QR Code Modal for Equipment scanning */}
      <QRCodeModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        equipmentCode={qrCode} 
        equipmentType={qrType} 
        equipmentData={qrData} 
        personnel={personnel}
      />

      {/* 7. Corporate footer (hides in print) */}
      <footer className="no-print mt-12 bg-slate-900 border-t border-slate-800 text-slate-500 py-6 text-center text-xs space-y-2 rounded-xl">
        <div>سامانه هوشمند و آفلاین شناسنامه واحد ICT کارگاه بوشهر شرکت عمران آذرستان</div>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span>برنامه نویس: <span className="font-bold text-slate-300">مهدی اسماعیلی</span></span>
          <span className="text-slate-700">|</span>
          <span>نسخه برنامه: <span className="font-mono font-bold text-blue-400">v1.2.5</span></span>
        </div>
        <div className="font-mono text-[10px] text-slate-600">
          تمامی حقوق محفوظ است © ۱۴۰۵ | پورت آفلاین بر پایه فایل‌های محلی JSON فاقد پایگاه‌داده خارجی
        </div>
      </footer>

    </div>
  );
}
