import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import AdmZip from "adm-zip";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

function getPersianDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const formatted = formatter.format(date);
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let result = formatted;
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianDigits[i], 'g'), String(i));
    }
    result = result.replace(/[^\d/]/g, '');
    const parts = result.split('/');
    if (parts.length === 3) {
      let year = parts[0];
      let month = parts[1];
      let day = parts[2];
      if (year.length === 2 && day.length === 4) {
        const temp = year;
        year = day;
        day = temp;
      }
      if (month.length === 1) month = `0${month}`;
      if (day.length === 1) day = `0${day}`;
      return `${year}/${month}/${day}`;
    }
    return result;
  } catch (e) {
    return "1405/03/09";
  }
}

// Helper to ensure database files exist with initial demo data
function initializeDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const personnelFile = path.join(DATA_DIR, "personnel.json");
  const casesFile = path.join(DATA_DIR, "cases.json");
  const monitorsFile = path.join(DATA_DIR, "monitors.json");
  const printersFile = path.join(DATA_DIR, "printers.json");
  const miceFile = path.join(DATA_DIR, "mice.json");
  const keyboardsFile = path.join(DATA_DIR, "keyboards.json");
  const radiosFile = path.join(DATA_DIR, "radios.json");
  const cctvsFile = path.join(DATA_DIR, "cctvs.json");
  const partsCatalogFile = path.join(DATA_DIR, "parts_catalog.json");
  const assignmentsFile = path.join(DATA_DIR, "assignments.json");
  const repairsFile = path.join(DATA_DIR, "repairs.json");

  if (!fs.existsSync(repairsFile)) {
    const demoRepairs = [
      {
        id: "rep_1",
        equipmentCode: "C-201",
        equipmentType: "case",
        requestDate: "1405/03/02",
        requesterName: "علی علوی",
        reportedIssue: "سیستم روشن نمی‌شود و بوی سوختگی جزئی احساس می‌شود.",
        diagnosis: "سوختگی خازن‌های فیلترینگ منبع تغذیه (پاور) بر اثر نوسان برق کارگاه",
        status: "completed",
        neededParts: [
          {
            id: "part_1",
            name: "منبع تغذیه Green GP400A-ECO",
            source: "warehouse",
            salvageEquipmentCode: "",
            cost: 1550000
          }
        ],
        repairFee: 350000,
        totalCost: 1900000,
        assignedTechnician: "زهرا حسینی",
        completedDate: "1405/03/04",
        remarks: "پاور جدید از انبار مرکزی قطعات تامین و تعویض شد. سیستم به مدت ۲۴ ساعت تحت تست استرس قرار گرفت."
      },
      {
        id: "rep_2",
        equipmentCode: "C-202",
        equipmentType: "case",
        requestDate: "1405/03/05",
        requesterName: "زهرا حسینی",
        reportedIssue: "فن سی‌پی‌یو نویز شدیدی ایجاد می‌کند و کارکرد سیستم بسیار کند شده است.",
        diagnosis: "شکستگی پره‌های خنک‌کننده پردازنده و نیاز مبرم به تعویض فن سی‌پی‌یو",
        status: "parts_requested",
        neededParts: [
          {
            id: "part_2",
            name: "فن خنک‌کننده پردازنده Intel LGA1750",
            source: "salvage",
            salvageEquipmentCode: "C-109",
            cost: 0
          }
        ],
        repairFee: 150000,
        totalCost: 150000,
        assignedTechnician: "علی علوی",
        completedDate: "",
        remarks: "فن سالم از کیس مستعمل و غیرقابل استفاده C-109 استخراج فرعی شده و آماده مونتاژ است."
      }
    ];
    fs.writeFileSync(repairsFile, JSON.stringify(demoRepairs, null, 2), "utf-8");
  }

  if (!fs.existsSync(personnelFile)) {
    const demoPersonnel = [
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
    ];
    fs.writeFileSync(personnelFile, JSON.stringify(demoPersonnel, null, 2), "utf-8");
  }

  if (!fs.existsSync(casesFile)) {
    const demoCases = [
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
    ];
    fs.writeFileSync(casesFile, JSON.stringify(demoCases, null, 2), "utf-8");
  }

  if (!fs.existsSync(monitorsFile)) {
    const demoMonitors = [
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
    ];
    fs.writeFileSync(monitorsFile, JSON.stringify(demoMonitors, null, 2), "utf-8");
  }

  if (!fs.existsSync(printersFile)) {
    const demoPrinters = [
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
    ];
    fs.writeFileSync(printersFile, JSON.stringify(demoPrinters, null, 2), "utf-8");
  }

  if (!fs.existsSync(assignmentsFile)) {
    const demoAssignments = [
      {
        id: "a1",
        equipmentCode: "C-201",
        equipmentType: "case",
        personnelCode: "1001",
        personnelName: "علی علوی",
        startDate: "1405/01/15",
        endDate: null
      },
      {
        id: "a2",
        equipmentCode: "M-301",
        equipmentType: "monitor",
        personnelCode: "1001",
        personnelName: "علی علوی",
        startDate: "1405/01/15",
        endDate: null
      },
      {
        id: "a3",
        equipmentCode: "M-302",
        equipmentType: "monitor",
        personnelCode: "1002",
        personnelName: "زهرا حسینی",
        startDate: "1405/02/01",
        endDate: null
      },
      {
        id: "a4",
        equipmentCode: "P-401",
        equipmentType: "printer",
        personnelCode: "1002",
        personnelName: "زهرا حسینی",
        startDate: "1405/02/01",
        endDate: null
      }
    ];
    fs.writeFileSync(assignmentsFile, JSON.stringify(demoAssignments, null, 2), "utf-8");
  }

  if (!fs.existsSync(miceFile)) {
    const demoMice = [
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
    ];
    fs.writeFileSync(miceFile, JSON.stringify(demoMice, null, 2), "utf-8");
  }

  if (!fs.existsSync(keyboardsFile)) {
    const demoKeyboards = [
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
    ];
    fs.writeFileSync(keyboardsFile, JSON.stringify(demoKeyboards, null, 2), "utf-8");
  }

  if (!fs.existsSync(radiosFile)) {
    const demoRadios = [
      {
        code: "R-701",
        model: "موتورولا ال‌پی‌دی ۴۴۶ (Motorola LPD446)",
        assignedTo: "1001",
        status: "working",
        description: "بی‌سیم دستی کانال‌دار با شارژر رومیزی"
      },
      {
        code: "R-702",
        model: "کنوود ۳۲۰۷ (Kenwood TK-3207)",
        assignedTo: null,
        status: "working",
        description: "بی‌سیم سرپرست کارگاه، باتری تقویت‌شده"
      }
    ];
    fs.writeFileSync(radiosFile, JSON.stringify(demoRadios, null, 2), "utf-8");
  }

  if (!fs.existsSync(cctvsFile)) {
    const demoCctvs = [
      {
        code: "CAM-901",
        brand: "هایک‌ویژن (Hikvision)",
        model: "DS-2CD1123G0E-I",
        location: "درب ورودی کانکس نگهبانی اصلی کارگاه",
        assignedTo: null,
        status: "working",
        description: "دوربین تحت شبکه گنبدی ضدضربه، پوشش زاویه دید ورودی اصلی",
        accessLink: "http://192.168.1.101"
      },
      {
        code: "CAM-902",
        brand: "داهوا (Dahua)",
        model: "DH-IPC-HFW1230S-A",
        location: "دیوار شمالی انبار مرکزی آهن‌آلات",
        assignedTo: null,
        status: "working",
        description: "دوربین تحت شبکه بالت دید در شب سیاه سفید و رنگی فعال",
        accessLink: "http://192.168.1.102"
      }
    ];
    fs.writeFileSync(cctvsFile, JSON.stringify(demoCctvs, null, 2), "utf-8");
  }

  if (!fs.existsSync(partsCatalogFile)) {
    const demoCatalog = [
      { id: "pc1", category: "cpu", name: "Intel Core i5-12400", description: "6 Cores, 12 Threads, 2.5 GHz Base, LGA1700" },
      { id: "pc2", category: "cpu", name: "Intel Core i7-13700", description: "16 Cores, 24 Threads, 2.1 GHz Base, LGA1700" },
      { id: "pc3", category: "motherboard", name: "ASUS PRIME H610M-R", description: "Intel Socket LGA1700, DDR4 Support, Micro-ATX" },
      { id: "pc4", category: "vga", name: "Desktop Intel UHD Graphics 730", description: "Integrated CPU Graphics" },
      { id: "pc5", category: "vga", name: "NVIDIA GeForce RTX 3050 8GB", description: "Dedicated GDDR6 Graphics Card" },
      { id: "pc6", category: "ramType", name: "DDR4", description: "DDR4 Desktop Memory SDRAM" },
      { id: "pc7", category: "ramType", name: "DDR5", description: "DDR5 Next-Gen High Speed Memory" },
      { id: "pc_p1", category: "power", name: "Green GP400A-ECO 400W", description: "Standard 80Plus Eco Power Supply" },
      { id: "pc_p2", category: "power", name: "Cooler Master MWE 550W", description: "550W 80Plus Bronze Power Supply" },
      { id: "pc8", category: "monitorBrand", name: "LG 22MP400 (22 Inch)", description: "22-Inch Full HD (1920x1080) IPS Monitor" },
      { id: "pc9", category: "monitorBrand", name: "Samsung LF24T350 (24 Inch)", description: "24-Inch Full HD IPS 75Hz Bezel-less Monitor" },
      { id: "pc10", category: "printerBrand", name: "HP LaserJet Pro M402dn", description: "Monochrome Laser Printer, Auto Duplex" },
      { id: "pc11", category: "printerBrand", name: "Canon LBP6030w", description: "Compact Wireless Monochrome Laser Printer" },
      { id: "pc12", category: "printerFeature", name: "سه کاره (پرینت / کپی / اسکن)", description: "Multi-Function Monochrome Laser printer" },
      { id: "pc13", category: "printerFeature", name: "تک کاره (پرینت فقط)", description: "Single-Function Dedicated Print Unit" }
    ];
    fs.writeFileSync(partsCatalogFile, JSON.stringify(demoCatalog, null, 2), "utf-8");
  }

  const usersFile = path.join(DATA_DIR, "users.json");
  if (!fs.existsSync(usersFile)) {
    const demoUsers = [
      {
        id: "u1",
        username: "admin",
        password: "admin",
        role: "admin",
        name: "مهندس علوی (ادمین اصلی)",
        canEditPersonnel: true,
        canEditEquipment: true,
        canExport: true,
        canBackup: true,
        allowedIPs: ""
      },
      {
        id: "u2",
        username: "editor",
        password: "1234",
        role: "editor_equipment",
        name: "اپراتور تجهیزات کارگاه",
        canEditPersonnel: false,
        canEditEquipment: true,
        canExport: true,
        canBackup: false,
        allowedIPs: ""
      },
      {
        id: "u3",
        username: "viewer",
        password: "1111",
        role: "viewer",
        name: "کارشناس ناظر",
        canEditPersonnel: false,
        canEditEquipment: false,
        canExport: false,
        canBackup: false,
        allowedIPs: ""
      }
    ];
    fs.writeFileSync(usersFile, JSON.stringify(demoUsers, null, 2), "utf-8");
  }
}

// Read database helper
function readDb(file: string): any[] {
  const filePath = path.join(DATA_DIR, file);
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

// Write database helper
function writeDb(file: string, data: any[]) {
  const filePath = path.join(DATA_DIR, file);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

const activeUsers = new Map<string, { username: string; name: string; lastSeen: number }>();

function addAuditLog(username: string, name: string, ip: string, action: string, targetType: string, targetId: string, details: string, before: any = null, after: any = null) {
  const logsFile = path.join(DATA_DIR, "logs.json");
  let logs: any[] = [];
  if (fs.existsSync(logsFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logsFile, "utf-8"));
    } catch (e) {
      logs = [];
    }
  }
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = getPersianDateString(now);
  const timestamp = `${dateStr} ساعت ${timeStr}`;

  let decodedName = username || "سیستم";
  if (name && name !== "undefined" && name !== "unknown") {
    try {
      decodedName = decodeURIComponent(name);
    } catch (e) {
      decodedName = name;
    }
  }

  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    username: username || "system",
    name: decodedName,
    ip: ip || "-",
    action,
    targetType,
    targetId,
    details,
    timestamp,
    before,
    after
  };
  
  logs.unshift(newLog); // newer logs at top
  if (logs.length > 2000) {
    logs = logs.slice(0, 2000);
  }
  
  try {
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing logs:", err);
  }
}

async function startServer() {
  initializeDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "50mb" }));

  // Helper to extract connection remote client IP
  function getClientIp(req: any): string {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    if (typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }
    return ip;
  }

  // API: Get All Data
  app.get("/api/data", (req, res) => {
    res.json({
      personnel: readDb("personnel.json"),
      cases: readDb("cases.json"),
      monitors: readDb("monitors.json"),
      printers: readDb("printers.json"),
      mice: readDb("mice.json"),
      keyboards: readDb("keyboards.json"),
      radios: readDb("radios.json"),
      cctvs: readDb("cctvs.json"),
      partsCatalog: readDb("parts_catalog.json"),
      assignments: readDb("assignments.json"),
      repairs: readDb("repairs.json"),
      customCategories: readDb("custom_categories.json"),
      customEquipment: readDb("custom_equipment.json")
    });
  });

  // API: Get Current Connection Status & Live IP
  app.get("/api/session", (req, res) => {
    const ip = getClientIp(req);
    res.json({ ip });
  });

  // API: Secure User Login
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "نام کاربری و کلمه عبور الزامی است." });
    }
    const users = readDb("users.json");
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (!user) {
      return res.status(401).json({ error: "کاربری با این مشخصات یافت نشد." });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "کلمه عبور وارد شده نادرست است." });
    }

    // IP Check if configured
    const clientIp = getClientIp(req);
    if (user.allowedIPs && user.allowedIPs.trim() !== "") {
      const allowed = user.allowedIPs.split(",").map((ip: string) => ip.trim());
      if (!allowed.includes(clientIp)) {
        return res.status(403).json({ error: `دسترسی کابر ${user.username} از آی‌پی شما (${clientIp}) مسدود می‌باشد.` });
      }
    }

    // Return profile without leaking plain-text passwords
    const { password: _, ...userInfo } = user;
    
    // Log successful login
    addAuditLog(user.username, user.name, clientIp, "login", "auth", user.id, `ورود موفقیت‌آمیز به سامانه`);
    
    // Register active session
    activeUsers.set(user.username.toLowerCase(), {
      username: user.username.toLowerCase(),
      name: user.name,
      lastSeen: Date.now()
    });

    res.json({ success: true, user: userInfo, ip: clientIp });
  });

  // API: Get System Users Configuration List (Admin Only)
  app.get("/api/users", (req, res) => {
    res.json(readDb("users.json"));
  });

  // API: Save or Update System User details
  app.post("/api/users/save", (req, res) => {
    const { id, username, password, role, name, canEditPersonnel, canEditEquipment, canExport, canBackup, allowedIPs } = req.body;
    if (!username || !password || !role || !name) {
      return res.status(400).json({ error: "نام، نام کاربری، نقش و رمز عبور الزامی هستند." });
    }

    const users = readDb("users.json");
    const existingIndex = id ? users.findIndex(u => u.id === id) : -1;
    const isEditing = existingIndex > -1;

    // Check duplicate username
    const duplicate = users.find((u, idx) => u.username.toLowerCase() === username.toLowerCase() && idx !== existingIndex);
    if (duplicate) {
      return res.status(400).json({ error: "این نام کاربری از قبل رزرو شده است." });
    }

    const updatedUser = {
      id: id || `u_${Date.now()}`,
      username: username.trim(),
      password: password.trim(),
      role,
      name: name.trim(),
      canEditPersonnel: !!canEditPersonnel,
      canEditEquipment: !!canEditEquipment,
      canExport: !!canExport,
      canBackup: !!canBackup,
      allowedIPs: (allowedIPs || "").trim()
    };

    if (isEditing) {
      users[existingIndex] = updatedUser;
    } else {
      users.push(updatedUser);
    }

    writeDb("users.json", users);
    
    // Log User Creation/Edit
    const opUser = req.headers["x-operator-username"] as string || "admin";
    const opName = req.headers["x-operator-name"] as string || "مدیریت کل";
    const clientIp = getClientIp(req);
    if (isEditing) {
      addAuditLog(opUser, opName, clientIp, "edit", "user", updatedUser.id, `ویرایش مشخصات کاربر: ${updatedUser.name} (${updatedUser.username})`);
    } else {
      addAuditLog(opUser, opName, clientIp, "create", "user", updatedUser.id, `افزودن کاربر سیستمی جدید: ${updatedUser.name} (${updatedUser.username}) با نقش ${updatedUser.role}`);
    }

    res.json({ success: true, user: updatedUser });
  });

  // API: Delete User (Main Admin cannot be deleted)
  app.post("/api/users/delete", (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "وارد کردن شناسه الزامی است." });
    }

    const users = readDb("users.json");
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "کاربری یافت نشد." });
    }

    const user = users[userIndex];
    if (user.username === 'admin') {
      return res.status(400).json({ error: "امکان حذف کاربر مدیریت کل وجود ندارد." });
    }

    users.splice(userIndex, 1);
    writeDb("users.json", users);

    // Log User Deletion
    const opUser = req.headers["x-operator-username"] as string || "admin";
    const opName = req.headers["x-operator-name"] as string || "مدیریت کل";
    const clientIp = getClientIp(req);
    addAuditLog(opUser, opName, clientIp, "delete", "user", id, `حذف کاربر سیستم: ${user.name} (${user.username})`);

    res.json({ success: true });
  });


  // API: Get custom theme settings
  app.get("/api/theme", (req, res) => {
    const themeFile = path.join(DATA_DIR, "theme.json");
    try {
      if (fs.existsSync(themeFile)) {
        const themeData = JSON.parse(fs.readFileSync(themeFile, "utf-8"));
        return res.json({ theme: themeData });
      }
      // Default theme response
      return res.json({
        theme: {
          themeMode: "slate-dark",
          fontFamily: "Vazirmatn",
          accentColor: "#3b82f6",
          containerBackground: "#0f172a",
          cardGlow: true,
          headingStyle: "font-black tracking-tight",
          welcomeTitle: "اموال و تجهیزات فاوا کارگاه بوشهر",
          appBorderRadius: "rounded-xl",
          workspaceGlowStyle: "soft",
          navbarOpacity: "90",
          textColor: "#cbd5e1",
          headingColor: "#f8fafc",
          cardBackground: "rgba(15, 23, 42, 0.75)",
          buttonBackground: "#3b82f6",
          buttonTextColor: "#111827",
          baseFontSize: "base",
          lightTextColor: "#334155",
          lightHeadingColor: "#0f172a",
          lightCardBackground: "#ffffff",
          lightButtonBackground: "#3b82f6",
          lightButtonTextColor: "#ffffff",
          lightContainerBackground: "#f1f5f9"
        }
      });
    } catch (e) {
      return res.json({ theme: null });
    }
  });

  // API: Update custom theme settings (Admin Only)
  app.post("/api/theme", (req, res) => {
    const { theme } = req.body;
    const themeFile = path.join(DATA_DIR, "theme.json");
    const opUser = req.headers["x-operator-username"] as string || "admin";
    const opName = req.headers["x-operator-name"] as string || "مدیریت کل";
    const clientIp = getClientIp(req);
    try {
      if (!theme) {
        if (fs.existsSync(themeFile)) {
          fs.unlinkSync(themeFile);
        }
        addAuditLog(opUser, opName, clientIp, "edit", "theme", "-", "بازنشانی تنظیمات ظاهری و پوسته پیش‌فرض سیستم");
        return res.json({ success: true, theme: null });
      }
      fs.writeFileSync(themeFile, JSON.stringify(theme, null, 2), "utf-8");
      addAuditLog(opUser, opName, clientIp, "edit", "theme", "-", "بروزرسانی تنظیمات ظاهری، رنگ‌بندی و فونت سیستم");
      return res.json({ success: true, theme });
    } catch (e) {
      return res.status(500).json({ error: "خطا در ذخیره‌سازی تنظیمات ظاهری روی سرور" });
    }
  });

  // API: Get Company Shared Corporate Logo
  app.get("/api/logo", (req, res) => {
    const logoFile = path.join(DATA_DIR, "logo.txt");
    try {
      if (fs.existsSync(logoFile)) {
        const logo = fs.readFileSync(logoFile, "utf-8");
        return res.json({ logo });
      }
      return res.json({ logo: null });
    } catch (e) {
      return res.json({ logo: null });
    }
  });

  // API: Update Shared Corporate Logo (Admin Only)
  app.post("/api/logo", (req, res) => {
    const { logo } = req.body; // base64 string or null
    const logoFile = path.join(DATA_DIR, "logo.txt");
    const opUser = req.headers["x-operator-username"] as string || "admin";
    const opName = req.headers["x-operator-name"] as string || "مدیریت کل";
    const clientIp = getClientIp(req);
    try {
      if (!logo) {
        if (fs.existsSync(logoFile)) {
          fs.unlinkSync(logoFile);
        }
        addAuditLog(opUser, opName, clientIp, "edit", "logo", "-", "حذف تصویر لوگوی اختصاصی بارگذاری‌شده");
        return res.json({ success: true, logo: null });
      }
      fs.writeFileSync(logoFile, logo, "utf-8");
      addAuditLog(opUser, opName, clientIp, "edit", "logo", "-", "بارگذاری و تغییر تصویر لوگوی اختصاصی شرکت");
      return res.json({ success: true, logo });
    } catch (e) {
      return res.status(500).json({ error: "خطا در ذخیره لوگو روی سرور" });
    }
  });

  // API: Save/Edit Item
  app.post("/api/save", (req, res) => {
    const { type, isEdit, id, code, oldCode, ...fields } = req.body;

    if (!type || !code) {
      return res.status(400).json({ error: "اطلاعات ارسالی ناقص است." });
    }

    const trimmedCode = code.trim();
    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    if (type === "personnel") {
      const personnel = readDb("personnel.json");
      const name = fields.name?.trim();
      const title = fields.title?.trim();
      const department = fields.department?.trim();
      const location = fields.location?.trim();

      if (!name) {
        return res.status(400).json({ error: "نام پرسنل الزامی است." });
      }

      const isEditing = !!(isEdit || id);
      const existingIndex = personnel.findIndex((p) => p.code === trimmedCode && (!isEditing || p.id !== id));
      if (existingIndex !== -1) {
        return res.status(400).json({ error: "کد پرسنلی تکراری است." });
      }

      const existingItem = isEditing ? personnel.find((p) => p.id === id) : null;
      const status = fields.status || "active";
      const item = {
        id: isEditing ? id : `p_${Date.now()}`,
        name,
        code: trimmedCode,
        title: title || "-",
        department: department || "-",
        location: location || "کارگاه بوشهر",
        documentNumber: fields.documentNumber !== undefined ? fields.documentNumber : (existingItem ? existingItem.documentNumber : ""),
        status: status,
      };

      if (isEditing) {
        const idx = personnel.findIndex((p) => p.id === id);
        if (idx !== -1) {
          const oldPersCode = personnel[idx].code;
          personnel[idx] = item;

          // If personnel code changed, cascade updates to all assignments
          if (oldPersCode !== trimmedCode) {
            // Cases
            const cases = readDb("cases.json");
            cases.forEach((c) => {
              if (c.assignedTo === oldPersCode) c.assignedTo = trimmedCode;
            });
            writeDb("cases.json", cases);

            // Monitors
            const monitors = readDb("monitors.json");
            monitors.forEach((m) => {
              if (m.assignedTo === oldPersCode) m.assignedTo = trimmedCode;
            });
            writeDb("monitors.json", monitors);

            // Printers
            const printers = readDb("printers.json");
            printers.forEach((pr) => {
              if (pr.assignedTo === oldPersCode) pr.assignedTo = trimmedCode;
            });
            writeDb("printers.json", printers);

            // Mice
            const mice = readDb("mice.json");
            mice.forEach((m) => {
              if (m.assignedTo === oldPersCode) m.assignedTo = trimmedCode;
            });
            writeDb("mice.json", mice);

            // Keyboards
            const keyboards = readDb("keyboards.json");
            keyboards.forEach((k) => {
              if (k.assignedTo === oldPersCode) k.assignedTo = trimmedCode;
            });
            writeDb("keyboards.json", keyboards);

            // Radios
            const radios = readDb("radios.json");
            radios.forEach((r) => {
              if (r.assignedTo === oldPersCode) r.assignedTo = trimmedCode;
            });
            writeDb("radios.json", radios);

            // Cctvs
            const cctvs = readDb("cctvs.json");
            cctvs.forEach((c) => {
              if (c.assignedTo === oldPersCode) c.assignedTo = trimmedCode;
            });
            writeDb("cctvs.json", cctvs);

            // History
            const assignments = readDb("assignments.json");
            assignments.forEach((ass) => {
              if (ass.personnelCode === oldPersCode) {
                ass.personnelCode = trimmedCode;
                ass.personnelName = name;
              }
            });
            writeDb("assignments.json", assignments);
          }
        }
      } else {
        personnel.push(item);
      }

      // Check if personnel status is set to terminated (terminate cooperation)
      // If terminated, return all currently assigned equipment to the central workshop store/warehouse
      if (status === "terminated") {
        const dateStr = getPersianDateString();
        const returnedHardware: { code: string; type: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | "cctv" }[] = [];

        // 1. Cases
        const cases = readDb("cases.json");
        let casesChanged = false;
        cases.forEach((c) => {
          if (c.assignedTo === trimmedCode) {
            c.assignedTo = null;
            casesChanged = true;
            returnedHardware.push({ code: c.code, type: "case" });
          }
        });
        if (casesChanged) writeDb("cases.json", cases);

        // 2. Monitors
        const monitors = readDb("monitors.json");
        let monitorsChanged = false;
        monitors.forEach((m) => {
          if (m.assignedTo === trimmedCode) {
            m.assignedTo = null;
            monitorsChanged = true;
            returnedHardware.push({ code: m.code, type: "monitor" });
          }
        });
        if (monitorsChanged) writeDb("monitors.json", monitors);

        // 3. Printers
        const printers = readDb("printers.json");
        let printersChanged = false;
        printers.forEach((pr) => {
          if (pr.assignedTo === trimmedCode) {
            pr.assignedTo = null;
            printersChanged = true;
            returnedHardware.push({ code: pr.code, type: "printer" });
          }
        });
        if (printersChanged) writeDb("printers.json", printers);

        // 4. Mice
        const mice = readDb("mice.json");
        let miceChanged = false;
        mice.forEach((m) => {
          if (m.assignedTo === trimmedCode) {
            m.assignedTo = null;
            miceChanged = true;
            returnedHardware.push({ code: m.code, type: "mouse" });
          }
        });
        if (miceChanged) writeDb("mice.json", mice);

        // 5. Keyboards
        const keyboards = readDb("keyboards.json");
        let keyboardsChanged = false;
        keyboards.forEach((k) => {
          if (k.assignedTo === trimmedCode) {
            k.assignedTo = null;
            keyboardsChanged = true;
            returnedHardware.push({ code: k.code, type: "keyboard" });
          }
        });
        if (keyboardsChanged) writeDb("keyboards.json", keyboards);

        // 5.5. Radios
        const radios = readDb("radios.json");
        let radiosChanged = false;
        radios.forEach((r) => {
          if (r.assignedTo === trimmedCode) {
            r.assignedTo = null;
            radiosChanged = true;
            returnedHardware.push({ code: r.code, type: "radio" });
          }
        });
        if (radiosChanged) writeDb("radios.json", radios);

        // 5.6. Cctvs
        const cctvs = readDb("cctvs.json");
        let cctvsChanged = false;
        cctvs.forEach((c) => {
          if (c.assignedTo === trimmedCode) {
            c.assignedTo = null;
            cctvsChanged = true;
            returnedHardware.push({ code: c.code, type: "cctv" });
          }
        });
        if (cctvsChanged) writeDb("cctvs.json", cctvs);

        // 6. Update Assignments History logs
        if (returnedHardware.length > 0) {
          const assignments = readDb("assignments.json");
          returnedHardware.forEach((hw) => {
            // End active assignment
            assignments.forEach((ass) => {
              if (ass.equipmentCode === hw.code && ass.equipmentType === hw.type && (ass.endDate === null || ass.endDate === "")) {
                ass.endDate = dateStr;
              }
            });

            // Create returned to store log entry
            assignments.push({
              id: `ass_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              equipmentCode: hw.code,
              equipmentType: hw.type,
              personnelCode: null,
              personnelName: `عودت به انبار/تحویل به کارگاه (به علت خاتمه همکاری ${name})`,
              startDate: dateStr,
              endDate: dateStr,
            });
          });
          writeDb("assignments.json", assignments);
        }
      }

      writeDb("personnel.json", personnel);
      
      if (isEditing) {
        addAuditLog(opUser, opName, clientIp, "edit", "personnel", trimmedCode, `ویرایش پرونده پرسنلی: ${name} (${trimmedCode}) - دپارتمان ${department || '-'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "personnel", trimmedCode, `ایجاد پرونده پرسنلی جدید: ${name} (${trimmedCode}) - دپارتمان ${department || '-'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "case") {
      const cases = readDb("cases.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = cases.some((c) => c.code === trimmedCode && (!isEdit || c.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد کیس تکراری است." });
      }

      const item = {
        code: trimmedCode,
        motherboard: fields.motherboard?.trim() || "-",
        cpu: fields.cpu?.trim() || "-",
        vga: fields.vga?.trim() || "-",
        hdd1: fields.hdd1?.trim() || "-",
        hdd2: fields.hdd2?.trim() || "-",
        ramType: fields.ramType?.trim() || "DDR4",
        ramQty: fields.ramQty?.trim() || "8GB",
        power: fields.power?.trim() || "-",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
      };

      if (isEdit) {
        const idx = cases.findIndex((c) => c.code === lookupCode);
        if (idx !== -1) cases[idx] = item;
      } else {
        cases.push(item);
      }

      writeDb("cases.json", cases);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "case", trimmedCode, `ویرایش مشخصات سخت‌افزاری کیس: مادربرد ${fields.motherboard || '-'}، پردازنده ${fields.cpu || '-'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "case", trimmedCode, `ثبت کیس کامپیوتر جدید در کارگاه: مادربرد ${fields.motherboard || '-'}، پردازنده ${fields.cpu || '-'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "monitor") {
      const monitors = readDb("monitors.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = monitors.some((m) => m.code === trimmedCode && (!isEdit || m.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد مانیتور تکراری است." });
      }

      const item = {
        code: trimmedCode,
        model: fields.model?.trim() || "سایر",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
      };

      if (isEdit) {
        const idx = monitors.findIndex((m) => m.code === lookupCode);
        if (idx !== -1) monitors[idx] = item;
      } else {
        monitors.push(item);
      }

      writeDb("monitors.json", monitors);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "monitor", trimmedCode, `ویرایش مشخصات مانیتور: مدل ${fields.model || 'سایر'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "monitor", trimmedCode, `ثبت مانیتور جدید در سامانه: مدل ${fields.model || 'سایر'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "printer") {
      const printers = readDb("printers.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = printers.some((pr) => pr.code === trimmedCode && (!isEdit || pr.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد چاپگر تکراری است." });
      }

      const item = {
        code: trimmedCode,
        model: fields.model?.trim() || "سایر",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
      };

      if (isEdit) {
        const idx = printers.findIndex((pr) => pr.code === lookupCode);
        if (idx !== -1) printers[idx] = item;
      } else {
        printers.push(item);
      }

      writeDb("printers.json", printers);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "printer", trimmedCode, `ویرایش مشخصات چاپگر: مدل ${fields.model || 'سایر'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "printer", trimmedCode, `ثبت چاپگر جدید در سامانه: مدل ${fields.model || 'سایر'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "mouse") {
      const mice = readDb("mice.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = mice.some((m) => m.code === trimmedCode && (!isEdit || m.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد ماوس تکراری است." });
      }

      const item = {
        code: trimmedCode,
        model: fields.model?.trim() || "سایر",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
      };

      if (isEdit) {
        const idx = mice.findIndex((m) => m.code === lookupCode);
        if (idx !== -1) mice[idx] = item;
      } else {
        mice.push(item);
      }

      writeDb("mice.json", mice);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "mouse", trimmedCode, `ویرایش مشخصات ماوس کابل‌دار/بیسیم: مدل ${fields.model || 'سایر'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "mouse", trimmedCode, `ثبت ماوس جدید در انبار: مدل ${fields.model || 'سایر'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "keyboard") {
      const keyboards = readDb("keyboards.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = keyboards.some((k) => k.code === trimmedCode && (!isEdit || k.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد کیبورد تکراری است." });
      }

      const item = {
        code: trimmedCode,
        model: fields.model?.trim() || "سایر",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
      };

      if (isEdit) {
        const idx = keyboards.findIndex((k) => k.code === lookupCode);
        if (idx !== -1) keyboards[idx] = item;
      } else {
        keyboards.push(item);
      }

      writeDb("keyboards.json", keyboards);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "keyboard", trimmedCode, `ویرایش مشخصات کیبورد: مدل ${fields.model || 'سایر'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "keyboard", trimmedCode, `ثبت کیبورد جدید در انبار: مدل ${fields.model || 'سایر'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "radio") {
      const radios = readDb("radios.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = radios.some((r) => r.code === trimmedCode && (!isEdit || r.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد بی‌سیم تکراری است." });
      }

      const item = {
        code: trimmedCode,
        model: fields.model?.trim() || "سایر",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
        frequencyRange: fields.frequencyRange || "",
        ipRating: fields.ipRating || "",
      };

      if (isEdit) {
        const idx = radios.findIndex((r) => r.code === lookupCode);
        if (idx !== -1) radios[idx] = item;
      } else {
        radios.push(item);
      }

      writeDb("radios.json", radios);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "radio", trimmedCode, `ویرایش مشخصات بی‌سیم: مدل ${fields.model || 'سایر'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "radio", trimmedCode, `ثبت بی‌سیم جدید در انبار: مدل ${fields.model || 'سایر'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "cctv") {
      const cctvs = readDb("cctvs.json");
      const lookupCode = isEdit ? oldCode : trimmedCode;

      const codeExists = cctvs.some((c) => c.code === trimmedCode && (!isEdit || c.code !== oldCode));
      if (codeExists) {
        return res.status(400).json({ error: "کد دوربین مداربسته تکراری است." });
      }

      const item = {
        code: trimmedCode,
        brand: fields.brand?.trim() || "سایر",
        model: fields.model?.trim() || "سایر",
        location: fields.location?.trim() || "",
        assignedTo: fields.assignedTo || null,
        status: fields.status || "working",
        description: fields.description?.trim() || "",
        lastServiced: fields.lastServiced || "",
        accessLink: fields.accessLink?.trim() || "",
      };

      if (isEdit) {
        const idx = cctvs.findIndex((c) => c.code === lookupCode);
        if (idx !== -1) cctvs[idx] = item;
      } else {
        cctvs.push(item);
      }

      writeDb("cctvs.json", cctvs);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "cctv", trimmedCode, `ویرایش مشخصات دوربین مداربسته: برند ${fields.brand || 'سایر'} مدل ${fields.model || 'سایر'}`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "cctv", trimmedCode, `ثبت دوربین مداربسته جدید: برند ${fields.brand || 'سایر'} مدل ${fields.model || 'سایر'}`);
      }

      return res.json({ success: true, item });
    }

    if (type === "catalog") {
      const catalog = readDb("parts_catalog.json");
      const itemId = isEdit ? id : `pc_${Date.now()}`;

      const item = {
        id: itemId,
        category: fields.category,
        name: fields.name?.trim(),
        description: fields.description?.trim() || "",
      };

      if (isEdit) {
        const idx = catalog.findIndex((c) => c.id === itemId);
        if (idx !== -1) catalog[idx] = item;
      } else {
        catalog.push(item);
      }

      writeDb("parts_catalog.json", catalog);
      
      if (isEdit) {
        addAuditLog(opUser, opName, clientIp, "edit", "catalog", itemId, `ویرایش قطعه مرجع کارگاه: ${fields.name} (دسته‌بندی ${fields.category})`);
      } else {
        addAuditLog(opUser, opName, clientIp, "create", "catalog", itemId, `تعریف قطعه مرجع هوشمند جدید: ${fields.name} (دسته‌بندی ${fields.category})`);
      }

      return res.json({ success: true, item });
    }

    if (type === "custom_category") {
      const categories = readDb("custom_categories.json");
      const categoryId = isEdit ? id : `cat_${Date.now()}`;
      
      const item = {
        id: categoryId,
        name: fields.name?.trim(),
        icon: fields.icon || "⚙️",
        fields: fields.fields || []
      };

      if (!item.name) {
        return res.status(400).json({ error: "نام دسته سخت‌افزاری الزامی است." });
      }

      if (isEdit) {
        const idx = categories.findIndex((c) => c.id === categoryId);
        if (idx !== -1) categories[idx] = item;
      } else {
        categories.push(item);
      }

      writeDb("custom_categories.json", categories);
      addAuditLog(opUser, opName, clientIp, isEdit ? "edit" : "create", "custom_category", categoryId, `تعریف دسته سخت‌افزاری جدید: ${fields.name}`);
      return res.json({ success: true, item });
    }

    // Check if the type matches any custom category
    const customCategories = readDb("custom_categories.json");
    if (customCategories.some(c => c.id === type)) {
      const customEquips = readDb("custom_equipment.json");
      const isEditing = !!(isEdit || id);
      const existingIndex = customEquips.findIndex(e => e.code === trimmedCode && (!isEditing || e.id !== id));
      if (existingIndex !== -1) {
        return res.status(400).json({ error: "کد اموال وارد شده تکراری است." });
      }

      const item = {
        id: isEditing ? id : `eq_${Date.now()}`,
        categorySlug: type,
        code: trimmedCode,
        assignedTo: fields.assignedTo !== undefined ? fields.assignedTo : null,
        status: fields.status || "working",
        location: fields.location || "کارگاه بوشهر",
        lastServiced: fields.lastServiced || "",
        description: fields.description || "",
        ...fields
      };

      if (isEditing) {
        const idx = customEquips.findIndex(e => e.id === id);
        if (idx !== -1) {
          customEquips[idx] = item;
        }
      } else {
        customEquips.push(item);
      }

      writeDb("custom_equipment.json", customEquips);
      addAuditLog(opUser, opName, clientIp, isEditing ? "edit" : "create", type, trimmedCode, `ثبت تجهیز سفارشی جدید: ${trimmedCode} در دسته ${type}`);
      return res.json({ success: true, item });
    }

    return res.status(400).json({ error: "نوع آیتم نامعتبر است." });
  });

  // API: Save Bulk Items
  app.post("/api/save-bulk", (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "لیست تجهیزات معتبر یافت نشد." });
    }

    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    // Group items by type to load/save each DB file once
    const itemsByType: Record<string, any[]> = {};
    for (const item of items) {
      if (!item.type || !item.code) continue;
      const type = item.type;
      if (!itemsByType[type]) itemsByType[type] = [];
      itemsByType[type].push(item);
    }

    const fileMap: Record<string, string> = {
      case: "cases.json",
      monitor: "monitors.json",
      printer: "printers.json",
      mouse: "mice.json",
      keyboard: "keyboards.json",
      radio: "radios.json",
      cctv: "cctvs.json"
    };

    let totalSaved = 0;
    const skipped: string[] = [];

    // Process each type
    for (const [type, typeItems] of Object.entries(itemsByType)) {
      const fileName = fileMap[type];
      if (!fileName) continue;

      const dbList = readDb(fileName);

      for (const rawItem of typeItems) {
        const trimmedCode = String(rawItem.code).trim().toUpperCase();
        if (!trimmedCode) continue;

        // Check duplicate
        const exists = dbList.some((x: any) => String(x.code).toUpperCase() === trimmedCode);
        if (exists) {
          skipped.push(trimmedCode);
          continue;
        }

        // Build item object
        let itemObj: any = {
          code: trimmedCode,
          assignedTo: null,
          status: rawItem.status || "working",
          description: rawItem.description?.trim() || "ایمپورت گروهی به انبار"
        };

        if (type === "case") {
          itemObj = {
            ...itemObj,
            motherboard: rawItem.motherboard?.trim() || "Gigabyte",
            cpu: rawItem.cpu?.trim() || "Intel Core i5",
            vga: rawItem.vga?.trim() || "Onboard",
            hdd1: rawItem.hdd1?.trim() || "256GB SSD",
            hdd2: rawItem.hdd2?.trim() || "1TB HDD",
            ramType: rawItem.ramType || "DDR4",
            ramQty: rawItem.ramQty || "8GB",
            power: rawItem.power?.trim() || "Green 400W"
          };
        } else if (type === "radio") {
          itemObj = {
            ...itemObj,
            model: rawItem.model?.trim() || "Motorola GP338",
            frequencyRange: rawItem.frequencyRange?.trim() || "UHF",
            ipRating: rawItem.ipRating?.trim() || "IP54"
          };
        } else {
          // monitor, printer, mouse, keyboard
          itemObj = {
            ...itemObj,
            model: rawItem.model?.trim() || "سایر"
          };
        }

        dbList.push(itemObj);
        totalSaved++;
      }

      writeDb(fileName, dbList);
    }

    if (totalSaved > 0) {
      addAuditLog(opUser, opName, clientIp, "create", "bulk", "-", `ثبت گروهی و ایمپورت ${totalSaved} دستگاه سخت‌افزاری جدید به حساب انبار`);
    }

    return res.json({ success: true, savedCount: totalSaved, skippedCodes: skipped });
  });

  // API: Save Bulk Edit on existing Items
  app.post("/api/save-bulk-edit", (req, res) => {
    const { updates } = req.body; // updates is an array of { code: string, type: string, fields: any }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: "لیست تغییرات معتبر یافت نشد." });
    }

    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    const fileMap: Record<string, string> = {
      case: "cases.json",
      monitor: "monitors.json",
      printer: "printers.json",
      mouse: "mice.json",
      keyboard: "keyboards.json",
      radio: "radios.json",
      cctv: "cctvs.json"
    };

    // Group updates by type
    const updatesByType: Record<string, any[]> = {};
    for (const item of updates) {
      if (!item.type || !item.code) continue;
      const type = item.type;
      if (!updatesByType[type]) updatesByType[type] = [];
      updatesByType[type].push(item);
    }

    let totalUpdated = 0;

    for (const [type, typeUpdates] of Object.entries(updatesByType)) {
      const fileName = fileMap[type];
      if (!fileName) continue;

      const dbList = readDb(fileName);
      let changed = false;

      for (const updateInfo of typeUpdates) {
        const targetCode = String(updateInfo.code).trim().toUpperCase();
        const idx = dbList.findIndex((x: any) => String(x.code).toUpperCase() === targetCode);
        if (idx !== -1) {
          // Merge fields safely
          dbList[idx] = {
            ...dbList[idx],
            ...updateInfo.fields,
            code: dbList[idx].code // always keep original code
          };
          changed = true;
          totalUpdated++;
        }
      }

      if (changed) {
        writeDb(fileName, dbList);
      }
    }

    if (totalUpdated > 0) {
      addAuditLog(opUser, opName, clientIp, "edit", "bulk_edit", "-", `ویرایش تکمیلی گروهی بر روی تعداد ${totalUpdated} تجهیزات سخت‌افزاری`);
    }

    return res.json({ success: true, updatedCount: totalUpdated });
  });

  // API: Delete Item
  app.post("/api/delete", (req, res) => {
    const { type, id, today } = req.body;
    const dateStr = today || getPersianDateString();

    if (!type || !id) {
      return res.status(400).json({ error: "شناسه یا مانیفست حذف ارسال نگردیده." });
    }

    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    if (type === "personnel") {
      const personnel = readDb("personnel.json");
      const idx = personnel.findIndex((p) => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "پرسنل یافت نشد." });
      }

      const codeToClear = personnel[idx].code;
      personnel.splice(idx, 1);
      writeDb("personnel.json", personnel);

      // Cascade update to unassign equipment and close history
      if (codeToClear) {
        // Cases
        const cases = readDb("cases.json");
        cases.forEach((c) => {
          if (c.assignedTo === codeToClear) c.assignedTo = null;
        });
        writeDb("cases.json", cases);

        // Monitors
        const monitors = readDb("monitors.json");
        monitors.forEach((m) => {
          if (m.assignedTo === codeToClear) m.assignedTo = null;
        });
        writeDb("monitors.json", monitors);

        // Printers
        const printers = readDb("printers.json");
        printers.forEach((pr) => {
          if (pr.assignedTo === codeToClear) pr.assignedTo = null;
        });
        writeDb("printers.json", printers);

        // Mice
        const mice = readDb("mice.json");
        mice.forEach((m) => {
          if (m.assignedTo === codeToClear) m.assignedTo = null;
        });
        writeDb("mice.json", mice);

        // Keyboards
        const keyboards = readDb("keyboards.json");
        keyboards.forEach((k) => {
          if (k.assignedTo === codeToClear) k.assignedTo = null;
        });
        writeDb("keyboards.json", keyboards);

        // Assignment History close
        const assignments = readDb("assignments.json");
        assignments.forEach((ass) => {
          if (ass.personnelCode === codeToClear && ass.endDate === null) {
            ass.endDate = dateStr;
          }
        });
        writeDb("assignments.json", assignments);
      }

      addAuditLog(opUser, opName, clientIp, "delete", "personnel", codeToClear, `حذف پرونده کارمند: شماره پرسنلی ${codeToClear} و آزادسازی کلیه تجهیزات تحت تصرف وی`);
      return res.json({ success: true });
    }

    if (type === "case") {
      const cases = readDb("cases.json");
      const idx = cases.findIndex((c) => c.code === id);
      if (idx === -1) return res.status(404).json({ error: "کیس یافت نشد." });

      cases.splice(idx, 1);
      writeDb("cases.json", cases);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "case" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "case", id, `حذف کامل دارایی کیس کامپیوتر با شماره اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "monitor") {
      const monitors = readDb("monitors.json");
      const idx = monitors.findIndex((m) => m.code === id);
      if (idx === -1) return res.status(404).json({ error: "مانیتور یافت نشد." });

      monitors.splice(idx, 1);
      writeDb("monitors.json", monitors);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "monitor" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "monitor", id, `حذف مانیتور از سامانه با کد اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "printer") {
      const printers = readDb("printers.json");
      const idx = printers.findIndex((pr) => pr.code === id);
      if (idx === -1) return res.status(404).json({ error: "چاپگر یافت نشد." });

      printers.splice(idx, 1);
      writeDb("printers.json", printers);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "printer" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "printer", id, `حذف چاپگر با شماره پرونده اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "mouse") {
      const mice = readDb("mice.json");
      const idx = mice.findIndex((m) => m.code === id);
      if (idx === -1) return res.status(404).json({ error: "ماوس یافت نشد." });

      mice.splice(idx, 1);
      writeDb("mice.json", mice);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "mouse" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "mouse", id, `حذف فیزیکی ماوس با شماره پرونده اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "keyboard") {
      const keyboards = readDb("keyboards.json");
      const idx = keyboards.findIndex((k) => k.code === id);
      if (idx === -1) return res.status(404).json({ error: "کیبورد یافت نشد." });

      keyboards.splice(idx, 1);
      writeDb("keyboards.json", keyboards);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "keyboard" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "keyboard", id, `حذف فیزیکی کیبورد با شماره پرونده اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "radio") {
      const radios = readDb("radios.json");
      const idx = radios.findIndex((r) => r.code === id);
      if (idx === -1) return res.status(404).json({ error: "بی‌سیم یافت نشد." });

      radios.splice(idx, 1);
      writeDb("radios.json", radios);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "radio" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "radio", id, `حذف فیزیکی بی‌سیم با شماره پرونده اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "cctv") {
      const cctvs = readDb("cctvs.json");
      const idx = cctvs.findIndex((c) => c.code === id);
      if (idx === -1) return res.status(404).json({ error: "دوربین مداربسته یافت نشد." });

      cctvs.splice(idx, 1);
      writeDb("cctvs.json", cctvs);

      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === id && ass.equipmentType === "cctv" && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", "cctv", id, `حذف فیزیکی دوربین مداربسته با شماره پرونده اموال ${id}`);
      return res.json({ success: true });
    }

    if (type === "catalog") {
      const catalog = readDb("parts_catalog.json");
      const idx = catalog.findIndex((c) => c.id === id);
      if (idx === -1) return res.status(404).json({ error: "قطعه مرجع یافت نشد." });

      catalog.splice(idx, 1);
      writeDb("parts_catalog.json", catalog);

      addAuditLog(opUser, opName, clientIp, "delete", "catalog", id, `حذف دائمی قطعه مرجع از کاتالوگ قطعات کارگاه بوشهر`);
      return res.json({ success: true });
    }

    if (type === "custom_category") {
      const categories = readDb("custom_categories.json");
      const customEquips = readDb("custom_equipment.json");
      const hasItems = customEquips.some(e => e.categorySlug === id);
      if (hasItems) {
        return res.status(400).json({ error: "این دسته دارای تجهیز فعال است و امکان حذف آن وجود ندارد." });
      }
      const idx = categories.findIndex((c) => c.id === id);
      if (idx === -1) return res.status(404).json({ error: "دسته‌بندی یافت نشد." });
      categories.splice(idx, 1);
      writeDb("custom_categories.json", categories);
      addAuditLog(opUser, opName, clientIp, "delete", "custom_category", id, `حذف دسته‌بندی سفارشی ${id}`);
      return res.json({ success: true });
    }

    const customCategoriesCheck = readDb("custom_categories.json");
    if (customCategoriesCheck.some(c => c.id === type)) {
      const customEquips = readDb("custom_equipment.json");
      const idx = customEquips.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: "تجهیز یافت نشد." });
      
      const equipCode = customEquips[idx].code;
      customEquips.splice(idx, 1);
      writeDb("custom_equipment.json", customEquips);

      // End active assignments
      const dateStr = getPersianDateString();
      const assignments = readDb("assignments.json");
      assignments.forEach((ass) => {
        if (ass.equipmentCode === equipCode && ass.equipmentType === type && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
      writeDb("assignments.json", assignments);

      addAuditLog(opUser, opName, clientIp, "delete", type, id, `حذف تجهیز سفارشی ${equipCode}`);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: "نوع آیتم نامعتبر است." });
  });

  // API: Intelligent Equipment Transfer
  app.post("/api/transfer", (req, res) => {
    const { equipmentCode, targetPersonnelCode, today } = req.body;
    const dateStr = today || getPersianDateString();
    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    if (!equipmentCode) {
      return res.status(400).json({ error: "کد سخت‌افزار ارسالی الزامی است." });
    }

    // 1. Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | "radio" | "cctv" | null = null;
    let equipItem: any = null;

    const cases = readDb("cases.json");
    const cIdx = cases.findIndex((c) => c.code === equipmentCode);
    if (cIdx !== -1) {
      equipType = "case";
      equipItem = cases[cIdx];
    }

    if (!equipItem) {
      const monitors = readDb("monitors.json");
      const mIdx = monitors.findIndex((m) => m.code === equipmentCode);
      if (mIdx !== -1) {
        equipType = "monitor";
        equipItem = monitors[mIdx];
      }
    }

    if (!equipItem) {
      const printers = readDb("printers.json");
      const prIdx = printers.findIndex((pr) => pr.code === equipmentCode);
      if (prIdx !== -1) {
        equipType = "printer";
        equipItem = printers[prIdx];
      }
    }

    if (!equipItem) {
      const mice = readDb("mice.json");
      const mIdx = mice.findIndex((m) => m.code === equipmentCode);
      if (mIdx !== -1) {
        equipType = "mouse";
        equipItem = mice[mIdx];
      }
    }

    if (!equipItem) {
      const keyboards = readDb("keyboards.json");
      const kIdx = keyboards.findIndex((k) => k.code === equipmentCode);
      if (kIdx !== -1) {
        equipType = "keyboard";
        equipItem = keyboards[kIdx];
      }
    }

    if (!equipItem) {
      const radios = readDb("radios.json");
      const rIdx = radios.findIndex((r) => r.code === equipmentCode);
      if (rIdx !== -1) {
        equipType = "radio";
        equipItem = radios[rIdx];
      }
    }

    if (!equipItem) {
      const cctvs = readDb("cctvs.json");
      const cIdx = cctvs.findIndex((c) => c.code === equipmentCode);
      if (cIdx !== -1) {
        equipType = "cctv";
        equipItem = cctvs[cIdx];
      }
    }

    if (!equipItem || !equipType) {
      return res.status(404).json({ error: "تجهیزی با این کد اموال یافت نشد." });
    }

    const currentOwnerCode = equipItem.assignedTo;

    // Normalize Target Personnel Code
    let targetCode: string | null = targetPersonnelCode;
    if (!targetCode || targetCode === "null" || targetCode === "warehouse") {
      targetCode = null;
    }

    if (currentOwnerCode === targetCode && targetCode !== null) {
      return res.status(400).json({ error: "دستگاه در حال حاضر تحویل همین شخص می‌باشد." });
    }

    // Resolve target personnel name
    const personnel = readDb("personnel.json");
    let targetName: string | null = null;

    if (targetCode !== null) {
      const p = personnel.find((pers) => pers.code === targetCode);
      if (!p) {
        return res.status(444).json({ error: "کاربر هدف یافت نشد." });
      }
      targetName = p.name;
    }

    // Update Equipment Owner Map
    equipItem.assignedTo = targetCode;

    if (equipType === "case") {
      writeDb("cases.json", cases);
    } else if (equipType === "monitor") {
      const monitors = readDb("monitors.json");
      const idx = monitors.findIndex((m) => m.code === equipmentCode);
      monitors[idx] = equipItem;
      writeDb("monitors.json", monitors);
    } else if (equipType === "printer") {
      const printers = readDb("printers.json");
      const idx = printers.findIndex((pr) => pr.code === equipmentCode);
      printers[idx] = equipItem;
      writeDb("printers.json", printers);
    } else if (equipType === "mouse") {
      const mice = readDb("mice.json");
      const idx = mice.findIndex((m) => m.code === equipmentCode);
      mice[idx] = equipItem;
      writeDb("mice.json", mice);
    } else if (equipType === "keyboard") {
      const keyboards = readDb("keyboards.json");
      const idx = keyboards.findIndex((k) => k.code === equipmentCode);
      keyboards[idx] = equipItem;
      writeDb("keyboards.json", keyboards);
    } else if (equipType === "radio") {
      const radios = readDb("radios.json");
      const idx = radios.findIndex((r) => r.code === equipmentCode);
      radios[idx] = equipItem;
      writeDb("radios.json", radios);
    } else if (equipType === "cctv") {
      const cctvs = readDb("cctvs.json");
      const idx = cctvs.findIndex((c) => c.code === equipmentCode);
      cctvs[idx] = equipItem;
      writeDb("cctvs.json", cctvs);
    }

    // History log mapping
    const assignments = readDb("assignments.json");

    // Close active assignment if existed
    if (currentOwnerCode !== null) {
      assignments.forEach((ass) => {
        if (ass.equipmentCode === equipmentCode && ass.equipmentType === equipType && ass.endDate === null) {
          ass.endDate = dateStr;
        }
      });
    }

    // Log new assignment or return to warehouse
    if (targetCode !== null) {
      assignments.push({
        id: `ass_${Date.now()}`,
        equipmentCode,
        equipmentType: equipType,
        personnelCode: targetCode,
        personnelName: targetName,
        startDate: dateStr,
        endDate: null,
      });
    } else {
      assignments.push({
        id: `ass_${Date.now()}`,
        equipmentCode,
        equipmentType: equipType,
        personnelCode: null,
        personnelName: "عودت به انبار/تحویل به کارگاه",
        startDate: dateStr,
        endDate: dateStr,
      });
    }

    writeDb("assignments.json", assignments);

    const actionDetails = targetCode 
      ? `تحویل تجهیز ${equipType} (${equipmentCode}) به پرسنل: ${targetName} (${targetCode})`
      : `عودت هوشمند تجهیز ${equipType} (${equipmentCode}) به انبار مرکزی کارگاه`;
    addAuditLog(opUser, opName, clientIp, "transfer", equipType!, equipmentCode, actionDetails);

    return res.json({
      success: true,
      equipmentType: equipType,
      currentOwner: currentOwnerCode,
      newOwner: targetCode,
      newOwnerName: targetName,
    });
  });

  // API: Restore Backup (Replace completely with requested payload)
  app.post("/api/restore", (req, res) => {
    const data = req.body;

    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "فایل پشتیبان نامعتبر است." });
    }

    const keysMap: { [key: string]: string } = {
      personnel: "personnel.json",
      cases: "cases.json",
      monitors: "monitors.json",
      printers: "printers.json",
      mice: "mice.json",
      keyboards: "keyboards.json",
      radios: "radios.json",
      cctvs: "cctvs.json",
      partsCatalog: "parts_catalog.json",
      parts_catalog: "parts_catalog.json",
      assignments: "assignments.json"
    };
    let restoredCount = 0;

    Object.keys(keysMap).forEach((key) => {
      if (Array.isArray(data[key])) {
        writeDb(keysMap[key], data[key]);
        restoredCount++;
      }
    });

    if (restoredCount === 0) {
      return res.status(400).json({ error: "ساختار فایل پشتیبان معقول نیست." });
    }

    return res.json({
      success: true,
      message: "بازیابی اطلاعات به طور کامل در سرور شبیه‌ساز صورت پذیرفت.",
    });
  });

  // API: Get Security Audit Logs (Admin Only)
  app.get("/api/logs", (req, res) => {
    const logsFile = path.join(DATA_DIR, "logs.json");
    if (!fs.existsSync(logsFile)) {
      return res.json([]);
    }
    try {
      const logs = JSON.parse(fs.readFileSync(logsFile, "utf-8"));
      return res.json(logs);
    } catch (e) {
      return res.json([]);
    }
  });

  // API: Clear Logs (Admin Only)
  app.post("/api/logs/clear", (req, res) => {
    const logsFile = path.join(DATA_DIR, "logs.json");
    try {
      fs.writeFileSync(logsFile, JSON.stringify([], null, 2), "utf-8");
      const opUser = req.headers["x-operator-username"] as string || "admin";
      const opName = req.headers["x-operator-name"] as string || "مدیریت کل";
      const clientIp = getClientIp(req);
      addAuditLog(opUser, opName, clientIp, "delete", "logs", "-", "پاکسازی و تخلیه کل تاریخچه لاگ‌های امنیتی سیستم");
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: "خطا در پاکسازی لاگ‌ها" });
    }
  });

  // API: User Session Heartbeat
  app.post("/api/active-ping", (req, res) => {
    const { username, name } = req.body;
    if (username && username !== "undefined") {
      activeUsers.set(username.toLowerCase(), {
        username: username.toLowerCase(),
        name: name || username,
        lastSeen: Date.now()
      });
    }
    res.json({ success: true });
  });

  // API: Get Active/Online Users
  app.get("/api/online-users", (req, res) => {
    const now = Date.now();
    const list: any[] = [];
    for (const [key, val] of activeUsers.entries()) {
      if (now - val.lastSeen < 65000) { // slightly over 1 minute threshold
        list.push({
          username: val.username,
          name: val.name,
          lastSeen: val.lastSeen
        });
      } else {
        activeUsers.delete(key);
      }
    }
    res.json({
      count: list.length,
      users: list
    });
  });

  // API: Save or Update Repair Task
  app.post("/api/repairs/save", (req, res) => {
    const { 
      id, 
      equipmentCode, 
      equipmentType, 
      requestDate, 
      requesterName, 
      reportedIssue, 
      diagnosis, 
      status, 
      neededParts, 
      repairFee, 
      totalCost, 
      assignedTechnician, 
      completedDate, 
      remarks 
    } = req.body;

    if (!equipmentCode || !equipmentType || !reportedIssue) {
      return res.status(400).json({ error: "کد تجهیز، نوع تجهیز و شرح ایراد الزامی است." });
    }

    const repairs = readDb("repairs.json");
    const existingIndex = id ? repairs.findIndex(r => r.id === id) : -1;
    const isEditing = existingIndex > -1;

    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    const oldRecord = isEditing ? repairs[existingIndex] : null;

    const updatedRepair = {
      id: id || `rep_${Date.now()}`,
      equipmentCode: equipmentCode.trim(),
      equipmentType,
      requestDate: requestDate || getPersianDateString(),
      requesterName: (requesterName || "").trim(),
      reportedIssue: (reportedIssue || "").trim(),
      diagnosis: (diagnosis || "").trim(),
      status: status || "pending_diagnosis",
      neededParts: Array.isArray(neededParts) ? neededParts : [],
      repairFee: Number(repairFee) || 0,
      totalCost: Number(totalCost) || 0,
      assignedTechnician: (assignedTechnician || "").trim(),
      completedDate: (completedDate || "").trim(),
      remarks: (remarks || "").trim()
    };

    if (isEditing) {
      repairs[existingIndex] = updatedRepair;
    } else {
      repairs.push(updatedRepair);
    }

    writeDb("repairs.json", repairs);

    // Audit Log with detailed before and after payloads
    if (isEditing) {
      addAuditLog(opUser, opName, clientIp, "edit", "repair", updatedRepair.equipmentCode, `ویرایش پرونده تعمیراتی تجهیز ${updatedRepair.equipmentCode}: ${updatedRepair.reportedIssue.substring(0, 40)}... (وضعیت: ${updatedRepair.status})`, oldRecord, updatedRepair);
    } else {
      addAuditLog(opUser, opName, clientIp, "create", "repair", updatedRepair.equipmentCode, `ثبت درخواست جدید تعمیرات برای تجهیز ${updatedRepair.equipmentCode}: ${updatedRepair.reportedIssue.substring(0, 40)}...`, null, updatedRepair);
    }

    res.json({ success: true, item: updatedRepair });
  });

  // API: Delete Repair Task
  app.post("/api/repairs/delete", (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "شناسه پرونده تعمیراتی الزامی است." });
    }

    const repairs = readDb("repairs.json");
    const idx = repairs.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "پرونده تعمیراتی یافت نشد." });
    }

    const item = repairs[idx];

    const opUser = req.headers["x-operator-username"] as string || "system";
    const opName = req.headers["x-operator-name"] as string || "سیستم";
    const clientIp = getClientIp(req);

    repairs.splice(idx, 1);
    writeDb("repairs.json", repairs);

    addAuditLog(opUser, opName, clientIp, "delete", "repair", item.equipmentCode, `حذف پرونده تعمیراتی تجهیز با کد اموال ${item.equipmentCode}`, item, null);

    res.json({ success: true });
  });

  // API: ZIP generation - Bundles /php/ directory files
  app.get("/api/download-zip", (req, res) => {
    try {
      const phpDir = path.join(process.cwd(), "php");
      if (!fs.existsSync(phpDir)) {
        return res.status(404).json({ error: "کدهای پیش‌ساخته PHP در سرور یافت نگردید." });
      }

      const zip = new AdmZip();
      zip.addLocalFolder(phpDir);
      const outputBuffer = zip.toBuffer();

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="omran-azarestan-it-system.zip"');
      res.send(outputBuffer);
    } catch (err) {
      console.error("ZIP packaging error:", err);
      res.status(500).json({ error: "خطای داخلی سرور در فشرده‌سازی فایل برنامه." });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`Express custom server running on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  });
}

startServer();
