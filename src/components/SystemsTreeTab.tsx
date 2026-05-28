import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Server, 
  Monitor, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  HelpCircle,
  FileText,
  Building,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Define typed node interface for the D3 tree
interface CustomTreeNode {
  id: string;
  name: string;
  persianName: string;
  type: 'root' | 'department' | 'category' | 'system';
  dept?: 'IT' | 'Finance' | 'HR' | 'Operations' | 'root';
  status?: 'active' | 'maintenance' | 'offline';
  description?: string;
  ipAddress?: string;
  hardwareType?: string;
  docCode: string; // "37-FO-IT-01-01"
  children?: CustomTreeNode[];
  _children?: CustomTreeNode[]; // backing store for collapsed children
}

// Fixed Document Code required by user
const FIXED_DOC_CODE = "37-FO-IT-01-01";

// Rich Hierarchical Dataset
const initialTreeData: CustomTreeNode = {
  id: "root-azarestan",
  name: "Omran Azarestan",
  persianName: "عمران آذرستان (دفتر مرکزی و کارگاه بوشهر)",
  type: "root",
  dept: "root",
  docCode: FIXED_DOC_CODE,
  description: "کلان‌سیستم توزیع سخـت‌افزارها و سامانه‌های اداری",
  children: [
    {
      id: "dept-it",
      name: "IT",
      persianName: "واحد فناوری اطلاعات و ارتباطات (ICT)",
      type: "department",
      dept: "IT",
      docCode: FIXED_DOC_CODE,
      description: "مدیریت زیرساخت، شبکه‌ و پشتیبانی فنی کارگاه‌ها",
      children: [
        {
          id: "it-servers",
          name: "Servers",
          persianName: "سرورهای مرکزی و فرعی",
          type: "category",
          dept: "IT",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "IT-SRV-MAIN",
              name: "IT-SRV-MAIN",
              persianName: "سرور اصلی اکتیو دایرکتوری (AD DS)",
              type: "system",
              dept: "IT",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "کنترلر دامین اصلی و احراز هویت مرکزی پرسنل",
              ipAddress: "192.168.10.10",
              hardwareType: "HPE ProLiant DL380 Gen10"
            },
            {
              id: "IT-SRV-BACKUP",
              name: "IT-SRV-BACKUP",
              persianName: "سرور بک‌آپ‌گیری خودکار و آرشیو",
              type: "system",
              dept: "IT",
              status: "maintenance",
              docCode: FIXED_DOC_CODE,
              description: "بروزرسانی ریداندنسی هارد دیسک‌ها و بک‌آپ دوره‌ای",
              ipAddress: "192.168.10.12",
              hardwareType: "Synology RackStation RS2423+"
            }
          ]
        },
        {
          id: "it-workstations",
          name: "Workstations",
          persianName: "ایستگاه‌های کاری توسعه و ادمین",
          type: "category",
          dept: "IT",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "IT-WRK-ADMIN1",
              name: "IT-WRK-ADMIN1",
              persianName: "رایانه مدیریت و پاسخگویی تیکتینگ",
              type: "system",
              dept: "IT",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "پورتال کاربری مدیریت تجهیزات و پایش لاگ‌ها",
              ipAddress: "192.168.10.50",
              hardwareType: "Intel Core i7 Gen12 - 16GB RAM"
            },
            {
              id: "IT-WRK-DEV2",
              name: "IT-WRK-DEV2",
              persianName: "ایستگاه توسعه پکیج‌ها و کدهای محلی",
              type: "system",
              dept: "IT",
              status: "offline",
              docCode: FIXED_DOC_CODE,
              description: "خارج از شبکه جهت تعمیر اساسی منبع تغذیه (پاور)",
              ipAddress: "10.100.2.11",
              hardwareType: "Intel Core i9 Gen13 - 32GB RAM"
            }
          ]
        },
        {
          id: "it-network",
          name: "Network Devices",
          persianName: "تجهیزات ارتباطی و سوئیچینگ",
          type: "category",
          dept: "IT",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "IT-NET-SWITCH-GW",
              name: "IT-NET-SWITCH-GW",
              persianName: "سوئیچ اصلی لایه ۳ پورت گیگابیت",
              type: "system",
              dept: "IT",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "توزیع پهنای باند و وی‌لن‌بندی سیستم‌های دفتری بوشهر",
              ipAddress: "192.168.10.1",
              hardwareType: "Cisco Catalyst 3850 Series"
            },
            {
              id: "IT-NET-AP-MAIN",
              name: "IT-NET-AP-MAIN",
              persianName: "اکسس پوینت وایرلس اداری",
              type: "system",
              dept: "IT",
              status: "maintenance",
              docCode: FIXED_DOC_CODE,
              description: "تغییر کانال فرکانسی و کانفیگ رومینگ بی‌سیم کارگاه",
              ipAddress: "192.168.10.5",
              hardwareType: "UniFi AP AC LR"
            }
          ]
        }
      ]
    },
    {
      id: "dept-finance",
      name: "Finance",
      persianName: "مدیریت مالی و امور حسابداری",
      type: "department",
      dept: "Finance",
      docCode: FIXED_DOC_CODE,
      description: "ثبت اسناد، پرداخت حقوق و خزانه داری کارگاه",
      children: [
        {
          id: "fin-servers",
          name: "Servers",
          persianName: "بانک‌های اطلاعات مالی",
          type: "category",
          dept: "Finance",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "FIN-SRV-ACC",
              name: "FIN-SRV-ACC",
              persianName: "سرور پایگاه داده همکاران سیستم",
              type: "system",
              dept: "Finance",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "پایگاه داده SQL سرور مالی عمران آذرستان",
              ipAddress: "192.168.20.10",
              hardwareType: "Dell PowerEdge T440"
            }
          ]
        },
        {
          id: "fin-workstations",
          name: "Workstations",
          persianName: "کاربران حسابرسی و خزانه",
          type: "category",
          dept: "Finance",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "FIN-WRK-ACC1",
              name: "FIN-WRK-ACC1",
              persianName: "سیستم اختصاصی رئیس حسابداری",
              type: "system",
              dept: "Finance",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "تخصیص یافته به بخش حقوق دولتی و خزانه کارگاهی",
              ipAddress: "192.168.20.50",
              hardwareType: "Core i5 10th - 16GB RAM"
            },
            {
              id: "FIN-WRK-AUDIT2",
              name: "FIN-WRK-AUDIT2",
              persianName: "کیس حسابرسی و مغایرت‌گیری بانکی",
              type: "system",
              dept: "Finance",
              status: "offline",
              docCode: FIXED_DOC_CODE,
              description: "سیستم موقتاً خاموش - در انتظار بازگشت کاربر از مرخصی",
              ipAddress: "192.168.20.55",
              hardwareType: "Core i3 9th - 8GB RAM"
            }
          ]
        }
      ]
    },
    {
      id: "dept-hr",
      name: "HR & Office",
      persianName: "امور اداری و منابع انسانی",
      type: "department",
      dept: "HR",
      docCode: FIXED_DOC_CODE,
      description: "جذب نیرو، ثبت کارکرد روزانه و آرشیو مدارک پرسنل",
      children: [
        {
          id: "hr-workstations",
          name: "Workstations",
          persianName: "ایستگاه‌های اداری و ثبت نام",
          type: "category",
          dept: "HR",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "HR-WRK-DIR",
              name: "HR-WRK-DIR",
              persianName: "رایانه رئیس کارگزینی و بیمه کارگاهی",
              type: "system",
              dept: "HR",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "ارتباط با پورتال بیمه تامین اجتماعی و ورود پرسنل جدید",
              ipAddress: "192.168.30.20",
              hardwareType: "Core i7 Fast - 16GB RAM"
            },
            {
              id: "HR-WRK-RECP",
              name: "HR-WRK-RECP",
              persianName: "کیس متصدی پذیرش و ثبت ساعت ورود",
              type: "system",
              dept: "HR",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "تخلیه اطلاعات اکسس کنترل و دستگاه اثر انگشت",
              ipAddress: "192.168.30.25",
              hardwareType: "Core i5 11th - 8GB RAM"
            }
          ]
        },
        {
          id: "hr-devices",
          name: "Network Devices",
          persianName: "پرینترها و اسکنرهای اداری",
          type: "category",
          dept: "HR",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "HR-NET-PRINTER-NET",
              name: "HR-NET-PRINTER-NET",
              persianName: "چاپگر توزیع‌شده اداری و چندکاره HP",
              type: "system",
              dept: "HR",
              status: "maintenance",
              docCode: FIXED_DOC_CODE,
              description: "اشکال در درام پرینتر و شارژ کارتریج مجدد",
              ipAddress: "192.168.30.100",
              hardwareType: "HP LaserJet Enterprise M507dn"
            }
          ]
        }
      ]
    },
    {
      id: "dept-operations",
      name: "Operations",
      persianName: "بخش عملیاتی، کارگاه و ایمنی HSE",
      type: "department",
      dept: "Operations",
      docCode: FIXED_DOC_CODE,
      description: "کنترل بتن‌ریزی، ابنیه و پایش ترخیص متریال پروژه‌ها",
      children: [
        {
          id: "ops-servers",
          name: "Servers",
          persianName: "سرورهای نظارت کارگاهی",
          type: "category",
          dept: "Operations",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "OPS-SRV-TELE",
              name: "OPS-SRV-TELE",
              persianName: "سرور پایش و تله‌متری سیلوها",
              type: "system",
              dept: "Operations",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "سنجش لحظه‌ای دما، رطوبت و باسکول الکترونیکی فولادها",
              ipAddress: "192.168.40.10",
              hardwareType: "Advantech Rackmount Industrial PC"
            }
          ]
        },
        {
          id: "ops-workstations",
          name: "Workstations",
          persianName: "سیستم‌های مهندسی و نقشه‌کشی",
          type: "category",
          dept: "Operations",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "OPS-WRK-ENG1",
              name: "OPS-WRK-ENG1",
              persianName: "سیستم مهندس ناظر و اتوکد کارگاهی",
              type: "system",
              dept: "Operations",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "بررسی نقشه‌های شاپ دراوینگ کارگاهی عمران بوشهر",
              ipAddress: "192.168.40.50",
              hardwareType: "ASUS Workstation - RTX 3060 GPU"
            },
            {
              id: "OPS-WRK-SITE2",
              name: "OPS-WRK-SITE2",
              persianName: "رایانه دفتری بخش متریال و انبار پای کار",
              type: "system",
              dept: "Operations",
              status: "maintenance",
              docCode: FIXED_DOC_CODE,
              description: "رفع عیب نویز شدید فن پردازنده و منبع تغذیه کیس",
              ipAddress: "192.168.40.52",
              hardwareType: "Intel Core i5 - 8GB RAM"
            }
          ]
        },
        {
          id: "ops-network",
          name: "Network & Security",
          persianName: "امنیت سخت‌افزاری و دوربین کارگاه",
          type: "category",
          dept: "Operations",
          docCode: FIXED_DOC_CODE,
          children: [
            {
              id: "OPS-NET-SW24",
              name: "OPS-NET-SW24",
              persianName: "سوئیچ صنعتی ۲۴ پورت کارگاهی",
              type: "system",
              dept: "Operations",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "توزیع کابل‌کشی پیرامونی و دکل‌های رادیویی کارگاه",
              ipAddress: "192.168.40.5",
              hardwareType: "Cisco Industrial Ethernet IE-3000"
            },
            {
              id: "OPS-NET-CCTV-REC",
              name: "OPS-NET-CCTV-REC",
              persianName: "دستگاه ضبط تصویر NVR حراست",
              type: "system",
              dept: "Operations",
              status: "active",
              docCode: FIXED_DOC_CODE,
              description: "ذخیره تصاویر ۶۰ روزه زوم روی سازه‌ها و خروجی انبار",
              ipAddress: "192.168.40.80",
              hardwareType: "Hikvision NVR 32-Channel"
            }
          ]
        }
      ]
    }
  ]
};

// Styling Configuration per department type
const colors = {
  root: {
    bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
    text: 'text-indigo-950 dark:text-indigo-200',
    accent: '#4f46e5',
    pill: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
  },
  IT: {
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
    text: 'text-emerald-950 dark:text-emerald-200',
    accent: '#10b981',
    pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
  },
  Finance: {
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
    text: 'text-amber-950 dark:text-amber-200',
    accent: '#d97706',
    pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
  },
  HR: {
    bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
    text: 'text-purple-950 dark:text-purple-200',
    accent: '#8b5cf6',
    pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
  },
  Operations: {
    bg: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800',
    text: 'text-sky-950 dark:text-sky-200',
    accent: '#0284c7',
    pill: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300'
  }
};

export default function SystemsTreeTab() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // State for collapsible tree data
  const [treeData, setTreeData] = useState<CustomTreeNode>(initialTreeData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<CustomTreeNode | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'offline'>('all');
  
  // SVG Canvas scale states
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const zoomBehaviorRef = useRef<any>(null);

  // Expand/Collapse state trackers
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Flat systems list extractor for search & stats calculation
  const allSystemsFlat = useMemo(() => {
    const list: CustomTreeNode[] = [];
    const recurse = (node: CustomTreeNode) => {
      if (node.type === 'system') {
        list.push(node);
      }
      if (node.children) node.children.forEach(recurse);
      if (node._children) node._children.forEach(recurse);
    };
    recurse(initialTreeData);
    return list;
  }, []);

  // System Stats calculations
  const stats = useMemo(() => {
    const total = allSystemsFlat.length;
    const active = allSystemsFlat.filter(s => s.status === 'active').length;
    const maintenance = allSystemsFlat.filter(s => s.status === 'maintenance').length;
    const offline = allSystemsFlat.filter(s => s.status === 'offline').length;
    return { total, active, maintenance, offline };
  }, [allSystemsFlat]);

  // Handle zooming controls manually
  const handleZoom = (factor: number) => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      if (zoomBehaviorRef.current) {
        svg.transition().duration(400).call(
          zoomBehaviorRef.current.scaleBy, factor
        );
      }
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      if (zoomBehaviorRef.current) {
        svg.transition().duration(600).call(
          zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(80, 280).scale(0.8)
        );
      }
    }
  };

  // Build/Re-render D3 Tree on state mutations
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 980;
    const height = 640;

    // Helper functions for checking if node passes status filter
    const nodeMatchesFilter = (node: CustomTreeNode): boolean => {
      if (statusFilter === 'all') return true;
      if (node.type === 'system') {
        return node.status === statusFilter;
      }
      // For groups/categories/dept, pass if any of its active descendants match
      const checkDescendant = (n: CustomTreeNode): boolean => {
        if (n.type === 'system') return n.status === statusFilter;
        let matched = false;
        if (n.children) matched = matched || n.children.some(checkDescendant);
        if (n._children) matched = matched || n._children.some(checkDescendant);
        return matched;
      };
      return checkDescendant(node);
    };

    // Deep clone the tree structure while respecting collapsed nodes state & filtering
    const buildFilteredHierarchy = (node: CustomTreeNode): CustomTreeNode | null => {
      if (!nodeMatchesFilter(node)) return null;

      const isCollapsed = collapsedNodes[node.id];
      const newNode: CustomTreeNode = { 
        ...node, 
        children: undefined, 
        _children: undefined 
      };

      const sourceChildren = node.children || node._children || [];
      const processesChildren = sourceChildren
        .map(buildFilteredHierarchy)
        .filter((c): c is CustomTreeNode => c !== null);

      if (processesChildren.length > 0) {
        if (isCollapsed) {
          newNode._children = processesChildren;
        } else {
          newNode.children = processesChildren;
        }
      }

      return newNode;
    };

    const filteredRootData = buildFilteredHierarchy(treeData);
    if (!filteredRootData) {
      // If nothing matches filter, clear SVG
      d3.select(svgRef.current).selectAll('.main-group').remove();
      return;
    }

    // Set up d3 select
    const svg = d3.select(svgRef.current);
    svg.selectAll('.main-group').remove(); // clear previous renders

    // Container group supporting zooms & pans
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Setup zoom behaviors
    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100) / 100);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Default translate coordinate to look nice in horizontal layout
    // We want the root on the left or structured left-to-right nicely
    svg.call(zoom.transform, d3.zoomIdentity.translate(80, 240).scale(0.8));

    // Create D3 Hierarchical layouts
    const hierarchyRoot = d3.hierarchy<CustomTreeNode>(filteredRootData);
    
    // Horizontal spacing: root nodes get more horizontal step
    const treeLayout = d3.tree<CustomTreeNode>()
      .size([height - 120, width - 360])
      .nodeSize([84, 250]); // Spacing bounds [nodeHeight, nodeWidth]

    treeLayout(hierarchyRoot);

    // Links Generator (Bezier Curves)
    const linkGenerator = d3.linkHorizontal<any, any>()
      .x(d => d.y) // Swap X and Y for Horizontal orientation
      .y(d => d.x);

    // Render continuous linking lines
    mainGroup.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(hierarchyRoot.links())
      .enter()
      .append('path')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        // Source/Target specific color
        const targetDept = d.target.data.dept || 'root';
        return colors[targetDept as keyof typeof colors]?.accent || '#cbd5e1';
      })
      .attr('stroke-width', (d) => {
        if (d.source.depth === 0) return '3px';
        if (d.source.depth === 1) return '2px';
        return '1.5px';
      })
      .attr('stroke-opacity', 0.55)
      .attr('stroke-dasharray', d => d.target.data.status === 'offline' ? '4,4' : 'none')
      .style('transition', 'all 0.3s ease');

    // Nodes creation
    const node = mainGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(hierarchyRoot.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    // Node container visual cards (Faking HTML card via SVG elements)
    node.each(function (d) {
      const g = d3.select(this);
      const isSystem = d.data.type === 'system';
      const isDept = d.data.type === 'department';
      const isCat = d.data.type === 'category';
      const isRoot = d.data.type === 'root';

      const deptKey = (d.data.dept || 'root') as keyof typeof colors;
      const themeColors = colors[deptKey] || colors.root;
      
      // Highlight check (Search & Status)
      const isMatchingSearch = searchQuery ? 
        d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.data.persianName.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      const isSelected = selectedNode?.id === d.data.id;

      // Draw outer glowing borders for system nodes with pulse or highlight
      if (isMatchingSearch || isSelected) {
        g.append('rect')
          .attr('x', -102)
          .attr('y', -32)
          .attr('width', 204)
          .attr('height', 64)
          .attr('rx', 12)
          .attr('fill', 'none')
          .attr('stroke', isMatchingSearch ? '#10b981' : themeColors.accent)
          .attr('stroke-width', '4px')
          .attr('class', 'animate-pulse')
          .style('filter', 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))');
      }

      // Base Node Cards rectangle dimensions
      const cardWidth = isSystem ? 190 : (isRoot ? 230 : (isDept ? 190 : 160));
      const cardHeight = isSystem ? 52 : (isRoot ? 50 : 42);
      const rxVal = isSystem ? 8 : (isRoot ? 10 : 6);

      // Node background rect
      g.append('rect')
        .attr('x', -cardWidth / 2)
        .attr('y', -cardHeight / 2)
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .attr('rx', rxVal)
        .attr('fill', () => {
          // Status styled system bg
          if (isSystem) {
            if (d.data.status === 'active') return '#f0fdf4'; // Light green
            if (d.data.status === 'maintenance') return '#fffbeb'; // Light amber
            if (d.data.status === 'offline') return '#fef2f2'; // Light red
          }
          if (isDept) return '#eff6ff'; // Light blue
          if (isRoot) return '#f5f3ff'; // Light purple
          return '#f8fafc'; // Slate 50
        })
        .attr('stroke', () => {
          if (isSystem) {
            if (d.data.status === 'active') return '#10b981';
            if (d.data.status === 'maintenance') return '#f59e0b';
            if (d.data.status === 'offline') return '#ef4444';
          }
          return themeColors.accent;
        })
        .attr('stroke-width', isSelected ? '2.5px' : '1.5px');

      // Status Indicator Pill for systems (Small circle on the side)
      if (isSystem) {
        let statusColor = '#10b981';
        if (d.data.status === 'maintenance') statusColor = '#f59e0b';
        if (d.data.status === 'offline') statusColor = '#ef4444';

        g.append('circle')
          .attr('cx', -cardWidth / 2 + 12)
          .attr('cy', 0)
          .attr('r', 5)
          .attr('fill', statusColor);
        
        // Pulser for active systems
        if (d.data.status === 'active') {
          g.append('circle')
            .attr('cx', -cardWidth / 2 + 12)
            .attr('cy', 0)
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', '#10b981')
            .attr('stroke-width', '1px')
            .attr('class', 'animate-ping')
            .style('opacity', 0.35);
        }
      }

      // 🩺 Document Code Label requested by user: Code "37-FO-IT-01-01" as a fixed label
      g.append('text')
        .attr('x', cardWidth / 2 - 8)
        .attr('y', cardHeight / 2 - 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#64748b')
        .attr('font-size', '6.5px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'medium')
        .text(d.data.docCode);

      // System / Group Names Text Elements
      // Name
      g.append('text')
        .attr('x', isSystem ? -cardWidth / 2 + 25 : 0)
        .attr('y', isSystem ? -4 : (isCat ? -2 : 0))
        .attr('text-anchor', isSystem ? 'start' : 'middle')
        .attr('fill', '#0f172a')
        .attr('font-weight', isRoot || isDept ? '900' : '700')
        .attr('font-size', isRoot ? '11px' : (isDept ? '10px' : '9px'))
        .attr('font-family', 'sans-serif')
        .text(d.data.persianName);

      // System ID / Technical Label
      if (isSystem) {
        g.append('text')
          .attr('x', -cardWidth / 2 + 25)
          .attr('y', 11)
          .attr('text-anchor', 'start')
          .attr('fill', '#475569')
          .attr('font-family', 'monospace')
          .attr('font-size', '8px')
          .attr('font-weight', 'black')
          .text(d.data.name);

        // Status Badge text
        let statusText = '🟢 فعال';
        let statusColor = '#047857';
        if (d.data.status === 'maintenance') {
          statusText = '🟡 تعمیرات';
          statusColor = '#b45309';
        } else if (d.data.status === 'offline') {
          statusText = '🔴 خاموش';
          statusColor = '#b91c1c';
        }

        g.append('text')
          .attr('x', cardWidth / 2 - 8)
          .attr('y', -3)
          .attr('text-anchor', 'end')
          .attr('fill', statusColor)
          .attr('font-weight', 'bold')
          .attr('font-size', '7.5px')
          .text(statusText);
      } else {
        // Group secondary labels e.g. children counts
        const childCount = (d.data.children || d.data._children || []).length;
        if (childCount > 0 && !isRoot) {
          g.append('text')
            .attr('x', 0)
            .attr('y', isCat ? 11 : 13)
            .attr('text-anchor', 'middle')
            .attr('fill', '#64748b')
            .attr('font-size', '7.5px')
            .attr('font-weight', 'semibold')
            .text(`(تعداد: ${childCount} آیتم)`);
        }
      }

      // Plus/Minus Collapsible Circle on Nodes with children
      const hasChildren = (d.data.children || d.data._children || []).length > 0;
      if (hasChildren && !isRoot) {
        const isSelfCollapsed = collapsedNodes[d.data.id];
        
        const helperGroup = g.append('g')
          .attr('transform', `translate(${cardWidth / 2}, 0)`);

        helperGroup.append('circle')
          .attr('r', 6)
          .attr('fill', '#ffffff')
          .attr('stroke', themeColors.accent)
          .attr('stroke-width', '1.5px');

        helperGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '9px')
          .attr('fill', themeColors.accent)
          .attr('font-weight', 'black')
          .text(isSelfCollapsed ? '+' : '-');
      }
    });

    // Handle Interactivity events
    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(d.data);

      const hasChildren = (d.data.children || d.data._children || []).length > 0;
      if (hasChildren && d.data.type !== 'root') {
        const nodeId = d.data.id;
        setCollapsedNodes(prev => ({
          ...prev,
          [nodeId]: !prev[nodeId]
        }));
      }
    });

  }, [treeData, collapsedNodes, searchQuery, selectedNode, statusFilter]);

  // Click outside clears selected card
  const handleClearSelection = () => {
    setSelectedNode(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-6 mb-6">
      
      {/* Tab Ribbon Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🌳</span>
            <span>نمودار درختی تعاملی توزیع سیستم‌های سازمانی</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            پایش سلسله‌مراتب سیستم‌های سروری، کلاینت‌ها و سوئیچ‌های تفکیک شده عمران آذرستان به همراه کد مرجع ثابت سند
          </p>
        </div>

        {/* Floating Code badge */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
          <FileText className="w-3.5 h-3.5" />
          <span>کد مرجع ثابت استاندارد: {FIXED_DOC_CODE}</span>
        </div>
      </div>

      {/* Systems Summary Statistics Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-bold">کل تجهیزات پایش شده</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">{stats.total}</span>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl">
          <span className="text-emerald-600 dark:text-emerald-400 text-[11px] block font-bold">🟢 روشن و در مدار (Active)</span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">{stats.active}</span>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl">
          <span className="text-amber-600 dark:text-amber-400 text-[11px] block font-bold">🟡 در حال اورهال / سرویس</span>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5 block">{stats.maintenance}</span>
        </div>
        <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 p-3 rounded-xl">
          <span className="text-red-600 dark:text-red-400 text-[11px] block font-bold">🔴 خارج از مدار (Offline)</span>
          <span className="text-2xl font-black text-red-700 dark:text-red-300 font-mono mt-0.5 block">{stats.offline}</span>
        </div>
      </div>

      {/* Controller Bars (Filters & Searches) */}
      <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800/60 p-4 rounded-xl flex flex-col xl:flex-row justify-between items-center gap-4 mb-5">
        
        {/* Search Input Filter */}
        <div className="w-full xl:max-w-md relative">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">جستجو و ریملایتینگ تجهیزات در ساختار:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثلاً: IT-SRV یا سرور یا نقشه‌کشی..."
              className="w-full text-right p-2.5 pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:outline-none dark:text-white"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 self-start xl:self-center flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">فیلتر وضعیت سلامت:</span>
          {(['all', 'active', 'maintenance', 'offline'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer transition ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {filter === 'all' && '🌐 نمایش همه'}
              {filter === 'active' && '🟢 فقط روشن'}
              {filter === 'maintenance' && '🟡 فقط تعمیرات'}
              {filter === 'offline' && '🔴 فقط خاموش'}
            </button>
          ))}
        </div>

        {/* Zoom & Navigation Actions */}
        <div className="flex items-center gap-1.5 self-end xl:self-center">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="بزرگنمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="کوچکنمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="بازنشانی اندازه و زاویه دید دایره‌ای"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازنشانی مرکز</span>
          </button>
        </div>
      </div>

      {/* Main Container visual panel hosting SVG tree */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* SVG Drawing Zone (Takes 3 columns on wide desktop) */}
        <div className="lg:col-span-3 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100/30 dark:bg-slate-950/50 relative">
          
          {/* Legend indicator badges */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px] space-y-1.5 z-10 shadow-sm pointer-events-none">
            <span className="font-bold text-slate-800 dark:text-slate-200 block border-b pb-1">راهنما و فیلتربندی رنگ‌ها:</span>
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>عمران آذرستان (کل دپارتمان‌ها)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>آی‌تی و مرکز ارتباطات (ICT)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>دپارتمان مالی و حسابرسی</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>دبیرخانه و منابع انسانی (HR)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>عملیات عمرانی و دوربین پیشرفته</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block border-t pt-1">💡 جهت مشاهده جزییات یا بازبستن روی نودها کلیک فرمایید.</span>
          </div>

          {/* Scale HUD info */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono p-1 px-2.5 rounded-full pointer-events-none">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>

          {/* The drawing box */}
          <div 
            ref={containerRef} 
            className="w-full h-[580px] overflow-hidden"
            onClick={handleClearSelection}
          >
            <svg 
              ref={svgRef} 
              className="w-full h-full select-none"
            />
          </div>
        </div>

        {/* Sidebar displaying details of selected node */}
        <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 border-b pb-2 mb-3 flex items-center justify-between">
            <span>🔍 جزییات و متادیتای سیستم انتخاب‌شده</span>
            <span className="text-blue-500 block font-normal text-[10px]">کلیک کنید</span>
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              
              {/* Box title based on node type */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  {selectedNode.type === 'root' && '🏢 سامانه مرکزی سازمان'}
                  {selectedNode.type === 'department' && '👥 دپارتمان بزرگ'}
                  {selectedNode.type === 'category' && '📂 دسته بندی فرعی'}
                  {selectedNode.type === 'system' && '🖥️ تجهیز سخت‌افزاری فعال'}
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {selectedNode.persianName}
                </h4>
                <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                  id: {selectedNode.name}
                </div>
              </div>

              {/* Status and colors if system */}
              {selectedNode.type === 'system' && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedNode.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400' :
                  selectedNode.status === 'maintenance' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400' :
                  'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
                }`}>
                  <span className="font-bold">وضعیت در ساختار درختی:</span>
                  <span className="font-bold font-mono">
                    {selectedNode.status === 'active' && '🟢 ACTIVE (فعال)'}
                    {selectedNode.status === 'maintenance' && '🟡 MAINTENANCE (تعمیر)'}
                    {selectedNode.status === 'offline' && '🔴 OFFLINE (خاموش)'}
                  </span>
                </div>
              )}

              {/* Fixed document code check */}
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">📄 کد آیین‌نامه و شیوه ثبت (ثابت):</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-300 block select-all">
                  {selectedNode.docCode}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">ثبت شده تحت لایسنس بازاریابی سازمان</span>
              </div>

              {/* Metadata variables if System layout */}
              <div className="space-y-2.5 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                {selectedNode.ipAddress && (
                  <div>
                    <span className="text-slate-400 text-[10px] block">🌐 آدرس آی‌پی (IP Address):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{selectedNode.ipAddress}</span>
                  </div>
                )}
                
                {selectedNode.hardwareType && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">📦 مدل و نام سخت‌افزار استاندارد:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{selectedNode.hardwareType}</span>
                  </div>
                )}

                {selectedNode.description && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">📝 نقش کاربردی در دیسپاچینگ:</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-normal block mt-0.5">
                      {selectedNode.description}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-400 leading-relaxed text-center">
                جهت بازیابی اطلاعات درختی اصلی، از فیلتر وضعیت در نوار بالایی استفاده کنید.
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
              <span className="text-3xl mb-1.5 opacity-75">💬</span>
              <p className="text-xs font-semibold">هیچ آیتمی انتخاب نشده است.</p>
              <p className="text-[10px] mt-1">جهت مشاهده متادیتا، آی‌پی پیوندی و شرح وظیفه، روی نودهای درختی دلخواه کلیک فرمایید.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
