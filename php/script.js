/**
 * Offline-First Client Logic Engine - IT Equipment Tracking System
 * Omran Azarestan Company - Bushehr Workspace
 */

// Global State
let gState = {
    personnel: [],
    cases: [],
    monitors: [],
    printers: [],
    assignments: []
};

// Current Jalali Date helper
function getJalaliDate() {
    // Return standard system date in Jalali format representing year 1405
    return "1405/03/03"; 
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    addAppTabEvents();
    loadAllData();
    updateAddFormFields(); // Initialize Unified Form fields
});

// Real-time Clock Simulator
function initClock() {
    const clockEl = document.getElementById('jalali-clock');
    if (!clockEl) return;
    
    setInterval(() => {
        const d = new Date();
        const hrs = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        clockEl.textContent = `تاریخ: ۱۴۰۵/۰۳/۰۳ | زمان: ${hrs}:${mins}`;
    }, 1000);
}

// Navigation Tab Swapper
function addAppTabEvents() {
    const tabs = document.querySelectorAll('#nav-tabs .nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPaneId = tab.getAttribute('data-tab');
            switchTab(targetPaneId);
        });
    });
}

function switchTab(paneId) {
    // Deactivate all
    document.querySelectorAll('.workspace-area .tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.querySelectorAll('#nav-tabs .nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activate selected
    const targetPane = document.getElementById(paneId);
    if (targetPane) targetPane.classList.add('active');
    
    const targetTabBtn = document.querySelector(`#nav-tabs .nav-tab[data-tab="${paneId}"]`);
    if (targetTabBtn) targetTabBtn.classList.add('active');
}

// Push local toast messages safely
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = "🔔";
    if (type === 'success') icon = "✔️";
    if (type === 'danger') icon = "⚠️";
    if (type === 'warning') icon = "⚡";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Load data from PHP GET endpoint
async function loadAllData() {
    try {
        const response = await fetch('api/get_data.php');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        gState = data;
        
        // Render all tables
        renderPersonnelTable();
        renderCasesTable();
        renderMonitorsTable();
        renderPrintersTable();
        renderHistoryTable();
    } catch (err) {
        console.error('Data loading failure:', err);
        showToast('خطا در بارگذاری اطلاعات از پایگاه داده محلی.', 'danger');
    }
}

// Map assignments helper to find owners and specifications
function getAssignedEquipments(personnelCode) {
    const userCases = gState.cases.filter(c => c.assignedTo === personnelCode);
    const userMonitors = gState.monitors.filter(m => m.assignedTo === personnelCode);
    const userPrinters = gState.printers.filter(p => p.assignedTo === personnelCode);
    
    return {
        cases: userCases,
        monitors: userMonitors,
        printers: userPrinters,
        totalCount: userCases.length + userMonitors.length + userPrinters.length
    };
}

// ----------------------------------------------------
// Table Rendering Engines
// ----------------------------------------------------

function renderPersonnelTable() {
    const tbody = document.getElementById('personnel-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (gState.personnel.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">هیچ پرسنلی در پایگاه داده ثبت نشده است.</td></tr>`;
        return;
    }

    gState.personnel.forEach(p => {
        const assigns = getAssignedEquipments(p.code);
        let equipBadges = '';
        
        assigns.cases.forEach(c => {
            equipBadges += `<span class="badge badge-primary" title="${c.motherboard} | ${c.cpu}">کیس: ${c.code}</span> `;
        });
        assigns.monitors.forEach(m => {
            equipBadges += `<span class="badge badge-success">مانیتور: ${m.code}</span> `;
        });
        assigns.printers.forEach(pr => {
            equipBadges += `<span class="badge badge-warning">چاپگر: ${pr.code}</span> `;
        });

        if (!equipBadges) {
            equipBadges = `<span class="badge badge-secondary">فاقد سخت‌افزار</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td><code>${escapeHtml(p.code)}</code></td>
            <td>${escapeHtml(p.title)}</td>
            <td>${escapeHtml(p.department)}</td>
            <td>${escapeHtml(p.location)}</td>
            <td><div class="equip-badge-row">${equipBadges}</div></td>
            <td>
                <div class="action-links">
                    <button class="btn btn-secondary btn-xs" onclick="openEditItemModal('personnel', '${p.id}')">✏️ ویرایش</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteItemAction('personnel', '${p.id}')">🗑️ حذف</button>
                    <button class="btn btn-indigo btn-xs" onclick="triggerDirectSystemID('${p.code}')">📜 شناسنامه</button>
                    <button class="btn btn-secondary btn-xs" onclick="quickSelectForTransfer('${p.code}')">🔄 انتقال</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCasesTable() {
    const tbody = document.getElementById('cases-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (gState.cases.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">کیسی در سامانه ثبت نشده است.</td></tr>`;
        return;
    }

    gState.cases.forEach(c => {
        let ownerLabel = `<span class="badge badge-secondary">📦 داخل انبار کارگاه</span>`;
        if (c.assignedTo) {
            const user = gState.personnel.find(p => p.code === c.assignedTo);
            ownerLabel = user 
                ? `<span class="badge badge-primary" title="موقعیت: ${user.location}">👥 ${escapeHtml(user.name)} (${user.code})</span>`
                : `<span class="badge badge-warning">کد نامعتبر: ${escapeHtml(c.assignedTo)}</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code><strong>${escapeHtml(c.code)}</strong></code></td>
            <td>${escapeHtml(c.motherboard || '-')}</td>
            <td>${escapeHtml(c.cpu || '-')}</td>
            <td><span class="badge badge-secondary">${escapeHtml(c.ramType || '-')} / ${escapeHtml(c.ramQty || '-')}</span></td>
            <td>${escapeHtml(c.vga || '-')}</td>
            <td>${escapeHtml(c.hdd1 || '-')} | ${escapeHtml(c.hdd2 || '-')}</td>
            <td>${ownerLabel}</td>
            <td>
                <div class="action-links">
                    <button class="btn btn-secondary btn-xs" onclick="openEditItemModal('case', '${c.code}')">✏️ ویرایش</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteItemAction('case', '${c.code}')">🗑️ حذف</button>
                    <button class="btn btn-indigo btn-xs" onclick="quickSelectEquipForTransfer('${c.code}')">🔄 جابجایی</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderMonitorsTable() {
    const tbody = document.getElementById('monitors-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (gState.monitors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">مانیتوری ثبت نشده است.</td></tr>`;
        return;
    }

    gState.monitors.forEach(m => {
        let ownerLabel = `<span class="badge badge-secondary">📦 داخل انبار</span>`;
        if (m.assignedTo) {
            const user = gState.personnel.find(p => p.code === m.assignedTo);
            ownerLabel = user 
                ? `<span class="badge badge-success">👥 ${escapeHtml(user.name)} (${user.code})</span>`
                : `<span class="badge badge-warning">کد نامعتبر: ${escapeHtml(m.assignedTo)}</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code><strong>${escapeHtml(m.code)}</strong></code></td>
            <td>${escapeHtml(m.model || '-')}</td>
            <td>${ownerLabel}</td>
            <td>
                <div class="action-links">
                    <button class="btn btn-secondary btn-xs" onclick="openEditItemModal('monitor', '${m.code}')">✏️ ویرایش</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteItemAction('monitor', '${m.code}')">🗑️ حذف</button>
                    <button class="btn btn-indigo btn-xs" onclick="quickSelectEquipForTransfer('${m.code}')">🔄 جابجایی</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPrintersTable() {
    const tbody = document.getElementById('printers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (gState.printers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">پرینتری ثبت نشده است.</td></tr>`;
        return;
    }

    gState.printers.forEach(pr => {
        let ownerLabel = `<span class="badge badge-secondary">📦 داخل انبار</span>`;
        if (pr.assignedTo) {
            const user = gState.personnel.find(p => p.code === pr.assignedTo);
            ownerLabel = user 
                ? `<span class="badge badge-warning">👥 ${escapeHtml(user.name)} (${user.code})</span>`
                : `<span class="badge badge-warning">کد نامعتبر: ${escapeHtml(pr.assignedTo)}</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code><strong>${escapeHtml(pr.code)}</strong></code></td>
            <td>${escapeHtml(pr.model || '-')}</td>
            <td>${ownerLabel}</td>
            <td>
                <div class="action-links">
                    <button class="btn btn-secondary btn-xs" onclick="openEditItemModal('printer', '${pr.code}')">✏️ ویرایش</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteItemAction('printer', '${pr.code}')">🗑️ حذف</button>
                    <button class="btn btn-indigo btn-xs" onclick="quickSelectEquipForTransfer('${pr.code}')">🔄 جابجایی</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderHistoryTable() {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (gState.assignments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">سابقه و تاریخچه جابجایی یافت نشد.</td></tr>`;
        return;
    }

    // Sort: newest first
    const sorted = [...gState.assignments].reverse();

    sorted.forEach(ass => {
        let typeBadge = '';
        if (ass.equipmentType === 'case') typeBadge = `<span class="badge badge-primary">🖥️ کیس</span>`;
        if (ass.equipmentType === 'monitor') typeBadge = `<span class="badge badge-success">📺 مانیتور</span>`;
        if (ass.equipmentType === 'printer') typeBadge = `<span class="badge badge-warning">🖨️ پرینتر</span>`;

        const isCurrent = ass.endDate === null || ass.endDate === '';
        const statusBadge = isCurrent 
            ? `<span class="badge badge-success">فعلی (تحت اختیار)</span>`
            : `<span class="badge badge-danger">استرداد / عودت شده</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${typeBadge}</td>
            <td><code><strong>${escapeHtml(ass.equipmentCode)}</strong></code></td>
            <td><strong>${escapeHtml(ass.personnelName || 'انبار مرکزی کارگاه')}</strong></td>
            <td><code>${escapeHtml(ass.personnelCode || '-')}</code></td>
            <td>${escapeHtml(ass.startDate)}</td>
            <td>${isCurrent ? '-' : escapeHtml(ass.endDate)}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Quick trigger shortcuts
function triggerDirectSystemID(persCode) {
    switchTab('reporting-tab');
    document.getElementById('cert-personnel-code').value = persCode;
    generateSystemCertificate();
}

function quickSelectForTransfer(persCode) {
    switchTab('transfer-tab');
    document.getElementById('tx-personnel-code').value = persCode;
    previewPersonnelForTransfer();
}

function quickSelectEquipForTransfer(equipCode) {
    switchTab('transfer-tab');
    document.getElementById('tx-equipment-code').value = equipCode;
    previewEquipmentForTransfer();
}

// ----------------------------------------------------
// Unified Creator form (TAB 9)
// ----------------------------------------------------

function updateAddFormFields() {
    const type = document.getElementById('add-item-type').value;
    const container = document.getElementById('dynamic-add-fields');
    if (!container) return;

    if (type === 'personnel') {
        container.innerHTML = `
            <div class="form-group">
                <label>نام کامل پرسنل (نام و نام خانوادگی):</label>
                <input type="text" id="add-pers-name" placeholder="مثال: رضا محمدی..." required>
            </div>
            <div class="form-group">
                <label>کد پرسنلی (یکتا):</label>
                <input type="text" id="add-pers-code" placeholder="مثال: 1003..." required>
            </div>
            <div class="form-group">
                <label>سمت سازمانی / شغل:</label>
                <input type="text" id="add-pers-title" placeholder="کارشناس فرآیند، سرپرست کارگاه و...">
            </div>
            <div class="form-group">
                <label>بخش و واحد خدمتی:</label>
                <input type="text" id="add-pers-dept" placeholder="خرید، کنترل پروژه، ابزار دقیق و...">
            </div>
            <div class="form-group">
                <label>موقعیت استقرار در کارگاه بوشهر:</label>
                <input type="text" id="add-pers-location" placeholder="کانکس فنی، اتاق سرور و...">
            </div>
        `;
    } else if (type === 'case') {
        container.innerHTML = `
            <div class="form-group">
                <label>کد اموال یا سریال کیس (یکتا):</label>
                <input type="text" id="add-case-code" placeholder="مثال: C-203..." required>
            </div>
            <div class="form-group">
                <label>برد اصلی (Motherboard):</label>
                <input type="text" id="add-case-mb" placeholder="مثال: ASUS PRIME H610M-K...">
            </div>
            <div class="form-group">
                <label>پردازنده (CPU):</label>
                <input type="text" id="add-case-cpu" placeholder="مثال: Intel Core i5-12400F...">
            </div>
            <div class="form-group">
                <label>رم - نوع حافظه (RAM Type):</label>
                <input type="text" id="add-case-ramtype" placeholder="مثال: DDR4...">
            </div>
            <div class="form-group">
                <label>رم - ظرفیت (RAM Size):</label>
                <input type="text" id="add-case-ramqty" placeholder="مثال: 16GB...">
            </div>
            <div class="form-group">
                <label>کارت گرافیک (VGA):</label>
                <input type="text" id="add-case-vga" placeholder="مثال: NVIDIA GTX 1650 4GB...">
            </div>
            <div class="form-group">
                <label>فضای ذخیره‌سازی اول (SSD/HDD):</label>
                <input type="text" id="add-case-hdd1" placeholder="مثال: SSD 512GB NVMe..." required>
            </div>
            <div class="form-group">
                <label>فضای ذخیره‌سازی ثانویه (SSD/HDD):</label>
                <input type="text" id="add-case-hdd2" placeholder="چنانچه نصب نشده، علامت خط تیره - درج شود...">
            </div>
        `;
    } else if (type === 'monitor') {
        container.innerHTML = `
            <div class="form-group">
                <label>کد اموال مانیتور (یکتا):</label>
                <input type="text" id="add-mon-code" placeholder="مثال: M-303..." required>
            </div>
            <div class="form-group">
                <label>مدل و مشخصات فنی مانیتور:</label>
                <input type="text" id="add-mon-model" placeholder="مثال: Samsung 24\" FHD FT350..." required>
            </div>
        `;
    } else if (type === 'printer') {
        container.innerHTML = `
            <div class="form-group">
                <label>کد اموال پرینتر (یکتا):</label>
                <input type="text" id="add-printer-code" placeholder="مثال: P-403..." required>
            </div>
            <div class="form-group">
                <label>مدل و مشخصات چاپگر:</label>
                <input type="text" id="add-printer-model" placeholder="مثال: HP LaserJet M402dne..." required>
            </div>
        `;
    }
}

async function submitAddNewItem() {
    const type = document.getElementById('add-item-type').value;
    let payload = { type: type };

    if (type === 'personnel') {
        const name = document.getElementById('add-pers-name').value.trim();
        const code = document.getElementById('add-pers-code').value.trim();
        const title = document.getElementById('add-pers-title').value.trim();
        const dept = document.getElementById('add-pers-dept').value.trim();
        const loc = document.getElementById('add-pers-location').value.trim();

        if (!name || !code) {
            showToast('کد پرسنلی و نام کامل الزامی می‌باشد.', 'danger');
            return;
        }

        payload = { ...payload, name, code, title, department: dept, location: loc };
    } else if (type === 'case') {
        const code = document.getElementById('add-case-code').value.trim();
        const mb = document.getElementById('add-case-mb').value.trim();
        const cpu = document.getElementById('add-case-cpu').value.trim();
        const ramtype = document.getElementById('add-case-ramtype').value.trim();
        const ramqty = document.getElementById('add-case-ramqty').value.trim();
        const vga = document.getElementById('add-case-vga').value.trim();
        const hdd1 = document.getElementById('add-case-hdd1').value.trim();
        const hdd2 = document.getElementById('add-case-hdd2').value.trim();

        if (!code || !hdd1) {
            showToast('درج کد کیس و فضای هارد برای ذخیره‌سازی الزامی است.', 'danger');
            return;
        }

        payload = { ...payload, code, motherboard: mb, cpu, ramType: ramtype, ramQty: ramqty, vga, hdd1, hdd2, assignedTo: null };
    } else if (type === 'monitor') {
        const code = document.getElementById('add-mon-code').value.trim();
        const model = document.getElementById('add-mon-model').value.trim();

        if (!code || !model) {
            showToast('درج کد اموال و مدل مانیتور الزامی است.', 'danger');
            return;
        }

        payload = { ...payload, code, model, assignedTo: null };
    } else if (type === 'printer') {
        const code = document.getElementById('add-printer-code').value.trim();
        const model = document.getElementById('add-printer-model').value.trim();

        if (!code || !model) {
            showToast('درج کد اموال و مدل پرینتر الزامی است.', 'danger');
            return;
        }

        payload = { ...payload, code, model, assignedTo: null };
    }

    try {
        const res = await fetch('api/save_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const resData = await res.json();
        
        if (!res.ok) {
            throw new Error(resData.error || 'خطا در شبکه');
        }

        showToast('آیتم جدید با موفقیت ثبت پایگاه داده گردید.');
        loadAllData();
        
        // Return to appropriate tab view
        if (type === 'personnel') switchTab('personnel-tab');
        if (type === 'case') switchTab('cases-tab');
        if (type === 'monitor') switchTab('monitors-tab');
        if (type === 'printer') switchTab('printers-tab');
        
    } catch (err) {
        showToast(err.message || 'ثبت با خطا مواجه شد. لطفاً بررسی کنید کدهای وارد شده تکراری نباشند.', 'danger');
    }
}

// ----------------------------------------------------
// Deleting Items Handler
// ----------------------------------------------------

async function deleteItemAction(type, id) {
    if (!confirm('آیا از حذف کامل این آیتم از پایگاه اطلاعاتی مطمئن هستید؟ این امر ممکن است تخصیص‌ها را باطل کند.')) {
        return;
    }

    try {
        const res = await fetch('api/delete_item.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id, today: getJalaliDate() })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'حذف ناموفق');

        showToast('آیتم مزبور با موفقیت حذف شده و تاریخچه تخصیص آن بسته گردید.');
        loadAllData();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// ----------------------------------------------------
// Editing Items (Modals)
// ----------------------------------------------------
let gActiveEditType = '';
let gActiveEditId = '';

function openEditItemModal(type, lookupId) {
    gActiveEditType = type;
    gActiveEditId = lookupId;

    const modal = document.getElementById('edit-modal');
    const titleEl = document.getElementById('edit-modal-title');
    const container = document.getElementById('edit-modal-fields-container');
    
    if (!modal || !container) return;

    modal.classList.remove('hidden');

    if (type === 'personnel') {
        const item = gState.personnel.find(p => p.id === lookupId);
        titleEl.textContent = '✏️ ویرایش مشخصات پرسنلی';
        container.innerHTML = `
            <div class="form-group">
                <label>نام کامل پرسنل:</label>
                <input type="text" id="edit-p-name" value="${escapeHtml(item.name)}">
            </div>
            <div class="form-group">
                <label>کد پرسنلی:</label>
                <input type="text" id="edit-p-code" value="${escapeHtml(item.code)}">
            </div>
            <div class="form-group">
                <label>سمت:</label>
                <input type="text" id="edit-p-title" value="${escapeHtml(item.title)}">
            </div>
            <div class="form-group">
                <label>واحد خدمتی:</label>
                <input type="text" id="edit-p-dept" value="${escapeHtml(item.department)}">
            </div>
            <div class="form-group">
                <label>موقعیت استقرار در بوشهر:</label>
                <input type="text" id="edit-p-loc" value="${escapeHtml(item.location)}">
            </div>
        `;
    } else if (type === 'case') {
        const item = gState.cases.find(c => c.code === lookupId);
        titleEl.textContent = '✏️ ویرایش مشخصات سخت‌افزاری کیس';
        container.innerHTML = `
            <div class="form-group">
                <label>کد کیس (اموال):</label>
                <input type="text" id="edit-c-code" value="${escapeHtml(item.code)}">
            </div>
            <div class="form-group">
                <label>مادربورد:</label>
                <input type="text" id="edit-c-mb" value="${escapeHtml(item.motherboard)}">
            </div>
            <div class="form-group">
                <label>پردازنده (CPU):</label>
                <input type="text" id="edit-c-cpu" value="${escapeHtml(item.cpu)}">
            </div>
            <div class="form-group">
                <label>نوع رم:</label>
                <input type="text" id="edit-c-ramtype" value="${escapeHtml(item.ramType)}">
            </div>
            <div class="form-group">
                <label>مقدار فرکانس/ظرفیت رم:</label>
                <input type="text" id="edit-c-ramqty" value="${escapeHtml(item.ramQty)}">
            </div>
            <div class="form-group">
                <label>گرافیک VGA:</label>
                <input type="text" id="edit-c-vga" value="${escapeHtml(item.vga)}">
            </div>
            <div class="form-group">
                <label>هارد اصلی SSD/HDD:</label>
                <input type="text" id="edit-c-hdd1" value="${escapeHtml(item.hdd1)}">
            </div>
            <div class="form-group">
                <label>هارد دوم SSD/HDD:</label>
                <input type="text" id="edit-c-hdd2" value="${escapeHtml(item.hdd2)}">
            </div>
        `;
    } else if (type === 'monitor') {
        const item = gState.monitors.find(m => m.code === lookupId);
        titleEl.textContent = '✏️ ویرایش مشخصات مانیتور';
        container.innerHTML = `
            <div class="form-group">
                <label>کد مانیتور (اموال):</label>
                <input type="text" id="edit-m-code" value="${escapeHtml(item.code)}">
            </div>
            <div class="form-group">
                <label>مدل و مشخصات فنی:</label>
                <input type="text" id="edit-m-model" value="${escapeHtml(item.model)}">
            </div>
        `;
    } else if (type === 'printer') {
        const item = gState.printers.find(pr => pr.code === lookupId);
        titleEl.textContent = '✏️ ویرایش مشخصات پرینتر';
        container.innerHTML = `
            <div class="form-group">
                <label>کد پرینتر:</label>
                <input type="text" id="edit-pr-code" value="${escapeHtml(item.code)}">
            </div>
            <div class="form-group">
                <label>مدل و مشخصات فنی چاپگر:</label>
                <input type="text" id="edit-pr-model" value="${escapeHtml(item.model)}">
            </div>
        `;
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.classList.add('hidden');
    gActiveEditType = '';
    gActiveEditId = '';
}

async function submitEditItem() {
    let payload = { type: gActiveEditType, id: gActiveEditId, isEdit: true };

    if (gActiveEditType === 'personnel') {
        const name = document.getElementById('edit-p-name').value.trim();
        const code = document.getElementById('edit-p-code').value.trim();
        const title = document.getElementById('edit-p-title').value.trim();
        const dept = document.getElementById('edit-p-dept').value.trim();
        const loc = document.getElementById('edit-p-loc').value.trim();

        if (!name || !code) {
            showToast('کد و نام پرسنل الزامی است.', 'danger');
            return;
        }
        payload = { ...payload, name, code, title, department: dept, location: loc };
    } else if (gActiveEditType === 'case') {
        const code = document.getElementById('edit-c-code').value.trim();
        const mb = document.getElementById('edit-c-mb').value.trim();
        const cpu = document.getElementById('edit-c-cpu').value.trim();
        const ramtype = document.getElementById('edit-c-ramtype').value.trim();
        const ramqty = document.getElementById('edit-c-ramqty').value.trim();
        const vga = document.getElementById('edit-c-vga').value.trim();
        const hdd1 = document.getElementById('edit-c-hdd1').value.trim();
        const hdd2 = document.getElementById('edit-c-hdd2').value.trim();

        if (!code) {
            showToast('درج کد اموال الزامی است.', 'danger');
            return;
        }
        payload = { ...payload, code, oldCode: gActiveEditId, motherboard: mb, cpu, ramType: ramtype, ramQty: ramqty, vga, hdd1, hdd2 };
    } else if (gActiveEditType === 'monitor') {
        const code = document.getElementById('edit-m-code').value.trim();
        const model = document.getElementById('edit-m-model').value.trim();

        if (!code || !model) {
            showToast('پر کردن همه فیلدها الزامی است.', 'danger');
            return;
        }
        payload = { ...payload, code, oldCode: gActiveEditId, model };
    } else if (gActiveEditType === 'printer') {
        const code = document.getElementById('edit-pr-code').value.trim();
        const model = document.getElementById('edit-pr-model').value.trim();

        if (!code || !model) {
            showToast('پر کردن کلیه فیلدها الزامی است.', 'danger');
            return;
        }
        payload = { ...payload, code, oldCode: gActiveEditId, model };
    }

    try {
        const res = await fetch('api/save_data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'خطا در ویرایش');

        showToast('آیتم مد نظر با موفقیت بروزرسانی شد.');
        closeEditModal();
        loadAllData();
    } catch (err) {
        showToast(err.message, 'danger');
    }
}


// ----------------------------------------------------
// Intelligent Equipment Transfer (TAB 5)
// ----------------------------------------------------
let gTransferEquipmentType = null;
let gTransferEquipmentObj = null;
let gTransferTargetPersonnel = null;

function previewEquipmentForTransfer() {
    const code = document.getElementById('tx-equipment-code').value.trim().toUpperCase();
    const previewBox = document.getElementById('tx-eq-preview');
    
    // Elements
    const pCode = document.getElementById('p-eq-code');
    const pType = document.getElementById('p-eq-type');
    const pInfo = document.getElementById('p-eq-info');
    const pOwner = document.getElementById('p-eq-owner');

    if (!code) {
        previewBox.classList.add('hidden');
        gTransferEquipmentObj = null;
        gTransferEquipmentType = null;
        return;
    }

    // Search in Case, Monitor, Printer
    let found = false;
    
    // 1. Cases
    const cItem = gState.cases.find(c => c.code.toUpperCase() === code);
    if (cItem) {
        gTransferEquipmentObj = cItem;
        gTransferEquipmentType = 'case';
        pType.textContent = '🖥️ کیس رایانه';
        pType.className = 'badge badge-primary';
        pInfo.textContent = `${cItem.motherboard} / ${cItem.cpu} / RAM: ${cItem.ramQty}`;
        found = true;
    }

    // 2. Monitors
    if (!found) {
        const mItem = gState.monitors.find(m => m.code.toUpperCase() === code);
        if (mItem) {
            gTransferEquipmentObj = mItem;
            gTransferEquipmentType = 'monitor';
            pType.textContent = '📺 مانیتور';
            pType.className = 'badge badge-success';
            pInfo.textContent = mItem.model;
            found = true;
        }
    }

    // 3. Printers
    if (!found) {
        const prItem = gState.printers.find(p => p.code.toUpperCase() === code);
        if (prItem) {
            gTransferEquipmentObj = prItem;
            gTransferEquipmentType = 'printer';
            pType.textContent = '🖨️ پرینتر/چاپگر';
            pType.className = 'badge badge-warning';
            pInfo.textContent = prItem.model;
            found = true;
        }
    }

    if (found) {
        pCode.textContent = gTransferEquipmentObj.code;
        previewBox.classList.remove('hidden');
        
        if (gTransferEquipmentObj.assignedTo) {
            const user = gState.personnel.find(p => p.code === gTransferEquipmentObj.assignedTo);
            pOwner.innerHTML = user 
                ? `👥 ${escapeHtml(user.name)} (${user.code}) - مستقر در ${escapeHtml(user.location)}`
                : `کد دارنده: ${escapeHtml(gTransferEquipmentObj.assignedTo)}`;
            pOwner.className = "text-danger font-bold";
        } else {
            pOwner.textContent = '📦 تحویل نشده (داخل انبار کارگاه)';
            pOwner.className = "text-success font-bold";
        }
    } else {
        previewBox.classList.add('hidden');
        gTransferEquipmentObj = null;
        gTransferEquipmentType = null;
    }
}

function previewPersonnelForTransfer() {
    const code = document.getElementById('tx-personnel-code').value.trim();
    const previewBox = document.getElementById('tx-p-preview');
    
    const pName = document.getElementById('p-pers-name');
    const pTitle = document.getElementById('p-pers-title');
    const pDept = document.getElementById('p-pers-dept');
    const pLoc = document.getElementById('p-pers-loc');

    if (!code) {
        previewBox.classList.add('hidden');
        gTransferTargetPersonnel = null;
        return;
    }

    const p = gState.personnel.find(pers => pers.code === code);
    
    if (p) {
        gTransferTargetPersonnel = p;
        pName.textContent = p.name;
        pTitle.textContent = p.title || '-';
        pDept.textContent = p.department || '-';
        pLoc.textContent = p.location || '-';
        previewBox.classList.remove('hidden');
    } else {
        previewBox.classList.add('hidden');
        gTransferTargetPersonnel = null;
    }
}

// Perform Transfer action call
async function executeTransferAction() {
    if (!gTransferEquipmentObj) {
        showToast('لطفا کد اموال محصول معتبری جهت جابجایی وارد نمایید.', 'danger');
        return;
    }

    const targetCode = document.getElementById('tx-personnel-code').value.trim();
    
    if (!targetCode) {
        showToast('جهت انتقال لطفا کد پرسنلی تحویل گیرنده را وارد نمایید. (برای خروج به انبار از دکمه دیگر استفاده کنید)', 'danger');
        return;
    }

    if (!gTransferTargetPersonnel) {
        showToast('پرسنل هدفی با این کد پرسنلی یافت نشد.', 'danger');
        return;
    }

    try {
        const res = await fetch('api/transfer.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                equipmentCode: gTransferEquipmentObj.code,
                targetPersonnelCode: targetCode,
                today: getJalaliDate()
            })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'جابجایی با شکست مواجه شد');

        showToast(`تجهیز مظهر با موفقیت به نام آقای/خانم ${resData.newOwnerName} تخصیص یافت.`);
        
        // Reset inputs
        document.getElementById('tx-equipment-code').value = '';
        document.getElementById('tx-personnel-code').value = '';
        document.getElementById('tx-eq-preview').classList.add('hidden');
        document.getElementById('tx-p-preview').classList.add('hidden');
        
        loadAllData();
        switchTab('history-tab');
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// Return directly to Central Workshop Warehouse
async function executeReturnToWarehouse() {
    if (!gTransferEquipmentObj) {
        showToast('لطفا ابتدا کد اموال یک تجهیز را برای خروج از حساب پرسنلی وارد نمایید.', 'danger');
        return;
    }

    if (!gTransferEquipmentObj.assignedTo) {
        showToast('این کالا در حال حاضر هم در انبار کارگاه مستقر بوده و به هیچ شخصی تحویل نگردیده است.', 'warning');
        return;
    }

    if (!confirm(`آیا مطمئن هستید که می‌خواهید تجهیز ${gTransferEquipmentObj.code} را از پرونده پرسنلی کاربر فعلی ترخیص و عودت به انبار نمایید؟`)) {
        return;
    }

    try {
        const res = await fetch('api/transfer.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                equipmentCode: gTransferEquipmentObj.code,
                targetPersonnelCode: 'warehouse',
                today: getJalaliDate()
            })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'عودت با شکست مواجه شد');

        showToast(`کالا با موفقیت از حساب جداگانه استرداد و به آلبوم انبار مرکزی عودت داده شد.`);
        
        document.getElementById('tx-equipment-code').value = '';
        document.getElementById('tx-personnel-code').value = '';
        document.getElementById('tx-eq-preview').classList.add('hidden');
        document.getElementById('tx-p-preview').classList.add('hidden');
        
        loadAllData();
        switchTab('history-tab');
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

// ----------------------------------------------------
// Instant Real-Time Search UI Filter (Global search)
// ----------------------------------------------------

function handleGlobalSearch() {
    const query = document.getElementById('global-search').value.toLowerCase().trim();
    const panel = document.getElementById('search-results-container');
    const list = document.getElementById('search-results-list');
    const clearBtn = document.getElementById('clear-search-btn');

    if (!query) {
        panel.classList.add('hidden');
        clearBtn.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'block';
    list.innerHTML = '';
    let matches = [];

    // 1. Search Personnel
    gState.personnel.forEach(p => {
        if (p.name.toLowerCase().includes(query) || p.code.includes(query) || (p.title && p.title.toLowerCase().includes(query))) {
            matches.push({ type: 'personnel', label: '👥 پرسنل سازمانی', title: p.name, desc: `کد پرسنلی: ${p.code} | واحد: ${p.department} | محل: ${p.location}`, raw: p });
        }
    });

    // 2. Search Cases
    gState.cases.forEach(c => {
        if (c.code.toLowerCase().includes(query) || (c.motherboard && c.motherboard.toLowerCase().includes(query)) || (c.cpu && c.cpu.toLowerCase().includes(query))) {
            const hasOwner = c.assignedTo ? `تحویل پرسنل: ${c.assignedTo}` : 'مستقر در انبار';
            matches.push({ type: 'case', label: '🖥️ کیس کامپیوتر', title: `کیس ${c.code}`, desc: `مادربورد: ${c.motherboard} | پردازنده: ${c.cpu} | وضعیت: ${hasOwner}`, raw: c });
        }
    });

    // 3. Search Monitors
    gState.monitors.forEach(m => {
        if (m.code.toLowerCase().includes(query) || (m.model && m.model.toLowerCase().includes(query))) {
            const hasOwner = m.assignedTo ? `تحویل پرسنل: ${m.assignedTo}` : 'مستقر در انبار';
            matches.push({ type: 'monitor', label: '📺 مانیتور سخت‌افزاری', title: `مانیتور ${m.code}`, desc: `مدل: ${m.model} | وضیعت: ${hasOwner}`, raw: m });
        }
    });

    // 4. Search Printers
    gState.printers.forEach(pr => {
        if (pr.code.toLowerCase().includes(query) || (pr.model && pr.model.toLowerCase().includes(query))) {
            const hasOwner = pr.assignedTo ? `تحویل پرسنل: ${pr.assignedTo}` : 'مستقر در انبار';
            matches.push({ type: 'printer', label: '🖨️ پرینتر چاپگر', title: `پرینتر ${pr.code}`, desc: `مدل: ${pr.model} | وضعیت: ${hasOwner}`, raw: pr });
        }
    });

    if (matches.length === 0) {
        list.innerHTML = `<p class="col-span-full text-center text-muted text-xs">هیچ رکوردی منطبق با عبارت «${escapeHtml(query)}» پیدا نشد.</p>`;
    } else {
        matches.forEach(item => {
            const card = document.createElement('div');
            card.className = 'search-card';
            
            let actionBtn = '';
            if (item.type === 'personnel') {
                actionBtn = `<button class="btn btn-xs btn-indigo" onclick="triggerDirectSystemID('${item.raw.code}')">مشاهده شناسنامه</button>`;
            } else {
                actionBtn = `<button class="btn btn-xs btn-success" onclick="quickSelectEquipForTransfer('${item.raw.code}')">انتقال فوری</button>`;
            }

            card.innerHTML = `
                <div class="search-card-header">
                    <span>${item.label}</span>
                    <code>${item.raw.code || item.raw.id}</code>
                </div>
                <div style="font-size:12px; margin-bottom:8px;">
                    <strong>${escapeHtml(item.title)}</strong><br>
                    <span class="text-muted">${escapeHtml(item.desc)}</span>
                </div>
                <div style="text-align:left;">
                    ${actionBtn}
                </div>
            `;
            list.appendChild(card);
        });
    }

    panel.classList.remove('hidden');
}

function clearSearchInput() {
    document.getElementById('global-search').value = '';
    handleGlobalSearch();
}

function closeSearchPanel() {
    document.getElementById('search-results-container').classList.add('hidden');
}


// ----------------------------------------------------
// Advanced Reporting (TAB 7)
// ----------------------------------------------------

function generateGeneralReport() {
    const secPers = document.getElementById('rep-sec-personnel').checked;
    const secCases = document.getElementById('rep-sec-cases').checked;
    const secMons = document.getElementById('rep-sec-monitors').checked;
    const secPris = document.getElementById('rep-sec-printers').checked;
    const secHis = document.getElementById('rep-sec-history').checked;

    const filterPers = document.getElementById('rep-filter-personnel').value.trim().toLowerCase();
    const filterEquip = document.getElementById('rep-filter-equipment').value.trim().toUpperCase();
    
    const dateFrom = document.getElementById('rep-date-from').value.trim();
    const dateTo = document.getElementById('rep-date-to').value.trim();

    const outputEl = document.getElementById('report-rendered-output');
    if (!outputEl) return;
    
    let html = `
        <div style="text-align:center; border-bottom:3px double #000000; padding-bottom:12px; margin-bottom:20px;">
            <h2>گزارش جامع و تخصصی تجهیزات کل کارگاه</h2>
            <h3>شرکت عمران آذرستان - واحد فناوری اطلاعات و ارتباطات</h3>
            <p style="font-size:11px; margin-top:5px; color:#475569;">تاریخ خروجی: ۱۴۰۵/۰۳/۰۳ | فیلتر اعمال شده: بر اساس درخواست کاربر</p>
        </div>
    `;

    // 1. Personnel Table report
    if (secPers) {
        html += `<h4>👥 گزارش پرسنلی</h4>`;
        let filtered = gState.personnel;
        if (filterPers) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(filterPers) || p.code.includes(filterPers));
        }
        
        if (filtered.length === 0) {
            html += `<p class="text-muted text-xs">کادری یافت نشد.</p>`;
        } else {
            html += `
                <table class="cert-table" style="margin-bottom:20px;">
                    <thead>
                        <tr>
                            <th>نام کامل</th>
                            <th>کد پرسنلی</th>
                            <th>سمت سازمانی</th>
                            <th>بخش خدمتی</th>
                            <th>موقعیت استقرار</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            filtered.forEach(p => {
                html += `
                    <tr>
                        <td><strong>${escapeHtml(p.name)}</strong></td>
                        <td><code>${escapeHtml(p.code)}</code></td>
                        <td>${escapeHtml(p.title)}</td>
                        <td>${escapeHtml(p.department)}</td>
                        <td>${escapeHtml(p.location)}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        }
    }

    // 2. Cases list
    if (secCases) {
        html += `<h4>🖥️ گزارش کیس‌های سخت‌افزاری</h4>`;
        let filtered = gState.cases;
        if (filterEquip) {
            filtered = filtered.filter(c => c.code.toUpperCase().includes(filterEquip));
        }

        if (filtered.length === 0) {
            html += `<p class="text-muted text-xs">کیسی یافت نشد.</p>`;
        } else {
            html += `
                <table class="cert-table" style="margin-bottom:20px;">
                    <thead>
                        <tr>
                            <th>کد کیس</th>
                            <th>مادربورد</th>
                            <th>پردازنده CPU</th>
                            <th>رم RAM</th>
                            <th>گرافیک/VGA</th>
                            <th>دیسک‌ها</th>
                            <th>کاربر تخصیص یافته</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            filtered.forEach(c => {
                html += `
                    <tr>
                        <td><code>${escapeHtml(c.code)}</code></td>
                        <td>${escapeHtml(c.motherboard)}</td>
                        <td>${escapeHtml(c.cpu)}</td>
                        <td>${escapeHtml(c.ramType)} / ${escapeHtml(c.ramQty)}</td>
                        <td>${escapeHtml(c.vga)}</td>
                        <td>${escapeHtml(c.hdd1)} | ${escapeHtml(c.hdd2)}</td>
                        <td>${escapeHtml(c.assignedTo || 'داخل انبار کارگاه')}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        }
    }

    // 3. Monitors
    if (secMons) {
        html += `<h4>📺 گزارش تفصیلی مانیتورها</h4>`;
        let filtered = gState.monitors;
        if (filterEquip) {
            filtered = filtered.filter(m => m.code.toUpperCase().includes(filterEquip));
        }

        if (filtered.length === 0) {
            html += `<p class="text-muted text-xs">رکوردی یافت نشد.</p>`;
        } else {
            html += `
                <table class="cert-table" style="margin-bottom:20px;">
                    <thead>
                        <tr>
                            <th>کد مانیتور</th>
                            <th>مدل</th>
                            <th>صاحب فتوولتائیک</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            filtered.forEach(m => {
                html += `
                    <tr>
                        <td><code>${escapeHtml(m.code)}</code></td>
                        <td>${escapeHtml(m.model)}</td>
                        <td>${escapeHtml(m.assignedTo || 'انبار')}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        }
    }

    // 4. Printers
    if (secPris) {
        html += `<h4>🖨️ گزارش پرینترها</h4>`;
        let filtered = gState.printers;
        if (filterEquip) {
            filtered = filtered.filter(pr => pr.code.toUpperCase().includes(filterEquip));
        }

        if (filtered.length === 0) {
            html += `<p class="text-muted text-xs">رکوردی یافت نشد.</p>`;
        } else {
            html += `
                <table class="cert-table" style="margin-bottom:20px;">
                    <thead>
                        <tr>
                            <th>کد پرینتر</th>
                            <th>مدل</th>
                            <th>تحویل به</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            filtered.forEach(pr => {
                html += `
                    <tr>
                        <td><code>${escapeHtml(pr.code)}</code></td>
                        <td>${escapeHtml(pr.model)}</td>
                        <td>${escapeHtml(pr.assignedTo || 'انبار')}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        }
    }

    // 5. History Reports
    if (secHis) {
        html += `<h4>📜 گزارش کل جابجایی ها</h4>`;
        let filtered = gState.assignments;
        
        // Date from-to range parse
        if (dateFrom) {
            filtered = filtered.filter(ass => ass.startDate >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(ass => (ass.endDate || '1405/12/29') <= dateTo);
        }

        if (filtered.length === 0) {
            html += `<p class="text-muted text-xs">سابقه جابجایی با شرایط فوق یافت نشد.</p>`;
        } else {
            html += `
                <table class="cert-table">
                    <thead>
                        <tr>
                            <th>تجهیز</th>
                            <th>کد سخت‌افزار</th>
                            <th>تحویل گیرنده</th>
                            <th>شروع</th>
                            <th>پایان</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            filtered.forEach(ass => {
                html += `
                    <tr>
                        <td>${escapeHtml(ass.equipmentType)}</td>
                        <td><code>${escapeHtml(ass.equipmentCode)}</code></td>
                        <td>${escapeHtml(ass.personnelName || 'انبار')}</td>
                        <td>${escapeHtml(ass.startDate)}</td>
                        <td>${ass.endDate ? escapeHtml(ass.endDate) : 'فعلی'}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        }
    }

    outputEl.innerHTML = html;
}

// System Certificate generation (Official Profiling Form)
function generateSystemCertificate() {
    const code = document.getElementById('cert-personnel-code').value.trim();
    const outputEl = document.getElementById('report-rendered-output');
    if (!outputEl) return;

    if (!code) {
        showToast('لطفاً جهت صدور شناسنامه، ابتدا کد پرسنلی معتبری درج نمایید.', 'warning');
        return;
    }

    const pers = gState.personnel.find(p => p.code === code);
    if (!pers) {
        showToast('پرسنلی با این کد پرسنلی در پایگاه داده یافت نگردید.', 'danger');
        return;
    }

    const assigns = getAssignedEquipments(code);
    
    let html = `
        <div class="system-cert-sheet">
            <!-- Cert Top Header -->
            <div class="cert-header">
                <div class="cert-header-right">
                    <div class="cert-logo">🏭</div>
                    <div class="cert-title-block">
                        <h2>شرکت عمران آذرستان</h2>
                        <h3>کارگاه بوشهر | واحد فناوری اطلاعات و ارتباطات (ICT)</h3>
                    </div>
                </div>
                <div class="cert-header-left">
                    <div>شماره سند: ICT-FA-${code}</div>
                    <div>تاریخ صدور: ۱۴۰۵/۰۳/۰۳</div>
                    <div>وضعیت: تایید نهایی آفلاین</div>
                </div>
            </div>

            <!-- Main Title Banner -->
            <div class="cert-main-title">
                فرم شناسنامه سیستم و واگذاری تجهیزات رایانه‌ای
            </div>

            <!-- Block 1: User details -->
            <h4 style="margin: 10px 0 5px 0; font-weight:bold;">۱. مشخصات کامل تحویل‌گیرنده کارتابل:</h4>
            <table class="cert-table">
                <tr>
                    <td style="width:15%; font-weight:bold;">نام و نام خانوادگی:</td>
                    <td style="width:35%;"><strong>${escapeHtml(pers.name)}</strong></td>
                    <td style="width:15%; font-weight:bold;">کد پرسنلی:</td>
                    <td style="width:35%;"><code>${escapeHtml(pers.code)}</code></td>
                </tr>
                <tr>
                    <td style="font-weight:bold;">سمت سازمانی:</td>
                    <td>${escapeHtml(pers.title || 'کارشناس')}</td>
                    <td style="font-weight:bold;">بخش/واحد خدمتی:</td>
                    <td>${escapeHtml(pers.department || 'کارگاه')}</td>
                </tr>
                <tr>
                    <td style="font-weight:bold;">موقعیت استقرار:</td>
                    <td colspan="3">${escapeHtml(pers.location || 'دفتر کارگاه')}</td>
                </tr>
            </table>

            <!-- Block 2: Assigned equipment specifications details -->
            <h4 style="margin: 15px 0 5px 0; font-weight:bold;">۲. مشخصات سخت‌افزاری و قطعات سیستم واگذار شده:</h4>
    `;

    if (assigns.totalCount === 0) {
        html += `<p style="text-align:center; padding: 20px; border:1px dashed #000; font-size:12px;"><strong>به این شخص در حال حاضر هیچ‌گونه تجهیزاتی (کیس، مانیتور یا پرینتر) تخصیص نیافته است.</strong></p>`;
    } else {
        // Render cases details
        assigns.cases.forEach(c => {
            html += `
                <table class="cert-table" style="margin-bottom:12px;">
                    <thead>
                        <tr>
                            <th colspan="4" style="text-align:center; font-weight:bold; background-color:#e2e8f0;">کیس کامپیوتر (شناسه اموال: ${c.code})</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="width:20%; font-weight:bold;">مادربورد:</td>
                            <td style="width:30%;">${escapeHtml(c.motherboard)}</td>
                            <td style="width:20%; font-weight:bold;">پردازنده (CPU):</td>
                            <td style="width:30%;">${escapeHtml(c.cpu)}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold;">نوع / ظرفیت رم:</td>
                            <td>${escapeHtml(c.ramType)} / ${escapeHtml(c.ramQty)}</td>
                            <td style="font-weight:bold;">کارت گرافیک (VGA):</td>
                            <td>${escapeHtml(c.vga)}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold;">دیسک ذخیره‌ساز اول:</td>
                            <td>${escapeHtml(c.hdd1)}</td>
                            <td style="font-weight:bold;">دیسک ذخیره‌ساز ثانویه:</td>
                            <td>${escapeHtml(c.hdd2)}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        });

        // Monitors & Printers listed
        if (assigns.monitors.length > 0 || assigns.printers.length > 0) {
            html += `
                <table class="cert-table">
                    <thead>
                        <tr style="background-color:#e2e8f0;">
                            <th style="width:30%; font-weight:bold;">رده سخت افزار</th>
                            <th style="width:30%; font-weight:bold;">کد اموال تجهیز</th>
                            <th style="width:40%; font-weight:bold;">مدل و مشخصات دستگاه واگذار شده</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            assigns.monitors.forEach(m => {
                html += `
                    <tr>
                        <td><strong>📺 مانیتور (نمایشگر)</strong></td>
                        <td><code>${escapeHtml(m.code)}</code></td>
                        <td>${escapeHtml(m.model)}</td>
                    </tr>
                `;
            });
            assigns.printers.forEach(p => {
                html += `
                    <tr>
                        <td><strong>🖨️ چاپگر / پرینتر</strong></td>
                        <td><code>${escapeHtml(p.code)}</code></td>
                        <td>${escapeHtml(p.model)}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
        }
    }

    // Signatures blocks
    html += `
            <!-- Block 3: Signatures blocks -->
            <div class="signatures-block">
                <div class="signature-box">
                    <span class="signature-title">استفاده‌کننده (تحویل‌گیرنده):</span>
                    <span class="signature-footer-box">نام و امضا پرسنل</span>
                </div>
                <div class="signature-box">
                    <span class="signature-title">بخش انبار کارگاه بوشهر:</span>
                    <span class="signature-footer-box">امضا و تایید تحویل فیزیکی کالا</span>
                </div>
                <div class="signature-box">
                    <span class="signature-title">واحد فناوری اطلاعات و ارتباطات:</span>
                    <span class="signature-footer-box">ثبت و برنامه‌نویسی واحد ICT</span>
                </div>
            </div>

            <!-- Custom Branded Footer -->
            <div class="cert-footer-legal">
                سامانه مدیریت هوشمند شناسنامه تجهیزات رایانه ای شرکت عمران آذرستان سال ۱۴۰۵ | واحد فناوری اطلاعات و ارتباطات کارگاه بوشهر
            </div>
        </div>
    `;

    outputEl.innerHTML = html;
    showToast(`شناسنامه سیستم با موفقیت به نام ${pers.name} تولید و آماده چاپ شد.`);
}

function printRenderedReport() {
    window.print();
}

function printTable(elementId, title) {
    // Rely on simple print layout
    window.print();
}


// ----------------------------------------------------
// EXCEL EXPORTER UTILITY
// ----------------------------------------------------

function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csvContent = "";
    
    // Add UTF-8 BOM representation for proper Microsoft Excel RTL alignment
    csvContent += "\xEF\xBB\xBF";

    const rows = table.querySelectorAll("tr");
    
    rows.forEach(row => {
        const cols = row.querySelectorAll("th, td");
        let rowData = [];
        
        cols.forEach((col, idx) => {
            // Skip the Action / operations Column which is usually the last column of the table (if visible)
            if (idx === cols.length - 1 && col.textContent.includes("✏️") || col.textContent.includes("عملیات")) {
                return;
            }
            
            let text = col.textContent.replace(/"/g, '""').trim();
            rowData.push('"' + text + '"');
        });
        
        csvContent += rowData.join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}-${getJalaliDate().replace(/\//g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}


// ----------------------------------------------------
// BACKUPS, RESTORES & CSV UPLOADS HANDLER CALLS
// ----------------------------------------------------

async function handleCSVUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('csv-file-input');
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('لطفا فایل CSV اکسل را انتخاب نمایید.', 'warning');
        return;
    }

    if (!confirm('توجه: بارگذاری فایل جدید کل اطلاعات فعلی سامانه را با فایل بارگذاری شده پاک و جایگزین می‌کند. آیا مطمئن هستید؟')) {
        return;
    }

    const formData = new FormData();
    formData.append('csv_file', fileInput.files[0]);

    try {
        const res = await fetch('api/upload_csv.php', {
            method: 'POST',
            body: formData
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'خطا در بارگذاری');

        showToast(resData.message || 'بارگذاری CSV با موفقیت انجام شد.');
        
        // Reset file field
        fileInput.value = '';
        
        loadAllData();
        switchTab('personnel-tab');
    } catch (err) {
        showToast(err.message, 'danger');
    }
}

async function handleRestoreBackup(event) {
    event.preventDefault();

    const fileInput = document.getElementById('restore-file-input');
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('لطفا ابتدا فایل بکاپ JSON را انتخاب نمایید.', 'warning');
        return;
    }

    if (!confirm('آیا از بازگردانی کل اطلاعات به این فایل پشتیبان اطمینان دارید؟ تغییرات فعلی از بین خواهند رفت.')) {
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const backupContent = JSON.parse(e.target.result);
            const res = await fetch('api/restore.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backupContent)
            });

            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || 'خطا در بارگذاری');

            showToast(resData.message || 'پایگاه داده کامل سیستم با موفقیت بازیابی شد.');
            fileInput.value = '';
            loadAllData();
        } catch (err) {
            showToast('بارگذاری بکاپ با شکست مواجه شد. از معتبر بودن ساختار فایل اطمینان حاصل فرمایید.', 'danger');
        }
    };

    reader.readAsText(file);
}


// Helper helper function to escape output strings safely
function escapeHtml(string) {
    if (!string) return '';
    return String(string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
