import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonnelTab from './components/PersonnelTab';
import { CasesSubTab, MonitorsSubTab, PrintersSubTab, MiceSubTab, KeyboardsSubTab, RadiosSubTab } from './components/EquipmentTabs';
import PartsCatalogTab from './components/PartsCatalogTab';
import TransferTab from './components/TransferTab';
import HistoryTab from './components/HistoryTab';
import ReportingTab from './components/ReportingTab';
import BackupTab from './components/BackupTab';
import AddNewTab from './components/AddNewTab';
import SystemsTreeTab from './components/SystemsTreeTab';
import EditModal from './components/EditModal';
import QRCodeModal from './components/QRCodeModal';
import LoginScreen from './components/LoginScreen';
import UsersTab from './components/UsersTab';
import BulkQRTab from './components/BulkQRTab';
import LogsTab from './components/LogsTab';
import RepairsTab from './components/RepairsTab';
import AppearanceTab from './components/AppearanceTab';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard, CatalogItem, Repair, Radio, ThemeSettings } from './types';
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
  ],
  radios: []
};

export default function App() {
  // Session user storage checking
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

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

  // Appearance & Theme settings
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('custom-theme-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return {
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
  });

  // Dynamically compile and override css properties to reflect visual configurations
  useEffect(() => {
    let styleTag = document.getElementById('custom-dynamic-theme-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-dynamic-theme-styles';
      document.head.appendChild(styleTag);
    }

    const { fontFamily, accentColor, containerBackground, cardGlow, appBorderRadius, workspaceGlowStyle } = currentTheme;

    let fontName = 'Vazirmatn';
    if (fontFamily === 'Inter') fontName = 'Inter, sans-serif';
    if (fontFamily === 'Estedad') fontName = 'Estedad, sans-serif';
    if (fontFamily === 'JetBrains Mono') fontName = 'JetBrains Mono, monospace';
    if (fontFamily === 'Tahoma') fontName = 'Tahoma, Arial, sans-serif';

    let radiusPx = '12px';
    if (appBorderRadius === 'rounded-none') radiusPx = '0px';
    if (appBorderRadius === 'rounded-md') radiusPx = '4px';
    if (appBorderRadius === 'rounded-lg') radiusPx = '8px';
    if (appBorderRadius === 'rounded-xl') radiusPx = '12px';
    if (appBorderRadius === 'rounded-2xl') radiusPx = '16px';
    if (appBorderRadius === 'rounded-3xl') radiusPx = '24px';

    const rootBg = darkMode ? (containerBackground || '#0b0f19') : '#f1f5f9';
    const cardBg = darkMode ? 'rgba(15, 23, 42, 0.75)' : '#ffffff';
    const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)';
    const textColor = darkMode ? '#cbd5e1' : '#334155';
    const headingColor = darkMode ? '#f8fafc' : '#0f172a';
    const muteColor = darkMode ? '#94a3b8' : '#64748b';
    const inputBg = darkMode ? 'rgba(3, 7, 18, 0.65)' : '#ffffff';
    const inputBorder = darkMode ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1';

    let cardShadow = 'none';
    if (cardGlow) {
      cardShadow = darkMode 
        ? `0 4px 22px -5px ${accentColor}4d, 0 8px 32px rgba(0, 0, 0, 0.35)` 
        : `0 4px 18px -4px rgba(0, 0, 0, 0.05), 0 10px 30px -10px ${accentColor}10`;
    } else {
      cardShadow = darkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
        : '0 4px 12px rgba(0, 0, 0, 0.02)';
    }

    styleTag.innerHTML = `
      :root, body, #root, #app-root-container {
        font-family: ${fontName} !important;
        background-color: ${rootBg} !important;
        color: ${textColor} !important;
        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease;
      }
      
      /* Accent colors override */
      .text-blue-600, .text-blue-500, .text-blue-400, .text-blue-650, .text-indigo-655 {
        color: ${accentColor} !important;
      }
      .bg-blue-600, .bg-blue-500, .bg-blue-700, .bg-blue-800, .bg-blue-650 {
        background-color: ${accentColor} !important;
        color: ${darkMode ? '#000000' : '#ffffff'} !important;
      }
      .border-blue-600, .border-blue-500 {
        border-color: ${accentColor} !important;
      }
      
      /* Active tab colors for indigo and emerald subthemes */
      .bg-emerald-600 {
        background-color: ${accentColor === '#3b82f6' ? '#10b981' : accentColor} !important;
        color: ${darkMode ? '#000000' : '#ffffff'} !important;
      }
      .bg-indigo-600 {
        background-color: ${accentColor === '#3b82f6' ? '#6366f1' : accentColor} !important;
        color: ${darkMode ? '#000000' : '#ffffff'} !important;
      }
      
      /* Primary and button hover overlays */
      .hover\\:bg-blue-700:hover, .hover\\:bg-blue-600:hover, .hover\\:bg-blue-800:hover {
        background-color: ${accentColor}dd !important;
        filter: brightness(1.08);
      }
      
      /* Styled dynamic workspace wrapper */
      #application-workspace-wrapper {
        background-color: ${rootBg} !important;
        background-image: ${workspaceGlowStyle === 'aurora' 
          ? (darkMode 
              ? `radial-gradient(circle at 12% 18%, ${accentColor}1c 0%, transparent 45%), radial-gradient(circle at 88% 82%, ${accentColor}24 0%, transparent 48%)` 
              : `radial-gradient(circle at 12% 18%, ${accentColor}0a 0%, transparent 60%), radial-gradient(circle at 88% 82%, ${accentColor}0c 0%, transparent 60%)`)
          : workspaceGlowStyle === 'intense'
          ? (darkMode 
              ? `radial-gradient(circle at 50% -25%, ${accentColor}3c 0%, transparent 65%)` 
              : `radial-gradient(circle at 50% -25%, ${accentColor}12 0%, transparent 65%)`)
          : workspaceGlowStyle === 'soft'
          ? (darkMode 
              ? `radial-gradient(circle at 50% 50%, ${accentColor}0e 0%, transparent 80%)` 
              : `radial-gradient(circle at 50% 50%, ${accentColor}04 0%, transparent 80%)`)
          : 'none'} !important;
        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Dynamically adjusted border radius for standard tiles & blocks */
      .rounded-xl, .rounded-lg, .rounded-2xl, .rounded-3xl {
        border-radius: ${radiusPx} !important;
      }
      
      .bg-white, .dark\\:bg-slate-950, .bg-slate-950, .bg-slate-900\\/50, .bg-slate-900\\/60, .bg-slate-900\\/80, .bg-slate-950\\/80, .bg-slate-900, .bg-slate-950, .bg-slate-900\\/40 {
        background-color: ${cardBg} !important;
        border-color: ${cardBorder} !important;
        box-shadow: ${cardShadow} !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      /* Consistent input backgrounds inside responsive mode */
      .bg-slate-50, .bg-slate-100\\/60, .bg-slate-100, .dark\\:bg-slate-900, .bg-slate-900 {
        background-color: ${darkMode ? 'rgba(3, 7, 18, 0.45)' : '#f8fafc'} !important;
        color: ${headingColor} !important;
        border-color: ${cardBorder} !important;
      }
      
      .shadow-sm, .shadow-md, .shadow-lg, .shadow-2xl, .shadow {
        box-shadow: ${cardShadow} !important;
      }

      /* System Scrollbar polish once and for all */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: ${darkMode ? '#090d16' : '#f1f5f9'};
      }
      ::-webkit-scrollbar-thumb {
        background: ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${accentColor}a0;
      }

      /* Standard typography overrides for pristine readability */
      h1, h2, h3, h4, h5, h6, strong {
        color: ${headingColor} !important;
      }
      
      p, label, span, .text-slate-505, .text-slate-500, .text-slate-400, .text-slate-300, .text-slate-650 {
        color: ${textColor}e0;
      }

      /* Style all form components consistently */
      input[type="text"], input[type="password"], select, textarea {
        background-color: ${inputBg} !important;
        border-color: ${inputBorder} !important;
        color: ${headingColor} !important;
        font-family: inherit;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      input[type="text"]:focus, select:focus, textarea:focus {
        border-color: ${accentColor} !important;
        box-shadow: 0 0 0 3px ${accentColor}2c !important;
        outline: none !important;
      }

      th {
        background-color: ${darkMode ? 'rgba(15, 23, 42, 0.9)' : '#f8fafc'} !important;
        color: ${headingColor} !important;
      }

      td {
        border-color: ${cardBorder} !important;
        color: ${textColor} !important;
      }

      tr:hover td {
        background-color: ${darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} !important;
      }

      /* Estedad font support custom family class */
      .family-estedad {
        font-family: "Estedad", "Vazirmatn", sans-serif !important;
      }

      /* Specific focused element styling rule */
      div#root:nth-of-type(1) > div#application-workspace-wrapper:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) {
        background-color: #0f172a !important;
      }

      /* Second focused element styling rule */
      div#root:nth-of-type(1) > div#application-workspace-wrapper:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) {
        background-color: #0f172a !important;
      }
    `;

    // Fetch Persian Estedad webfont dynamically if chosen
    if (fontFamily === 'Estedad') {
      let fontLink = document.getElementById('font-estedad-link');
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = 'font-estedad-link';
        fontLink.setAttribute('rel', 'stylesheet');
        fontLink.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Estedad:wght@300;400;700;900&display=swap');
        document.head.appendChild(fontLink);
      }
    }
  }, [currentTheme, darkMode]);

  // Database States
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [mice, setMice] = useState<Mouse[]>([]);
  const [keyboards, setKeyboards] = useState<Keyboard[]>([]);
  const [radios, setRadios] = useState<Radio[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<CatalogItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'catalog' | null>(null);

  // Transfer prefill
  const [prefilledEquipCode, setPrefilledEquipCode] = useState('');
  const [prefilledPersCode, setPrefilledPersCode] = useState('');

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrType, setQrType] = useState<'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio'>('case');
  const [qrData, setQrData] = useState<any>(null);
  const [onlineUsersData, setOnlineUsersData] = useState<{ count: number; users: { username: string; name: string }[] }>({ count: 1, users: [] });

  useEffect(() => {
    if (!currentUser || isOfflineMode) return;

    const pingServer = async () => {
      try {
        await fetch('/api/active-ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser.username, name: currentUser.name })
        });
        
        const res = await fetch('/api/online-users');
        if (res.ok) {
          const data = await res.json();
          setOnlineUsersData(data);
        }
      } catch (e) {
        console.warn('Live session check issue:', e);
      }
    };

    pingServer();
    const interval = setInterval(pingServer, 15000);

    return () => clearInterval(interval);
  }, [currentUser, isOfflineMode]);

  const handleShowQR = (code: string, type: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio', data: any) => {
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
      setRadios(data.radios || []);
      setPartsCatalog(data.partsCatalog || []);
      setAssignments(data.assignments || []);
      setRepairs(data.repairs || []);

      // Fetch custom corporate layout theme
      try {
        const themeRes = await fetch('/api/theme');
        if (themeRes.ok) {
          const themeJson = await themeRes.json();
          if (themeJson && themeJson.theme) {
            setCurrentTheme(themeJson.theme);
            localStorage.setItem('custom-theme-config', JSON.stringify(themeJson.theme));
          }
        }
      } catch (themeErr) {
        console.warn("Could not retrieve custom theme from server, staying with previous layout config.", themeErr);
      }

      // Cache locally
      localStorage.setItem('azarestan_ict_db', JSON.stringify({
        personnel: data.personnel || [],
        cases: data.cases || [],
        monitors: data.monitors || [],
        printers: data.printers || [],
        mice: data.mice || [],
        keyboards: data.keyboards || [],
        radios: data.radios || [],
        partsCatalog: data.partsCatalog || [],
        assignments: data.assignments || [],
        repairs: data.repairs || []
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
      setRadios(localDb.radios || []);
      setPartsCatalog(localDb.partsCatalog || []);
      setAssignments(localDb.assignments || []);
      setRepairs(localDb.repairs || []);
      
      setIsOfflineMode(true);
      setError(null); // Bypass red screen of death completely
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Save Bulk Items
  const handleSaveBulkItems = async (items: any[]) => {
    if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
      alert("دسترسی غیرمجاز! شما صلاحیت افزودن یا ویرایش تجهیزات را ندارید.");
      return { success: false, savedCount: 0, skipped: [] };
    }

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/save-bulk', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-operator-username': currentUser?.username || 'system',
            'x-operator-name': encodeURIComponent(currentUser?.name || '')
          },
          body: JSON.stringify({ items })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await loadDatabase();
          return { success: true, savedCount: data.savedCount, skipped: data.skippedCodes || [] };
        } else {
          alert(data.error || "خطا در ثبت گروهی اطلاعات بر روی سرور.");
          return { success: false, savedCount: 0, skipped: [] };
        }
      } catch (err) {
        console.warn('API save-bulk failed. Switching to Local fallback.', err);
      }
    }

    // Local / Offline mutate simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    let savedCount = 0;
    const skipped: string[] = [];

    const keyMap: Record<string, string> = {
      case: 'cases',
      monitor: 'monitors',
      printer: 'printers',
      mouse: 'mice',
      keyboard: 'keyboards',
      radio: 'radios'
    };

    items.forEach((rawItem: any) => {
      const type = rawItem.type;
      const dbKey = keyMap[type];
      if (!dbKey) return;

      db[dbKey] = db[dbKey] || [];
      const trimmedCode = String(rawItem.code).trim().toUpperCase();
      if (!trimmedCode) return;

      const exists = db[dbKey].some((x: any) => String(x.code).toUpperCase() === trimmedCode);
      if (exists) {
        skipped.push(trimmedCode);
        return;
      }

      let itemObj: any = {
        code: trimmedCode,
        assignedTo: null,
        status: rawItem.status || "working",
        description: rawItem.description?.trim() || "ایمپورت گروهی به انبار"
      };

      if (type === 'case') {
        itemObj = {
          ...itemObj,
          motherboard: rawItem.motherboard || "Gigabyte",
          cpu: rawItem.cpu || "Intel Core i5",
          vga: rawItem.vga || "Onboard",
          hdd1: rawItem.hdd1 || "256GB SSD",
          hdd2: rawItem.hdd2 || "1TB HDD",
          ramType: rawItem.ramType || "DDR4",
          ramQty: rawItem.ramQty || "8GB",
          power: rawItem.power || "Green 400W"
        };
      } else if (type === 'radio') {
        itemObj = {
          ...itemObj,
          model: rawItem.model || "Motorola GP338",
          frequencyRange: rawItem.frequencyRange || "UHF",
          ipRating: rawItem.ipRating || "IP54"
        };
      } else {
        itemObj = {
          ...itemObj,
          model: rawItem.model || "سایر"
        };
      }

      db[dbKey].push(itemObj);
      savedCount++;
    });

    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setCases(db.cases || []);
    setMonitors(db.monitors || []);
    setPrinters(db.printers || []);
    setMice(db.mice || []);
    setKeyboards(db.keyboards || []);
    setRadios(db.radios || []);

    return { success: true, savedCount, skipped };
  };

  // Save/Edit entity
  const handleSaveItem = async (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'catalog', data: any) => {
    // Permission validation checks
    if (type === 'personnel') {
      if (!currentUser?.canEditPersonnel && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت افزودن یا ویرایش پرونده پرسنلی را ندارید.");
        return false;
      }
    } else if (type === 'catalog') {
      if (currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! ویرایش لیست قطعات مرجع کارگاه منحصراً در اختیار ادمین اصلی است.");
        return false;
      }
    } else {
      // Equipment types: case, monitor, printer, mouse, keyboard
      if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت افزودن یا ویرایش تجهیزات را ندارید.");
        return false;
      }
    }

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-operator-username': currentUser?.username || 'system',
            'x-operator-name': encodeURIComponent(currentUser?.name || '')
          },
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

      // Handle local termination cascade
      if (data.status === 'terminated') {
        const today = getPersianDateString();
        const trimmedCode = data.code.trim();
        const returnedHardware: { code: string; type: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" }[] = [];

        // Cases
        db.cases = (db.cases || []).map((c: any) => {
          if (c.assignedTo === trimmedCode) {
            returnedHardware.push({ code: c.code, type: 'case' });
            return { ...c, assignedTo: null };
          }
          return c;
        });

        // Monitors
        db.monitors = (db.monitors || []).map((m: any) => {
          if (m.assignedTo === trimmedCode) {
            returnedHardware.push({ code: m.code, type: 'monitor' });
            return { ...m, assignedTo: null };
          }
          return m;
        });

        // Printers
        db.printers = (db.printers || []).map((p: any) => {
          if (p.assignedTo === trimmedCode) {
            returnedHardware.push({ code: p.code, type: 'printer' });
            return { ...p, assignedTo: null };
          }
          return p;
        });

        // Mice
        db.mice = (db.mice || []).map((m: any) => {
          if (m.assignedTo === trimmedCode) {
            returnedHardware.push({ code: m.code, type: 'mouse' });
            return { ...m, assignedTo: null };
          }
          return m;
        });

        // Keyboards
        db.keyboards = (db.keyboards || []).map((k: any) => {
          if (k.assignedTo === trimmedCode) {
            returnedHardware.push({ code: k.code, type: 'keyboard' });
            return { ...k, assignedTo: null };
          }
          return k;
        });

        // Radios
        db.radios = (db.radios || []).map((r: any) => {
          if (r.assignedTo === trimmedCode) {
            returnedHardware.push({ code: r.code, type: 'radio' });
            return { ...r, assignedTo: null };
          }
          return r;
        });

        if (returnedHardware.length > 0) {
          db.assignments = db.assignments || [];
          returnedHardware.forEach((itemToReturn) => {
            // Close active assignment
            db.assignments = db.assignments.map((ass: any) => {
              if (
                ass.equipmentCode === itemToReturn.code &&
                ass.equipmentType === itemToReturn.type &&
                (ass.endDate === null || ass.endDate === '')
              ) {
                return { ...ass, endDate: today };
              }
              return ass;
            });

            // Log warehouse return
            db.assignments.push({
              id: `ass_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              equipmentCode: itemToReturn.code,
              equipmentType: itemToReturn.type,
              personnelCode: null,
              personnelName: `عودت به انبار/تحویل به کارگاه (به علت خاتمه همکاری ${data.name})`,
              startDate: today,
              endDate: today,
            });
          });
        }
      }
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
    else if (type === 'radio') {
      let list = db.radios || [];
      if (!data.code) {
        alert("کد بی‌سیم الزامی است.");
        return false;
      }
      const index = list.findIndex((r: any) => r.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((r: any) => r.code === data.code)) {
          alert("کد بی‌سیم تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.radios = list;
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
  const handleDeleteItem = async (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'catalog', id: string) => {
    // Permission validation checks for deletion
    if (type === 'personnel') {
      if (!currentUser?.canEditPersonnel && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت حذف پرونده پرسنلی را ندارید.");
        return;
      }
    } else if (type === 'catalog') {
      if (currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! حذف از لیست قطعات مرجع کارگاه منحصراً در اختیار ادمین اصلی است.");
        return;
      }
    } else {
      // Equipment types: case, monitor, printer, mouse, keyboard
      if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت حذف تجهیزات را ندارید.");
        return;
      }
    }

    const confirmationMsg = type === 'personnel' 
      ? 'آیا از حذف این پرسنل اطمینان دارید؟ تمامی تجهیزات تحت تصرف وی آزاد شده و به انبار پروژه بازگردانده می‌شوند.'
      : 'آیا از حذف این سخت‌افزار از سامانه اطمینان کامل دارید؟';

    if (!window.confirm(confirmationMsg)) return;

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/delete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-operator-username': currentUser?.username || 'system',
            'x-operator-name': encodeURIComponent(currentUser?.name || '')
          },
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
          (db.radios || []).forEach((r: any) => { if (r.assignedTo === codeToClear) r.assignedTo = null; });

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
        'radio': 'radios',
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
  const handleTransferItem = async (equipmentCode: string, targetPersonnelCode: string | null, documentNumber?: string, dateStr?: string) => {
    const today = dateStr || getPersianDateString();

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/transfer', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-operator-username': currentUser?.username || 'system',
            'x-operator-name': encodeURIComponent(currentUser?.name || '')
          },
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

    // Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | null = null;
    let equipItem: any = null;

    const listKeys = ['cases', 'monitors', 'printers', 'mice', 'keyboards', 'radios'] as const;
    const typesMap = { cases: 'case', monitors: 'monitor', printers: 'printer', mice: 'mouse', keyboards: 'keyboard', radios: 'radio' } as const;

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
          ass.endDate = today;
        }
      });
    }

    const docSuffix = documentNumber ? ` (سند جابجایی ${documentNumber})` : '';

    if (targetCode !== null) {
      assignments.push({
        id: `ass_${Date.now()}`,
        equipmentCode,
        equipmentType: equipType,
        personnelCode: targetCode,
        personnelName: targetName + docSuffix,
        startDate: today,
        endDate: null
      });
    } else {
      assignments.push({
        id: `ass_${Date.now()}`,
        equipmentCode,
        equipmentType: equipType,
        personnelCode: null,
        personnelName: "عودت به انبار/تحویل به کارگاه" + docSuffix,
        startDate: today,
        endDate: today
      });
    }

    db.assignments = assignments;
    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setIsOfflineMode(true);
    await loadDatabase();
  };

  // Location Transfer Handler
  const handleLocationTransfer = async (equipmentCode: string, targetLocation: string, documentNumber?: string, dateStr?: string) => {
    const today = dateStr || getPersianDateString();

    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    // Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | null = null;
    let equipItem: any = null;

    const listKeys = ['cases', 'monitors', 'printers', 'mice', 'keyboards', 'radios'] as const;
    const typesMap = { cases: 'case', monitors: 'monitor', printers: 'printer', mice: 'mouse', keyboards: 'keyboard', radios: 'radio' } as const;

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

    const oldLocation = equipItem.location || (equipItem.assignedTo ? (db.personnel || []).find((p: any) => p.code === equipItem.assignedTo)?.location : "انبار کارگاه") || "انبار کارگاه";

    // Set new geographical location
    equipItem.location = targetLocation;

    // Log the physical movement in history
    const assignments = db.assignments || [];
    assignments.push({
      id: `ass_${Date.now()}`,
      equipmentCode,
      equipmentType: equipType,
      personnelCode: 'LOC_CHG',
      personnelName: `موقعیت فیزیکی جدید ${documentNumber ? `(سند ${documentNumber})` : ''}: "${targetLocation}" (قبلاً "${oldLocation}")`,
      startDate: today,
      endDate: today
    });

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

  const handleEditTrigger = (item: any, type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'catalog') => {
    setEditItem(item);
    setEditType(type);
  };

  // Filter list based on global search inputs with multi-keyword support
  const getFilteredPersonnel = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return personnel;
    const keywords = q.split(/\s+/).filter(Boolean);
    return personnel.filter(p => 
      keywords.every(kw =>
        p.name.toLowerCase().includes(kw) || 
        p.code.toLowerCase().includes(kw) || 
        p.title.toLowerCase().includes(kw) || 
        p.department.toLowerCase().includes(kw)
      )
    );
  };

  const getFilteredCases = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cases;
    const keywords = q.split(/\s+/).filter(Boolean);
    return cases.filter(c => 
      keywords.every(kw =>
        c.code.toLowerCase().includes(kw) || 
        c.cpu.toLowerCase().includes(kw) || 
        c.motherboard.toLowerCase().includes(kw) ||
        (c.power && c.power.toLowerCase().includes(kw)) ||
        (c.assignedTo && c.assignedTo.toLowerCase().includes(kw))
      )
    );
  };

  const getFilteredMonitors = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return monitors;
    const keywords = q.split(/\s+/).filter(Boolean);
    return monitors.filter(m => 
      keywords.every(kw =>
        m.code.toLowerCase().includes(kw) || 
        m.model.toLowerCase().includes(kw) || 
        (m.assignedTo && m.assignedTo.toLowerCase().includes(kw))
      )
    );
  };

  const getFilteredPrinters = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return printers;
    const keywords = q.split(/\s+/).filter(Boolean);
    return printers.filter(pr => 
      keywords.every(kw =>
        pr.code.toLowerCase().includes(kw) || 
        pr.model.toLowerCase().includes(kw) || 
        (pr.assignedTo && pr.assignedTo.toLowerCase().includes(kw))
      )
    );
  };

  const getFilteredMice = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return mice;
    const keywords = q.split(/\s+/).filter(Boolean);
    return mice.filter(m => 
      keywords.every(kw =>
        m.code.toLowerCase().includes(kw) || 
        m.model.toLowerCase().includes(kw) || 
        (m.assignedTo && m.assignedTo.toLowerCase().includes(kw))
      )
    );
  };

  const getFilteredKeyboards = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return keyboards;
    const keywords = q.split(/\s+/).filter(Boolean);
    return keyboards.filter(k => 
      keywords.every(kw =>
        k.code.toLowerCase().includes(kw) || 
        k.model.toLowerCase().includes(kw) || 
        (k.assignedTo && k.assignedTo.toLowerCase().includes(kw))
      )
    );
  };

  const getFilteredRadios = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return radios;
    const keywords = q.split(/\s+/).filter(Boolean);
    return radios.filter(r => 
      keywords.every(kw =>
        r.code.toLowerCase().includes(kw) || 
        r.model.toLowerCase().includes(kw) || 
        (r.assignedTo && r.assignedTo.toLowerCase().includes(kw))
      )
    );
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => { setCurrentUser(u); }} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('user-session-changed'));
    setActiveTab('personnel-tab');
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 font-sans max-w-[1600px] w-full mx-auto print:p-0 print:max-w-none" id="application-workspace-wrapper" dir="rtl">
      
      {/* 1. System Header component */}
      <Header isDark={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} customTitle={currentTheme.welcomeTitle} />

      {/* Welcome & logout bar */}
      <div className="no-print mt-4 mb-2 flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">🗣️</span>
            <span>
              کاربر جاری سیستم: <strong className="text-indigo-655 dark:text-indigo-400 font-bold">{currentUser.name}</strong> 
              <span className="text-slate-500 dark:text-slate-400 font-medium mr-2">({currentUser.role === 'admin' ? 'مدير ارشد سیستم (ادمین)' : currentUser.role === 'editor_equipment' ? 'اپراتور سخت‌افزار' : 'ناظر سیستم'})</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200/50">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
            <span className="font-bold">تعداد کاربران آنلاین: {onlineUsersData.count} نفر</span>
            {currentUser.role === 'admin' && onlineUsersData.users.length > 0 && (
              <span className="border-r border-emerald-300 dark:border-emerald-800/80 pr-2 mr-2 text-[10px] font-medium">
                اسامی: {onlineUsersData.users.map(u => u.name).join('، ')}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 hover:text-red-750 text-[11px] font-black px-3 py-1 rounded-lg border border-red-200/50 cursor-pointer transition flex items-center gap-1"
          style={{ color: '#dc2626' }}
        >
          🚪 خروج امن از سیستم
        </button>
      </div>

      {/* 2. Global search bar (hides in print mode) */}
      <div className="no-print bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-center gap-2 mb-3 text-right">
        <div className="flex-1 w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔎 جستجوی هوشمند در لیست پرسنل، شماره اموال، مدل سخت‌افزار و..."
            className="w-full text-right py-1 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none placeholder-slate-400 dark:text-slate-100"
          />
        </div>
        
        {/* Active searches stats indicators */}
        <div className="text-[10px] sm:text-[11px] text-slate-505 dark:text-slate-400 flex gap-1.5 flex-wrap justify-center font-extrabold">
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">👥 پرسنل: {personnel.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">🖥️ کیس: {cases.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">📺 مانیتور: {monitors.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">🖨️ چاپگر: {printers.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">🖱️ ماوس: {mice.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">⌨️ کیبورد: {keyboards.length}</span>
          <span className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">📻 بی‌سیم: {radios.length}</span>
        </div>
      </div>

      {/* 3. Navigation tabs bar (hides in print) */}
      <div 
        className={`no-print border rounded-xl p-2.5 mb-3.5 shadow-xs text-right transition-all duration-250 ${
          darkMode 
            ? 'border-slate-800 text-slate-100' 
            : 'border-slate-300/60 text-slate-800'
        }`}
        style={{ 
          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
          boxShadow: currentTheme.cardGlow && darkMode ? `0 4px 20px -5px ${currentTheme.accentColor}33` : 'none'
        }}
      >
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pb-1.5 mb-2 border-b gap-1.5 ${
          darkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎛️</span>
            <div>
              <h4 className="text-xs md:text-xs font-black">میز کار و منوی ناوبری کارگاه بوشهر</h4>
            </div>
          </div>
          {/* Active selection badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black border transition-colors ${
            darkMode 
              ? 'bg-blue-950/70 text-blue-300 border-blue-900/40' 
              : 'bg-blue-50 text-blue-700 border-blue-200/70'
          }`}>
            <span className={darkMode ? 'text-slate-400 font-bold' : 'text-slate-500 font-bold'}>بخش فعال:</span>
            <span>
              {
                [
                  { id: 'personnel-tab', label: '👥 لیست پرسنل' },
                  { id: 'cases-tab', label: '🖥️ کیس‌های کارگاه' },
                  { id: 'monitors-tab', label: '📺 مانیتورها' },
                  { id: 'printers-tab', label: '🖨️ پرینترها' },
                  { id: 'mice-tab', label: '🖱️ ماوس‌ها' },
                  { id: 'keyboards-tab', label: '⌨️ کیبوردها' },
                  { id: 'radios-tab', label: '📻 بی‌سیم‌ها دستی' },
                  { id: 'catalog-tab', label: '🛠️ قطعات مرجع' },
                  { id: 'transfer-tab', label: '🔄 جابجایی هوشمند' },
                  { id: 'history-tab', label: '📜 تاریخچه لجستیک' },
                  { id: 'reports-tab', label: '📋 گزارش و شناسنامه' },
                  { id: 'repairs-tab', label: '🛠️ تعمیرات و اسقاط' },
                  { id: 'bulk-qr-tab', label: '🖨️ چاپ گروهی بارکد' },
                  { id: 'systems-tree-tab', label: '🌳 نمودار درختی سیستم‌ها' },
                  { id: 'users-tab', label: '🛡️ مدیریت کاربران' },
                  { id: 'logs-tab', label: '🪵 لاگ امنیتی سیستم' },
                  { id: 'appearance-tab', label: '🎨 تنظیمات زیبایی تم' },
                  { id: 'backup-tab', label: '⚙️ پشتیبان‌گیری و سورس' },
                  { id: 'add-new-tab', label: '➕ ثبت و ایمپورت جدید' }
                ].find(t => t.id === activeTab)?.label || '—'
              }
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          {/* Column 1: Assets & Equipment */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <span className="text-xs">📦</span>
              <span>دفتر پرسنل و فهرست سخت‌افزارها</span>
            </div>
            <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
            }`}>
              {[
                { id: 'personnel-tab', label: 'لیست پرسنل', icon: '👥' },
                { id: 'cases-tab', label: 'کیس‌های کارگاه', icon: '🖥️' },
                { id: 'monitors-tab', label: 'مانیتورها', icon: '📺' },
                { id: 'printers-tab', label: 'پرینترها', icon: '🖨️' },
                { id: 'mice-tab', label: 'ماوس‌ها', icon: '🖱️' },
                { id: 'keyboards-tab', label: 'کیبوردها', icon: '⌨️' },
                { id: 'radios-tab', label: 'بی‌سیم‌های دستی', icon: '📻' },
                { id: 'catalog-tab', label: 'قطعات مرجع', icon: '🛠️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`w-full py-2 px-1 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 border text-center ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black' 
                      : darkMode 
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/85 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  <span className="text-[10px] shrink-0">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Operations & Actions */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <span className="text-xs">🔄</span>
              <span>لجستیک، عملیات تحویل و اسناد</span>
            </div>
            <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
            }`}>
              {[
                { id: 'transfer-tab', label: 'جابجایی هوشمند', icon: '🔄', show: currentUser?.canEditEquipment || currentUser?.role === 'admin' },
                { id: 'history-tab', label: 'تاریخچه لجستیک', icon: '📜', show: true },
                { id: 'reports-tab', label: 'گزارش و شناسنامه', icon: '📋', show: currentUser?.canExport || currentUser?.role === 'admin' },
                { id: 'repairs-tab', label: 'تعمیرات و اسقاط', icon: '🛠️', show: true },
                { id: 'bulk-qr-tab', label: 'چاپ گروهی بارکد', icon: '🖨️', show: currentUser?.canExport || currentUser?.role === 'admin' },
                { id: 'systems-tree-tab', label: 'نمودار درختی', icon: '🌳', show: true }
              ].filter(t => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`w-full py-2 px-1 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 border text-center ${
                    activeTab === tab.id 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-black' 
                      : darkMode 
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/85 hover:text-emerald-600 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-[10px] shrink-0">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Secure Management & Backup */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              <span className="text-xs">🛡️</span>
              <span>امنیت، سیستم و ثبت پنل</span>
            </div>
            <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
            }`}>
              {[
                { id: 'users-tab', label: 'مدیریت کاربران', icon: '🛡️', show: currentUser?.role === 'admin' },
                { id: 'logs-tab', label: 'لاگ امنیتی سیستم', icon: '🪵', show: currentUser?.role === 'admin' },
                { id: 'appearance-tab', label: 'تنظیمات زیبایی تم', icon: '🎨', show: currentUser?.role === 'admin' },
                { id: 'backup-tab', label: 'پشتیبان‌گیری و سورس', icon: '⚙️', show: currentUser?.canBackup || currentUser?.role === 'admin' },
                { id: 'add-new-tab', label: 'ثبت جدید (تکی/گروهی)', icon: '➕', show: currentUser?.canEditPersonnel || currentUser?.canEditEquipment || currentUser?.role === 'admin', highlight: true }
              ].filter(t => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`w-full py-2 px-1 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 border text-center ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black' 
                      : tab.highlight
                        ? darkMode
                          ? 'bg-indigo-950/50 border-indigo-900/40 text-indigo-300 hover:bg-slate-800 font-black'
                          : 'bg-indigo-50 border-indigo-200/80 text-indigo-700 hover:bg-indigo-100/60 font-black'
                        : darkMode 
                          ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/85 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-[10px] shrink-0">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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

          {activeTab === 'radios-tab' && (
            <RadiosSubTab 
              radios={getFilteredRadios()} 
              personnel={personnel}
              onEdit={(r) => handleEditTrigger(r, 'radio')}
              onDelete={(code) => handleDeleteItem('radio', code)}
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
              radios={radios}
              personnel={personnel}
              onTransfer={handleTransferItem}
              onLocationTransfer={handleLocationTransfer}
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

          {activeTab === 'repairs-tab' && (
            <RepairsTab 
              repairs={repairs}
              onRefresh={loadDatabase}
              currentUser={currentUser}
              cases={cases}
              monitors={monitors}
              printers={printers}
              keyboards={keyboards}
              mice={mice}
              radios={radios}
              personnel={personnel}
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

          {activeTab === 'users-tab' && (
            <UsersTab currentUser={currentUser} />
          )}

          {activeTab === 'logs-tab' && (
            <LogsTab currentUser={currentUser} />
          )}

          {activeTab === 'appearance-tab' && (
            <AppearanceTab 
              currentUser={currentUser} 
              currentTheme={currentTheme} 
              onThemeUpdated={(updatedTheme) => setCurrentTheme(updatedTheme)} 
            />
          )}

          {activeTab === 'bulk-qr-tab' && (
            <BulkQRTab 
              cases={cases}
              monitors={monitors}
              printers={printers}
              mice={mice}
              keyboards={keyboards}
              radios={radios}
              personnel={personnel}
            />
          )}

          {activeTab === 'add-new-tab' && (
            <AddNewTab onSave={handleSaveItem} onSaveBulk={handleSaveBulkItems} />
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
      <footer className="no-print mt-6 bg-slate-900 border border-slate-800 text-slate-400 py-2.5 px-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] font-medium">
        <div>سامانه شناسنامه هوشمند ICT کارگاه بوشهر - شرکت عمران آذرستان</div>
        <div className="flex flex-wrap items-center gap-3">
          <span>توسعه‌دهنده: <span className="font-bold text-slate-300">مهدی اسماعیلی</span></span>
          <span className="text-slate-700">|</span>
          <span>نسخه: <span className="font-mono font-bold text-blue-400">v1.2.5</span></span>
          <span className="text-slate-700">|</span>
          <span className="font-mono text-[10px] text-slate-500">پورت آفلاین محلی (LocalStorage JSON)</span>
        </div>
        <div className="text-[10px] text-slate-500">
          حقوق محفوظ است © ۱۴۰۵
        </div>
      </footer>

    </div>
  );
}
