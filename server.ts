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
  const partsCatalogFile = path.join(DATA_DIR, "parts_catalog.json");
  const assignmentsFile = path.join(DATA_DIR, "assignments.json");

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

async function startServer() {
  initializeDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "50mb" }));

  // API: Get All Data
  app.get("/api/data", (req, res) => {
    res.json({
      personnel: readDb("personnel.json"),
      cases: readDb("cases.json"),
      monitors: readDb("monitors.json"),
      printers: readDb("printers.json"),
      mice: readDb("mice.json"),
      keyboards: readDb("keyboards.json"),
      partsCatalog: readDb("parts_catalog.json"),
      assignments: readDb("assignments.json"),
    });
  });

  // API: Save/Edit Item
  app.post("/api/save", (req, res) => {
    const { type, isEdit, id, code, oldCode, ...fields } = req.body;

    if (!type || !code) {
      return res.status(400).json({ error: "اطلاعات ارسالی ناقص است." });
    }

    const trimmedCode = code.trim();

    if (type === "personnel") {
      const personnel = readDb("personnel.json");
      const name = fields.name?.trim();
      const title = fields.title?.trim();
      const department = fields.department?.trim();
      const location = fields.location?.trim();

      if (!name) {
        return res.status(400).json({ error: "نام پرسنل الزامی است." });
      }

      const existingIndex = personnel.findIndex((p) => p.code === trimmedCode && (!isEdit || p.id !== id));
      if (existingIndex !== -1) {
        return res.status(400).json({ error: "کد پرسنلی تکراری است." });
      }

      const existingItem = isEdit ? personnel.find((p) => p.id === id) : null;
      const item = {
        id: isEdit ? id : `p_${Date.now()}`,
        name,
        code: trimmedCode,
        title: title || "-",
        department: department || "-",
        location: location || "کارگاه بوشهر",
        documentNumber: fields.documentNumber !== undefined ? fields.documentNumber : (existingItem ? existingItem.documentNumber : ""),
      };

      if (isEdit) {
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

      writeDb("personnel.json", personnel);
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
      };

      if (isEdit) {
        const idx = cases.findIndex((c) => c.code === lookupCode);
        if (idx !== -1) cases[idx] = item;
      } else {
        cases.push(item);
      }

      writeDb("cases.json", cases);
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
      };

      if (isEdit) {
        const idx = monitors.findIndex((m) => m.code === lookupCode);
        if (idx !== -1) monitors[idx] = item;
      } else {
        monitors.push(item);
      }

      writeDb("monitors.json", monitors);
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
      };

      if (isEdit) {
        const idx = printers.findIndex((pr) => pr.code === lookupCode);
        if (idx !== -1) printers[idx] = item;
      } else {
        printers.push(item);
      }

      writeDb("printers.json", printers);
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
      };

      if (isEdit) {
        const idx = mice.findIndex((m) => m.code === lookupCode);
        if (idx !== -1) mice[idx] = item;
      } else {
        mice.push(item);
      }

      writeDb("mice.json", mice);
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
      };

      if (isEdit) {
        const idx = keyboards.findIndex((k) => k.code === lookupCode);
        if (idx !== -1) keyboards[idx] = item;
      } else {
        keyboards.push(item);
      }

      writeDb("keyboards.json", keyboards);
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
      return res.json({ success: true, item });
    }

    return res.status(400).json({ error: "نوع آیتم نامعتبر است." });
  });

  // API: Delete Item
  app.post("/api/delete", (req, res) => {
    const { type, id, today } = req.body;
    const dateStr = today || getPersianDateString();

    if (!type || !id) {
      return res.status(400).json({ error: "شناسه یا مانیفست حذف ارسال نگردیده." });
    }

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

      return res.json({ success: true });
    }

    if (type === "catalog") {
      const catalog = readDb("parts_catalog.json");
      const idx = catalog.findIndex((c) => c.id === id);
      if (idx === -1) return res.status(404).json({ error: "قطعه مرجع یافت نشد." });

      catalog.splice(idx, 1);
      writeDb("parts_catalog.json", catalog);

      return res.json({ success: true });
    }

    return res.status(400).json({ error: "نوع آیتم نامعتبر است." });
  });

  // API: Intelligent Equipment Transfer
  app.post("/api/transfer", (req, res) => {
    const { equipmentCode, targetPersonnelCode, today } = req.body;
    const dateStr = today || getPersianDateString();

    if (!equipmentCode) {
      return res.status(400).json({ error: "کد سخت‌افزار ارسالی الزامی است." });
    }

    // 1. Locate Equipment
    let equipType: "case" | "monitor" | "printer" | "mouse" | "keyboard" | null = null;
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
        personnelName: "خروج به انبار/تحویل به کارگاه",
        startDate: dateStr,
        endDate: dateStr,
      });
    }

    writeDb("assignments.json", assignments);

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
