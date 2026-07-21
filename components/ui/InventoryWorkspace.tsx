'use client';

import { WorkspaceSidebarNav } from './Workspace/WorkspaceSidebarNav';
import { WorkspaceTabPanel } from './Workspace/WorkspaceTabPanel';
import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  FileText,
  Truck,
  Building,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ClipboardList,
  MapPin,
  FileSpreadsheet,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Download,
  BarChart2,
  Activity,
  History,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  Shield,
  CornerDownRight,
  Info,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Bell,
  ThermometerSnowflake,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// --- ERP INVENTORY INTERFACES ---
interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: 'Pharmaceuticals' | 'Medical Supplies' | 'Protective Gear' | 'Diagnostics' | 'Lab Reagents';
  brand: string;
  manufacturer: string;
  supplierName: string;
  warehouse: string;
  storageLocation: string; // e.g. Shelf B-4, Cold Box 2
  batchNumber: string;
  lotNumber: string;
  serialNumber?: string;
  expiryDate: string;
  stockQuantity: number;
  minimumStock: number;
  unitOfMeasure: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
  valuePerUnit: number;
  attachments: string[];
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  itemsCount: number;
  totalCost: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Received' | 'Cancelled';
  paymentTerms: string;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  performanceScore: number; // 0 to 100
  paymentTerms: string;
  activeContracts: number;
  totalSpent: number;
}

interface StockMovement {
  id: string;
  timestamp: string;
  sku: string;
  productName: string;
  type: 'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment' | 'Consumption' | 'Return';
  quantity: number;
  fromLocation: string;
  toLocation: string;
  authorizedBy: string;
  referenceDoc: string; // PO or patient case ID
}

interface Warehouse {
  id: string;
  name: string;
  type: 'General' | 'Cold Storage' | 'Clinic Stock' | 'Lab Depot';
  address: string;
  shelvesCount: number;
  occupancyPercent: number;
}

// --- REALISTIC ERP DATASETS ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'P-101',
    sku: 'PH-AMX-500-C10',
    barcode: '400129038201',
    name: 'Amoxicillin Trihydrate 500mg',
    description: 'Broad spectrum penicillin antibiotic, 500mg capsules. Store below 25°C.',
    category: 'Pharmaceuticals',
    brand: 'Amoxil',
    manufacturer: 'GlaxoSmithKline',
    supplierName: 'PharmaLink Distributions',
    warehouse: 'HealthOS Central Warehouse',
    storageLocation: 'Aisle 3, Shelf B-2',
    batchNumber: 'AMX-BC99',
    lotNumber: 'L-2026-X11',
    expiryDate: '2027-04-15',
    stockQuantity: 12400,
    minimumStock: 2000,
    unitOfMeasure: 'Capsules',
    status: 'In Stock',
    valuePerUnit: 0.12,
    attachments: ['GSK_Amoxicillin_COA.pdf', 'FDA_PharmaLink_Clearance.pdf']
  },
  {
    id: 'P-102',
    sku: 'PP-N95-FLT-M01',
    barcode: '088390192830',
    name: 'Clinical N95 Respirator Mask',
    description: 'Particulate respirator mask, high-filtration medical grade. Adjustable nose clip.',
    category: 'Protective Gear',
    brand: 'Aura 1870+',
    manufacturer: '3M Healthcare',
    supplierName: 'SafeMed Global',
    warehouse: 'HealthOS Central Warehouse',
    storageLocation: 'Aisle 1, Shelf D-4',
    batchNumber: '3M-N95-77A',
    lotNumber: 'L-998-3M',
    expiryDate: '2031-10-22',
    stockQuantity: 840,
    minimumStock: 1000,
    unitOfMeasure: 'Units',
    status: 'Low Stock',
    valuePerUnit: 1.45,
    attachments: ['NIOSH_N95_Certificate.pdf']
  },
  {
    id: 'P-103',
    sku: 'MS-SYR-5ML-S02',
    barcode: '501293810291',
    name: 'Disposable Syringe 5ml (Luer Lock)',
    description: 'Sterile single use syringe, Luer Lock connection, without needle.',
    category: 'Medical Supplies',
    brand: 'Plastipak',
    manufacturer: 'Becton Dickinson (BD)',
    supplierName: 'Global MedSurg Inc.',
    warehouse: 'Clinic Ward Depot',
    storageLocation: 'Aisle 5, Shelf A-1',
    batchNumber: 'BD-SYR-55',
    lotNumber: 'L-221-BD',
    expiryDate: '2029-08-30',
    stockQuantity: 45000,
    minimumStock: 5000,
    unitOfMeasure: 'Units',
    status: 'In Stock',
    valuePerUnit: 0.08,
    attachments: ['Sterilization_Compliance_Doc.pdf']
  },
  {
    id: 'P-104',
    sku: 'LR-COV-PCR-G20',
    barcode: '880918239012',
    name: 'SARS-CoV-2 PCR Test Reagent Kit',
    description: 'Real-time RT-PCR assay kits for qualitative detection. Temp controlled.',
    category: 'Lab Reagents',
    brand: 'TaqPath COVID-19',
    manufacturer: 'Thermo Fisher Scientific',
    supplierName: 'PharmaLink Distributions',
    warehouse: 'Cold Storage Vault',
    storageLocation: 'Sub-Zero Freezer B',
    batchNumber: 'TF-COV-822',
    lotNumber: 'L-882-TF',
    expiryDate: '2026-08-25',
    stockQuantity: 450,
    minimumStock: 200,
    unitOfMeasure: 'Kits',
    status: 'Expiring Soon',
    valuePerUnit: 45.00,
    attachments: ['ColdChain_Log_Validated.xlsx', 'ThermoFisher_Instructions.pdf']
  },
  {
    id: 'P-105',
    sku: 'DG-GLU-MTR-X01',
    barcode: '711209381923',
    name: 'Digital Glucometer Pro V3',
    description: 'Accurate blood glucose monitoring system with Bluetooth connectivity.',
    category: 'Diagnostics',
    brand: 'Accu-Chek Instant',
    manufacturer: 'Roche Diagnostics',
    supplierName: 'Roche Direct Supply',
    warehouse: 'Clinic Ward Depot',
    storageLocation: 'Shelf F-3',
    batchNumber: 'RCH-GLU-01',
    lotNumber: 'L-ROC-77',
    expiryDate: '2030-01-01',
    stockQuantity: 0,
    minimumStock: 15,
    unitOfMeasure: 'Units',
    status: 'Out of Stock',
    valuePerUnit: 35.00,
    attachments: ['Roche_Bluetooth_SDK.pdf']
  }
];

const INITIAL_POS: PurchaseOrder[] = [
  { id: 'PO-801', poNumber: 'PO-2026-001', supplierName: 'PharmaLink Distributions', orderDate: '2026-07-10', deliveryDate: '2026-07-20', itemsCount: 3, totalCost: 14200.00, status: 'Approved', paymentTerms: 'Net 30' },
  { id: 'PO-802', poNumber: 'PO-2026-002', supplierName: 'SafeMed Global', orderDate: '2026-07-15', deliveryDate: '2026-07-22', itemsCount: 1, totalCost: 1450.00, status: 'Pending Approval', paymentTerms: 'Net 15' },
  { id: 'PO-803', poNumber: 'PO-2026-003', supplierName: 'Global MedSurg Inc.', orderDate: '2026-07-11', deliveryDate: '2026-07-14', itemsCount: 5, totalCost: 3600.00, status: 'Received', paymentTerms: 'Due on Receipt' },
  { id: 'PO-804', poNumber: 'PO-2026-004', supplierName: 'Roche Direct Supply', orderDate: '2026-07-16', deliveryDate: '2026-07-30', itemsCount: 2, totalCost: 12500.00, status: 'Draft', paymentTerms: 'Net 45' }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'S-201', name: 'PharmaLink Distributions', contactName: 'Meredith Grey', email: 'mgrey@pharmalink.com', phone: '+1 (555) 019-2831', leadTimeDays: 5, performanceScore: 94, paymentTerms: 'Net 30', activeContracts: 3, totalSpent: 128400.00 },
  { id: 'S-202', name: 'SafeMed Global', contactName: 'Peter Parker', email: 'pparker@safemed.org', phone: '+1 (555) 332-9012', leadTimeDays: 7, performanceScore: 82, paymentTerms: 'Net 15', activeContracts: 1, totalSpent: 42900.00 },
  { id: 'S-203', name: 'Global MedSurg Inc.', contactName: 'Bruce Banner', email: 'bbanner@madsurg.com', phone: '+1 (555) 881-2090', leadTimeDays: 3, performanceScore: 98, paymentTerms: 'Due on Receipt', activeContracts: 4, totalSpent: 210000.00 },
  { id: 'S-204', name: 'Roche Direct Supply', contactName: 'Tony Stark', email: 'stark@rochedirect.com', phone: '+1 (555) 443-8821', leadTimeDays: 14, performanceScore: 91, paymentTerms: 'Net 45', activeContracts: 2, totalSpent: 350000.00 }
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  { id: 'MVT-001', timestamp: '2026-07-16 09:15', sku: 'PP-N95-FLT-M01', productName: 'Clinical N95 Respirator Mask', type: 'Consumption', quantity: 60, fromLocation: 'HealthOS Central Warehouse', toLocation: 'COVID Clinic Room 3', authorizedBy: 'Nurse Practitioner Clara', referenceDoc: 'CASE-7701' },
  { id: 'MVT-002', timestamp: '2026-07-15 14:00', sku: 'MS-SYR-5ML-S02', productName: 'Disposable Syringe 5ml (Luer Lock)', type: 'Inbound', quantity: 20000, fromLocation: 'Global MedSurg Dock', toLocation: 'Clinic Ward Depot', authorizedBy: 'Receiving Clerk Sam', referenceDoc: 'PO-2026-003' },
  { id: 'MVT-003', timestamp: '2026-07-14 11:30', sku: 'PH-AMX-500-C10', productName: 'Amoxicillin Trihydrate 500mg', type: 'Transfer', quantity: 1000, fromLocation: 'HealthOS Central Warehouse', toLocation: 'Pharmacy Dispensary B', authorizedBy: 'Pharma Director John', referenceDoc: 'TRF-9021' },
  { id: 'MVT-004', timestamp: '2026-07-13 16:45', sku: 'LR-COV-PCR-G20', productName: 'SARS-CoV-2 PCR Test Reagent Kit', type: 'Adjustment', quantity: -5, fromLocation: 'Cold Storage Vault', toLocation: 'Disposed (Cold Chain Broken)', authorizedBy: 'Lab Lead Avery', referenceDoc: 'ADJ-881' }
];

const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'W-01', name: 'HealthOS Central Warehouse', type: 'General', address: 'Building A, Grid-Row 3, Sector 5', shelvesCount: 45, occupancyPercent: 68 },
  { id: 'W-02', name: 'Cold Storage Vault', type: 'Cold Storage', address: 'Sub-Basement Refrigerated Hub', shelvesCount: 8, occupancyPercent: 84 },
  { id: 'W-03', name: 'Clinic Ward Depot', type: 'Clinic Stock', address: 'Floor 2, Outpatient Supply Closet', shelvesCount: 12, occupancyPercent: 42 },
  { id: 'W-04', name: 'Lab Depot Store', type: 'Lab Depot', address: 'Clinical Laboratory Wing room 104', shelvesCount: 6, occupancyPercent: 55 }
];

// --- REPORTS & CHART DATA ---
const STOCK_VALUE_TREND = [
  { month: 'Jan', Pharmaceuticals: 35000, Consumables: 18000, LabSupplies: 22000, Total: 75000 },
  { month: 'Feb', Pharmaceuticals: 38000, Consumables: 19500, LabSupplies: 23500, Total: 81000 },
  { month: 'Mar', Pharmaceuticals: 42000, Consumables: 24000, LabSupplies: 21000, Total: 87000 },
  { month: 'Apr', Pharmaceuticals: 39000, Consumables: 22000, LabSupplies: 28000, Total: 89000 },
  { month: 'May', Pharmaceuticals: 45000, Consumables: 27000, LabSupplies: 31000, Total: 103000 },
  { month: 'Jun', Pharmaceuticals: 51000, Consumables: 29000, LabSupplies: 34000, Total: 114000 },
  { month: 'Jul', Pharmaceuticals: 56000, Consumables: 31500, LabSupplies: 32000, Total: 119500 }
];

const DEPT_CONSUMPTION_PIE = [
  { name: 'Surgery Dept', value: 48900, color: '#10b981' },
  { name: 'Inpatient Ward', value: 32400, color: '#3b82f6' },
  { name: 'Emergency Room', value: 24100, color: '#ef4444' },
  { name: 'Clinical Labs', value: 14500, color: '#8b5cf6' }
];

const MATERIALS_USAGE_BAR = [
  { name: 'N95 Masks', count: 1420 },
  { name: 'Syringes 5ml', count: 4800 },
  { name: 'Suture Packs', count: 980 },
  { name: 'Antiseptic Pt', count: 760 }
];

export default function InventoryWorkspace() {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Catalog' | 'ProductWorkspace' | 'Procurement' | 'Suppliers' | 'StockMovements' | 'Warehouse' | 'AIAssistant' | 'Reports' | 'Settings'
  >('Dashboard');

  // Core React States (Real-time in-memory persistence)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);

  // Selected State variables
  const [selectedProductId, setSelectedProductId] = useState<string>('P-102');
  const [bulkCheckedIds, setBulkCheckedIds] = useState<string[]>([]);
  
  // Search & Filtering States
  const [catSearch, setCatSearch] = useState('');
  const [catCategoryFilter, setCatCategoryFilter] = useState('All');
  const [catWarehouseFilter, setCatWarehouseFilter] = useState('All');
  const [catStatusFilter, setCatStatusFilter] = useState('All');

  // Purchase order creator state
  const [poSupplier, setPoSupplier] = useState('PharmaLink Distributions');
  const [poItemsCount, setPoItemsCount] = useState('2');
  const [poTotalCost, setPoTotalCost] = useState('3400.00');
  const [poPaymentTerms, setPoPaymentTerms] = useState('Net 30');

  // AI Assistant action states
  const [aiReport, setAiReport] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Dynamic configuration states
  const [defaultUOM, setDefaultUOM] = useState('Units');
  const [requirePOApproval, setRequirePOApproval] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(150);

  // Compute stats on-the-fly from actual state
  const stats = useMemo(() => {
    let totalVal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringSoonCount = 0;

    products.forEach(p => {
      totalVal += p.stockQuantity * p.valuePerUnit;
      if (p.status === 'Low Stock') lowStockCount++;
      if (p.status === 'Out of Stock') outOfStockCount++;
      if (p.status === 'Expiring Soon') expiringSoonCount++;
    });

    const pendingPoCount = pos.filter(po => po.status === 'Pending Approval').length;
    const totalSuppliersCount = suppliers.length;

    return {
      totalVal,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      pendingPoCount,
      totalSuppliersCount
    };
  }, [products, pos, suppliers]);

  // Selected Product reference
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Handle advanced filtered catalog list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(catSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(catSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(catSearch.toLowerCase()) ||
                          p.manufacturer.toLowerCase().includes(catSearch.toLowerCase());
      const matchCat = catCategoryFilter === 'All' || p.category === catCategoryFilter;
      const matchWh = catWarehouseFilter === 'All' || p.warehouse === catWarehouseFilter;
      const matchStat = catStatusFilter === 'All' || p.status === catStatusFilter;
      return matchSearch && matchCat && matchWh && matchStat;
    });
  }, [products, catSearch, catCategoryFilter, catWarehouseFilter, catStatusFilter]);

  // Bulk operation triggers
  const handleBulkReorder = () => {
    if (bulkCheckedIds.length === 0) return alert('No items selected. Please select items first.');
    const productsToReorder = products.filter(p => bulkCheckedIds.includes(p.id));
    
    // Create PO draft based on bulk selections
    const newPoId = `PO-2026-B0${pos.length + 1}`;
    const newPo: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-3)}`,
      poNumber: newPoId,
      supplierName: productsToReorder[0]?.supplierName || 'PharmaLink Distributions',
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().substring(0, 10),
      itemsCount: productsToReorder.length,
      totalCost: productsToReorder.reduce((acc, curr) => acc + (curr.minimumStock * 2 * curr.valuePerUnit), 0),
      status: 'Draft',
      paymentTerms: 'Net 30'
    };

    setPos([newPo, ...pos]);
    setBulkCheckedIds([]);
    alert(`Bulk PO Created: Draft ${newPoId} contains ${productsToReorder.length} products to reorder.`);
    setActiveTab('Procurement');
  };

  const handleBulkDisposal = () => {
    if (bulkCheckedIds.length === 0) return alert('No items selected.');
    if (!confirm('Are you sure you want to flag selected batches for clinical biohazard disposal/audit?')) return;

    setProducts(prev => prev.map(p => {
      if (bulkCheckedIds.includes(p.id)) {
        return {
          ...p,
          stockQuantity: 0,
          status: 'Out of Stock' as const
        };
      }
      return p;
    }));

    // Generate movement logs for each
    const newMovements: StockMovement[] = bulkCheckedIds.map(id => {
      const match = products.find(p => p.id === id)!;
      return {
        id: `MVT-DISP-${Math.floor(Math.random() * 900)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        sku: match.sku,
        productName: match.name,
        type: 'Adjustment',
        quantity: -match.stockQuantity,
        fromLocation: match.warehouse,
        toLocation: 'Clinical Waste Bin',
        authorizedBy: 'QA Compliance Officer',
        referenceDoc: 'BIO-AUDIT-2026'
      };
    });

    setMovements([...newMovements, ...movements]);
    setBulkCheckedIds([]);
    alert('Selected items marked for disposal and written off.');
  };

  // Add a new manual stock movement / transaction
  const [moveSku, setMoveSku] = useState('PP-N95-FLT-M01');
  const [moveQty, setMoveQty] = useState('100');
  const [moveType, setMoveType] = useState<'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment'>('Inbound');
  const [moveFrom, setMoveFrom] = useState('External Supplier Dock');
  const [moveTo, setMoveTo] = useState('HealthOS Central Warehouse');

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === moveSku);
    if (!product) return alert('Product SKU not found');

    const qty = parseInt(moveQty);
    if (isNaN(qty) || qty <= 0) return alert('Invalid quantity');

    const newMvt: StockMovement = {
      id: `MVT-${Date.now().toString().slice(-3)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sku: moveSku,
      productName: product.name,
      type: moveType,
      quantity: qty,
      fromLocation: moveFrom,
      toLocation: moveTo,
      authorizedBy: 'Warehouse Manager Miller',
      referenceDoc: 'MVT-MANUAL'
    };

    setMovements([newMvt, ...movements]);

    // Apply change to state
    setProducts(prev => prev.map(p => {
      if (p.sku === moveSku) {
        let newQty = p.stockQuantity;
        if (moveType === 'Inbound') newQty += qty;
        if (moveType === 'Outbound') newQty -= qty;
        if (moveType === 'Adjustment') newQty = qty; // set exactly

        let stat: Product['status'] = 'In Stock';
        if (newQty <= 0) stat = 'Out of Stock';
        else if (newQty < p.minimumStock) stat = 'Low Stock';

        return {
          ...p,
          stockQuantity: Math.max(0, newQty),
          status: stat
        };
      }
      return p;
    }));

    setMoveQty('');
    alert(`Stock Movement logged successfully. State synchronized!`);
  };

  // Create Purchase Order
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const newPoId = `PO-2026-00${pos.length + 1}`;
    const newPo: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber: newPoId,
      supplierName: poSupplier,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: new Date(Date.now() + 10*24*60*60*1000).toISOString().substring(0, 10),
      itemsCount: parseInt(poItemsCount),
      totalCost: parseFloat(poTotalCost),
      status: requirePOApproval ? 'Pending Approval' : 'Approved',
      paymentTerms: poPaymentTerms
    };

    setPos([newPo, ...pos]);
    alert(`Purchase Order ${newPoId} submitted! Status: ${newPo.status}`);
  };

  // AI Assistant generator
  const triggerAIAnalysis = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiReport(
        `**HEALTHOS AI INVENTORY FORECASTING & DEMAND CONTROLLER**\n\n` +
        `**1. PREDICTIVE STOCK SHORTAGES:**\n` +
        `• **SKU: PP-N95-FLT-M01 (Clinical N95 Respirator Mask)**: Current stock is **840 units**. Based on 14-day trailing outpatient admissions and historical flu-season consumption peaks, we project stock depletion in **12.4 days**. \n` +
        `  *Action Required*: Suggested immediate reorder of **2,000 units** to mitigate shortage.\n\n` +
        `**2. AUTOMATIC REORDER & COST OPTIMIZATION:**\n` +
        `• Roche Digital Glucometers (Accu-Chek) is currently **Out of Stock**. SafeMed Global is quoting $34.50/unit with a 7-day lead time. Roche Direct offers $32.00/unit with a 14-day lead. \n` +
        `  *Recommendation*: Purchase **50 units** from **SafeMed Global** for immediate triage, and place a bulk net-30 replenishment of **300 units** from **Roche Direct** to optimize unit economics.\n\n` +
        `**3. CLINICAL EXPIRY RISK ANALYSIS:**\n` +
        `• **SARS-CoV-2 PCR Test Reagents**: kit batches exp. **2026-08-25** are valued at **$20,250.00**. Present test rate averages only 8 kits/week. Suggest transferring 60% of cold vault reserve to Westside Pediatric hub where intake has surged by 44% last week.`
      );
      setAiAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[780px] font-sans antialiased text-zinc-100 relative">
      
      {/* BRAND & HEADER STATUS BAR */}
      <div className="bg-zinc-900/85 border-b border-zinc-900 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">HealthOS Procurement & SCM</h2>
              <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                ERP CORE
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              SCM Node ID: <span className="text-zinc-300 font-bold">INV-9902-S8</span> • Real-time GS1 barcode integration
            </p>
          </div>
        </div>

        {/* TOP STATUS BAR ROW */}
        <div className="hidden lg:flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-400 font-bold">Cold Vault:</span>
            <span className="text-emerald-400 font-extrabold">-18.4°C (Optimal)</span>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-400 font-bold">FDA Compliance:</span>
            <span className="text-white font-extrabold">Validated (2026)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] bg-zinc-950 border border-zinc-850 text-zinc-300 px-3 py-1.5 rounded-full font-mono font-bold">
            <Sliders className="w-3.5 h-3.5 text-blue-400" /> GS1-Active
          </span>
        </div>
      </div>

      {/* WORKSPACE SIDEBAR NAVIGATION */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* MODULE LEFT NAVIGATION */}
        <div className="w-60 bg-zinc-900 border-r border-zinc-900 flex flex-col shrink-0 overflow-hidden select-none">
          <div className="p-4 border-b border-zinc-900 shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-1">ERP Modules</span>
            <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">Enterprise Supply Chain Console:</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
            {[
              { id: 'Dashboard', label: '1. Inventory Dashboard', icon: Layers, badge: 'Main Console' },
              { id: 'Catalog', label: '2. Catalog Register', icon: ClipboardList, badge: `${products.length} Products` },
              { id: 'ProductWorkspace', label: '3. Product Details', icon: Search, badge: 'Focus Workspace' },
              { id: 'Procurement', label: '4. Purchase Orders', icon: Truck, badge: `${pos.length} Orders` },
              { id: 'Suppliers', label: '5. Supplier Directory', icon: Users, badge: `${suppliers.length} Vendors` },
              { id: 'StockMovements', label: '6. Movements Log', icon: History, badge: `${movements.length} logs` },
              { id: 'Warehouse', label: '7. Multi-Warehouse', icon: MapPin, badge: `${warehouses.length} Depots` },
              { id: 'AIAssistant', label: '8. AI Demand Engine', icon: Sparkles, badge: 'Smart AI', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { id: 'Reports', label: '9. Financial SCM Analytics', icon: BarChart2, badge: 'Turnover' },
              { id: 'Settings', label: '10. SCM Rules & Configs', icon: Settings, badge: 'Rules' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border cursor-pointer ${
                    isActive 
                      ? 'bg-blue-500 text-zinc-950 border-blue-400 shadow-md' 
                      : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-950/40 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md border ${
                      item.badgeColor || (isActive ? 'bg-zinc-950 text-blue-400 border-blue-500/30' : 'bg-zinc-950 text-zinc-500 border-zinc-850')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-zinc-950/80 border-t border-zinc-900 shrink-0 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">SCM Controller</span>
            <div className="flex items-center gap-2.5 p-2 bg-zinc-900 border border-zinc-850 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-md">
                SC
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-[11px] font-bold text-white truncate">Supply Control</h5>
                <p className="text-[9px] text-zinc-500 font-mono truncate">Role: Procurement Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE VIEW CONTENT AREA */}
        <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <AnimatePresence mode="wait">
              
              {/* ==================================================
                  1. INVENTORY DASHBOARD
                  ================================================== */}
              {activeTab === 'Dashboard' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">Enterprise SCM & Stock Operations</h3>
                      <p className="text-xs text-zinc-500 font-mono">Consolidated overview of pharmaceutical inventories, low stock levels, pending purchase orders, and supplier ratings.</p>
                    </div>
                    <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl">
                      FDA & DEA Drug Compliant
                    </span>
                  </div>

                  {/* High Quality Bento Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Total Inventory Value</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white font-mono">${stats.totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +4.2% vs last quarter
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Stock Warnings</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white font-mono">{stats.lowStockCount} Low</span>
                        <span className="text-xs text-red-400 font-black font-mono">/ {stats.outOfStockCount} Out</span>
                      </div>
                      <p className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> {stats.expiringSoonCount} Expiring within 30 days
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Purchase Orders</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-zinc-300 font-mono">{stats.pendingPoCount} Pending</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-mono">
                        Awaiting financial approval workflow
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[105px]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Suppliers Directory</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white font-mono">{stats.totalSuppliersCount} Connected</span>
                      </div>
                      <p className="text-[9px] text-emerald-400 font-semibold">
                        91.2% Average Performance
                      </p>
                    </div>
                  </div>

                  {/* Chart Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recharts Area Chart */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl col-span-2 flex flex-col justify-between h-[280px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Total Capitalized Stock Value (YTD)</span>
                        <div className="flex gap-4 text-[10px] font-mono">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Pharma</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500" /> Consumables</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={STOCK_VALUE_TREND}>
                            <defs>
                              <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="cnGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                            <XAxis dataKey="month" stroke="#52525b" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                            <Area type="monotone" dataKey="Pharmaceuticals" stroke="#3b82f6" fillOpacity={1} fill="url(#phGrad)" name="Pharmaceuticals" />
                            <Area type="monotone" dataKey="Consumables" stroke="#6366f1" fillOpacity={1} fill="url(#cnGrad)" name="Consumables" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Quick actions panel */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[280px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">Quick Logistics Dispatches</span>
                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed mb-4">Direct dispatch links for immediate procurement operations.</p>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={() => { setActiveTab('Procurement') }}
                          className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-blue-500 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-[11px]">Draft Purchase Order</p>
                            <p className="text-[9px] text-zinc-500">Initiate bulk replenishment</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setActiveTab('StockMovements') }}
                          className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-blue-500 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <History className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-[11px]">Log Stock Movement</p>
                            <p className="text-[9px] text-zinc-500">Record clinical consumption</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setActiveTab('AIAssistant') }}
                          className="w-full text-left p-2.5 bg-zinc-950 border border-zinc-850 hover:border-blue-500 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-[11px]">AI Demand Forecast</p>
                            <p className="text-[9px] text-zinc-500">Run clinical usage analytics</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM TELEMETRY BAR */}
                  <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">Storage Node Integrity:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Synchronized with US GS1 Registries
                    </span>
                    <span className="text-zinc-400">DEA Register: <span className="text-white font-bold">ACTIVE-DEA-2026</span></span>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  2. INVENTORY CATALOG
                  ================================================== */}
              {activeTab === 'Catalog' && (
                <WorkspaceTabPanel
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Active Product Registry</h3>
                      <p className="text-xs text-zinc-500 font-mono">GS1 SKU database of drugs, disposable components, sterile shields and reagents.</p>
                    </div>

                    <div className="flex gap-2">
                      {bulkCheckedIds.length > 0 && (
                        <div className="flex gap-2 items-center mr-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
                          <span className="text-zinc-400 font-mono">{bulkCheckedIds.length} checked</span>
                          <button 
                            onClick={handleBulkReorder}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-mono px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Bulk Reorder
                          </button>
                          <button 
                            onClick={handleBulkDisposal}
                            className="bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-900/40 font-mono px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Bulk Discard
                          </button>
                        </div>
                      )}

                      <button 
                        onClick={() => {
                          const newSku = `PH-DRG-NEW-${products.length + 1}`;
                          const newProd: Product = {
                            id: `P-${Date.now()}`,
                            sku: newSku,
                            barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                            name: 'Standard Normal Saline 0.9%',
                            description: 'Intravenous infusion, standard 500ml bag.',
                            category: 'Medical Supplies',
                            brand: 'Sodium Chloride IV',
                            manufacturer: 'Baxter Healthcare',
                            supplierName: 'Global MedSurg Inc.',
                            warehouse: 'HealthOS Central Warehouse',
                            storageLocation: 'Aisle 2, Shelf F-1',
                            batchNumber: 'SAL-821',
                            lotNumber: 'L-SAL-88',
                            expiryDate: '2028-12-01',
                            stockQuantity: 1500,
                            minimumStock: 250,
                            unitOfMeasure: 'Units',
                            status: 'In Stock',
                            valuePerUnit: 1.85,
                            attachments: []
                          };
                          setProducts([newProd, ...products]);
                          alert(`Product SKU ${newSku} registered!`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register SKU
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-900/30 p-4 border border-zinc-900 rounded-2xl">
                    <div className="relative md:col-span-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="Search SKU, name, brand, bar..."
                        className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 text-xs rounded-xl outline-none focus:border-blue-500 text-white font-mono placeholder:text-zinc-650"
                      />
                    </div>

                    <div>
                      <select
                        value={catCategoryFilter}
                        onChange={(e) => setCatCategoryFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="All">All Categories</option>
                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                        <option value="Medical Supplies">Medical Supplies</option>
                        <option value="Protective Gear">Protective Gear</option>
                        <option value="Lab Reagents">Lab Reagents</option>
                        <option value="Diagnostics">Diagnostics</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={catWarehouseFilter}
                        onChange={(e) => setCatWarehouseFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="All">All Warehouses</option>
                        <option value="HealthOS Central Warehouse">Central Warehouse</option>
                        <option value="Cold Storage Vault">Cold Storage Vault</option>
                        <option value="Clinic Ward Depot">Clinic Ward Depot</option>
                        <option value="Lab Depot Store">Lab Depot Store</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={catStatusFilter}
                        onChange={(e) => setCatStatusFilter(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 p-1.5 outline-none focus:border-blue-500"
                      >
                        <option value="All">All Stock Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                      </select>
                    </div>
                  </div>

                  {/* Large Product Table */}
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-900">
                        <tr>
                          <th className="py-3 px-4 w-8">
                            <input 
                              type="checkbox"
                              checked={bulkCheckedIds.length === products.length}
                              onChange={(e) => {
                                if (e.target.checked) setBulkCheckedIds(products.map(p => p.id));
                                else setBulkCheckedIds([]);
                              }}
                              className="accent-blue-500"
                            />
                          </th>
                          <th className="py-3 px-4">SKU / Brand</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Physical Stock</th>
                          <th className="py-3 px-4 text-right">Unit Value</th>
                          <th className="py-3 px-4 text-right">Total Capital</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {filteredProducts.map(p => {
                          const totalVal = p.stockQuantity * p.valuePerUnit;
                          const isChecked = bulkCheckedIds.includes(p.id);
                          return (
                            <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="py-2.5 px-4">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) setBulkCheckedIds(bulkCheckedIds.filter(id => id !== p.id));
                                    else setBulkCheckedIds([...bulkCheckedIds, p.id]);
                                  }}
                                  className="accent-blue-500"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <p className="text-white font-bold">{p.brand}</p>
                                <p className="text-[10px] text-zinc-500">{p.sku}</p>
                              </td>
                              <td className="py-2.5 px-4 max-w-[200px] truncate text-zinc-400">
                                {p.name}
                              </td>
                              <td className="py-2.5 px-4 text-[10px]">
                                <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-zinc-400">
                                  {p.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold text-white">
                                {p.stockQuantity.toLocaleString()} <span className="text-[9px] text-zinc-500">{p.unitOfMeasure}</span>
                              </td>
                              <td className="py-2.5 px-4 text-right text-zinc-400">
                                ${p.valuePerUnit.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                                ${totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  p.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  p.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  p.status === 'Expiring Soon' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex gap-1.5 justify-center">
                                  <button 
                                    onClick={() => {
                                      setSelectedProductId(p.id);
                                      setActiveTab('ProductWorkspace');
                                    }}
                                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                                    title="View Product Workspace"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const newQty = prompt(`Adjust stock quantity for ${p.brand}:`, String(p.stockQuantity));
                                      if (newQty !== null) {
                                        const parsed = parseInt(newQty);
                                        if (!isNaN(parsed)) {
                                          setProducts(prev => prev.map(item => {
                                            if (item.id === p.id) {
                                              let stat: Product['status'] = 'In Stock';
                                              if (parsed <= 0) stat = 'Out of Stock';
                                              else if (parsed < item.minimumStock) stat = 'Low Stock';
                                              return { ...item, stockQuantity: parsed, status: stat };
                                            }
                                            return item;
                                          }));
                                        }
                                      }
                                    }}
                                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 rounded transition-colors"
                                    title="Edit Quantity"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  3. PRODUCT WORKSPACE (FOCUSED DETAIL)
                  ================================================== */}
              {activeTab === 'ProductWorkspace' && selectedProduct && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono border-b border-zinc-900 pb-2">
                    <span className="cursor-pointer hover:text-white" onClick={() => setActiveTab('Catalog')}>Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-white font-bold">{selectedProduct.sku}</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Detail Column */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4">
                        <div>
                          <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-full">
                            {selectedProduct.category}
                          </span>
                          <h3 className="text-xl font-bold text-white mt-2 font-sans">{selectedProduct.name}</h3>
                          <p className="text-xs text-zinc-400 mt-1 font-mono">{selectedProduct.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-850">
                          <div>
                            <span className="text-[9px] text-zinc-500 font-mono block">Brand</span>
                            <span className="text-xs font-bold text-white font-mono">{selectedProduct.brand}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 font-mono block">Manufacturer</span>
                            <span className="text-xs font-bold text-white font-mono">{selectedProduct.manufacturer}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 font-mono block">Preferred Supplier</span>
                            <span className="text-xs font-bold text-white font-mono">{selectedProduct.supplierName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 font-mono block">Storage Location</span>
                            <span className="text-xs font-bold text-white font-mono">{selectedProduct.storageLocation}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-850 font-mono">
                          <div>
                            <span className="text-[9px] text-zinc-500 block">Batch Number</span>
                            <span className="text-xs font-bold text-zinc-300">{selectedProduct.batchNumber}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 block">Lot Number</span>
                            <span className="text-xs font-bold text-zinc-300">{selectedProduct.lotNumber}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 block">Barcode (EAN-13)</span>
                            <span className="text-xs font-bold text-zinc-350">{selectedProduct.barcode}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 block">Expiration Date</span>
                            <span className="text-xs font-bold text-purple-400">{selectedProduct.expiryDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stock History Audit Table */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 font-mono flex items-center gap-2">
                          <History className="w-4 h-4 text-zinc-500" /> Stock Movement History
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="text-zinc-500 border-b border-zinc-850 text-[10px]">
                                <th className="pb-2">Timestamp</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2 text-right">Quantity</th>
                                <th className="pb-2">Custodian</th>
                                <th className="pb-2">Reference Case/Doc</th>
                              </tr>
                            </thead>
                            <tbody>
                              {movements.filter(m => m.sku === selectedProduct.sku).map((m, idx) => (
                                <tr key={idx} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30">
                                  <td className="py-2 text-zinc-400">{m.timestamp}</td>
                                  <td className="py-2">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      m.type === 'Inbound' ? 'bg-emerald-500/10 text-emerald-400' :
                                      m.type === 'Outbound' ? 'bg-amber-500/10 text-amber-400' :
                                      m.type === 'Transfer' ? 'bg-blue-500/10 text-blue-400' :
                                      'bg-purple-500/10 text-purple-400'
                                    }`}>
                                      {m.type}
                                    </span>
                                  </td>
                                  <td className="py-2 text-right font-bold text-white">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                                  <td className="py-2 text-zinc-400">{m.authorizedBy}</td>
                                  <td className="py-2 text-zinc-500">{m.referenceDoc}</td>
                                </tr>
                              ))}
                              {movements.filter(m => m.sku === selectedProduct.sku).length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-4 text-center text-zinc-650 font-mono text-[10px]">
                                    No ledgered transaction history found for this SKU.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Column */}
                    <div className="space-y-4">
                      {/* Live Stock Level Indicators */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Real-time Level Indicator</span>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-400">Current Qty</span>
                            <span className="text-white font-bold">{selectedProduct.stockQuantity} / {selectedProduct.minimumStock} min</span>
                          </div>
                          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                selectedProduct.status === 'In Stock' ? 'bg-emerald-500' :
                                selectedProduct.status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${Math.min(100, (selectedProduct.stockQuantity / (selectedProduct.minimumStock * 2)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Stock Rating:</span>
                          <span className={`font-bold ${
                            selectedProduct.status === 'In Stock' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>{selectedProduct.status}</span>
                        </div>
                      </div>

                      {/* Attachments Section */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Certificates & Specifications</span>
                        {selectedProduct.attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-zinc-950 rounded-xl border border-zinc-850 font-mono text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                              <span className="text-zinc-300 truncate">{file}</span>
                            </div>
                            <Download className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer" />
                          </div>
                        ))}
                        {selectedProduct.attachments.length === 0 && (
                          <p className="text-[10px] text-zinc-650 text-center font-mono py-2">No FDA COA attached.</p>
                        )}
                        <button className="w-full py-1.5 border border-dashed border-zinc-800 text-zinc-500 hover:text-white rounded-xl text-xs font-mono font-bold transition-colors">
                          + Attach FDA COA Document
                        </button>
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  4. PROCUREMENT CENTER
                  ================================================== */}
              {activeTab === 'Procurement' && (
                <WorkspaceTabPanel
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Purchase Orders (PO) Registry</h3>
                        <p className="text-xs text-zinc-500 font-mono">Approve clinical replenishment schedules, track supplier delivery timetables.</p>
                      </div>
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-900">
                          <tr>
                            <th className="py-3 px-4">PO Number</th>
                            <th className="py-3 px-4">Supplier</th>
                            <th className="py-3 px-4">Order Date</th>
                            <th className="py-3 px-4 text-right">Items</th>
                            <th className="py-3 px-4 text-right">Total Cost</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {pos.map(po => (
                            <tr key={po.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-white">{po.poNumber}</td>
                              <td className="py-2.5 px-4 text-zinc-300">{po.supplierName}</td>
                              <td className="py-2.5 px-4 text-zinc-400">{po.orderDate}</td>
                              <td className="py-2.5 px-4 text-right">{po.itemsCount}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-emerald-400">${po.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  po.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  po.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  po.status === 'Pending Approval' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-zinc-800 text-zinc-500 border-zinc-700'
                                }`}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                {po.status === 'Pending Approval' ? (
                                  <button 
                                    onClick={() => {
                                      setPos(prev => prev.map(p => p.id === po.id ? { ...p, status: 'Approved' } : p));
                                      alert(`PO ${po.poNumber} Approved! Ready for dispatch to supplier.`);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[9px] font-bold px-2 py-1 rounded cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <span className="text-zinc-650 text-[10px]">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Supplier Quote Comparison */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold uppercase text-zinc-400 font-mono flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-zinc-500" /> Procurement Quote Matrix (Bid Analysis)
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">Comparing multiple clinical bidders for Disposable Syringe bulk orders:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl font-mono text-[11px] space-y-1">
                          <p className="text-white font-bold">Global MedSurg (Winner)</p>
                          <p className="text-zinc-400">Unit Bid: <span className="text-emerald-400 font-bold">$0.08</span></p>
                          <p className="text-zinc-500">Lead Time: <span className="text-white">3 Days</span></p>
                          <p className="text-zinc-500">Contract Rate: Locked</p>
                        </div>
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl font-mono text-[11px] space-y-1 opacity-60">
                          <p className="text-white font-bold">PharmaLink Distributions</p>
                          <p className="text-zinc-400">Unit Bid: $0.10</p>
                          <p className="text-zinc-500">Lead Time: 5 Days</p>
                          <p className="text-zinc-500">Contract Rate: Open</p>
                        </div>
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl font-mono text-[11px] space-y-1 opacity-60">
                          <p className="text-white font-bold">SafeMed Global</p>
                          <p className="text-zinc-400">Unit Bid: $0.11</p>
                          <p className="text-zinc-500">Lead Time: 7 Days</p>
                          <p className="text-zinc-500">Contract Rate: Spot</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PO Draft Form */}
                  <div className="space-y-4">
                    <form onSubmit={handleCreatePO} className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block">Draft PO Replenishment</span>

                      <div className="space-y-1.5 font-mono text-xs">
                        <label className="text-zinc-400">Preferred Supplier</label>
                        <select 
                          value={poSupplier}
                          onChange={(e) => setPoSupplier(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl p-2 outline-none"
                        >
                          {suppliers.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="space-y-1.5">
                          <label className="text-zinc-400">Items Count</label>
                          <input 
                            type="number"
                            value={poItemsCount}
                            onChange={(e) => setPoItemsCount(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl p-2 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-zinc-400">Payment Terms</label>
                          <select 
                            value={poPaymentTerms}
                            onChange={(e) => setPoPaymentTerms(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl p-2 outline-none"
                          >
                            <option value="Net 30">Net 30</option>
                            <option value="Net 15">Net 15</option>
                            <option value="Net 45">Net 45</option>
                            <option value="Due on Receipt">Due on Receipt</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        <label className="text-zinc-400">Estimated Total Cost ($)</label>
                        <input 
                          type="text"
                          value={poTotalCost}
                          onChange={(e) => setPoTotalCost(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl p-2 outline-none text-right font-bold text-emerald-400"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs rounded-xl font-mono transition-colors cursor-pointer"
                      >
                        Submit Purchase Order Draft
                      </button>
                    </form>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  5. SUPPLIER MANAGEMENT
                  ================================================== */}
              {activeTab === 'Suppliers' && (
                <WorkspaceTabPanel
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Validated Suppliers Directory</h3>
                      <p className="text-xs text-zinc-500 font-mono">FDA approved pharmaceuticals & medical consumables logistics vendors.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {suppliers.map(s => (
                      <div key={s.id} className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[190px] font-mono">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-white leading-tight">{s.name}</h4>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              s.performanceScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>{s.performanceScore}% Score</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">{s.contactName} • {s.phone}</p>
                          <p className="text-[10px] text-zinc-400 mt-2 truncate">{s.email}</p>
                        </div>

                        <div className="space-y-1 pt-3 border-t border-zinc-850 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Lead Time:</span>
                            <span className="text-zinc-300 font-bold">{s.leadTimeDays} Days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Total Spent:</span>
                            <span className="text-emerald-400 font-bold">${s.totalSpent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Supplier Contract Overview Table */}
                  <div className="p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold uppercase text-zinc-400 font-mono">Supplier Performance & SLA Contracts</h4>
                    <div className="overflow-hidden rounded-xl border border-zinc-850 bg-zinc-950/40">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-zinc-900/60 text-zinc-400 text-[10px] uppercase">
                          <tr>
                            <th className="p-2 px-3">Supplier Name</th>
                            <th className="p-2 px-3">Active Contracts</th>
                            <th className="p-2 px-3">SLA Compliance Rating</th>
                            <th className="p-2 px-3">Payment Terms</th>
                            <th className="p-2 px-3">Risk Assessment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          <tr>
                            <td className="p-2 px-3 text-white font-bold">PharmaLink Distributions</td>
                            <td className="p-2 px-3">3 Active MSA</td>
                            <td className="p-2 px-3 text-emerald-400">98% Ontime Delivery</td>
                            <td className="p-2 px-3">Net 30</td>
                            <td className="p-2 px-3 text-emerald-500">Low Risk</td>
                          </tr>
                          <tr>
                            <td className="p-2 px-3 text-white font-bold">SafeMed Global</td>
                            <td className="p-2 px-3">1 MSA</td>
                            <td className="p-2 px-3 text-amber-400">84% Ontime Delivery</td>
                            <td className="p-2 px-3">Net 15</td>
                            <td className="p-2 px-3 text-amber-500">Moderate (Delayed Lead)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  6. STOCK MOVEMENTS
                  ================================================== */}
              {activeTab === 'StockMovements' && (
                <WorkspaceTabPanel
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="lg:col-span-2 space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Stock Movement Audit Trail</h3>
                      <p className="text-xs text-zinc-500 font-mono">Continuous digital log of inbound shipments, outbound patient treatments, transfers, and warehouse adjustments.</p>
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-900">
                          <tr>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">SKU / Product</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4 text-right">Quantity</th>
                            <th className="py-3 px-4">From → To</th>
                            <th className="py-3 px-4">Authorized By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {movements.map(m => (
                            <tr key={m.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="py-2.5 px-4 text-zinc-400 text-[10px]">{m.timestamp}</td>
                              <td className="py-2.5 px-4">
                                <p className="text-white font-bold">{m.productName}</p>
                                <p className="text-[9px] text-zinc-500">{m.sku}</p>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  m.type === 'Inbound' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  m.type === 'Outbound' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  m.type === 'Transfer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                }`}>
                                  {m.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold text-white">
                                {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-400 max-w-[120px] truncate">
                                {m.fromLocation} → {m.toLocation}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-400 text-[10px]">{m.authorizedBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Manual Stock Dispatch Form */}
                  <div>
                    <form onSubmit={handleCreateMovement} className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4 font-mono text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Dispatch Manual Stock</span>

                      <div className="space-y-1.5">
                        <label className="text-zinc-400">Select Registered SKU</label>
                        <select 
                          value={moveSku}
                          onChange={(e) => setMoveSku(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-250 rounded-xl p-2 outline-none"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.sku}>{p.brand} ({p.sku})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-zinc-400">Movement Type</label>
                          <select 
                            value={moveType}
                            onChange={(e) => setMoveType(e.target.value as any)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-250 rounded-xl p-2 outline-none"
                          >
                            <option value="Inbound">Inbound</option>
                            <option value="Outbound">Outbound</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Adjustment">Adjustment (Direct SET)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-zinc-400">Qty (UOM)</label>
                          <input 
                            type="number"
                            value={moveQty}
                            onChange={(e) => setMoveQty(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-250 rounded-xl p-2 outline-none text-right font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-zinc-400">From Depot / Location</label>
                        <input 
                          type="text"
                          value={moveFrom}
                          onChange={(e) => setMoveFrom(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-250 rounded-xl p-2 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-zinc-400">To Destination Depot</label>
                        <input 
                          type="text"
                          value={moveTo}
                          onChange={(e) => setMoveTo(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-250 rounded-xl p-2 outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Commit Movement Transaction
                      </button>
                    </form>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  7. WAREHOUSE MANAGEMENT
                  ================================================== */}
              {activeTab === 'Warehouse' && (
                <WorkspaceTabPanel
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">Depot & Storage Area Registers</h3>
                      <p className="text-xs text-zinc-500 font-mono">Oversee multiple physical warehouses, cold storage vaults, clinical ward cupboards and lab reagent depots.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {warehouses.map(w => (
                      <div key={w.id} className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[175px] font-mono">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-blue-400">{w.type}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">Occupancy: {w.occupancyPercent}%</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 leading-tight">{w.name}</h4>
                          <p className="text-[10px] text-zinc-450 mt-1 truncate">{w.address}</p>
                        </div>

                        <div className="pt-3 border-t border-zinc-850 space-y-2">
                          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${w.occupancyPercent}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>Shelves: {w.shelvesCount} sectors</span>
                            <span>Safe Range Checked</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cold Chain Storage Telemetry Panel */}
                  <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Main Cold Vault</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">-18.4°C</span>
                        <span className="text-emerald-400 text-xs font-bold">Stable</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">Storage: Covid Reagents, Vaccines, RNA active chains.</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Lab Depot Temperature</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">4.2°C</span>
                        <span className="text-emerald-400 text-xs font-bold">Stable</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">Storage: Normal insulin vials, enzyme buffers.</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Humidity Sensor Node #4</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">38% rH</span>
                        <span className="text-emerald-400 text-xs font-bold">Optimal</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">Dry conditions preserved to prevent capsule degradation.</p>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  8. AI INVENTORY ASSISTANT
                  ================================================== */}
              {activeTab === 'AIAssistant' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">AI Stock & Demand Engine</h3>
                      <p className="text-xs text-zinc-500 font-mono">Automate clinical stock replenishment, predict stock shortages, calculate supplier lead times, and optimize SCM.</p>
                    </div>

                    <button 
                      onClick={triggerAIAnalysis}
                      disabled={aiAnalyzing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 text-xs font-black transition-all cursor-pointer"
                    >
                      {aiAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing SCM Ledger...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Predict Demand & Optimize
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Forecast Summary Indicators */}
                    <div className="space-y-4">
                      <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4 font-mono">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Automatic Reorder Suggestion</span>
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1 text-xs">
                          <p className="text-white font-bold">SKU: PP-N95-FLT-M01</p>
                          <p className="text-zinc-400">Reorder Quantity: <span className="text-blue-400 font-bold">2,000 Units</span></p>
                          <p className="text-zinc-500">Suggested Supplier: <span className="text-white">SafeMed Global</span></p>
                          <p className="text-zinc-500">Est Savings: $240.00 via contract</p>
                        </div>
                      </div>

                      <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4 font-mono">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Expiry Risk Warnings</span>
                        <div className="p-3 bg-zinc-950 border border-red-900/40 bg-red-950/10 rounded-xl text-xs space-y-1">
                          <p className="text-red-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> High Expiry Risk
                          </p>
                          <p className="text-zinc-300">TaqPath COVID PCR (450 Kits)</p>
                          <p className="text-zinc-400">Expires: <span className="text-zinc-200">2026-08-25</span></p>
                          <p className="text-zinc-550">Recommended: Transfer to Westside Pediatric</p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Report View */}
                    <div className="lg:col-span-2 p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between h-[420px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">AI SCM Optimization Report</span>
                        {aiReport ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 overflow-y-auto max-h-[300px] text-xs font-mono text-zinc-300 whitespace-pre-line leading-relaxed scrollbar-thin">
                            {aiReport}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[260px] border border-dashed border-zinc-800 rounded-xl text-center p-4">
                            <Sparkles className="w-8 h-8 text-zinc-700 animate-pulse mb-2" />
                            <h4 className="text-zinc-400 text-xs font-bold font-mono">Replenishment Engine Standby</h4>
                            <p className="text-zinc-550 text-[10px] font-mono mt-1 max-w-xs">Click "Predict Demand & Optimize" to process GS1 logs, consumption data, and supplier lead times.</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-zinc-850 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-550">Engine: HealthOS GPT-SCM-V2</span>
                        <span className="text-emerald-400">Optimizations processed 100% locally</span>
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  9. REPORTS & ANALYTICS
                  ================================================== */}
              {activeTab === 'Reports' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2">
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Clinical SCM Cost & Turnaround Analytics</h3>
                    <p className="text-xs text-zinc-500 font-mono">Track localized material consumption, department waste rates, supplier pricing optimizations, and inventory turnover ratios.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Consumption by Department Pie */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[280px] flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Consumption by Department (YTD)</span>
                      <div className="flex-1 w-full min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={DEPT_CONSUMPTION_PIE}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {DEPT_CONSUMPTION_PIE.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[9px] font-mono">
                        {DEPT_CONSUMPTION_PIE.map((entry, index) => (
                          <span key={index} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded" style={{ backgroundColor: entry.color }} /> {entry.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top Used Materials Bar Chart */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[280px] flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Top Material Consumption Logs</span>
                      <div className="flex-1 w-full min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={MATERIALS_USAGE_BAR}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                            <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: '9px' }} />
                            <YAxis stroke="#52525b" style={{ fontSize: '9px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Units Dispatched" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Waste & Discard Analysis Card */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl h-[280px] flex flex-col justify-between font-mono">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">Waste & Shrinkage Report</span>
                        <div className="space-y-3 text-xs pt-1">
                          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Cold Chain Incidents:</span>
                              <span className="text-red-400">0.4%</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">Primarily due to temporary sub-vault maintenance.</p>
                          </div>

                          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Expiry Write-offs:</span>
                              <span className="text-emerald-400">1.2%</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">Outstanding clinical efficiency (GS1 warnings active).</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-zinc-550">
                        Calculated across 4 depots monthly.
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

              {/* ==================================================
                  10. INVENTORY SETTINGS
                  ================================================== */}
              {activeTab === 'Settings' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="border-b border-zinc-900 pb-2">
                    <h3 className="text-base font-black text-white uppercase tracking-tight">SCM Rules & System Constants</h3>
                    <p className="text-xs text-zinc-500 font-mono">Configure FDA batch rules, automated reorder thresholds, tax compliance, and approval chains.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Measurement Units & Categories */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4 font-mono text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Measurement Units & Expiry Rules</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                          <span>Default UOM (Consumables)</span>
                          <input 
                            type="text"
                            value={defaultUOM}
                            onChange={(e) => setDefaultUOM(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded p-1 text-center w-24 text-white"
                          />
                        </div>

                        <div className="flex justify-between items-center p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                          <span>Low Stock Warn Threshold</span>
                          <input 
                            type="number"
                            value={lowStockThreshold}
                            onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                            className="bg-zinc-900 border border-zinc-800 rounded p-1 text-center w-24 text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SCM Approval Workflow */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-4 font-mono text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Purchase Order Workflows</span>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-850 rounded-xl cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={requirePOApproval}
                            onChange={(e) => setRequirePOApproval(e.target.checked)}
                            className="accent-blue-500 w-4 h-4"
                          />
                          <div>
                            <p className="text-white font-bold">Require Clinical Director Approval</p>
                            <p className="text-[10px] text-zinc-500">Require double sign-off for PO values exceeding $5,000.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </WorkspaceTabPanel>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
