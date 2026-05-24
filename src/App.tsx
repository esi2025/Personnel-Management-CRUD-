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
import EditModal from './components/EditModal';
import { Personnel, Case, Monitor, Printer, Assignment, Mouse, Keyboard, CatalogItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('personnel-tab');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch all databases from Express server imitation
  const loadDatabase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('خطا در بارگذاری اطلاعات از وب‌سرور شبیه‌ساز.');
      const data = await res.json();
      setPersonnel(data.personnel || []);
      setCases(data.cases || []);
      setMonitors(data.monitors || []);
      setPrinters(data.printers || []);
      setMice(data.mice || []);
      setKeyboards(data.keyboards || []);
      setPartsCatalog(data.partsCatalog || []);
      setAssignments(data.assignments || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطای غیرمنتظره در ارتباط با وب‌سرویس.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Save/Edit entity
  const handleSaveItem = async (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog', data: any) => {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data })
      });

      if (!res.ok) {
        const errJson = await res.json();
        alert(`عدم موفقیت در ثبت اطلاعات: ${errJson.error || 'خطای نامشخص'}`);
        return false;
      }
      
      await loadDatabase();
      return true;
    } catch (err) {
      alert('خطا در ثبت اطلاعات.');
      return false;
    }
  };

  // Delete entity
  const handleDeleteItem = async (type: 'personnel' | 'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'catalog', id: string) => {
    const confirmationMsg = type === 'personnel' 
      ? 'آیا از حذف این پرسنل اطمینان دارید؟ تمامی تجهیزات تحت تصرف وی آزاد شده و به انبار پروژه بازگردانده می‌شوند.'
      : 'آیا از حذف این سخت‌افزار از سامانه اطمینان کامل دارید؟';

    if (!window.confirm(confirmationMsg)) return;

    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, today: '1405/03/03' })
      });

      if (!res.ok) {
        const errJson = await res.json();
        alert(`عدم موفقیت در حذف: ${errJson.error || 'خطای سیستم'}`);
        return;
      }

      alert('مورد با موفقیت از سیستم حذف و بایگانی شد.');
      await loadDatabase();
    } catch (err) {
      alert('خطا در برقراری ارتباط حذف.');
    }
  };

  // Intelligent Equipment Transfer
  const handleTransferItem = async (equipmentCode: string, targetPersonnelCode: string | null) => {
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentCode, targetPersonnelCode, today: '1405/03/03' })
      });

      if (!res.ok) {
        const errJson = await res.json();
        alert(`خطا در ثبت فرآیند واگذاری: ${errJson.error || 'خطای سیستمی'}`);
        throw new Error(errJson.error);
      }

      await loadDatabase();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Restore Entire Database
  const handleRestoreDatabase = async (backupData: any) => {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData)
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || 'خطا در بازیابی دیتابیس.');
    }
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
    <div className="min-h-screen flex flex-col p-4 md:p-8 font-sans max-w-7xl mx-auto print:p-0 print:max-w-none" dir="rtl">
      
      {/* 1. System Header component */}
      <Header />

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
            />
          )}

          {activeTab === 'backup-tab' && (
            <BackupTab 
              onRestore={handleRestoreDatabase}
              onReload={loadDatabase}
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

      {/* 7. Corporate footer (hides in print) */}
      <footer className="no-print mt-12 bg-slate-900 border-t border-slate-800 text-slate-500 py-6 text-center text-xs space-y-2 rounded-xl">
        <div>سامانه هوشمند و آفلاین شناسنامه واحد ICT کارگاه بوشهر شرکت عمران آذرستان</div>
        <div className="font-mono text-[10px] text-slate-600">
          تمامی حقوق محفوظ است © ۱۴۰۵ | پورت آفلاین بر پایه فایل‌های محلی JSON فاقد پایگاه‌داده خارجی
        </div>
      </footer>

    </div>
  );
}
