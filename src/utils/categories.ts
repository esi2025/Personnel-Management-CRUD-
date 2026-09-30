export interface CategoryField {
  name: string;
  key: string;
  type: 'text' | 'number';
}

export interface EquipmentCategory {
  id: string; // unique identifier (e.g. 'case', 'monitor', or 'cat_12345')
  tabId: string; // navigation tab id (e.g. 'cases-tab', 'custom_cat_12345')
  name: string; // Persian display name (e.g. 'کیس سیستم', 'مانیتور')
  shortName: string; // Short Persian label for compact UI (e.g. 'کیس')
  icon: string; // Emoji or visual icon
  defaultPrefix: string; // Smart code prefix (e.g. 'CAS-', 'MNT-', 'UPS-')
  isCustom: boolean; // false for standard built-ins, true for admin-defined
  fields?: CategoryField[]; // Custom fields for dynamic attributes
  dbKey: string; // json file / db array key
  color?: string; // Tailwind color theme for badges and cards
}

export const STANDARD_EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'case',
    tabId: 'cases-tab',
    name: 'کیس سیستم',
    shortName: 'کیس',
    icon: '🖥️',
    defaultPrefix: 'CAS-',
    isCustom: false,
    dbKey: 'cases',
    color: 'from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/60 dark:border-blue-900/40'
  },
  {
    id: 'monitor',
    tabId: 'monitors-tab',
    name: 'مانیتور',
    shortName: 'مانیتور',
    icon: '📺',
    defaultPrefix: 'MNT-',
    isCustom: false,
    dbKey: 'monitors',
    color: 'from-sky-500/10 to-sky-600/5 text-sky-600 border-sky-200/60 dark:border-sky-900/40'
  },
  {
    id: 'printer',
    tabId: 'printers-tab',
    name: 'پرینتر',
    shortName: 'پرینتر',
    icon: '🖨️',
    defaultPrefix: 'PRN-',
    isCustom: false,
    dbKey: 'printers',
    color: 'from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200/60 dark:border-amber-900/40'
  },
  {
    id: 'keyboard',
    tabId: 'keyboards-tab',
    name: 'کیبورد',
    shortName: 'کیبورد',
    icon: '⌨️',
    defaultPrefix: 'KB-',
    isCustom: false,
    dbKey: 'keyboards',
    color: 'from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/60 dark:border-purple-900/40'
  },
  {
    id: 'mouse',
    tabId: 'mice-tab',
    name: 'ماوس',
    shortName: 'ماوس',
    icon: '🖱️',
    defaultPrefix: 'MOU-',
    isCustom: false,
    dbKey: 'mice',
    color: 'from-indigo-500/10 to-indigo-600/5 text-indigo-600 border-indigo-200/60 dark:border-indigo-900/40'
  },
  {
    id: 'radio',
    tabId: 'radios-tab',
    name: 'بی‌سیم دستی',
    shortName: 'بی‌سیم',
    icon: '📻',
    defaultPrefix: 'RAD-',
    isCustom: false,
    dbKey: 'radios',
    color: 'from-teal-500/10 to-teal-600/5 text-teal-600 border-teal-200/60 dark:border-teal-900/40'
  },
  {
    id: 'cctv',
    tabId: 'cctvs-tab',
    name: 'دوربین مداربسته',
    shortName: 'دوربین مداربسته',
    icon: '📹',
    defaultPrefix: 'CAM-',
    isCustom: false,
    dbKey: 'cctvs',
    color: 'from-pink-500/10 to-pink-600/5 text-pink-600 border-pink-200/60 dark:border-pink-900/40'
  }
];

export function detectSmartPrefix(name: string, customPrefix?: string): string {
  if (customPrefix && customPrefix.trim()) return customPrefix.trim().toUpperCase();
  const lower = (name || '').toLowerCase();
  if (lower.includes('یو پی اس') || lower.includes('ups') || lower.includes('برق')) return 'UPS-';
  if (lower.includes('حضور') || lower.includes('غیاب')) return 'ATT-';
  if (lower.includes('شبکه') || lower.includes('سوییچ') || lower.includes('switch')) return 'SW-';
  if (lower.includes('روتر') || lower.includes('router')) return 'RTR-';
  if (lower.includes('سرور') || lower.includes('server')) return 'SRV-';
  if (lower.includes('اسکنر') || lower.includes('scanner') || lower.includes('scan')) return 'SCN-';
  if (lower.includes('لپ') || lower.includes('نوت') || lower.includes('laptop')) return 'LPT-';
  if (lower.includes('تبلت') || lower.includes('tablet')) return 'TAB-';
  if (lower.includes('موبایل') || lower.includes('phone')) return 'MOB-';
  if (lower.includes('پروژکتور') || lower.includes('projector')) return 'PRJ-';
  if (lower.includes('هارد') || lower.includes('hdd') || lower.includes('ssd') || lower.includes('ذخیره')) return 'STR-';
  return 'EQ-';
}

/**
 * Builds the unified equipment categories list combining standard and custom categories.
 * This serves as the single source of truth across the app.
 */
export function buildEquipmentCategories(customCategories: any[] = []): EquipmentCategory[] {
  const customList: EquipmentCategory[] = (customCategories || []).map((cat) => {
    const rawId = String(cat.id || '').replace(/^custom_/, '');
    const tabId = cat.id && String(cat.id).startsWith('custom_') ? String(cat.id) : `custom_${rawId}`;
    return {
      id: rawId,
      tabId,
      name: cat.name || 'سخت‌افزار سفارشی',
      shortName: cat.name || 'سفارشی',
      icon: cat.icon || '⚙️',
      defaultPrefix: cat.prefix || detectSmartPrefix(cat.name || ''),
      isCustom: true,
      fields: Array.isArray(cat.fields) ? cat.fields : [],
      dbKey: 'customEquipment',
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-200/60 dark:border-emerald-800'
    };
  });

  return [...STANDARD_EQUIPMENT_CATEGORIES, ...customList];
}

/**
 * Flexible finder for category by ID, tab ID, slug, or name (ignoring custom_ prefix or case).
 */
export function findCategory(categories: EquipmentCategory[] | any, idOrTypeOrTab: string | null | undefined): EquipmentCategory | undefined {
  if (!idOrTypeOrTab || !categories) return undefined;
  const list: EquipmentCategory[] = Array.isArray(categories) ? categories : (categories?.list || []);
  if (!Array.isArray(list) || typeof list.find !== 'function') return undefined;
  const clean = String(idOrTypeOrTab).trim().toLowerCase();
  const rawClean = clean.replace(/^custom_/, '').replace(/-tab$/, '');
  
  return list.find(cat => {
    if (!cat) return false;
    const catId = (cat.id || '').toLowerCase();
    const catTab = (cat.tabId || '').toLowerCase();
    const catRaw = catId.replace(/^custom_/, '');
    
    return (
      catId === clean ||
      catTab === clean ||
      `custom_${catId}` === clean ||
      catRaw === rawClean ||
      catTab === `${clean}-tab` ||
      (cat.name && cat.name.toLowerCase() === clean)
    );
  });
}

export interface EquipmentCategoriesState {
  list: EquipmentCategory[];
  byId: Record<string, EquipmentCategory>;
  standard: EquipmentCategory[];
  custom: EquipmentCategory[];
  get: (idOrTypeOrTab: string | null | undefined) => EquipmentCategory | undefined;
  getPrefix: (idOrTypeOrTab: string | null | undefined) => string;
  getName: (idOrTypeOrTab: string | null | undefined) => string;
  getIcon: (idOrTypeOrTab: string | null | undefined) => string;
  isCustom: (idOrTypeOrTab: string | null | undefined) => boolean;
  getFields: (idOrTypeOrTab: string | null | undefined) => CategoryField[];
}

export type SharedEquipmentCategories = EquipmentCategory[] & EquipmentCategoriesState & Record<string, any>;

/**
 * Creates the unified shared equipment categories object that includes both standard
 * types (Case, Monitor, Printer, Keyboard, Mouse, Radio, CCTV) and all custom types.
 * Acts as an Array and an Object with helper utilities, serving as the single source of truth.
 */
export function createEquipmentCategories(customCategories: any[] = []): SharedEquipmentCategories {
  const list = buildEquipmentCategories(customCategories);
  const standard = list.filter(c => !c.isCustom);
  const custom = list.filter(c => c.isCustom);

  const byId: Record<string, EquipmentCategory> = {};
  for (const cat of list) {
    byId[cat.id] = cat;
    byId[cat.tabId] = cat;
    if (cat.isCustom) {
      byId[`custom_${cat.id}`] = cat;
      byId[cat.id.replace(/^custom_/, '')] = cat;
    }
  }

  const helper: EquipmentCategoriesState = {
    list,
    byId,
    standard,
    custom,
    get: (idOrTypeOrTab: string | null | undefined) => findCategory(list, idOrTypeOrTab),
    getPrefix: (idOrTypeOrTab: string | null | undefined) => {
      const cat = findCategory(list, idOrTypeOrTab);
      return cat ? cat.defaultPrefix : detectSmartPrefix(String(idOrTypeOrTab || ''));
    },
    getName: (idOrTypeOrTab: string | null | undefined) => {
      const cat = findCategory(list, idOrTypeOrTab);
      return cat ? cat.name : String(idOrTypeOrTab || '');
    },
    getIcon: (idOrTypeOrTab: string | null | undefined) => {
      const cat = findCategory(list, idOrTypeOrTab);
      return cat ? cat.icon : '⚙️';
    },
    isCustom: (idOrTypeOrTab: string | null | undefined) => {
      const cat = findCategory(list, idOrTypeOrTab);
      return Boolean(cat?.isCustom);
    },
    getFields: (idOrTypeOrTab: string | null | undefined) => {
      const cat = findCategory(list, idOrTypeOrTab);
      return cat?.fields || [];
    }
  };

  const shared: any = [...list];
  Object.assign(shared, helper);
  
  // Safe indexing without clobbering Array prototype methods (e.g. map, filter, find, length, etc.)
  const reservedKeys = new Set(['map', 'filter', 'find', 'length', 'slice', 'some', 'every', 'reduce', 'forEach', 'concat', 'includes', 'indexOf']);
  for (const [k, v] of Object.entries(byId)) {
    if (!reservedKeys.has(k)) {
      shared[k] = v;
    }
  }

  return shared as SharedEquipmentCategories;
}
