import React, { useState, useEffect } from 'react';
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
  const [col2Expanded, setCol2Expanded] = useState(false);
  const [col3Expanded, setCol3Expanded] = useState(false);
  const [col4Expanded, setCol4Expanded] = useState(false);
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
      buttonTextColor: '#111827',
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
      ? (buttonTextColor || '#111827') 
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

      body, html, #root, #app-root-container {
        font-family: var(--theme-font-family) !important;
        font-size: var(--theme-font-size) !important;
        background-color: var(--theme-container-bg) !important;
        color: var(--theme-text-color) !important;
      }

      /* Heading typography colors and structural labels override with Ultimate Specificity */
      html body h1, html body h2, html body h3, html body h4, html body h5, html body h6, html body strong, html body th,
      html.dark body h1, html.dark body h2, html.dark body h3, html.dark body h4, html.dark body h5, html.dark body h6, html.dark body strong, html.dark body th,
      html.light body h1, html.light body h2, html.light body h3, html.light body h4, html.light body h5, html.light body h6, html.light body strong, html.light body th,
      html body .font-black, html body .font-bold, html body .font-extrabold,
      html.dark body .font-black, html.dark body .font-bold, html.dark body .font-extrabold,
      html.light body .font-black, html.light body .font-bold, html.light body .font-extrabold,
      html body .text-slate-900, html body .dark\\:text-slate-900,
      html body .text-slate-800, html body .dark\\:text-slate-800,
      html body .text-slate-100, html body .dark\\:text-slate-100,
      html body .text-white, html body .dark\\:text-white,
      html.dark body .text-slate-900, html.dark body .text-slate-800, html.dark body .text-slate-100, html.dark body .text-white,
      html.light body .text-slate-900, html.light body .text-slate-800, html.light body .text-white,
      .heading-themed {
        color: var(--theme-heading-color) !important;
      }

      /* Text and descriptive body styling with Ultimate Specificity and Hierarchy */
      html body p, html body label, html body li, html body td,
      html body .text-slate-750, html body .text-slate-700, html body .text-slate-650, html body .text-slate-600, html body .dark\\:text-slate-350, html body .dark\\:text-slate-300,
      html body .dark\\:text-slate-400, html body .text-gray-700, html body .text-gray-650, html body .text-gray-600,
      html.dark body p, html.dark body label, html.dark body li, html.dark body td,
      html.dark body .text-slate-700, html.dark body .text-slate-600, html.dark body .text-slate-500, html.dark body .text-slate-400, html.dark body .text-slate-300,
      html.light body p, html.light body label, html.light body li, html.light body td,
      html.light body .text-slate-700, html.light body .text-slate-600, html.light body .text-slate-500, html.light body .text-slate-400 {
        color: var(--theme-text-color) !important;
      }

      /* Secondary/dimmed descriptions / meta info */
      html body .text-slate-505, html body .text-slate-500, html body .text-slate-400, html body .text-gray-500, html body .text-gray-400,
      html.dark body .text-slate-500, html.dark body .text-slate-400,
      html.light body .text-slate-500, html.light body .text-slate-400 {
        color: var(--theme-text-color) !important;
        opacity: 0.8 !important;
      }

      /* Buttons & active UI actions background and text colors (excl. naked button tags to prevent action button clashes) */
      html body .bg-indigo-600, html body .bg-indigo-505, html body .bg-indigo-500, html body .bg-indigo-650, html body .bg-indigo-700,
      html body .bg-blue-600, html body .bg-blue-500, html body .bg-blue-700, html body .bg-blue-800, html body .bg-blue-650,
      html body .btn-gradient,
      html body button.bg-gradient-to-r, html body button.bg-gradient-to-l, 
      html body a.bg-gradient-to-r, html body a.bg-gradient-to-l,
      html.dark body .bg-indigo-600, html.dark body .bg-indigo-500, html.dark body .bg-indigo-650, html.dark body .bg-indigo-700,
      html.dark body .bg-blue-600, html.dark body .bg-blue-500, html.dark body .bg-blue-700, html.dark body .bg-blue-800, html.dark body .bg-blue-650,
      html.dark body button.bg-gradient-to-r, html.dark body button.bg-gradient-to-l,
      html.light body .bg-indigo-600, html.light body .bg-indigo-500,
      html.light body .bg-blue-600, html.light body .bg-blue-500, html.light body .bg-blue-700, html.light body .bg-blue-855, html.light body .bg-blue-650,
      html body button.bg-blue-600, html body button.bg-indigo-600, html.light body button.bg-blue-600, html.light body button.bg-indigo-600 {
        background-color: var(--theme-button-bg) !important;
        color: var(--theme-button-text) !important;
        border-color: var(--theme-button-bg) !important;
      }

      /* Hover States */
      html body .bg-indigo-600:hover, html body .bg-indigo-500:hover, html body .bg-indigo-650:hover, html body .bg-indigo-700:hover,
      html body .bg-blue-600:hover, html body .bg-blue-500:hover, html body .bg-blue-700:hover, html body .bg-blue-800:hover, html body .bg-blue-650:hover,
      html.dark body .bg-indigo-600:hover, html.dark body .bg-indigo-500:hover, html.dark body .bg-indigo-650:hover, html.dark body .bg-indigo-700:hover,
      html.light body .bg-indigo-600:hover, html.light body .bg-indigo-500:hover, html.light body .bg-indigo-650:hover, html.light body .bg-indigo-700:hover {
        background-color: var(--theme-button-bg) !important;
        filter: brightness(1.15) !important;
        color: var(--theme-button-text) !important;
      }

      /* Make sure nested spans, icons, text utilities inside themed backgrounds perfectly match their text color */
      html body .bg-indigo-600 *, html body .bg-indigo-500 *, html body .bg-indigo-650 *, html body .bg-indigo-700 *,
      html body .bg-blue-600 *, html body .bg-blue-500 *, html body .bg-blue-700 *, html body .bg-blue-800 *, html body .bg-blue-650 *,
      html body .btn-gradient *,
      html body button.bg-gradient-to-r *, html body button.bg-gradient-to-l *, 
      html body a.bg-gradient-to-r *, html body a.bg-gradient-to-l *,
      html.dark body .bg-indigo-600 *, html.dark body .bg-indigo-500 *, html.dark body .bg-indigo-650 *, html.dark body .bg-indigo-700 *,
      html.dark body button.bg-gradient-to-r *, html.dark body button.bg-gradient-to-l *,
      html.light body .bg-indigo-600 *, html.light body .bg-indigo-500 *, html.light body .bg-indigo-650 *, html.light body .bg-indigo-700 *,
      html.light body .bg-indigo-600 * span, html.light body .bg-indigo-500 * span {
        color: var(--theme-button-text) !important;
      }

      html body .text-blue-600, html body .text-blue-500, html body .text-blue-400, html body .text-indigo-600, html body .text-indigo-500, html body .text-blue-655, html body .text-indigo-650, html body .text-indigo-655,
      html.dark body .text-blue-500, html.dark body .text-indigo-500, html.light body .text-blue-600, html.light body .text-indigo-600 {
        color: var(--theme-accent-color) !important;
      }

      html body .border-blue-600, html body .border-blue-500, html body .border-indigo-600, html body .border-indigo-500 {
        border-color: var(--theme-accent-color) !important;
      }

      /* Box, Card, panels backgrounds & shadow effect styling */
      html body .bg-white, html body .dark\\:bg-slate-950, html body .bg-slate-950, 
      html body .bg-slate-900\\/50, html body .bg-slate-900\\/60, html body .bg-slate-900\\/80, 
      html body .bg-slate-950\\/80, html body .bg-slate-900, html body .bg-slate-950, html body .bg-slate-900\\/40, html body .bg-slate-900\\/90,
      html.dark body .bg-white, html.dark body .bg-slate-950, html.dark body .bg-slate-900, html.light body .bg-white, html.light body .bg-slate-50 {
        background-color: var(--theme-card-bg) !important;
        border-color: ${cardBorder} !important;
        box-shadow: ${cardShadow} !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
      }

      /* Consistent styling for sub-boxes, alert boxes and dynamic badges */
      html body .bg-indigo-50\\/45, html body .bg-indigo-50\\/30, html body .bg-indigo-50\\/60, html body .bg-indigo-50, html body .bg-blue-50, html body .bg-slate-50,
      html body .dark\\:bg-indigo-950\\/20, html body .dark\\:bg-indigo-950\\/40, html body .dark\\:bg-slate-900\\/50, html body .bg-indigo-50\\/70, html body .bg-indigo-100\\/50,
      html.dark body .bg-indigo-50, html.dark body .bg-indigo-950\\/20, html.dark body .bg-indigo-950\\/40, html.light body .bg-indigo-50, html.light body .bg-slate-50 {
        background-color: ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'} !important;
        border-color: ${cardBorder} !important;
      }

      /* Consistent badges or highlights */
      html body .text-indigo-700, html body .text-indigo-800, html body .text-indigo-300, html body .text-indigo-400, 
      html body .dark\\:text-indigo-300, html body .dark\\:text-indigo-400, html body .text-emerald-800, html body .text-emerald-705,
      html.dark body .text-indigo-700, html.dark body .text-indigo-800, html.dark body .text-indigo-300, html.dark body .text-indigo-400,
      html.light body .text-indigo-700, html.light body .text-indigo-800, html.light body .text-indigo-300, html.light body .text-indigo-400 {
        color: var(--theme-accent-color) !important;
      }

      /* Overwrite background indigo and slate gradients to match the card and container look */
      body .from-indigo-900, body .to-slate-900, body .from-blue-900, body .to-indigo-950, body .to-blue-950, body .from-slate-900 {
        --tw-gradient-from: var(--theme-card-bg) !important;
        --tw-gradient-to: var(--theme-card-bg) !important;
        background-color: var(--theme-card-bg) !important;
      }
      
      /* Pure gradient elements overrides for buttons and container divisions */
      body button.bg-gradient-to-r, body button.bg-gradient-to-l, 
      body a.bg-gradient-to-r, body a.bg-gradient-to-l,
      body .btn-gradient {
        background-image: linear-gradient(135deg, var(--theme-button-bg) 0%, var(--theme-accent-color, var(--theme-button-bg)) 100%) !important;
        color: var(--theme-button-text) !important;
        border-color: var(--theme-button-bg) !important;
      }
      body button.bg-gradient-to-r:hover, body button.bg-gradient-to-l:hover, 
      body a.bg-gradient-to-r:hover, body a.bg-gradient-to-l:hover {
        filter: brightness(1.15) !important;
      }
      
      body div.bg-gradient-to-r, body div.bg-gradient-to-l {
        background-image: linear-gradient(135deg, var(--theme-card-bg) 0%, var(--theme-card-bg) 100%) !important;
        border: 1px solid ${cardBorder} !important;
      }

      /* Borders theme unification */
      body .border-indigo-100, body .border-indigo-150, body .border-indigo-200, body .border-indigo-300,
      body .border-slate-200, body .border-slate-300, body .border-slate-800, body .border-slate-850, body .border-slate-700, body .border-slate-900,
      body .border-indigo-850, body .border-indigo-900\\/40, body .border-indigo-200\\/80, body .border-indigo-150\\/40,
      .dark .border-slate-800, .dark .border-slate-700, .light .border-slate-200, .light .border-slate-300 {
        border-color: ${cardBorder} !important;
      }   .border-indigo-850, .border-indigo-900\\/40, .border-indigo-200\\/80, .border-indigo-150\\/40 {
        border-color: ${cardBorder} !important;
      }

      /* Border radius override */
      .rounded-xl, .rounded-lg, .rounded-2xl, .rounded-3xl, .rounded-md {
        border-radius: var(--theme-border-radius) !important;
      }

      /* Theme the dynamic workspace wrapper too */
      #application-workspace-wrapper {
        background-color: var(--theme-container-bg) !important;
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
          : 'none'} !important;
        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Inputs, Select elements, Textareas style override */
      input[type="text"], input[type="password"], select, textarea {
        background-color: ${inputBg} !important;
        border-color: ${inputBorder} !important;
        color: var(--theme-heading-color) !important;
        font-family: inherit;
        border-radius: var(--theme-border-radius) !important;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      input[type="text"]:focus, select:focus, textarea:focus, input[type="password"]:focus {
        border-color: var(--theme-accent-color) !important;
        box-shadow: 0 0 0 3px ${actualButtonBg}2c !important;
        outline: none !important;
      }

      th {
        background-color: ${darkMode ? 'rgba(15, 23, 42, 0.9)' : '#f8fafc'} !important;
        color: var(--theme-heading-color) !important;
      }

      td {
        border-color: ${cardBorder} !important;
        color: var(--theme-text-color) !important;
      }

      tr:hover td {
        background-color: ${darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} !important;
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
        background: ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${actualButtonBg}a0;
      }

      .family-estedad {
        font-family: "Estedad", "Vazirmatn", sans-serif !important;
      }

      /* Specific focused elements dynamic override instead of constant #0f172a hardcoded */
      div#root:nth-of-type(1) > div#application-workspace-wrapper:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) {
        background-color: var(--theme-card-bg) !important;
      }

      div#root:nth-of-type(1) > div#application-workspace-wrapper:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) {
        background-color: var(--theme-card-bg) !important;
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
  const [cctvs, setCctvs] = useState<Cctv[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<CatalogItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [customEquipment, setCustomEquipment] = useState<any[]>([]);

  // Auto-expand navigation categories if active tab is in the collapsed list
  useEffect(() => {
    // Column 1
    const col1Hidden = ['systems-tree-tab', 'define-hardware-tab'];
    if (col1Hidden.includes(activeTab)) {
      setCol1Expanded(true);
    }

    // Column 2
    const col2StandardIds = ['cases-tab', 'monitors-tab', 'printers-tab', 'keyboards-tab', 'mice-tab', 'radios-tab', 'cctvs-tab'];
    const isCustomCat = activeTab?.startsWith('custom_');
    const col2Index = [
      ...col2StandardIds,
      ...customCategories.map(cat => `custom_${cat.id}`)
    ].indexOf(activeTab);
    if (col2Index >= 3 || isCustomCat) {
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
      setCctvs(data.cctvs || []);
      setPartsCatalog(data.partsCatalog || []);
      setAssignments(data.assignments || []);
      setRepairs(data.repairs || []);
      setCustomCategories(data.customCategories || []);
      setCustomEquipment(data.customEquipment || []);

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
      radio: 'radios',
      cctv: 'cctvs'
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
    });

    localStorage.setItem('azarestan_ict_db', JSON.stringify(db));
    setCases(db.cases || []);
    setMonitors(db.monitors || []);
    setPrinters(db.printers || []);
    setMice(db.mice || []);
    setKeyboards(db.keyboards || []);
    setRadios(db.radios || []);
    setCctvs(db.cctvs || []);

    return { success: true, savedCount, skipped };
  };

  // Save Bulk Edit
  const handleSaveBulkEdit = async (updates: { type: string, code: string, fields: any }[]) => {
    if (!currentUser?.canEditEquipment && currentUser?.role !== 'admin') {
      alert("دسترسی غیرمجاز! شما صلاحیت ویرایش تجهیزات را ندارید.");
      return { success: false, updatedCount: 0 };
    }

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/save-bulk-edit', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-operator-username': currentUser?.username || 'system',
            'x-operator-name': encodeURIComponent(currentUser?.name || '')
          },
          body: JSON.stringify({ updates })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await loadDatabase();
          return { success: true, updatedCount: data.updatedCount };
        } else {
          alert(data.error || "خطا در اعمال تغییرات گروهی بر روی سرور.");
          return { success: false, updatedCount: 0 };
        }
      } catch (err) {
        console.warn('API save-bulk-edit failed. Switching to Local fallback.', err);
      }
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
        } else {
          const errData = await res.json();
          if (errData && errData.error) {
            alert(errData.error);
            return;
          }
        }
      } catch (err) {
        console.warn('API delete failed. Fallback to Local deletion.', err);
      }
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
    setIsOfflineMode(true);
    await loadDatabase();
  };

  // Location Transfer Handler
  const handleLocationTransfer = async (equipmentCode: string, targetLocation: string, documentNumber?: string, dateStr?: string) => {
    const today = dateStr || getPersianDateString();

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
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex gap-1.5 flex-wrap justify-center font-extrabold">
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">👥 پرسنل: {personnel.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">🖥️ کیس: {cases.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">📺 مانیتور: {monitors.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">🖨️ چاپگر: {printers.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">🖱️ ماوس: {mice.length}</span>
          <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded">⌨️ کیبورد: {keyboards.length}</span>
          <span className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">📻 بی‌سیم: {radios.length}</span>
          <span className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">📹 دوربین مداربسته: {cctvs.length}</span>
          {customCategories.map(cat => (
            <span key={cat.id} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">{cat.icon || '⚙️'} {cat.name}: {customEquipment.filter(e => e.categorySlug === cat.id).length}</span>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Cards Grid (Request 2) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
        {[
          { label: 'کیس‌ها', count: cases.length, icon: '🖥️', active: cases.filter(c => !c.status || c.status === 'working' || c.status === null).length, repair: cases.filter(c => c.status === 'repair').length, color: 'from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/60 dark:border-blue-900/40' },
          { label: 'مانیتورها', count: monitors.length, icon: '📺', active: monitors.filter(m => !m.status || m.status === 'working' || m.status === null).length, repair: monitors.filter(m => m.status === 'repair').length, color: 'from-sky-500/10 to-sky-600/5 text-sky-600 border-sky-200/60 dark:border-sky-900/40' },
          { label: 'پرینترها', count: printers.length, icon: '🖨️', active: printers.filter(p => !p.status || p.status === 'working' || p.status === null).length, repair: printers.filter(p => p.status === 'repair').length, color: 'from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200/60 dark:border-amber-900/40' },
          { label: 'کیبوردها', count: keyboards.length, icon: '⌨️', active: keyboards.filter(k => !k.status || k.status === 'working' || k.status === null).length, repair: keyboards.filter(k => k.status === 'repair').length, color: 'from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/60 dark:border-purple-900/40' },
          { label: 'ماوس‌ها', count: mice.length, icon: '🖱️', active: mice.filter(m => !m.status || m.status === 'working' || m.status === null).length, repair: mice.filter(m => m.status === 'repair').length, color: 'from-indigo-500/10 to-indigo-600/5 text-indigo-600 border-indigo-200/60 dark:border-indigo-900/40' },
          { label: 'بی‌سیم‌ها', count: radios.length, icon: '📻', active: radios.filter(r => !r.status || r.status === 'working' || r.status === null).length, repair: radios.filter(r => r.status === 'repair').length, color: 'from-teal-500/10 to-teal-600/5 text-teal-600 border-teal-200/60 dark:border-teal-900/40' },
          { label: 'دوربین‌ها', count: cctvs.length, icon: '📹', active: cctvs.filter(c => !c.status || c.status === 'working' || c.status === null).length, repair: cctvs.filter(c => c.status === 'repair').length, color: 'from-pink-500/10 to-pink-600/5 text-pink-600 border-pink-200/60 dark:border-pink-900/40' },
          ...customCategories.map(cat => ({
            label: cat.name,
            count: customEquipment.filter(e => e.categorySlug === cat.id).length,
            icon: cat.icon || '⚙️',
            active: customEquipment.filter(e => e.categorySlug === cat.id && (!e.status || e.status === 'working' || e.status === null)).length,
            repair: customEquipment.filter(e => e.categorySlug === cat.id && e.status === 'repair').length,
            color: 'from-slate-500/10 to-slate-600/5 text-slate-600 border-slate-200/60 dark:border-slate-800'
          }))
        ].map((card, idx) => (
          <div 
            key={idx}
            className={`bg-gradient-to-br ${card.color} border py-1 px-1.5 rounded-lg flex items-center justify-between shadow-2xs hover:shadow-xs transition-all duration-200 text-xs`}
            style={{ minHeight: '36px' }}
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs shrink-0">{card.icon}</span>
              <div className="min-w-0 flex flex-col justify-center leading-none">
                <div className="text-[8px] md:text-[9px] font-black text-slate-500 dark:text-slate-400 truncate leading-none">{card.label}</div>
                <div className="text-[10px] md:text-xs font-black mt-0.5 font-mono flex items-baseline gap-0.5 leading-none">
                  <span>{card.count}</span>
                  <span className="text-[7px] md:text-[8px] text-slate-400 font-sans font-normal">عدد</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0 select-none">
              <span className="text-[7px] md:text-[8px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/10 leading-none" title="دستگاه‌های سالم">سالم: {card.active}</span>
              {card.repair > 0 && (
                <span className="text-[7px] md:text-[8px] font-black bg-rose-500/10 text-rose-700 dark:text-rose-400 px-1 py-0.5 rounded border border-rose-500/10 leading-none animate-pulse" title="دستگاه‌های در حال تعمیر">تعمیر: {card.repair}</span>
              )}
            </div>
          </div>
        ))}
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
                (() => {
                  if (activeTab?.startsWith('custom_')) {
                    const catId = activeTab.replace('custom_', '');
                    const cat = customCategories.find(c => c.id === catId);
                    return cat ? `${cat.icon || '⚙️'} ${cat.name}` : '—';
                  }
                  return [
                    { id: 'personnel-tab', label: '👥 لیست پرسنل' },
                    { id: 'cases-tab', label: '🖥️ کیس' },
                    { id: 'monitors-tab', label: '📺 مانیتور' },
                    { id: 'printers-tab', label: '🖨️ پرینتر' },
                    { id: 'mice-tab', label: '🖱️ ماوس' },
                    { id: 'keyboards-tab', label: '⌨️ کیبورد' },
                    { id: 'radios-tab', label: '📻 بی‌سیم دستی' },
                    { id: 'cctvs-tab', label: '📹 دوربین‌های مداربسته' },
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
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <span className="text-xs">👥</span>
              <span>بخش اول: تعاریف و پرسنل</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
            }`}>
              {(() => {
                const col1Items = [
                  { id: 'personnel-tab', label: 'لیست پرسنل', icon: '👥', show: true },
                  { id: 'add-new-tab', label: 'ثبت جدید(تکی /گروهی)', icon: '➕', show: currentUser?.canEditPersonnel || currentUser?.canEditEquipment || currentUser?.role === 'admin' },
                  { id: 'catalog-tab', label: 'قطعات مرجع', icon: '🛠️', show: true },
                  { id: 'systems-tree-tab', label: 'نمودار درختی', icon: '🌳', show: true },
                  { id: 'define-hardware-tab', label: 'تعریف سخت افزار جدید', icon: '🛠️', show: currentUser?.role === 'admin' }
                ].filter(t => t.show);

                const visibleItems = col1Expanded ? col1Items : col1Items.slice(0, 3);
                return (
                  <>
                    {visibleItems.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); }}
                        className={`w-full py-1.5 px-2 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-start gap-1.5 border text-right ${
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
                    {col1Items.length > 3 && (
                      <button
                        onClick={() => setCol1Expanded(!col1Expanded)}
                        className={`w-full mt-1 py-1 px-2 text-[9px] font-black rounded-md border border-dashed text-center flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          darkMode 
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white' 
                            : 'bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                        }`}
                      >
                        <span>{col1Expanded ? '🔼 نمایش کمتر' : `🔽 نمایش بیشتر (${col1Items.length - 3})`}</span>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Column 2: Equipment Categories */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <span className="text-xs">🖥️</span>
              <span>بخش دوم: تجهیزات سخت‌افزاری</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
            }`}>
              {(() => {
                const col2Items = [
                  { id: 'cases-tab', label: 'کیس', icon: '🖥️' },
                  { id: 'monitors-tab', label: 'مانیتور', icon: '📺' },
                  { id: 'printers-tab', label: 'پرینتر', icon: '🖨️' },
                  { id: 'keyboards-tab', label: 'کیبورد', icon: '⌨️' },
                  { id: 'mice-tab', label: 'ماوس', icon: '🖱️' },
                  { id: 'radios-tab', label: 'بی‌سیم', icon: '📻' },
                  { id: 'cctvs-tab', label: 'دوربین مداربسته', icon: '📹' },
                  ...customCategories.map(cat => ({
                    id: `custom_${cat.id}`,
                    label: cat.name,
                    icon: cat.icon || '⚙️'
                  }))
                ];

                const visibleItems = col2Expanded ? col2Items : col2Items.slice(0, 3);
                return (
                  <>
                    {visibleItems.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); }}
                        className={`w-full py-1.5 px-2 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-start gap-1.5 border text-right ${
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
                    {col2Items.length > 3 && (
                      <button
                        onClick={() => setCol2Expanded(!col2Expanded)}
                        className={`w-full mt-1 py-1 px-2 text-[9px] font-black rounded-md border border-dashed text-center flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          darkMode 
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white' 
                            : 'bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                        }`}
                      >
                        <span>{col2Expanded ? '🔼 نمایش کمتر' : `🔽 نمایش بیشتر (${col2Items.length - 3})`}</span>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Column 3: Logistics & Operations */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              <span className="text-xs">🔄</span>
              <span>بخش سوم: عملیات و لجستیک</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
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

                const visibleItems = col3Expanded ? col3Items : col3Items.slice(0, 3);
                return (
                  <>
                    {visibleItems.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); }}
                        className={`w-full py-1.5 px-2 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-start gap-1.5 border text-right ${
                          activeTab === tab.id 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-black' 
                            : darkMode 
                              ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/85 hover:text-indigo-600 hover:border-indigo-300'
                        }`}
                      >
                        <span className="text-[10px] shrink-0">{tab.icon}</span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                    {col3Items.length > 3 && (
                      <button
                        onClick={() => setCol3Expanded(!col3Expanded)}
                        className={`w-full mt-1 py-1 px-2 text-[9px] font-black rounded-md border border-dashed text-center flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          darkMode 
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white' 
                            : 'bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                        }`}
                      >
                        <span>{col3Expanded ? '🔼 نمایش کمتر' : `🔽 نمایش بیشتر (${col3Items.length - 3})`}</span>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Column 4: System & Security */}
          <div className="space-y-1">
            <div className={`flex items-center gap-1 px-1 text-[10px] font-black ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
              <span className="text-xs">🛡️</span>
              <span>بخش چهارم: امنیت و مدیریت سیستم</span>
            </div>
            <div className={`grid grid-cols-1 gap-1.5 p-1.5 rounded-lg shadow-inner transition-colors ${
              darkMode ? 'bg-slate-950/40 border border-slate-800/60' : 'bg-slate-50 border border-slate-200/50'
            }`}>
              {(() => {
                const col4Items = [
                  { id: 'users-tab', label: 'مدیریت کاربران', icon: '🛡️', show: currentUser?.role === 'admin' },
                  { id: 'logs-tab', label: 'لاگ امنیتی سیستم', icon: '🪵', show: currentUser?.role === 'admin' },
                  { id: 'appearance-tab', label: 'تنظیمات زیبایی تم', icon: '🎨', show: currentUser?.role === 'admin' },
                  { id: 'backup-tab', label: 'پشتیبان‌گیری پایگاه داده', icon: '💾', show: currentUser?.canBackup || currentUser?.role === 'admin' }
                ].filter(t => t.show);

                const visibleItems = col4Expanded ? col4Items : col4Items.slice(0, 3);
                return (
                  <>
                    {visibleItems.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); }}
                        className={`w-full py-1.5 px-2 text-[10px] md:text-[11px] font-extrabold rounded-md transition-all duration-150 cursor-pointer flex items-center justify-start gap-1.5 border text-right ${
                          activeTab === tab.id 
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-black' 
                            : darkMode 
                              ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/85 hover:text-rose-600 hover:border-rose-300'
                        }`}
                      >
                        <span className="text-[10px] shrink-0">{tab.icon}</span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                    {col4Items.length > 3 && (
                      <button
                        onClick={() => setCol4Expanded(!col4Expanded)}
                        className={`w-full mt-1 py-1 px-2 text-[9px] font-black rounded-md border border-dashed text-center flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          darkMode 
                            ? 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white' 
                            : 'bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                        }`}
                      >
                        <span>{col4Expanded ? '🔼 نمایش کمتر' : `🔽 نمایش بیشتر (${col4Items.length - 3})`}</span>
                      </button>
                    )}
                  </>
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
              onSaveCategory={(data) => handleSaveItem('custom_category', data)}
              onDeleteCategory={(id) => handleDeleteItem('custom_category', id)}
              currentUser={currentUser}
            />
          )}

          {activeTab?.startsWith('custom_') && (() => {
            const catId = activeTab.replace('custom_', '');
            const category = customCategories.find(c => c.id === catId);
            if (category) {
              const filteredEquips = customEquipment.filter(e => e.categorySlug === catId);
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
