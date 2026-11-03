import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PersonnelTab from './components/PersonnelTab';
import { CasesSubTab, MonitorsSubTab, PrintersSubTab, MiceSubTab, KeyboardsSubTab, RadiosSubTab, CctvsSubTab } from './components/EquipmentTabs';
import PartsCatalogTab from './components/PartsCatalogTab';
import TransferTab from './components/TransferTab';
import HistoryTab from './components/HistoryTab';
import ReportingTab from './components/ReportingTab';
import BackupTab from './components/BackupTab';
import AddNewTab from './components/AddNewTab';
import SystemsTreeTab from './components/SystemsTreeTab';
import EditModal from './components/EditModal';
import QRCodeModal from './components/QRCodeModal';
import DefineHardwareTab from './components/DefineHardwareTab';
import CustomEquipmentSubTab from './components/CustomEquipmentSubTab';
import LoginScreen from './components/LoginScreen';
import UsersTab from './components/UsersTab';
import BulkQRTab from './components/BulkQRTab';
import LogsTab from './components/LogsTab';
import RepairsTab from './components/RepairsTab';
import { BulkEditTab } from './components/BulkEditTab';
import AppearanceTab from './components/AppearanceTab';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard, CatalogItem, Repair, Radio, ThemeSettings, Cctv } from './types';
import { getPersianDateString } from './utils/date';
import { createEquipmentCategories, SharedEquipmentCategories } from './utils/categories';

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
  repairs?: Repair[];
  customCategories?: any[];
  customEquipment?: any[];
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
  radios: [],
  cctvs: []
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
  const [col1Expanded, setCol1Expanded] = useState(false);
  const [col2Expanded, setCol2Expanded] = useState(true);
  const [col3Expanded, setCol3Expanded] = useState(false);
  const [col4Expanded, setCol4Expanded] = useState(false);

  // Cached DB for instant 0ms initial render (Stale-While-Revalidate pattern)
  const initialCachedDb = (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('azarestan_ict_db') : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [loading, setLoading] = useState(!initialCachedDb);
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
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
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
      navbarOpacity: '90',
      textColor: '#cbd5e1',
      headingColor: '#f8fafc',
      cardBackground: 'rgba(15, 23, 42, 0.75)',
      buttonBackground: '#3b82f6',
      buttonTextColor: '#ffffff',
      baseFontSize: 'base',
      lightTextColor: '#334155',
      lightHeadingColor: '#0f172a',
      lightCardBackground: '#ffffff',
      lightButtonBackground: '#3b82f6',
      lightButtonTextColor: '#ffffff',
      lightContainerBackground: '#f1f5f9'
    };
  });

  // Synchronize localStorage with currentTheme instantly whenever it changes
  useEffect(() => {
    localStorage.setItem('custom-theme-config', JSON.stringify(currentTheme));
  }, [currentTheme]);

  // Dynamically compile and override css properties to reflect visual configurations
  useEffect(() => {
    let styleTag = document.getElementById('custom-dynamic-theme-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-dynamic-theme-styles';
      document.head.appendChild(styleTag);
    }

    const { 
      fontFamily, 
      accentColor, 
      containerBackground, 
      cardGlow, 
      appBorderRadius, 
      workspaceGlowStyle,
      textColor,
      headingColor,
      cardBackground,
      buttonBackground,
      buttonTextColor,
      baseFontSize,
      lightTextColor,
      lightHeadingColor,
      lightCardBackground,
      lightButtonBackground,
      lightButtonTextColor,
      lightContainerBackground
    } = currentTheme;

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

    const rootBg = darkMode 
      ? (containerBackground || '#0b0f19') 
      : (lightContainerBackground || '#f1f5f9');
    
    // Core color defaults with option overrides
    const actualTextColor = darkMode 
      ? (textColor || '#cbd5e1') 
      : (lightTextColor || '#334155');
      
    const actualHeadingColor = darkMode 
      ? (headingColor || '#f8fafc') 
      : (lightHeadingColor || '#0f172a');
      
    const actualCardBg = darkMode 
      ? (cardBackground || 'rgba(15, 23, 42, 0.75)') 
      : (lightCardBackground || '#ffffff');
      
    const actualButtonBg = darkMode 
      ? (buttonBackground || accentColor) 
      : (lightButtonBackground || accentColor);
      
    const actualButtonTextColor = darkMode 
      ? (buttonTextColor || '#ffffff') 
      : (lightButtonTextColor || '#ffffff');
    
    const cardBorder = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)';
    const inputBg = darkMode ? 'rgba(3, 7, 18, 0.65)' : '#ffffff';
    const inputBorder = darkMode ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1';

    let cardShadow = 'none';
    if (cardGlow) {
      cardShadow = darkMode 
        ? `0 4px 22px -5px ${actualButtonBg}4d, 0 8px 32px rgba(0, 0, 0, 0.35)` 
        : `0 4px 18px -4px rgba(0, 0, 0, 0.05), 0 10px 30px -10px ${actualButtonBg}10`;
    } else {
      cardShadow = darkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
        : '0 4px 12px rgba(0, 0, 0, 0.02)';
    }

    const fontSizePx = baseFontSize === 'sm' ? '12px' : baseFontSize === 'lg' ? '17px' : '14.5px';

    styleTag.innerHTML = `
      :root {
        --theme-font-family: ${fontName};
        --theme-container-bg: ${rootBg};
        --theme-text-color: ${actualTextColor};
        --theme-heading-color: ${actualHeadingColor};
        --theme-card-bg: ${actualCardBg};
        --theme-button-bg: ${actualButtonBg};
        --theme-button-text: ${actualButtonTextColor};
        --theme-accent-color: ${accentColor};
        --theme-border-radius: ${radiusPx};
        --theme-font-size: ${fontSizePx};
      }

      body, html, #root {
        font-family: var(--theme-font-family) !important;
        font-size: var(--theme-font-size);
        background-color: var(--theme-container-bg) !important;
        color: var(--theme-text-color);
      }

      /* Heading typography colors */
      .heading-themed {
        color: var(--theme-heading-color) !important;
      }

      /* Buttons & active UI actions accent branding */
      html body .btn-gradient,
      html body button.btn-gradient {
        background-image: linear-gradient(135deg, var(--theme-button-bg) 0%, var(--theme-accent-color, var(--theme-button-bg)) 100%) !important;
        color: var(--theme-button-text) !important;
        border-color: var(--theme-button-bg) !important;
      }
      
      html body .btn-gradient:hover {
        filter: brightness(1.1) !important;
      }

      /* Border radius override */
      .rounded-xl, .rounded-lg, .rounded-2xl {
        border-radius: var(--theme-border-radius);
      }

      /* Dynamic workspace wrapper background & glow */
      #application-workspace-wrapper {
        background-color: var(--theme-container-bg);
        background-image: ${workspaceGlowStyle === 'aurora' 
          ? (darkMode 
              ? `radial-gradient(circle at 12% 18%, ${actualButtonBg}1c 0%, transparent 45%), radial-gradient(circle at 88% 82%, ${actualButtonBg}24 0%, transparent 48%)` 
              : `radial-gradient(circle at 12% 18%, ${actualButtonBg}0a 0%, transparent 60%), radial-gradient(circle at 88% 82%, ${actualButtonBg}0c 0%, transparent 60%)`)
          : workspaceGlowStyle === 'intense'
          ? (darkMode 
              ? `radial-gradient(circle at 50% -25%, ${actualButtonBg}3c 0%, transparent 65%)` 
              : `radial-gradient(circle at 50% -25%, ${actualButtonBg}12 0%, transparent 65%)`)
          : workspaceGlowStyle === 'soft'
          ? (darkMode 
              ? `radial-gradient(circle at 50% 50%, ${actualButtonBg}0e 0%, transparent 80%)` 
              : `radial-gradient(circle at 50% 50%, ${actualButtonBg}04 0%, transparent 80%)`)
          : 'none'};
        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Inputs and form controls */
      input[type="text"]:focus, select:focus, textarea:focus, input[type="password"]:focus {
        border-color: var(--theme-accent-color);
        box-shadow: 0 0 0 3px ${actualButtonBg}2c;
        outline: none;
      }

      /* Custom system scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: ${darkMode ? '#090d16' : '#f1f5f9'};
      }
      ::-webkit-scrollbar-thumb {
        background: ${darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'};
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${actualButtonBg}a0;
      }

      .family-estedad {
        font-family: "Estedad", "Vazirmatn", sans-serif !important;
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

  // Database States (Instant SWR initialization from localStorage cache)
  const [personnel, setPersonnel] = useState<Personnel[]>(() => initialCachedDb?.personnel || []);
  const [cases, setCases] = useState<Case[]>(() => initialCachedDb?.cases || []);
  const [monitors, setMonitors] = useState<Monitor[]>(() => initialCachedDb?.monitors || []);
  const [printers, setPrinters] = useState<Printer[]>(() => initialCachedDb?.printers || []);
  const [mice, setMice] = useState<Mouse[]>(() => initialCachedDb?.mice || []);
  const [keyboards, setKeyboards] = useState<Keyboard[]>(() => initialCachedDb?.keyboards || []);
  const [radios, setRadios] = useState<Radio[]>(() => initialCachedDb?.radios || []);
  const [cctvs, setCctvs] = useState<Cctv[]>(() => initialCachedDb?.cctvs || []);
  const [partsCatalog, setPartsCatalog] = useState<CatalogItem[]>(() => initialCachedDb?.partsCatalog || []);
  const [assignments, setAssignments] = useState<Assignment[]>(() => initialCachedDb?.assignments || []);
  const [repairs, setRepairs] = useState<Repair[]>(() => initialCachedDb?.repairs || []);
  const [customCategories, setCustomCategories] = useState<any[]>(() => initialCachedDb?.customCategories || []);
  const [customEquipment, setCustomEquipment] = useState<any[]>(() => initialCachedDb?.customEquipment || []);

  // Shared Equipment Categories: Single Source of Truth including standard & custom types
  const equipmentCategories = useMemo<SharedEquipmentCategories>(() => {
    return createEquipmentCategories(customCategories);
  }, [customCategories]);

  // Auto-expand navigation categories if active tab is in the collapsed list
  useEffect(() => {
    // Column 1
    const col1Hidden = ['systems-tree-tab', 'define-hardware-tab'];
    if (col1Hidden.includes(activeTab)) {
      setCol1Expanded(true);
    }

    // Column 2
    const isEquipmentTab = equipmentCategories.list.some(cat => cat.tabId === activeTab) || activeTab?.startsWith('custom_');
    if (customCategories.length > 0 || isEquipmentTab) {
      setCol2Expanded(true);
    }

    // Column 3
    const col3Hidden = ['repairs-tab', 'bulk-edit-tab', 'bulk-qr-tab'];
    if (col3Hidden.includes(activeTab)) {
      setCol3Expanded(true);
    }

    // Column 4
    const col4Hidden = ['backup-tab'];
    if (col4Hidden.includes(activeTab)) {
      setCol4Expanded(true);
    }
  }, [activeTab, customCategories]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv' | 'catalog' | null>(null);

  // Transfer prefill
  const [prefilledEquipCode, setPrefilledEquipCode] = useState('');
  const [prefilledPersCode, setPrefilledPersCode] = useState('');

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrType, setQrType] = useState<'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv'>('case');
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

  const handleShowQR = (code: string, type: 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv', data: any) => {
    setQrCode(code);
    setQrType(type);
    setQrData(data);
    setQrModalOpen(true);
  };

  // Fetch all databases from Express server imitation with parallel fetching and robust localStorage fallback
  const loadDatabase = async () => {
    try {
      if (personnel.length === 0 && cases.length === 0 && !initialCachedDb) {
        setLoading(true);
      }
      setError(null);

      // Parallel fetch data and theme for maximum loading speed
      const [dataRes, themeRes] = await Promise.all([
        fetch(`/api/data?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }),
        fetch('/api/theme').catch(() => null)
      ]);

      if (!dataRes.ok) throw new Error('NOT_OK');
      
      const contentType = dataRes.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('NOT_JSON'); // Cookie check or SPA HTML fallback returned
      }

      const data = await dataRes.json();
      setPersonnel(data.personnel || []);
      setCases(data.cases || []);
      setMonitors(data.monitors || []);
      setPrinters(data.printers || []);
      setMice(data.mice || []);
      setKeyboards(data.keyboards || []);
      setRadios(data.radios || []);
      setCctvs(data.cctvs || []);
      setPartsCatalog(data.partsCatalog || []);
      setAssignments(data.assignments || []);
      setRepairs(data.repairs || []);
      setCustomCategories(data.customCategories || []);
      setCustomEquipment(data.customEquipment || []);

      // Process custom theme response if present
      if (themeRes && themeRes.ok) {
        try {
          const themeJson = await themeRes.json();
          if (themeJson && themeJson.theme) {
            setCurrentTheme(themeJson.theme);
            localStorage.setItem('custom-theme-config', JSON.stringify(themeJson.theme));
          }
        } catch (themeErr) {
          console.warn("Could not retrieve custom theme from server, staying with previous layout config.", themeErr);
        }
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
        cctvs: data.cctvs || [],
        partsCatalog: data.partsCatalog || [],
        assignments: data.assignments || [],
        repairs: data.repairs || [],
        customCategories: data.customCategories || [],
        customEquipment: data.customEquipment || []
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
      setCctvs(localDb.cctvs || []);
      setPartsCatalog(localDb.partsCatalog || []);
      setAssignments(localDb.assignments || []);
      setRepairs(localDb.repairs || []);
      setCustomCategories(localDb.customCategories || []);
      setCustomEquipment(localDb.customEquipment || []);
      
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

    try {
      const res = await fetch('/api/save-bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ items })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await loadDatabase();
        return { success: true, savedCount: data.savedCount || items.length, skipped: data.skippedCodes || [] };
      } else {
        alert(data.error || "خطا در ثبت گروهی اطلاعات بر روی سرور.");
        return { success: false, savedCount: 0, skipped: [] };
      }
    } catch (err) {
      console.warn('API save-bulk failed. Switching to Local fallback.', err);
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
      radio: 'radios',
      cctv: 'cctvs'
    };

    items.forEach((rawItem: any) => {
      const type = rawItem.type;
      const dbKey = keyMap[type];

      const trimmedCode = String(rawItem.code).trim().toUpperCase();
      if (!trimmedCode) return;

      if (dbKey) {
        db[dbKey] = db[dbKey] || [];
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
        } else if (type === 'cctv') {
          itemObj = {
            ...itemObj,
            brand: rawItem.brand || "سایر",
            model: rawItem.model || "سایر",
            location: rawItem.location || ""
          };
        } else {
          itemObj = {
            ...itemObj,
            model: rawItem.model || "سایر"
          };
        }

        db[dbKey].push(itemObj);
        savedCount++;
      } else {
        // Custom Category Equipment
        const customCategoriesCheck = db.customCategories || [];
        const matched = customCategoriesCheck.find((c: any) => 
          c.id === type || `custom_${c.id}` === type || c.id === String(type).replace(/^custom_/, '')
        );
        if (matched) {
          db.customEquipment = db.customEquipment || [];
          const exists = db.customEquipment.some((x: any) => String(x.code).toUpperCase() === trimmedCode);
          if (exists) {
            skipped.push(trimmedCode);
            return;
          }

          const itemObj: any = {
            id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            categorySlug: matched.id,
            code: trimmedCode,
            assignedTo: null,
            status: rawItem.status || "working",
            location: rawItem.location || "کارگاه بوشهر",
            lastServiced: rawItem.lastServiced || "",
            description: rawItem.description?.trim() || "ایمپورت گروهی به انبار",
            ...rawItem
          };

          db.customEquipment.push(itemObj);
          savedCount++;
        }
      }
    });

    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setCases(db.cases || []);
    setMonitors(db.monitors || []);
    setPrinters(db.printers || []);
    setMice(db.mice || []);
    setKeyboards(db.keyboards || []);
    setRadios(db.radios || []);
    setCctvs(db.cctvs || []);
    setCustomEquipment(db.customEquipment || []);

    return { success: true, savedCount, skipped };
  };

  // Save Bulk Edit
  const handleSaveBulkEdit = async (updates: { type: string, code: string, fields: any }[]) => {
    if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
      alert("دسترسی غیرمجاز! شما صلاحیت ویرایش تجهیزات را ندارید.");
      return { success: false, updatedCount: 0 };
    }

    try {
      const res = await fetch('/api/save-bulk-edit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ updates })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await loadDatabase();
        return { success: true, updatedCount: data.updatedCount || updates.length };
      } else {
        alert(data.error || "خطا در اعمال تغییرات گروهی بر روی سرور.");
        return { success: false, updatedCount: 0 };
      }
    } catch (err) {
      console.warn('API save-bulk-edit failed. Switching to Local fallback.', err);
    }

    // Local / Offline mutate simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    let updatedCount = 0;

    const keyMap: Record<string, string> = {
      case: 'cases',
      monitor: 'monitors',
      printer: 'printers',
      mouse: 'mice',
      keyboard: 'keyboards',
      radio: 'radios'
    };

    updates.forEach((up: any) => {
      const type = up.type;
      const dbKey = keyMap[type];
      if (!dbKey) return;

      db[dbKey] = db[dbKey] || [];
      const targetCode = String(up.code).toUpperCase().trim();
      
      const idx = db[dbKey].findIndex((x: any) => String(x.code).toUpperCase() === targetCode);
      if (idx !== -1) {
        db[dbKey][idx] = {
          ...db[dbKey][idx],
          ...up.fields,
          code: db[dbKey][idx].code
        };
        updatedCount++;
      }
    });

    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setCases(db.cases || []);
    setMonitors(db.monitors || []);
    setPrinters(db.printers || []);
    setMice(db.mice || []);
    setKeyboards(db.keyboards || []);
    setRadios(db.radios || []);

    return { success: true, updatedCount };
  };

  // Save/Edit entity
  const handleSaveItem = async (type: string, data: any) => {
    // Permission validation checks
    if (type === 'personnel') {
      if (!currentUser?.canEditPersonnel && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت افزودن یا ویرایش پرونده پرسنلی را ندارید.");
        return false;
      }
    } else if (type === 'catalog' || type === 'custom_category') {
      if (currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! ویرایش لیست قطعات مرجع یا تعریف سخت‌افزار کارگاه منحصراً در اختیار ادمین اصلی است.");
        return false;
      }
    } else {
      // Equipment types: case, monitor, printer, mouse, keyboard
      if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت افزودن یا ویرایش تجهیزات را ندارید.");
        return false;
      }
    }

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ type, ...data })
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        await loadDatabase();
        return true;
      } else {
        alert(resData.error || 'خطا در ثبت اطلاعات بر روی سرور.');
        return false;
      }
    } catch (err) {
      console.warn('API save network issue. Switching to Local fallback.', err);
    }

    // Local / Offline mutate simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    if (type === 'custom_category') {
      let list = db.customCategories || [];
      const item = {
        id: data.id || 'cat_' + Date.now(),
        name: data.name?.trim(),
        icon: data.icon || "⚙️",
        fields: data.fields || []
      };
      const index = list.findIndex((c: any) => c.id === item.id);
      if (index > -1) {
        list[index] = item;
      } else {
        list.push(item);
      }
      db.customCategories = list;
    } else {
      const customCategoriesCheck = db.customCategories || [];
      if (customCategoriesCheck.some((c: any) => c.id === type)) {
        let list = db.customEquipment || [];
        const isEditing = !!(data.isEdit || data.id);
        const index = list.findIndex((e: any) => e.code === data.code && (!isEditing || e.id !== data.id));
        if (index > -1) {
          alert("کد اموال وارد شده تکراری است.");
          return false;
        }
        const item = {
          id: isEditing ? data.id : 'eq_' + Date.now(),
          categorySlug: type,
          code: data.code?.trim(),
          assignedTo: data.assignedTo || null,
          status: data.status || "working",
          location: data.location || "کارگاه بوشهر",
          lastServiced: data.lastServiced || "",
          description: data.description || "",
          ...data
        };
        const editIdx = list.findIndex((e: any) => e.id === item.id);
        if (editIdx > -1) {
          list[editIdx] = item;
        } else {
          list.push(item);
        }
        db.customEquipment = list;
      }
    }

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
        const returnedHardware: { code: string; type: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | "cctv" }[] = [];

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

        // Cctvs
        db.cctvs = (db.cctvs || []).map((c: any) => {
          if (c.assignedTo === trimmedCode) {
            returnedHardware.push({ code: c.code, type: 'cctv' });
            return { ...c, assignedTo: null };
          }
          return c;
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
    else if (type === 'cctv') {
      let list = db.cctvs || [];
      if (!data.code) {
        alert("کد دوربین مداربسته الزامی است.");
        return false;
      }
      const index = list.findIndex((c: any) => c.code === data.code);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
      } else {
        if (list.some((c: any) => c.code === data.code)) {
          alert("کد دوربین مداربسته تکراری است.");
          return false;
        }
        list.push({ ...data, assignedTo: null });
      }
      db.cctvs = list;
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
  const handleDeleteItem = async (type: string, id: string) => {
    // Permission validation checks for deletion
    if (type === 'personnel') {
      if (!currentUser?.canEditPersonnel && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت حذف پرونده پرسنلی را ندارید.");
        return;
      }
    } else if (type === 'catalog' || type === 'custom_category') {
      if (currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! حذف از لیست قطعات مرجع یا تعاریف سخت‌افزار کارگاه منحصراً در اختیار ادمین اصلی است.");
        return;
      }
    } else {
      // Equipment types: case, monitor, printer, mouse, keyboard
      if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
        alert("دسترسی غیرمجاز! شما صلاحیت حذف تجهیزات را ندارید.");
        return;
      }
    }

    let itemLabel = 'سخت‌افزار';
    if (type === 'personnel') itemLabel = 'پرونده پرسنل';
    else if (type === 'case') itemLabel = 'کیس کامپیوتر';
    else if (type === 'monitor') itemLabel = 'مانیتور';
    else if (type === 'printer') itemLabel = 'چاپگر';
    else if (type === 'keyboard') itemLabel = 'کیبورد';
    else if (type === 'mouse') itemLabel = 'ماوس';
    else if (type === 'radio') itemLabel = 'بی‌سیم دستی';
    else if (type === 'cctv') itemLabel = 'دوربین مداربسته';
    else if (type === 'custom_category') itemLabel = 'دسته‌بندی سخت‌افزاری';
    else if (type === 'catalog') itemLabel = 'قطعه مرجع کاتالوگ';
    else {
      const cat = customCategories.find((c: any) => c.id === type || `custom_${c.id}` === type);
      if (cat) itemLabel = `تجهیز سفارشی «${cat.name}»`;
    }

    const confirmationMsg = type === 'personnel' 
      ? `آیا از حذف کامل پرونده پرسنلی «${id}» اطمینان دارید؟ تمامی تجهیزات تحت تصرف وی آزاد شده و به انبار پروژه بازگردانده می‌شوند.`
      : type === 'custom_category'
      ? `آیا از حذف کامل این دسته‌بندی سخت‌افزاری اطمینان کامل دارید؟`
      : type === 'catalog'
      ? `آیا از حذف این قطعه مرجع از کاتالوگ قطعات اطمینان کامل دارید؟`
      : `آیا از حذف کامل ${itemLabel} با کد اموال «${id}» از سامانه اطمینان کامل دارید؟\n⚠️ توجه: این عملیات غیرقابل بازگشت است و تجهیز به طور کامل از موجودی، تخصیص‌ها و سوابق جاری حذف خواهد شد.`;

    if (!window.confirm(confirmationMsg)) return;

    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ type, id, today: getPersianDateString() })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert(data.message || 'مورد با موفقیت از سیستم حذف و بایگانی شد.');
        await loadDatabase();
        return;
      } else {
        alert(data.error || 'خطا در عملیات حذف آیتم از سیستم.');
        return;
      }
    } catch (err) {
      console.warn('API delete failed. Fallback to Local deletion.', err);
    }

    // Local deletion simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };
    const dateStr = getPersianDateString();

    if (type === 'custom_category') {
      let list = db.customCategories || [];
      const customEquips = db.customEquipment || [];
      const hasItems = customEquips.some((e: any) => e.categorySlug === id);
      if (hasItems) {
        alert("این دسته دارای تجهیز فعال است و امکان حذف آن وجود ندارد.");
        return;
      }
      const idx = list.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        list.splice(idx, 1);
        db.customCategories = list;
      }
    } else {
      const customCategoriesCheck = db.customCategories || [];
      if (customCategoriesCheck.some((c: any) => c.id === type)) {
        let list = db.customEquipment || [];
        const idx = list.findIndex((x: any) => x.id === id || x.code === id);
        if (idx !== -1) {
          const equipCode = list[idx].code;
          list.splice(idx, 1);
          db.customEquipment = list;

          // End active assignments
          (db.assignments || []).forEach((ass: any) => {
            if (ass.equipmentCode === equipCode && ass.equipmentType === type && ass.endDate === null) {
              ass.endDate = dateStr;
            }
          });
        }
      }
    }

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
          (db.cctvs || []).forEach((c: any) => { if (c.assignedTo === codeToClear) c.assignedTo = null; });

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
        'cctv': 'cctvs',
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

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ equipmentCode, targetPersonnelCode, today })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await loadDatabase();
        return;
      } else {
        alert(data.error || 'خطا در ثبت جابه‌جایی و تحویل هوشمند تجهیز.');
        return;
      }
    } catch (err) {
      console.warn('API transfer failed. Fallback to Local transfer.', err);
    }

    // Local Transfer simulation
    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    // Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | "cctv" | null = null;
    let equipItem: any = null;

    const listKeys = ['cases', 'monitors', 'printers', 'mice', 'keyboards', 'radios', 'cctvs'] as const;
    const typesMap = { cases: 'case', monitors: 'monitor', printers: 'printer', mice: 'mouse', keyboards: 'keyboard', radios: 'radio', cctvs: 'cctv' } as const;

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
    await loadDatabase();
  };

  // Location Transfer Handler
  const handleLocationTransfer = async (equipmentCode: string, targetLocation: string, documentNumber?: string, dateStr?: string) => {
    const today = dateStr || getPersianDateString();

    try {
      const res = await fetch('/api/transfer-location', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify({ equipmentCode, targetLocation, documentNumber, today })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await loadDatabase();
        return;
      } else {
        alert(data.error || "خطا در ثبت جابه‌جایی مکانی تجهیز بر روی سرور.");
        return;
      }
    } catch (err) {
      console.warn('API transfer-location failed. Fallback to Local.', err);
    }

    const rawDb = localStorage.getItem('azarestan_ict_db');
    let db = rawDb ? JSON.parse(rawDb) : { ...INITIAL_DEMO_DATA };

    // Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | "cctv" | null = null;
    let equipItem: any = null;

    const listKeys = ['cases', 'monitors', 'printers', 'mice', 'keyboards', 'radios', 'cctvs'] as const;
    const typesMap = { cases: 'case', monitors: 'monitor', printers: 'printer', mice: 'mouse', keyboards: 'keyboard', radios: 'radio', cctvs: 'cctv' } as const;

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
    await loadDatabase();
  };

  // Restore Entire Database
  const handleRestoreDatabase = async (backupData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || '')
        },
        body: JSON.stringify(backupData)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await loadDatabase();
        return true;
      } else {
        alert(data.error || 'خطا در بازیابی نسخه پشتیبان بر روی سرور.');
        return false;
      }
    } catch (err) {
      console.warn('API restore failed. Fallback to Local restore.', err);
    }

    localStorage.setItem('azarestan_ict_db', JSON.stringify(backupData));
    await loadDatabase();
    return true;
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

  const handleEditTrigger = (item: any, type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio' | 'cctv' | 'catalog') => {
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
        p.department.toLowerCase().includes(kw) ||
        (p.username && p.username.toLowerCase().includes(kw))
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
        (c.assignedTo && c.assignedTo.toLowerCase().includes(kw)) ||
        (c.ipAddress && c.ipAddress.toLowerCase().includes(kw)) ||
        (c.hostName && c.hostName.toLowerCase().includes(kw)) ||
        (c.macAddress && c.macAddress.toLowerCase().includes(kw))
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

  const getFilteredCctvs = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cctvs;
    const keywords = q.split(/\s+/).filter(Boolean);
    return cctvs.filter(c => 
      keywords.every(kw =>
        c.code.toLowerCase().includes(kw) || 
        c.brand.toLowerCase().includes(kw) || 
        c.model.toLowerCase().includes(kw) || 
        (c.location && c.location.toLowerCase().includes(kw))
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

      {/* Welcome & User Session Command Bar */}
      <div className="no-print mb-3 flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/95 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center select-none shrink-0 shadow-2xs">
              {currentUser.name ? currentUser.name.trim().charAt(0) : 'ک'}
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">کاربر فعال:</span>
                <strong className="text-slate-900 dark:text-white font-bold text-xs">{currentUser.name}</strong>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 select-none">
                  {currentUser.role === 'admin' ? 'مدیر ارشد سامانه' : currentUser.role === 'editor_equipment' ? 'اپراتور سخت‌افزار' : 'ناظر سیستم'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 select-none">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0 shadow-xs" />
            <span className="font-bold text-[11px] tabular-nums">کاربران حاضر: {onlineUsersData.count} نفر</span>
            {currentUser.role === 'admin' && onlineUsersData.users.length > 0 && (
              <span className="border-r border-emerald-300/80 dark:border-emerald-800/80 pr-2 mr-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium hidden sm:inline-block">
                ({onlineUsersData.users.map(u => u.name).join('، ')})
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          type="button"
          className="w-full md:w-auto text-rose-700 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-all flex items-center justify-center gap-1.5 select-none"
        >
          <span className="text-xs">🚪</span>
          <span>خروج امن از سیستم</span>
        </button>
      </div>

      {/* 2. Executive Search & Live Metrics Strip */}
      <div className="no-print bg-white dark:bg-slate-900/95 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row justify-between items-center gap-3 mb-3 text-right transition-colors backdrop-blur-md">
        <div className="relative flex-1 w-full max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی سریع پرسنل، شماره اموال، مدل سخت‌افزار، آدرس شبکه IP..."
            className="w-full text-right py-2 pr-9 pl-12 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder-slate-400 text-slate-900 dark:text-slate-100 transition-all font-sans"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none pointer-events-none">🔍</span>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-[11px] font-bold cursor-pointer transition"
              title="پاک کردن عبارت جستجو"
            >
              ✕
            </button>
          ) : (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 select-none pointer-events-none hidden sm:inline-block">
              جستجو
            </span>
          )}
        </div>
        
        {/* Real-time Summary Indicator with Zero-Pill Typography */}
        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 font-medium select-none flex-wrap justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">موجودی تجهیزات:</span>
            <span className="font-mono font-black text-slate-900 dark:text-slate-100 tabular-nums text-sm">
              {cases.length + monitors.length + printers.length + keyboards.length + mice.length + radios.length + cctvs.length + customEquipment.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">دستگاه</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">پرسنل کارگاه:</span>
            <span className="font-mono font-black text-slate-900 dark:text-slate-100 tabular-nums text-sm">
              {personnel.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">نفر</span>
          </div>
          {searchQuery.trim() && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] animate-fade-in flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                فیلتر جستجو فعال
              </span>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Summary Cards Grid (Interactive KPI Tiles with Zero-Pill Discipline) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-4">
        {equipmentCategories.list.map((cat) => {
          let count = 0;
          let active = 0;
          let repair = 0;
          if (cat.id === 'case') {
            count = cases.length;
            active = cases.filter(c => !c.status || c.status === 'working' || c.status === null).length;
            repair = cases.filter(c => c.status === 'repair').length;
          } else if (cat.id === 'monitor') {
            count = monitors.length;
            active = monitors.filter(m => !m.status || m.status === 'working' || m.status === null).length;
            repair = monitors.filter(m => m.status === 'repair').length;
          } else if (cat.id === 'printer') {
            count = printers.length;
            active = printers.filter(p => !p.status || p.status === 'working' || p.status === null).length;
            repair = printers.filter(p => p.status === 'repair').length;
          } else if (cat.id === 'keyboard') {
            count = keyboards.length;
            active = keyboards.filter(k => !k.status || k.status === 'working' || k.status === null).length;
            repair = keyboards.filter(k => k.status === 'repair').length;
          } else if (cat.id === 'mouse') {
            count = mice.length;
            active = mice.filter(m => !m.status || m.status === 'working' || m.status === null).length;
            repair = mice.filter(m => m.status === 'repair').length;
          } else if (cat.id === 'radio') {
            count = radios.length;
            active = radios.filter(r => !r.status || r.status === 'working' || r.status === null).length;
            repair = radios.filter(r => r.status === 'repair').length;
          } else if (cat.id === 'cctv') {
            count = cctvs.length;
            active = cctvs.filter(c => !c.status || c.status === 'working' || c.status === null).length;
            repair = cctvs.filter(c => c.status === 'repair').length;
          } else {
            const list = customEquipment.filter(e => e.categorySlug === cat.id);
            count = list.length;
            active = list.filter(e => !e.status || e.status === 'working' || e.status === null).length;
            repair = list.filter(e => e.status === 'repair').length;
          }

          const isSelected = activeTab === cat.tabId;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.tabId)}
              className={`text-right group py-2.5 px-3 rounded-2xl border flex flex-col justify-between transition-all duration-150 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs hover:-translate-y-0.5'
              }`}
              title={`مشاهده فهرست و مدیریت ${cat.name}`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full mb-1">
                <span className="text-base shrink-0 transition-transform group-hover:scale-110 duration-150 select-none">{cat.icon}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.shortName || cat.name}
                </span>
              </div>

              <div className="flex items-baseline justify-between w-full mt-0.5">
                <div className="text-sm font-black font-mono tabular-nums text-slate-900 dark:text-white flex items-baseline gap-0.5">
                  <span>{count}</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-sans font-normal">عدد</span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] select-none font-medium">
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="tabular-nums font-mono">{active}</span>
                  </span>
                  {repair > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="tabular-nums font-mono">{repair}</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Navigation tabs bar (hides in print) */}
      <div 
        className={`no-print border rounded-2xl p-3.5 mb-4 shadow-2xs text-right transition-all duration-200 ${
          darkMode 
            ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200/90 text-slate-800'
        }`}
        style={{ 
          boxShadow: currentTheme.cardGlow && darkMode ? `0 4px 20px -5px ${currentTheme.accentColor}33` : undefined
        }}
      >
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-3 border-b gap-2 ${
          darkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">🎛️</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">میز کار و منوی ناوبری کارگاه</h4>
            </div>
          </div>
          {/* Active selection badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
            darkMode 
              ? 'bg-blue-950/70 text-blue-300 border-blue-900/60' 
              : 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs'
          }`}>
            <span className={darkMode ? 'text-blue-400/80 font-medium' : 'text-blue-600/80 font-medium'}>بخش فعال:</span>
            <span>
              {
                (() => {
                  const cat = equipmentCategories.get(activeTab);
                  if (cat) {
                    return `${cat.icon || '⚙️'} ${cat.name}`;
                  }
                  return [
                    { id: 'personnel-tab', label: '👥 لیست پرسنل' },
                    { id: 'catalog-tab', label: '🛠️ قطعات مرجع' },
                    { id: 'transfer-tab', label: '🔄 جابجایی هوشمند' },
                    { id: 'history-tab', label: '📜 تاریخچه لجستیک' },
                    { id: 'reports-tab', label: '📋 گزارش و شناسنامه' },
                    { id: 'repairs-tab', label: '🛠️ تعمیرات و اسقاط' },
                    { id: 'bulk-qr-tab', label: '🖨️ چاپ گروهی بارکد' },
                    { id: 'bulk-edit-tab', label: '🛠️ ویرایش گروهی تجهیزات' },
                    { id: 'systems-tree-tab', label: '🌳 نمودار درختی' },
                    { id: 'users-tab', label: '🛡️ مدیریت کاربران' },
                    { id: 'logs-tab', label: '🪵 لاگ امنیتی سیستم' },
                    { id: 'appearance-tab', label: '🎨 تنظیمات زیبایی تم' },
                    { id: 'backup-tab', label: '💾 پشتیبان‌گیری پایگاه داده' },
                    { id: 'define-hardware-tab', label: '🛠️ تعریف سخت افزار جدید' },
                    { id: 'add-new-tab', label: '➕ ثبت جدید(تکی /گروهی)' }
                  ].find(t => t.id === activeTab)?.label || '—';
                })()
              }
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Column 1: Basics & Personnel */}
          <div className="space-y-1.5">
            <div className={`flex items-center gap-1.5 px-1 text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-xs">👥</span>
              <span>بخش اول: تعاریف و پرسنل</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-2 rounded-xl transition-colors ${
              darkMode ? 'bg-slate-950/50 border border-slate-800/80' : 'bg-slate-50/70 border border-slate-200/60'
            }`}>
              {(() => {
                const col1Items = [
                  { id: 'personnel-tab', label: 'لیست پرسنل', icon: '👥', show: true },
                  { id: 'add-new-tab', label: 'ثبت جدید(تکی /گروهی)', icon: '➕', show: currentUser?.canEditPersonnel || currentUser?.canEditEquipment || currentUser?.role === 'admin' },
                  { id: 'catalog-tab', label: 'قطعات مرجع', icon: '🛠️', show: true },
                  { id: 'systems-tree-tab', label: 'نمودار درختی', icon: '🌳', show: true },
                  { id: 'define-hardware-tab', label: 'تعریف سخت افزار جدید', icon: '🛠️', show: currentUser?.role === 'admin' }
                ].filter(t => t.show);

                return (
                  col1Items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); }}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-start gap-2 border text-right ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black' 
                          : darkMode 
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-blue-600 hover:border-blue-200 shadow-2xs'
                      }`}
                    >
                      <span className="text-xs shrink-0">{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                    </button>
                  ))
                );
              })()}
            </div>
          </div>

          {/* Column 2: Equipment Categories */}
          <div className="space-y-1.5">
            <div className={`flex items-center gap-1.5 px-1 text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-xs">🖥️</span>
              <span>بخش دوم: تجهیزات سخت‌افزاری</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-2 rounded-xl transition-colors ${
              darkMode ? 'bg-slate-950/50 border border-slate-800/80' : 'bg-slate-50/70 border border-slate-200/60'
            }`}>
              {(() => {
                const col2Items = equipmentCategories.list.map(cat => ({
                  id: cat.tabId,
                  label: cat.shortName || cat.name,
                  icon: cat.icon || '⚙️',
                  isCustom: cat.isCustom
                }));

                return (
                  col2Items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); }}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-start gap-2 border text-right ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black' 
                          : darkMode 
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-blue-600 hover:border-blue-200 shadow-2xs'
                      }`}
                    >
                      <span className="text-xs shrink-0">{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                      {(tab as any).isCustom && (
                        <span className="mr-auto text-[8px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded font-bold border border-blue-200/60 dark:border-blue-800">سفارشی</span>
                      )}
                    </button>
                  ))
                );
              })()}
            </div>
          </div>

          {/* Column 3: Logistics & Operations */}
          <div className="space-y-1.5">
            <div className={`flex items-center gap-1.5 px-1 text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-xs">🔄</span>
              <span>بخش سوم: عملیات و لجستیک</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-2 rounded-xl transition-colors ${
              darkMode ? 'bg-slate-950/50 border border-slate-800/80' : 'bg-slate-50/70 border border-slate-200/60'
            }`}>
              {(() => {
                const col3Items = [
                  { id: 'transfer-tab', label: 'جابجایی هوشمند', icon: '🔄', show: currentUser?.canEditEquipment || currentUser?.role === 'admin' },
                  { id: 'history-tab', label: 'تاریخچه لجستیک', icon: '📜', show: true },
                  { id: 'reports-tab', label: 'گزارش و شناسنامه', icon: '📋', show: currentUser?.canExport || currentUser?.role === 'admin' },
                  { id: 'repairs-tab', label: 'تعمیرات و اسقاط', icon: '🛠️', show: true },
                  { id: 'bulk-edit-tab', label: 'ویرایش گروهی تجهیزات', icon: '🛠️', show: currentUser?.canEditEquipment || currentUser?.role === 'admin' },
                  { id: 'bulk-qr-tab', label: 'چاپ گروهی بارکد', icon: '🖨️', show: currentUser?.canExport || currentUser?.role === 'admin' }
                ].filter(t => t.show);

                return (
                  col3Items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); }}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-start gap-2 border text-right ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black' 
                          : darkMode 
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-blue-600 hover:border-blue-200 shadow-2xs'
                      }`}
                    >
                      <span className="text-xs shrink-0">{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                    </button>
                  ))
                );
              })()}
            </div>
          </div>

          {/* Column 4: System & Security */}
          <div className="space-y-1.5">
            <div className={`flex items-center gap-1.5 px-1 text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-xs">🛡️</span>
              <span>بخش چهارم: امنیت و مدیریت سیستم</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-2 rounded-xl transition-colors ${
              darkMode ? 'bg-slate-950/50 border border-slate-800/80' : 'bg-slate-50/70 border border-slate-200/60'
            }`}>
              {(() => {
                const col4Items = [
                  { id: 'users-tab', label: 'مدیریت کاربران', icon: '🛡️', show: currentUser?.role === 'admin' },
                  { id: 'logs-tab', label: 'لاگ امنیتی سیستم', icon: '🪵', show: currentUser?.role === 'admin' },
                  { id: 'appearance-tab', label: 'تنظیمات زیبایی تم', icon: '🎨', show: currentUser?.role === 'admin' },
                  { id: 'backup-tab', label: 'پشتیبان‌گیری پایگاه داده', icon: '💾', show: currentUser?.canBackup || currentUser?.role === 'admin' }
                ].filter(t => t.show);

                return (
                  col4Items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); }}
                      className={`w-full py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-start gap-2 border text-right ${
                        activeTab === tab.id 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black' 
                          : darkMode 
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-blue-600 hover:border-blue-200 shadow-2xs'
                      }`}
                    >
                      <span className="text-xs shrink-0">{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                    </button>
                  ))
                );
              })()}
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

          {activeTab === 'cctvs-tab' && (
            <CctvsSubTab 
              cctvs={getFilteredCctvs()} 
              personnel={personnel}
              onEdit={(c) => handleEditTrigger(c, 'cctv')}
              onDelete={(code) => handleDeleteItem('cctv', code)}
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

          {activeTab === 'bulk-edit-tab' && (
            <BulkEditTab 
              cases={cases}
              monitors={monitors}
              printers={printers}
              mice={mice}
              keyboards={keyboards}
              radios={radios}
              cctvs={cctvs}
              customEquipment={customEquipment}
              equipmentCategories={equipmentCategories}
              personnel={personnel}
              onSaveBulkEdit={handleSaveBulkEdit}
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
              radios={radios}
              cctvs={cctvs}
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
              customCategories={customCategories}
              customEquipment={customEquipment}
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

          {activeTab === 'define-hardware-tab' && (
            <DefineHardwareTab 
              customCategories={customCategories}
              customEquipment={customEquipment}
              onSaveCategory={async (data) => {
                const res = await handleSaveItem('custom_category', data);
                if (res) {
                  setCol2Expanded(true);
                  if (data.id) {
                    const newTabId = data.id.startsWith('custom_') ? data.id : `custom_${data.id}`;
                    setActiveTab(newTabId);
                  }
                }
                return res;
              }}
              onDeleteCategory={(id) => handleDeleteItem('custom_category', id)}
              onTabChange={setActiveTab}
              currentUser={currentUser}
            />
          )}

          {activeTab?.startsWith('custom_') && (() => {
            const rawId = activeTab.replace(/^custom_/, '');
            const category = customCategories.find(c => 
              c.id === activeTab || 
              c.id === rawId || 
              `custom_${c.id}` === activeTab
            );
            if (category) {
              const filteredEquips = customEquipment.filter(e => 
                e.categorySlug === category.id || 
                e.categorySlug === rawId ||
                `custom_${e.categorySlug}` === activeTab ||
                (e.categorySlug && e.categorySlug.replace(/^custom_/, '') === category.id.replace(/^custom_/, ''))
              );
              return (
                <CustomEquipmentSubTab
                  category={category}
                  equipmentList={filteredEquips}
                  personnel={personnel}
                  onSaveItem={handleSaveItem}
                  onDeleteItem={handleDeleteItem}
                  onTransfer={handleTriggerTransfer}
                  onShowQR={handleShowQR}
                  currentUser={currentUser}
                />
              );
            }
            return null;
          })()}

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
                radios,
                cctvs,
                partsCatalog,
                assignments,
                repairs,
                customCategories,
                customEquipment
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
              cctvs={cctvs}
              customEquipment={customEquipment}
              equipmentCategories={equipmentCategories}
              personnel={personnel}
            />
          )}

          {activeTab === 'add-new-tab' && (
            <AddNewTab 
              onSave={handleSaveItem} 
              onSaveBulk={handleSaveBulkItems} 
              equipmentCategories={equipmentCategories}
              customCategories={customCategories}
              isLoading={loading}
            />
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
          onDelete={handleDeleteItem}
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
