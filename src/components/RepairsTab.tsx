import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  Cpu, 
  Layers, 
  HelpCircle,
  Hash,
  Activity,
  Archive,
  Check,
  X,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { Repair, RepairNeededPart, Case, Monitor, Printer, Keyboard, Mouse, Personnel, SystemUser, Radio } from '../types';
import AutocompleteInput, { AutocompleteOption } from './AutocompleteInput';

interface RepairsTabProps {
  repairs: Repair[];
  onRefresh: () => Promise<void>;
  currentUser: SystemUser | null;
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  keyboards: Keyboard[];
  mice: Mouse[];
  radios: Radio[];
  personnel: Personnel[];
}

export default function RepairsTab({
  repairs,
  onRefresh,
  currentUser,
  cases,
  monitors,
  printers,
  keyboards,
  mice,
  radios,
  personnel
}: RepairsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formEqCode, setFormEqCode] = useState('');
  const [formEqType, setFormEqType] = useState<'case' | 'monitor' | 'printer' | 'mouse' | 'keyboard' | 'radio'>('case');
  const [formReqName, setFormReqName] = useState('');
  const [formReqDate, setFormReqDate] = useState('');
  const [formIssue, setFormIssue] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formStatus, setFormStatus] = useState<Repair['status']>('pending_diagnosis');
  const [formTech, setFormTech] = useState('');
  const [formFee, setFormFee] = useState<number>(0);
  const [formCompletedDate, setFormCompletedDate] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  
  // Sourcing list inside form
  const [neededParts, setNeededParts] = useState<RepairNeededPart[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartSource, setNewPartSource] = useState<'warehouse' | 'salvage'>('warehouse');
  const [newPartCost, setNewPartCost] = useState<number>(0);
  const [newPartSalvageCode, setNewPartSalvageCode] = useState('');

  const canEdit = currentUser?.role === 'admin' || currentUser?.canEditEquipment;

  // Group all equipment codes for fast selection and validation helpers
  const allEquipment = useMemo(() => {
    const list: { code: string; label: string; type: Repair['equipmentType']; status: string }[] = [];
    cases.forEach(c => list.push({ code: c.code, label: `کیس - اموال ${c.code} (${c.motherboard})`, type: 'case', status: c.status || 'working' }));
    monitors.forEach(m => list.push({ code: m.code, label: `مانیتور - اموال ${m.code} (${m.model})`, type: 'monitor', status: m.status || 'working' }));
    printers.forEach(p => list.push({ code: p.code, label: `چاپگر - اموال ${p.code} (${p.model})`, type: 'printer', status: p.status || 'working' }));
    keyboards.forEach(k => list.push({ code: k.code, label: `کیبورد - اموال ${k.code} (${k.model})`, type: 'keyboard', status: k.status || 'working' }));
    mice.forEach(m => list.push({ code: m.code, label: `ماوس - اموال ${m.code} (${m.model})`, type: 'mouse', status: m.status || 'working' }));
    radios.forEach(r => list.push({ code: r.code, label: `بی‌سیم - اموال ${r.code} (${r.model})`, type: 'radio', status: r.status || 'working' }));
    return list;
  }, [cases, monitors, printers, keyboards, mice, radios]);

  const equipmentOptions = useMemo<AutocompleteOption[]>(() => {
    return allEquipment.map(eq => ({
      value: eq.code,
      label: eq.label,
      sublabel: `وضعیت استقرار: ${eq.status === 'working' ? 'فعال و سالم' : eq.status === 'declared_repair' ? 'اعلام آوار/خراب' : eq.status === 'repairing' ? 'در حال تعمیر در کارگاه' : 'اسقاط/اوراق'}`,
      icon: eq.type === 'case' ? '🖥️' : eq.type === 'monitor' ? '📺' : eq.type === 'printer' ? '🖨️' : eq.type === 'mouse' ? '🖱️' : eq.type === 'keyboard' ? '⌨️' : '📻',
      searchTerms: [eq.code, eq.label]
    }));
  }, [allEquipment]);

  const personnelOptions = useMemo<AutocompleteOption[]>(() => {
    return personnel.map(p => ({
      value: p.name,
      label: p.name,
      sublabel: `${p.title || ''} - واحد: ${p.department || ''} - کد: ${p.code}`,
      icon: '👤',
      searchTerms: [p.name, p.code, p.title || '', p.department || '']
    }));
  }, [personnel]);

  // Handle Equipment auto-type assignment on code change
  const handleEqCodeChange = (code: string) => {
    setFormEqCode(code);
    const found = allEquipment.find(eq => eq.code.toLowerCase().trim() === code.toLowerCase().trim());
    if (found) {
      setFormEqType(found.type);
    }
  };

  // Status mapping to Persian labels & colors
  const statusConfig = {
    pending_diagnosis: { label: 'در انتظار عیب‌یابی', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30', icon: Clock },
    parts_requested: { label: 'درخواست خرید قطعه', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30', icon: HelpCircle },
    parts_procured: { label: 'تأمین شده از کاتالوگ/انبار', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30', icon: Cpu },
    completed: { label: 'تعمیر کامل و ترخیص شده', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', icon: CheckCircle2 },
    unrepairable_salvage: { label: 'غیرقابل تعمیر (اوراق/اسقاط)', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', icon: AlertTriangle },
  };

  const getPersianType = (type: string) => {
    switch (type) {
      case 'case': return 'کیس رایانه';
      case 'monitor': return 'مانیتور';
      case 'printer': return 'چاپگر / چندکاره';
      case 'mouse': return 'ماوس';
      case 'keyboard': return 'کیبورد';
      case 'radio': return 'بی‌سیم دستی';
      default: return type;
    }
  };

  // Stats computation
  const stats = useMemo(() => {
    let activeCount = 0;
    let salvagePartCount = 0;
    let totalCost = 0;

    repairs.forEach(r => {
      if (r.status !== 'completed' && r.status !== 'unrepairable_salvage') {
        activeCount++;
      }
      if (r.neededParts) {
        r.neededParts.forEach(p => {
          if (p.source === 'salvage') salvagePartCount++;
        });
      }
      totalCost += (r.totalCost || 0);
    });

    return {
      total: repairs.length,
      active: activeCount,
      salvaged: salvagePartCount,
      totalCost
    };
  }, [repairs]);

  // Filtered repairs
  const filteredRepairs = useMemo(() => {
    return repairs.filter(r => {
      const matchesSearch = 
        r.equipmentCode.toLowerCase().includes(search.toLowerCase()) ||
        r.reportedIssue.toLowerCase().includes(search.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
        (r.assignedTechnician && r.assignedTechnician.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [repairs, search, statusFilter]);

  // Parts List manipulation
  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const part: RepairNeededPart = {
      id: `p_${Date.now()}`,
      name: newPartName.trim(),
      source: newPartSource,
      cost: newPartSource === 'salvage' ? 0 : Number(newPartCost) || 0,
      salvageEquipmentCode: newPartSource === 'salvage' ? newPartSalvageCode.trim() : undefined
    };

    setNeededParts([...neededParts, part]);
    setNewPartName('');
    setNewPartCost(0);
    setNewPartSalvageCode('');
  };

  const handleRemovePart = (id: string) => {
    setNeededParts(neededParts.filter(p => p.id !== id));
  };

  // Calculate total costs reactively
  const currentTotalCost = useMemo(() => {
    const partsSum = neededParts.reduce((sum, p) => sum + (p.cost || 0), 0);
    return partsSum + Number(formFee || 0);
  }, [neededParts, formFee]);

  // Open creation form
  const handleOpenAdd = () => {
    // Today's fa-IR date estimation
    const today = new Date();
    const persDate = today.toLocaleDateString('fa-IR');
    
    setEditingId(null);
    setFormEqCode('');
    setFormEqType('case');
    setFormReqName('');
    setFormReqDate(persDate);
    setFormIssue('');
    setFormDiagnosis('');
    setFormStatus('pending_diagnosis');
    setFormTech('');
    setFormFee(0);
    setFormCompletedDate('');
    setFormRemarks('');
    setNeededParts([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open edit form
  const handleOpenEdit = (rep: Repair) => {
    setEditingId(rep.id);
    setFormEqCode(rep.equipmentCode);
    setFormEqType(rep.equipmentType);
    setFormReqName(rep.requesterName);
    setFormReqDate(rep.requestDate);
    setFormIssue(rep.reportedIssue);
    setFormDiagnosis(rep.diagnosis || '');
    setFormStatus(rep.status);
    setFormTech(rep.assignedTechnician || '');
    setFormFee(rep.repairFee || 0);
    setFormCompletedDate(rep.completedDate || '');
    setFormRemarks(rep.remarks || '');
    setNeededParts(rep.neededParts || []);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Form submission handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEqCode.trim()) {
      setFormError('کد تجهیز الزامی است.');
      return;
    }
    if (!formIssue.trim()) {
      setFormError('شرح عیب گزارش شده الزامی است.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      id: editingId,
      equipmentCode: formEqCode.trim().toUpperCase(),
      equipmentType: formEqType,
      requestDate: formReqDate,
      requesterName: formReqName.trim(),
      reportedIssue: formIssue.trim(),
      diagnosis: formDiagnosis.trim(),
      status: formStatus,
      neededParts,
      repairFee: Number(formFee) || 0,
      totalCost: currentTotalCost,
      assignedTechnician: formTech.trim(),
      completedDate: formStatus === 'completed' ? (formCompletedDate || formReqDate) : formCompletedDate,
      remarks: formRemarks.trim()
    };

    try {
      const res = await fetch('/api/repairs/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || 'Unknown')
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'خطا در ثبت اطلاعات تعمیرات');
      }

      await onRefresh();
      setIsFormOpen(false);
      setSelectedRepair(null);
    } catch (err: any) {
      setFormError(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete repair record
  const handleDeleteRepair = async (id: string) => {
    setIsDeletingId(id);
    try {
      const res = await fetch('/api/repairs/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-operator-username': currentUser?.username || 'system',
          'x-operator-name': encodeURIComponent(currentUser?.name || 'Unknown')
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await onRefresh();
        if (selectedRepair?.id === id) {
          setSelectedRepair(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در حذف این پرونده');
      }
    } catch (e) {
      console.error(e);
      alert('خطا در حذف پرونده تعمیرات');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Dashboard Header Zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-xl">
              <Wrench className="w-5 h-5" />
            </span>
            <span>مدیریت تعمیرات و پایش بازسازی تجهیزات کارگاهی</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            ثبت عیب‌یابی، تعویض سوئیچینگ، تامین قطعات سالم از لوازم اسقاطی کارگاه بوشهر و پایش فاکتورهای هزینه‌کرد.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all scale-100 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت درخواست تعمیرات جدید</span>
          </button>
        )}
      </div>

      {/* 2. Bento Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-600 dark:text-slate-300">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">کل پرونده‌های ثبت‌شده</span>
            <span className="text-xl font-black block mt-1 text-slate-800 dark:text-slate-100">{stats.total} <small className="text-xs text-slate-400">مورد</small></span>
          </div>
        </div>

        {/* Stat 2: Active */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5 rotate-12" />
          </div>
          <div>
            <span className="text-[10px] text-amber-500 block font-bold">جاری در دست اقدام کارگاه</span>
            <span className="text-xl font-black block mt-1 text-amber-600 dark:text-amber-400">{stats.active} <small className="text-xs text-slate-400">تجهیز</small></span>
          </div>
        </div>

        {/* Stat 3: Sourced from Salvage (Cannibalized) */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-500 block font-bold">قطعات استخراجی از اسقاطی‌ها</span>
            <span className="text-xl font-black block mt-1 text-indigo-600 dark:text-indigo-400">{stats.salvaged} <small className="text-xs text-slate-400">قطعه</small></span>
          </div>
        </div>

        {/* Stat 4: Sourced costs */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-500 block font-bold">کل هزینه‌های تقریبی تعمیرات</span>
            <span className="text-xl font-black block mt-1 text-emerald-600 dark:text-emerald-400">{stats.totalCost.toLocaleString('fa-IR')} <small className="text-xs text-slate-400">ریال</small></span>
          </div>
        </div>

      </div>

      {/* 3. Filter and List Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left List Pane (Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجوی کد اموال، عیب یا پرسنل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'all' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                همه ({repairs.length})
              </button>
              {Object.entries(statusConfig).map(([key, cfg]) => {
                const count = repairs.filter(r => r.status === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                      statusFilter === key 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    {cfg.label} ({count})
                  </button>
                );
              })}
            </div>

          </div>

          {/* LIST CARDS */}
          {filteredRepairs.length === 0 ? (
            <div className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
              <Wrench className="w-12 h-12 stroke-[1] mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-bold">هیچ پرونده تعمیراتی با مشخصات جستجو و فیلتر شده یافت نشد.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRepairs.map((rep) => {
                const cfg = statusConfig[rep.status];
                const StatusIcon = cfg.icon;
                const isSelected = selectedRepair?.id === rep.id;
                
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedRepair(rep)}
                    className={`bg-white dark:bg-slate-950 border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xs break-inside-avoid relative overflow-hidden ${
                      isSelected 
                        ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/5 dark:bg-slate-900/50' 
                        : 'border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {/* Corner accent according to status */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      rep.status === 'completed' ? 'bg-emerald-500' :
                      rep.status === 'unrepairable_salvage' ? 'bg-rose-500' :
                      rep.status === 'parts_requested' ? 'bg-blue-500' :
                      rep.status === 'parts_procured' ? 'bg-purple-500' : 'bg-amber-500'
                    }`} />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-[#84141A] dark:text-[#a82229]">
                            {rep.equipmentCode}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-md font-bold">
                            {getPersianType(rep.equipmentType)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed max-w-[450px]">
                          {rep.reportedIssue}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-bold">
                            <User className="w-3 h-3 text-indigo-500" />
                            درخواست‌دهنده: {rep.requesterName || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            تاریخ ثبت: {rep.requestDate}
                          </span>
                          {rep.assignedTechnician && (
                            <span className="flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-violet-500" />
                              تکنسین فنی: {rep.assignedTechnician}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                        {/* Status Badge */}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </div>
                        {/* Cost Indicator */}
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold mr-auto sm:mr-0 pl-1">
                          هزینه: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{(rep.totalCost || 0).toLocaleString('fa-IR')}</span> ریال
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Details Panel (Takes 1 Col) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 sticky top-4 shadow-sm min-h-[400px]">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b pb-2 mb-3 flex items-center justify-between">
              <span>🔍 جزییات پرونده و مسیر بهینه‌سازی</span>
              <Wrench className="w-4 h-4 text-blue-500" />
            </h3>

            {selectedRepair ? (
              <div className="space-y-4">
                
                {/* 1. Hardware description card */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] border-b pb-1.5">
                    <span className="text-slate-400">شناسه سیستم</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{selectedRepair.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">کد اموال تجهیز:</span>
                      <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedRepair.equipmentCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">نوع سخت‌افزار:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{getPersianType(selectedRepair.equipmentType)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5">
                    <div>
                      <span className="text-slate-400 block">درخواست‌دهنده:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRepair.requesterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">تاریخ درخواست:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-300">{selectedRepair.requestDate}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Reported Issue */}
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 block font-bold">⚠️ عیب و خرابی گزارش‌شده:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/20 border border-amber-100/40 p-2.5 rounded-xl leading-relaxed mt-1">
                    {selectedRepair.reportedIssue}
                  </p>
                </div>

                {/* 3. Technicial Diagnosis */}
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 block font-bold">🩺 تشخیص و اقدام فنی تکنسین:</span>
                  {selectedRepair.diagnosis ? (
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-blue-50/20 border border-blue-100/40 p-2.5 rounded-xl leading-relaxed mt-1">
                      {selectedRepair.diagnosis}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">در انتظار تشخیص عیب توسط تکنسین فنی...</p>
                  )}
                </div>

                {/* 4. Sourced Spare Parts (Warehouse or Salvage) */}
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold mb-1">🛠️ قطعات تدارک دیده شده:</span>
                  {!selectedRepair.neededParts || selectedRepair.neededParts.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">قطعه‌ای مصرف نشده است.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedRepair.neededParts.map((part) => (
                        <div key={part.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-lg flex items-center justify-between text-[10px]">
                          <div>
                            <span className="font-bold block text-slate-700 dark:text-slate-300">{part.name}</span>
                            <span className="text-[9px] text-slate-400">
                              تامین: {part.source === 'warehouse' ? 'کاتالوگ انبار مرکزی (خریداری شده)' : `استخراج فرعی از کیس اسقاطی ${part.salvageEquipmentCode || '-'}`}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-slate-600 dark:text-slate-400">
                            {part.cost > 0 ? `${part.cost.toLocaleString('fa-IR')} ریال` : 'بدون هزینه (اسقاط)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Costs Calculation Block */}
                <div className="border-t border-dashed pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>دستمزد عیب‌یابی و تعمیر:</span>
                    <span className="font-mono font-bold">{(selectedRepair.repairFee || 0).toLocaleString('fa-IR')} ریال</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-800 dark:text-white border-t pt-1.5 mt-1.5">
                    <span>هزینه تمام‌شده تقریبی:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{(selectedRepair.totalCost || 0).toLocaleString('fa-IR')} ریال</span>
                  </div>
                </div>

                {/* 6. Remarks / Date completed */}
                {selectedRepair.status === 'completed' && (
                  <div className="border-t pt-3 space-y-1 text-xs">
                    <span className="text-[10px] text-slate-400 block font-bold">🟢 توضیحات ترخیص و تحویل:</span>
                    <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl italic">
                      {selectedRepair.remarks || 'ترخیص با تایید نهایی بخش ICT.'}
                    </p>
                    <div className="text-[9px] text-slate-400 text-left pt-1">
                      ترخیص نهایی در تاریخ {selectedRepair.completedDate || selectedRepair.requestDate}
                    </div>
                  </div>
                )}

                {/* 7. Action controllers */}
                {canEdit && (
                  <div className="flex items-center gap-2 border-t pt-4">
                    <button
                      onClick={() => handleOpenEdit(selectedRepair)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش اطلاعات</span>
                    </button>
                    <button
                      disabled={isDeletingId === selectedRepair.id}
                      onClick={() => {
                        if (confirm(`آیا از حذف دائم پرونده تعمیرات شماره ${selectedRepair.id} در سیستم مطمئن هستید؟`)) {
                          handleDeleteRepair(selectedRepair.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900 dark:text-rose-400 rounded-xl transition-all cursor-pointer"
                    >
                      {isDeletingId === selectedRepair.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                <Wrench className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                <p className="text-[11px]">جهت بررسی زنجیره تدارکاتی، تامین قطعات اسقاطی و عیب‌یابی هر تجهیز، روی آن کلیک کنید.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Form Drawer Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Content Drawer panel */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="absolute bottom-0 sm:bottom-auto w-full sm:max-w-3xl sm:h-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 rounded-b-none sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span>{editingId ? 'بروزرسانی مشخصات و زنجیره قطعات تعمیرات' : 'ثبت برگه جدید ورود تجهیز به کارگاه تعمیرات'}</span>
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 block text-xs cursor-pointer"
                >
                  انصراف
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4 text-right">
                
                {/* LINE 1: Equipment selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Equipment Code input with list recommendations */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">کد اموال یا شناسه بازسازی:</label>
                    <AutocompleteInput 
                      value={formEqCode}
                      onChange={handleEqCodeChange}
                      options={equipmentOptions}
                      placeholder="مانند C-201"
                      required={true}
                      className="!py-2 !text-xs font-bold text-slate-800 dark:text-slate-200 uppercase rounded-xl"
                    />
                  </div>

                  {/* Auto assigned type */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">نوع وسیله سخت‌افزاری:</label>
                    <select
                      value={formEqType}
                      onChange={(e) => setFormEqType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="case">کیس کامپیوتر</option>
                      <option value="monitor">مانیتور نمایشگر</option>
                      <option value="printer">چاپگر / چندکاره</option>
                      <option value="mouse">ماوس کابل‌دار/بیسیم</option>
                      <option value="keyboard">کیبورد کارگاهی</option>
                      <option value="radio">بی‌سیم دستی کانال‌دار</option>
                    </select>
                  </div>

                  {/* Requester name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">تحویل‌دهنده / متقاضی:</label>
                    <AutocompleteInput 
                      value={formReqName}
                      onChange={setFormReqName}
                      options={personnelOptions}
                      placeholder="نام پرسنل یا واحد کارگاه"
                      className="!py-2 !text-xs rounded-xl"
                    />
                  </div>

                </div>

                {/* LINE 2: Dates and status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Request Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">تاریخ تحویل پرونده (خورشیدی):</label>
                    <input
                      type="text"
                      required
                      placeholder="۱۴۰۵/۰۳/۰۹"
                      value={formReqDate}
                      onChange={(e) => setFormReqDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Current assigned technician */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">تکنسین مسئول تعمیر:</label>
                    <input
                      type="text"
                      placeholder="نام متخصص فنی"
                      value={formTech}
                      onChange={(e) => setFormTech(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>

                  {/* Status SELECT */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-indigo-500 block font-black">وضعیت پیشرفت فرایند:</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-bold text-indigo-900 dark:text-indigo-300 cursor-pointer"
                    >
                      <option value="pending_diagnosis">در انتظار عیب‌یابی اولیه</option>
                      <option value="parts_requested">درخواست خرید قطعات</option>
                      <option value="parts_procured">تامین قطعه سالم از انبار قطعات</option>
                      <option value="completed">تعمیر کامل و ترخیص شده (موفق)</option>
                      <option value="unrepairable_salvage">غیرقابل تعمیر (اسقاط و اوراق)</option>
                    </select>
                  </div>

                </div>

                {/* LINE 3: Text descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">⚠️ شرح دقیق عیب گزارش شدهتوسط کاربر:</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="سیستم روشن نمی‌شود، نویز فن شدید است، مکرراً خاموش می‌شود و ..."
                      value={formIssue}
                      onChange={(e) => setFormIssue(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">🩺 تشخیص مهندسی و اقدامات فنی:</label>
                    <textarea
                      rows={3}
                      placeholder="خازن‌های فیلترینگ آسیب دیده، نیاز به تعویض پاور، نیاز به خمیر سیلیکون نو و ..."
                      value={formDiagnosis}
                      onChange={(e) => setFormDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs resize-none"
                    />
                  </div>

                </div>

                {/* SPECIAL SUB-SECTION: PARTS PROCUREMENT SYSTEM (Warehouse or Salvage Cannibalization) */}
                <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50/30 dark:bg-slate-900/10 space-y-3">
                  <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-300 block border-b pb-1.5 flex items-center justify-between">
                    <span>⚙️ تامین و تدارک قطعات یدکی (Warehouse / Salvage Kanban)</span>
                    <span className="text-[9px] text-slate-400 font-normal">امکان استخراج قطعات سالم از کیس‌های معیوب غیرقابل استفاده</span>
                  </span>

                  {/* Add spare part tool inline */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                    
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] text-slate-400 block font-bold">نام قطعه مورد نیاز:</label>
                      <input
                        type="text"
                        placeholder="مانند رم 8 گیگ DDR4 یا پاور"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-lg text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 block font-bold">محل تامین فیزیکی:</label>
                      <select
                        value={newPartSource}
                        onChange={(e) => setNewPartSource(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-lg text-[11px] cursor-pointer"
                      >
                        <option value="warehouse">انبار قطعات نو</option>
                        <option value="salvage">اسقاط تجهیز معیوب</option>
                      </select>
                    </div>

                    {newPartSource === 'salvage' ? (
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold">کد تجهیز معیوب اسقاطی:</label>
                        <input
                          type="text"
                          placeholder="مانند C-109"
                          value={newPartSalvageCode}
                          onChange={(e) => setNewPartSalvageCode(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900 rounded-lg text-[11px] uppercase"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold">قیمت فاکتور قطعه (ریال):</label>
                        <input
                          type="number"
                          placeholder="مثلاً 1500000"
                          value={newPartCost || ''}
                          onChange={(e) => setNewPartCost(Number(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-lg text-[11px] font-mono"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg h-[32px] cursor-pointer"
                    >
                      افزودن قطعه
                    </button>

                  </div>

                  {/* List of pending / added parts */}
                  {neededParts.length > 0 ? (
                    <div className="space-y-1.5 mt-2">
                      {neededParts.map((part) => (
                        <div key={part.id} className="bg-white dark:bg-slate-950 border border-slate-150 p-2 rounded-lg flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{part.name}</span>
                            <span className="text-[9px] px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">
                              {part.source === 'warehouse' ? 'تامین انبار نو' : `استخراج اسقاطی از اموال ${part.salvageEquipmentCode}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-600">
                              {part.cost > 0 ? `${part.cost.toLocaleString('fa-IR')} ریال` : 'رایگان (اسقاط برچیده شده)'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePart(part.id)}
                              className="text-rose-500 hover:text-rose-700 font-bold px-1 rounded block hover:bg-rose-50 ml-1 leading-none text-xs cursor-pointer"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">هیچ قطعه مصرفی تا این لحظه درج نشده است.</p>
                  )}

                </div>

                {/* LINE 4: Fee and calculated Total cost */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-2 items-center">
                  
                  {/* Expert Fee */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">دستمزد خدمات فنی تعمیرکار (ریال):</label>
                    <input
                      type="number"
                      placeholder="مثلاً 450000"
                      value={formFee || ''}
                      onChange={(e) => setFormFee(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  {/* Calculated summary auto */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">مجموع برآورد هزینه تمام‌شده:</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block h-[38px] flex items-center pr-1 font-mono">
                      {currentTotalCost.toLocaleString('fa-IR')} ریال
                    </span>
                  </div>

                  {/* Date of completion */}
                  {formStatus === 'completed' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-emerald-600 block">تاریخ ترخیص نهایی (خورشیدی):</label>
                      <input
                        type="text"
                        placeholder="۱۴۰۵/۰۳/۱۱"
                        value={formCompletedDate}
                        onChange={(e) => setFormCompletedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  )}

                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">توضیحات نهایی، گارانتی یا نحوه بازسازیتجهیز:</label>
                  <input
                    type="text"
                    placeholder="امور تست انجام گردید و گواهی سلامت برای برچسب صادر شد."
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                {/* Actions bottom */}
                <div className="flex items-center gap-3 border-t pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {isSaving ? 'در حال برقراری ارتباط با سرور...' : (editingId ? 'بروزرسانی نهایی و عیب‌یابی تجهیز' : 'ثبت قطعی پرونده کارگاهی تجهیز')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    بستن فرم
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
