import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Server, 
  Monitor as MonitorIcon, 
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
import { Personnel, Case, Monitor, Printer, Mouse, Keyboard } from '../types';

// Define typed node interface for the D3 tree
interface CustomTreeNode {
  id: string;
  name: string;
  persianName: string;
  type: 'root' | 'department' | 'category' | 'system';
  dept?: string;
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

interface SystemsTreeTabProps {
  personnel: Personnel[];
  cases: Case[];
  monitors: Monitor[];
  printers: Printer[];
  mice?: Mouse[];
  keyboards?: Keyboard[];
}

export default function SystemsTreeTab({
  personnel,
  cases,
  monitors,
  printers,
  mice = [],
  keyboards = []
}: SystemsTreeTabProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<CustomTreeNode | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'offline'>('all');
  
  // SVG Canvas scale states
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const zoomBehaviorRef = useRef<any>(null);

  // Expand/Collapse state trackers
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Show/Hide specific levels of the tree structure: Units, Locations, Personnel, Equipment
  const [showUnits, setShowUnits] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [showPersonnel, setShowPersonnel] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);

  // Map status helper: 'working' | 'repair' | 'retired' -> 'active' | 'maintenance' | 'offline'
  const mapStatus = (status?: 'working' | 'repair' | 'retired' | string): 'active' | 'maintenance' | 'offline' => {
    if (status === 'working') return 'active';
    if (status === 'repair') return 'maintenance';
    if (status === 'retired') return 'offline';
    return 'active';
  };

  // Map department helper for visual themes
  const getDeptKey = (dept?: string): 'IT' | 'Finance' | 'HR' | 'Operations' | 'root' => {
    if (!dept) return 'root';
    const d = dept.toLowerCase();
    if (d.includes('فناوری') || d.includes('آی') || d.includes('it') || d.includes('ict')) return 'IT';
    if (d.includes('مالی') || d.includes('حساب')) return 'Finance';
    if (d.includes('اداری') || d.includes('منابع') || d.includes('hr')) return 'HR';
    if (d.includes('عملیات' ) || d.includes('کارگاه') || d.includes('مهندسی') || d.includes('فنی') || d.includes('پروژه')) return 'Operations';
    return 'IT';
  };

  // Dynamically Build Hierarchical Tree strictly from user's current DB
  const dynamicTreeData = useMemo<CustomTreeNode>(() => {
    const root: CustomTreeNode = {
      id: "root-origin",
      name: "Omran Azarestan",
      persianName: "شرکت عمران آذرستان (اداری و کارگاهی)",
      type: "root",
      dept: "root",
      docCode: FIXED_DOC_CODE,
      description: "کلان‌سیستم توزیع سخت‌افزارها و سامانه‌های سازمان بر اساس واحد خدمتی (دپارتمان) و محل استقرار",
      children: []
    };

    // Group personnel by department and location
    const deptMap: Record<string, Record<string, Personnel[]>> = {};

    personnel.forEach(p => {
      const d = p.department || "سایر بخش‌ها";
      const l = p.location || "نامشخص";
      if (!deptMap[d]) {
        deptMap[d] = {};
      }
      if (!deptMap[d][l]) {
        deptMap[d][l] = [];
      }
      deptMap[d][l].push(p);
    });

    const deptNodes: CustomTreeNode[] = [];

    // Map registered departments
    Object.entries(deptMap).forEach(([deptName, locs]) => {
      const deptKey = getDeptKey(deptName);
      const deptNode: CustomTreeNode = {
        id: `dept-${deptName}`,
        name: deptName,
        persianName: `واحد ${deptName}`,
        type: "department",
        dept: deptKey,
        docCode: FIXED_DOC_CODE,
        description: `تجهیزات و پرسنل متعلق به واحد ${deptName}`,
        children: []
      };

      const locNodes: CustomTreeNode[] = [];

      Object.entries(locs).forEach(([locName, persList]) => {
        const locNode: CustomTreeNode = {
          id: `loc-${deptName}-${locName}`,
          name: locName,
          persianName: `موقعیت: ${locName}`,
          type: "category",
          dept: deptKey,
          docCode: FIXED_DOC_CODE,
          children: []
        };

        const persNodes: CustomTreeNode[] = [];

        persList.forEach(p => {
          const persNode: CustomTreeNode = {
            id: `p-${p.code}`,
            name: p.code,
            persianName: `${p.name} (${p.title || 'کارمند'})`,
            type: "category",
            dept: deptKey,
            docCode: FIXED_DOC_CODE,
            children: []
          };

          const assignedEquip: CustomTreeNode[] = [];

          // Cases
          cases.filter(c => c.assignedTo === p.code).forEach(c => {
            assignedEquip.push({
              id: `case-${c.code}`,
              name: c.code,
              persianName: `کیس: ${c.motherboard || 'مادربرد'} / CPU: ${c.cpu || 'پردازنده'}`,
              type: "system",
              dept: deptKey,
              docCode: FIXED_DOC_CODE,
              status: mapStatus(c.status),
              description: `رم: ${c.ramQty || '8GB'} ${c.ramType || 'DDR4'} / گرافیک: ${c.vga || 'Onboard'}`
            });
          });

          // Monitors
          monitors.filter(m => m.assignedTo === p.code).forEach(m => {
            assignedEquip.push({
              id: `monitor-${m.code}`,
              name: m.code,
              persianName: `مانیتور: ${m.model}`,
              type: "system",
              dept: deptKey,
              docCode: FIXED_DOC_CODE,
              status: mapStatus(m.status),
              description: m.description || "سالم و آماده به کار"
            });
          });

          // Printers
          printers.filter(pr => pr.assignedTo === p.code).forEach(pr => {
            assignedEquip.push({
              id: `printer-${pr.code}`,
              name: pr.code,
              persianName: `چاپگر: ${pr.model}`,
              type: "system",
              dept: deptKey,
              docCode: FIXED_DOC_CODE,
              status: mapStatus(pr.status),
              description: pr.description || "سالم و متصل به شبکه"
            });
          });

          // Keyboards
          keyboards.filter(k => k.assignedTo === p.code).forEach(k => {
            assignedEquip.push({
              id: `keyboard-${k.code}`,
              name: k.code,
              persianName: `کیبورد: ${k.model}`,
              type: "system",
              dept: deptKey,
              docCode: FIXED_DOC_CODE,
              status: mapStatus(k.status),
              description: k.description || "سالم و فعال"
            });
          });

          // Mice
          mice.filter(m => m.assignedTo === p.code).forEach(m => {
            assignedEquip.push({
              id: `mouse-${m.code}`,
              name: m.code,
              persianName: `ماوس: ${m.model}`,
              type: "system",
              dept: deptKey,
              docCode: FIXED_DOC_CODE,
              status: mapStatus(m.status),
              description: m.description || "سالم و فعال"
            });
          });

          if (assignedEquip.length > 0) {
            persNode.children = assignedEquip;
            persNodes.push(persNode);
          }
        });

        if (persNodes.length > 0) {
          locNode.children = persNodes;
          locNodes.push(locNode);
        }
      });

      if (locNodes.length > 0) {
        deptNode.children = locNodes;
        deptNodes.push(deptNode);
      }
    });

    // 2. Unassigned Equipment / Warehouse Node
    const warehouseNode: CustomTreeNode = {
      id: "dept-warehouse",
      name: "Warehouse",
      persianName: "انبار مرکزی و تجهیزات مازاد",
      type: "department",
      dept: "IT",
      docCode: FIXED_DOC_CODE,
      description: "تجهیزات بدون تخصیص یا دپو شده در انبار شرکت",
      children: []
    };

    const warehouseLocNode: CustomTreeNode = {
      id: "loc-warehouse-main",
      name: "Warehouse Main",
      persianName: "موقعیت: انبار بزرگ شرکت",
      type: "category",
      dept: "IT",
      docCode: FIXED_DOC_CODE,
      children: []
    };

    const warehouseEquip: CustomTreeNode[] = [];

    cases.filter(c => !c.assignedTo).forEach(c => {
      warehouseEquip.push({
        id: `case-${c.code}`,
        name: c.code,
        persianName: `کیس انبار: ${c.motherboard || 'مادربرد'} / CPU: ${c.cpu || 'پردازنده'}`,
        type: "system",
        dept: "IT",
        docCode: FIXED_DOC_CODE,
        status: mapStatus(c.status),
        description: `رم: ${c.ramQty || '8GB'} ${c.ramType || 'DDR4'} / گرافیک: ${c.vga || 'Onboard'}`
      });
    });

    monitors.filter(m => !m.assignedTo).forEach(m => {
      warehouseEquip.push({
        id: `monitor-${m.code}`,
        name: m.code,
        persianName: `مانیتور انبار: ${m.model}`,
        type: "system",
        dept: "IT",
        docCode: FIXED_DOC_CODE,
        status: mapStatus(m.status),
        description: "تحویل انبار"
      });
    });

    printers.filter(pr => !pr.assignedTo).forEach(pr => {
      warehouseEquip.push({
        id: `printer-${pr.code}`,
        name: pr.code,
        persianName: `چاپگر انبار: ${pr.model}`,
        type: "system",
        dept: "IT",
        docCode: FIXED_DOC_CODE,
        status: mapStatus(pr.status),
        description: "تحویل انبار"
      });
    });

    keyboards.filter(k => !k.assignedTo).forEach(k => {
      warehouseEquip.push({
        id: `keyboard-${k.code}`,
        name: k.code,
        persianName: `کیبورد انبار: ${k.model}`,
        type: "system",
        dept: "IT",
        docCode: FIXED_DOC_CODE,
        status: mapStatus(k.status),
        description: "تحویل انبار"
      });
    });

    mice.filter(m => !m.assignedTo).forEach(m => {
      warehouseEquip.push({
        id: `mouse-${m.code}`,
        name: m.code,
        persianName: `ماوس انبار: ${m.model}`,
        type: "system",
        dept: "IT",
        docCode: FIXED_DOC_CODE,
        status: mapStatus(m.status),
        description: "تحویل انبار"
      });
    });

    if (warehouseEquip.length > 0) {
      warehouseLocNode.children = warehouseEquip;
      warehouseNode.children = [warehouseLocNode];
      deptNodes.push(warehouseNode);
    }

    root.children = deptNodes;
    return root;
  }, [personnel, cases, monitors, printers, mice, keyboards]);

  const treeData = dynamicTreeData;

  // 1. Rebuild / bypass layers based on user checkbox settings
  const customizedTree = useMemo<CustomTreeNode | null>(() => {
    if (!treeData) return null;

    const getNodeLevel = (node: CustomTreeNode): 'root' | 'unit' | 'location' | 'personnel' | 'equipment' => {
      if (node.type === 'root') return 'root';
      if (node.type === 'department') return 'unit';
      if (node.id.startsWith('loc-')) return 'location';
      if (node.id.startsWith('p-')) return 'personnel';
      if (node.type === 'system') return 'equipment';
      return 'equipment';
    };

    const rebuildTreeWithBypass = (node: CustomTreeNode): CustomTreeNode[] => {
      const level = getNodeLevel(node);
      
      let keep = true;
      if (level === 'unit' && !showUnits) keep = false;
      if (level === 'location' && !showLocations) keep = false;
      if (level === 'personnel' && !showPersonnel) keep = false;
      if (level === 'equipment' && !showEquipment) keep = false;
      
      let childrenList: CustomTreeNode[] = [];
      const sourceChildren = node.children || node._children || [];
      
      sourceChildren.forEach(child => {
        childrenList.push(...rebuildTreeWithBypass(child));
      });

      if (keep) {
        const newNode = { ...node };
        if (childrenList.length > 0) {
          newNode.children = childrenList;
        } else {
          delete newNode.children;
          delete newNode._children;
        }
        return [newNode];
      } else {
        return childrenList;
      }
    };

    const results = rebuildTreeWithBypass(treeData);
    return results[0] || null;
  }, [treeData, showUnits, showLocations, showPersonnel, showEquipment]);

  // Flat systems list extractor for search & stats calculation based on dynamic tree
  const allSystemsFlat = useMemo(() => {
    const list: CustomTreeNode[] = [];
    const recurse = (node: CustomTreeNode) => {
      if (node.type === 'system') {
        list.push(node);
      }
      if (node.children) node.children.forEach(recurse);
      if (node._children) node._children.forEach(recurse);
    };
    if (customizedTree) {
      recurse(customizedTree);
    }
    return list;
  }, [customizedTree]);

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
          zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(80, 285).scale(0.8)
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

    // Check if node matches the search query
    const matchesSearch = (node: CustomTreeNode): boolean => {
      if (!searchQuery) return false;
      const q = searchQuery.toLowerCase();
      return (
        node.name.toLowerCase().includes(q) ||
        node.persianName.toLowerCase().includes(q) ||
        (node.description?.toLowerCase().includes(q) ?? false) ||
        (node.docCode?.toLowerCase().includes(q) ?? false)
      );
    };

    // Check if node or any of its descendants matches the search
    const hasMatchingDescendant = (node: CustomTreeNode): boolean => {
      if (matchesSearch(node)) return true;
      const sourceChildren = node.children || node._children || [];
      return sourceChildren.some(hasMatchingDescendant);
    };

    // Deep clone the tree structure while respecting collapsed nodes state & filtering
    const buildFilteredHierarchy = (node: CustomTreeNode): CustomTreeNode | null => {
      // If there is an active search, filter out nodes that don't match or have matching descendants
      if (searchQuery && !hasMatchingDescendant(node)) {
        return null;
      }

      if (!nodeMatchesFilter(node)) return null;

      // Force expansion if this node has a matching descendant so search results are never hidden
      const forceExpand = searchQuery && hasMatchingDescendant(node);
      const isCollapsed = collapsedNodes[node.id] && !forceExpand;

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

    if (!customizedTree) {
      d3.select(svgRef.current).selectAll('.main-group').remove();
      return;
    }
    const filteredRootData = buildFilteredHierarchy(customizedTree);
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
    svg.call(zoom.transform, d3.zoomIdentity.translate(80, 240).scale(0.8));

    // Create D3 Hierarchical layouts
    const hierarchyRoot = d3.hierarchy<CustomTreeNode>(filteredRootData);
    
    // Horizontal spacing layout with excellent margins to prevent overlaps
    const treeLayout = d3.tree<CustomTreeNode>()
      .size([height - 120, width - 360])
      .nodeSize([96, 280]); 

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

    // Node container visual cards with all texts perfectly centered inside boxes
    node.each(function (d) {
      const g = d3.select(this);
      const isSystem = d.data.type === 'system';
      const isDept = d.data.type === 'department';
      const isCat = d.data.type === 'category';
      const isRoot = d.data.type === 'root';

      const deptKey = (d.data.dept || 'root') as keyof typeof colors;
      const themeColors = colors[deptKey] || colors.root;
      
      const isMatchingSearch = searchQuery ? 
        d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.data.persianName.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      const isSelected = selectedNode?.id === d.data.id;

      // Base Node Cards rectangle dimensions (wider, taller box guarantees space)
      const cardWidth = isSystem ? 230 : (isRoot ? 250 : (isDept ? 210 : 190));
      const cardHeight = isSystem ? 70 : (isRoot ? 58 : (isDept ? 52 : 48));
      const rxVal = isSystem ? 8 : (isRoot ? 10 : 6);

      // Draw outer glowing borders for highlight
      if (isMatchingSearch || isSelected) {
        g.append('rect')
          .attr('x', -cardWidth / 2 - 4)
          .attr('y', -cardHeight / 2 - 4)
          .attr('width', cardWidth + 8)
          .attr('height', cardHeight + 8)
          .attr('rx', rxVal + 4)
          .attr('fill', 'none')
          .attr('stroke', isMatchingSearch ? '#10b981' : themeColors.accent)
          .attr('stroke-width', '3px')
          .attr('class', 'animate-pulse')
          .style('filter', 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))');
      }

      // Node background rect
      g.append('rect')
        .attr('x', -cardWidth / 2)
        .attr('y', -cardHeight / 2)
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .attr('rx', rxVal)
        .attr('fill', () => {
          if (isSystem) {
            if (d.data.status === 'active') return '#f0fdf4'; 
            if (d.data.status === 'maintenance') return '#fffbeb'; 
            if (d.data.status === 'offline') return '#fef2f2'; 
          }
          if (isDept) return '#eff6ff'; 
          if (isRoot) return '#f5f3ff'; 
          return '#f8fafc'; 
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

      // Centered Text Rendering Engine for perfect centering inside boxes
      if (isSystem) {
        // Status circle indicator placed at the top-left corner
        let statusColor = '#10b981';
        if (d.data.status === 'maintenance') statusColor = '#f59e0b';
        if (d.data.status === 'offline') statusColor = '#ef4444';

        g.append('circle')
          .attr('cx', -cardWidth / 2 + 12)
          .attr('cy', -cardHeight / 2 + 11)
          .attr('r', 4.5)
          .attr('fill', statusColor);

        if (d.data.status === 'active') {
          g.append('circle')
            .attr('cx', -cardWidth / 2 + 12)
            .attr('cy', -cardHeight / 2 + 11)
            .attr('r', 7.5)
            .attr('fill', 'none')
            .attr('stroke', '#10b981')
            .attr('stroke-width', '1px')
            .attr('class', 'animate-ping')
            .style('opacity', 0.4);
        }

        // Line 1: Centered Equipment Display Name (specs)
        g.append('text')
          .attr('x', 0)
          .attr('y', -11)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#0f172a')
          .attr('font-weight', 'bold')
          .attr('font-size', '9.5px')
          .attr('font-family', 'sans-serif')
          .text(d.data.persianName);

        // Line 2: Centered Code & Status Info
        let statusText = 'فعال';
        if (d.data.status === 'maintenance') {
          statusText = 'تعمیرات';
        } else if (d.data.status === 'offline') {
          statusText = 'خاموش';
        }

        g.append('text')
          .attr('x', 0)
          .attr('y', 3)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#475569')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '8.5px')
          .attr('font-weight', 'bold')
          .text(`${d.data.name} (${statusText})`);

        // Line 3: Small Centered description details
        if (d.data.description) {
          g.append('text')
            .attr('x', 0)
            .attr('y', 16)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#64748b')
            .attr('font-size', '7.5px')
            .attr('font-weight', 'medium')
            .text(d.data.description);
        }

        // Line 4: Symmetrically centered Document Reference Code
        g.append('text')
          .attr('x', 0)
          .attr('y', cardHeight / 2 - 5)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#cbd5e1')
          .attr('font-size', '6.5px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'semibold')
          .text(d.data.docCode);

      } else {
        // Non-system nodes: Center everything beautifully
        // Line 1: Primary Centered Persian Name
        g.append('text')
          .attr('x', 0)
          .attr('y', isRoot ? -8 : -5)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', isRoot ? '#1e1b4b' : '#0f172a')
          .attr('font-weight', isRoot || isDept ? 'bold' : '600')
          .attr('font-size', isRoot ? '11px' : (isDept ? '10px' : '9.5px'))
          .attr('font-family', 'sans-serif')
          .text(d.data.persianName);

        // Line 2: Children counts / Description centered horizontally
        const childCount = (d.data.children || d.data._children || []).length;
        if (isRoot) {
          g.append('text')
            .attr('x', 0)
            .attr('y', 6)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#4f46e5')
            .attr('font-size', '8.5px')
            .attr('font-weight', 'semibold')
            .text("نمودار سلسله‌مراتب سازمانی اموال");
        } else if (childCount > 0) {
          g.append('text')
            .attr('x', 0)
            .attr('y', isCat ? 8 : 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#64748b')
            .attr('font-size', '8px')
            .attr('font-weight', 'semibold')
            .text(`(شامل: ${childCount} آیتم فعال)`);
        } else {
          // Empty state placeholder
          g.append('text')
            .attr('x', 0)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#94a3b8')
            .attr('font-size', '8px')
            .text("(فاقد تجهیز فعلی)");
        }

        // Line 3: Standard Ref Doc Code aligned middle inside the box
        g.append('text')
          .attr('x', 0)
          .attr('y', cardHeight / 2 - 5)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#cbd5e1')
          .attr('font-size', '6.5px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'semibold')
          .text(d.data.docCode);
      }

      // Plus/Minus Collapsible Circle on Nodes with children
      const hasChildren = (d.data.children || d.data._children || []).length > 0;
      if (hasChildren && !isRoot) {
        const isSelfCollapsed = collapsedNodes[d.data.id];
        
        const helperGroup = g.append('g')
          .attr('transform', `translate(${cardWidth / 2}, 0)`);

        helperGroup.append('circle')
          .attr('r', 6.5)
          .attr('fill', '#ffffff')
          .attr('stroke', themeColors.accent)
          .attr('stroke-width', '1.5px');

        helperGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '9.5px')
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

  }, [customizedTree, collapsedNodes, searchQuery, selectedNode, statusFilter]);

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
            پایش سلسله‌مراتب زنده سیستم‌های سروری، کلاینت‌ها و سوئیچ‌های تفکیک شده بر اساس واحد خدمتی، محل استقرار و وضعیت سلامت زنده
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
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-bold">کل تجهیزات پایه‌ریزی شده</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">{stats.total}</span>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl">
          <span className="text-emerald-600 dark:text-emerald-400 text-[11px] block font-bold">🟢 روشن و در مدار (Working)</span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">{stats.active}</span>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl">
          <span className="text-amber-600 dark:text-amber-400 text-[11px] block font-bold">🟡 در حال اورهال / تعمیر</span>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5 block">{stats.maintenance}</span>
        </div>
        <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 p-3 rounded-xl">
          <span className="text-red-600 dark:text-red-400 text-[11px] block font-bold">🔴 خارج از مدار (Retired)</span>
          <span className="text-2xl font-black text-red-700 dark:text-red-300 font-mono mt-0.5 block">{stats.offline}</span>
        </div>
      </div>

      {/* 🛠️ مرکز کنترل و فیلترهای تعاملی هوشمند */}
      <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800/60 rounded-2xl p-5 mb-6 space-y-5">
        
        {/* ردیف اول: جستجوی پیشرفته + ابزارهای ناوبری و زوم */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* بخش جستجوی پیشرفته با استایل هوشمند و حرفه‌ای (۸ ستون در دسکتاپ) */}
          <div className="lg:col-span-8 space-y-1.5 w-full">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="text-blue-500 text-sm">🔍</span>
              <span>جستجو و ریملایتینگ هوشمند تجهیزات و پرسنل:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="کد سخت‌افزار، نام پرسنل، نوع تجهیزات (کیس، مانیتور...) یا دپارتمان..."
                className="w-full text-right p-3 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none dark:text-white transition shadow-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                <Search className="w-4 h-4" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="hover:text-red-500 transition text-xs font-bold font-mono px-1 rounded bg-slate-100 dark:bg-slate-800"
                  >
                    ×
                  </button>
                )}
              </span>
            </div>
          </div>

          {/* ابزارهای زوم و ناوبری (۴ ستون در دسکتاپ) */}
          <div className="lg:col-span-4 space-y-1.5 w-full">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🎛️</span>
              <span>تنظیم ابعاد نقشه:</span>
            </label>
            <div className="flex items-center gap-2 h-11">
              <button
                onClick={() => handleZoom(1.2)}
                className="flex-1 h-full flex items-center justify-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-semibold text-xs active:scale-[0.98] cursor-pointer shadow-sm"
                title="بزرگنمایی"
              >
                <ZoomIn className="w-4 h-4 text-blue-500" />
                <span>+</span>
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                className="flex-1 h-full flex items-center justify-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-semibold text-xs active:scale-[0.98] cursor-pointer shadow-sm"
                title="کوچکنمایی"
              >
                <ZoomOut className="w-4 h-4 text-slate-500" />
                <span>-</span>
              </button>
              <button
                onClick={handleResetZoom}
                className="flex-[2] h-full flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border border-transparent rounded-xl hover:bg-slate-800 transition-all font-bold text-xs active:scale-[0.98] cursor-pointer shadow-sm"
                title="بازنشانی اندازه و زاویه دید دایره‌ای"
              >
                <RotateCcw className="w-3.5 h-3.5 animate-spin-reverse" />
                <span>بازنشانی مرکز</span>
              </button>
            </div>
          </div>

        </div>

        {/* خط جداکننده افقی ظریف */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/80"></div>

        {/* ردیف دوم: فیلتر وضعیت سلامت کاربری + فیلتر سطوح درخت */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* فیلتر وضعیت کاربری تجهیزات */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">فیلتر بر اساس وضعیت سیستم‌ها:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['all', 'active', 'maintenance', 'offline'] as const).map((filter) => {
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`p-2.5 rounded-xl text-[11px] font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 border ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {filter === 'all' && <span className="text-sm">🌐</span>}
                    {filter === 'active' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15"></span>}
                    {filter === 'maintenance' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/15"></span>}
                    {filter === 'offline' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/15"></span>}

                    <span>
                      {filter === 'all' && 'نمایش همه'}
                      {filter === 'active' && 'فقط سالم'}
                      {filter === 'maintenance' && 'فقط تعمیرات'}
                      {filter === 'offline' && 'فقط اسقاط'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* فیلتر نمایش پارامترهای ساختار (سطوح درخت) */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>⚙️</span>
              <span>فیلتر نمایش پارامترهای ساختار (سطوح درخت):</span>
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* واحدها */}
              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                showUnits 
                  ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/70 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 font-bold' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
              }`}>
                <input 
                  type="checkbox" 
                  checked={showUnits} 
                  onChange={(e) => setShowUnits(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs leading-none">واحدها</span>
              </label>

              {/* موقعیت‌ها */}
              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                showLocations 
                  ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/70 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 font-bold' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
              }`}>
                <input 
                  type="checkbox" 
                  checked={showLocations} 
                  onChange={(e) => setShowLocations(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs leading-none">موقعیت‌ها</span>
              </label>

              {/* پرسنل‌ها */}
              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                showPersonnel 
                  ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/70 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 font-bold' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
              }`}>
                <input 
                  type="checkbox" 
                  checked={showPersonnel} 
                  onChange={(e) => setShowPersonnel(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs leading-none">پرسنل‌ها</span>
              </label>

              {/* تجهیزات */}
              <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                showEquipment 
                  ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/70 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 font-bold' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through'
              }`}>
                <input 
                  type="checkbox" 
                  checked={showEquipment} 
                  onChange={(e) => setShowEquipment(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs leading-none">تجهیزات</span>
              </label>

            </div>
          </div>

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
              <span>سامانه مرکزی سازمان (عمران آذرستان)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>واحدهای فناوری اطلاعات و ارتباطات</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>دپارتمان مالی و حسابداری</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>دبیرخانه و منابع انسانی (HR)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>واحدهای فنی، کارگاهی و سایر بخش‌ها</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block border-t pt-1">💡 جهت پایش جزییات یا بازبستن روی نودها کلیک فرمایید.</span>
          </div>

          {/* Scale HUD info */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono p-1 px-2.5 rounded-full pointer-events-none">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>

          {/* The drawing box */}
          <div 
            ref={containerRef} 
            className="w-full h-[580px] overflow-hidden bg-slate-50 dark:bg-slate-950"
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
            <span>🔍 جزییات و متادیتای تجهیز انتخاب‌شده</span>
            <span className="text-blue-500 block font-normal text-[10px]">کلیک کنید</span>
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              
              {/* Box title based on node type */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  {selectedNode.type === 'root' && '🏢 سامانه مرکزی سازمان'}
                  {selectedNode.type === 'department' && '👥 واحد بزرگ خدمتی'}
                  {selectedNode.type === 'category' && '📂 رده یا موقعیت استقرار'}
                  {selectedNode.type === 'system' && '🖥️ تجهیز سخت‌افزاری فعال'}
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {selectedNode.persianName}
                </h4>
                <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                  کد شناسایی: {selectedNode.name}
                </div>
              </div>

              {/* Status and colors if system */}
              {selectedNode.type === 'system' && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedNode.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400' :
                  selectedNode.status === 'maintenance' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400' :
                  'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
                }`}>
                  <span className="font-bold">وضعیت سلامت تجهیز:</span>
                  <span className="font-bold font-mono">
                    {selectedNode.status === 'active' && '🟢 WORKING (سالم)'}
                    {selectedNode.status === 'maintenance' && '🟡 SERVICE (تعمیر)'}
                    {selectedNode.status === 'offline' && '🔴 RETIRED (اسقاط)'}
                  </span>
                </div>
              )}

              {/* Fixed document code check */}
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-bold">📄 کد آیین‌نامه و شیوه ثبت (ثابت):</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-300 block select-all">
                  {selectedNode.docCode}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">ثبت شده تحت قالب گزارش اموال کارگاهی</span>
              </div>

              {/* Metadata variables if System layout */}
              <div className="space-y-2.5 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
                {selectedNode.ipAddress && (
                  <div>
                    <span className="text-slate-400 text-[10px] block">🌐 آدرس آی‌پی (IP):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{selectedNode.ipAddress}</span>
                  </div>
                )}
                
                {selectedNode.hardwareType && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">📦 رده سخت‌افزاری استاندارد:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{selectedNode.hardwareType}</span>
                  </div>
                )}

                {selectedNode.description && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">📝 مشخصات سیستم یا کاربری پرسنل:</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold leading-normal block mt-0.5">
                      {selectedNode.description}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-400 leading-relaxed text-center">
                جهت فیلتر برحسب وضعیت‌های خاص، بر روی دکمه‌های کنترلی نوار بالایی بفشارید.
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
              <span className="text-3xl mb-1.5 opacity-75">💬</span>
              <p className="text-xs font-semibold">هیچ آیتمی انتخاب نشده است.</p>
              <p className="text-[10px] mt-1">جهت مشاهده کامل متادیتا، آی‌پی‌ها و مشخصات قطعات تجهیز، روی نودهای درختی کلیک کنید.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
