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
import { motion, AnimatePresence } from 'motion/react';
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

interface InventorySettings {
  defaultUOM: string;
  requirePOApproval: boolean;
  lowStockThreshold: number;
}

interface InventoryWorkspaceProps {
  demoMode?: boolean;
  initialProducts?: Product[];
  initialPurchaseOrders?: PurchaseOrder[];
  initialSuppliers?: Supplier[];
  initialMovements?: StockMovement[];
  initialWarehouses?: Warehouse[];
  initialSettings?: InventorySettings;
}

// --- REALISTIC ERP DATASETS ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'P-101',
    sku: 'PH-AMX-500-C10',
    barcode: '400129038201',
    name: 'Amoxicillin Trihydrate 500mg',
    description: 'Broad spectrum penicillin antibiotic, 500mg capsules. Store below 25آ°C.',
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
  { id: 'S-201', name: 'PharmaLink Distributions', contactName: 'Demo Contact A', email: 'contact-a@example.invalid', phone: '+1 (555) 010-0001', leadTimeDays: 5, performanceScore: 94, paymentTerms: 'Net 30', activeContracts: 3, totalSpent: 128400.00 },
  { id: 'S-202', name: 'SafeMed Global', contactName: 'Demo Contact B', email: 'contact-b@example.invalid', phone: '+1 (555) 010-0002', leadTimeDays: 7, performanceScore: 82, paymentTerms: 'Net 15', activeContracts: 1, totalSpent: 42900.00 },
  { id: 'S-203', name: 'Global MedSurg Inc.', contactName: 'Demo Contact C', email: 'contact-c@example.invalid', phone: '+1 (555) 010-0003', leadTimeDays: 3, performanceScore: 98, paymentTerms: 'Due on Receipt', activeContracts: 4, totalSpent: 210000.00 },
  { id: 'S-204', name: 'Roche Direct Supply', contactName: 'Demo Contact D', email: 'contact-d@example.invalid', phone: '+1 (555) 010-0004', leadTimeDays: 14, performanceScore: 91, paymentTerms: 'Net 45', activeContracts: 2, totalSpent: 350000.00 }
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

const getProductStatus = (quantity: number, minimum: number, expiryDate?: string): Product['status'] => {
  if (quantity <= 0) return 'Out of Stock';
  if (expiryDate && new Date(expiryDate).getTime() <= Date.now() + 90 * 86400000) return 'Expiring Soon';
  if (quantity < minimum) return 'Low Stock';
  return 'In Stock';
};

const mapProductRow = (row: any): Product => ({
  id: row.id,
  sku: row.sku,
  barcode: row.barcode,
  name: row.name,
  description: row.description,
  category: row.category,
  brand: row.brand,
  manufacturer: row.manufacturer,
  supplierName: row.supplier_name,
  warehouse: row.warehouse_name,
  storageLocation: row.storage_location,
  batchNumber: row.batch_number,
  lotNumber: row.lot_number,
  serialNumber: row.serial_number || undefined,
  expiryDate: row.expiry_date || '',
  stockQuantity: row.stock_quantity,
  minimumStock: row.minimum_stock,
  unitOfMeasure: row.unit_of_measure,
  status: getProductStatus(row.stock_quantity, row.minimum_stock, row.expiry_date),
  valuePerUnit: Number(row.value_per_unit || 0),
  attachments: row.attachments || []
});

const mapPurchaseOrderRow = (row: any): PurchaseOrder => ({
  id: row.id,
  poNumber: row.po_number,
  supplierName: row.supplier_name,
  orderDate: row.order_date,
  deliveryDate: row.delivery_date,
  itemsCount: row.items_count,
  totalCost: Number(row.total_cost || 0),
  status: row.status,
  paymentTerms: row.payment_terms
});

const mapMovementRow = (row: any): StockMovement => ({
  id: row.id,
  timestamp: String(row.occurred_at).replace('T', ' ').slice(0, 16),
  sku: row.sku,
  productName: row.product_name,
  type: row.movement_type,
  quantity: row.quantity,
  fromLocation: row.from_location,
  toLocation: row.to_location,
  authorizedBy: row.authorized_by,
  referenceDoc: row.reference_doc
});

export default function InventoryWorkspace({
  demoMode = false,
  initialProducts = [],
  initialPurchaseOrders = [],
  initialSuppliers = [],
  initialMovements = [],
  initialWarehouses = [],
  initialSettings
}: InventoryWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Catalog' | 'ProductWorkspace' | 'Procurement' | 'Suppliers' | 'StockMovements' | 'Warehouse' | 'AIAssistant' | 'Reports' | 'Settings'
  >('Dashboard');

  const [products, setProducts] = useState<Product[]>(demoMode ? INITIAL_PRODUCTS : initialProducts);
  const [pos, setPos] = useState<PurchaseOrder[]>(demoMode ? INITIAL_POS : initialPurchaseOrders);
  const [suppliers] = useState<Supplier[]>(demoMode ? INITIAL_SUPPLIERS : initialSuppliers);
  const [movements, setMovements] = useState<StockMovement[]>(demoMode ? INITIAL_MOVEMENTS : initialMovements);
  const [warehouses] = useState<Warehouse[]>(demoMode ? INITIAL_WAREHOUSES : initialWarehouses);
  const [inventoryBusy, setInventoryBusy] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  // Selected State variables
  const [selectedProductId, setSelectedProductId] = useState<string>(
    (demoMode ? INITIAL_PRODUCTS[1]?.id : initialProducts[0]?.id) || ''
  );
  const [bulkCheckedIds, setBulkCheckedIds] = useState<string[]>([]);
  
  // Search & Filtering States
  const [catSearch, setCatSearch] = useState('');
  const [catCategoryFilter, setCatCategoryFilter] = useState('All');
  const [catWarehouseFilter, setCatWarehouseFilter] = useState('All');
  const [catStatusFilter, setCatStatusFilter] = useState('All');

  // Purchase order creator state
  const [poSupplier, setPoSupplier] = useState(
    (demoMode ? INITIAL_SUPPLIERS[0]?.name : initialSuppliers[0]?.name) || ''
  );
  const [poItemsCount, setPoItemsCount] = useState('2');
  const [poTotalCost, setPoTotalCost] = useState('3400.00');
  const [poPaymentTerms, setPoPaymentTerms] = useState('Net 30');

  // AI Assistant action states
  const [aiReport, setAiReport] = useState<string>('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Dynamic configuration states
  const [defaultUOM, setDefaultUOM] = useState(initialSettings?.defaultUOM || 'Units');
  const [requirePOApproval, setRequirePOApproval] = useState(initialSettings?.requirePOApproval ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(initialSettings?.lowStockThreshold ?? 150);

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

  const stockValueTrendData = useMemo(() => {
    if (demoMode) return STOCK_VALUE_TREND;
    const totals = products.reduce((result, product) => {
      const value = product.stockQuantity * product.valuePerUnit;
      if (product.category === 'Pharmaceuticals') result.Pharmaceuticals += value;
      else if (product.category === 'Lab Reagents') result.LabSupplies += value;
      else result.Consumables += value;
      result.Total += value;
      return result;
    }, { Pharmaceuticals: 0, Consumables: 0, LabSupplies: 0, Total: 0 });
    return [{
      month: new Date().toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
      ...totals
    }];
  }, [demoMode, products]);

  const departmentConsumptionData = useMemo(() => {
    if (demoMode) return DEPT_CONSUMPTION_PIE;
    const colors = ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];
    const totals = new Map<string, number>();
    movements
      .filter(movement => movement.quantity < 0)
      .forEach(movement => totals.set(
        movement.toLocation || 'Unassigned',
        (totals.get(movement.toLocation || 'Unassigned') || 0) + Math.abs(movement.quantity)
      ));
    return Array.from(totals, ([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [demoMode, movements]);

  const materialsUsageData = useMemo(() => {
    if (demoMode) return MATERIALS_USAGE_BAR;
    const totals = new Map<string, number>();
    movements
      .filter(movement => movement.quantity < 0)
      .forEach(movement => totals.set(
        movement.productName,
        (totals.get(movement.productName) || 0) + Math.abs(movement.quantity)
      ));
    return Array.from(totals, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [demoMode, movements]);

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

  const createPurchaseOrder = async (
    supplierName: string,
    itemsCount: number,
    totalCost: number,
    paymentTerms: string,
    productIds: string[] = []
  ) => {
    if (demoMode) {
      const newPo: PurchaseOrder = {
        id: crypto.randomUUID(),
        poNumber: `PO-DEMO-${String(pos.length + 1).padStart(3, '0')}`,
        supplierName,
        orderDate: new Date().toISOString().substring(0, 10),
        deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().substring(0, 10),
        itemsCount,
        totalCost,
        status: requirePOApproval ? 'Pending Approval' : 'Approved',
        paymentTerms
      };
      setPos(prev => [newPo, ...prev]);
      return newPo;
    }

    const { createClient } = await import('@/utils/supabase/client');
    const { data, error } = await (createClient() as any).rpc(
      'create_inventory_purchase_order',
      {
        order_supplier_name: supplierName,
        order_items_count: itemsCount,
        order_total_cost: totalCost,
        order_payment_terms: paymentTerms,
        order_requires_approval: requirePOApproval,
        order_product_ids: productIds
      }
    );
    if (error) throw error;
    const newPo = mapPurchaseOrderRow(data);
    setPos(prev => [newPo, ...prev]);
    return newPo;
  };

  const recordMovement = async (
    product: Product,
    movementType: StockMovement['type'],
    quantity: number,
    fromLocation: string,
    toLocation: string,
    referenceDoc: string
  ) => {
    if (demoMode) {
      const nextQuantity = movementType === 'Inbound' || movementType === 'Return'
        ? product.stockQuantity + quantity
        : movementType === 'Outbound' || movementType === 'Consumption'
          ? product.stockQuantity - quantity
          : movementType === 'Adjustment'
            ? quantity
            : product.stockQuantity;
      if (nextQuantity < 0) throw new Error(`Only ${product.stockQuantity} units are available.`);
      const ledgerQuantity = movementType === 'Outbound' || movementType === 'Consumption'
        ? -quantity
        : movementType === 'Adjustment'
          ? nextQuantity - product.stockQuantity
          : quantity;
      const newMovement: StockMovement = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        sku: product.sku,
        productName: product.name,
        type: movementType,
        quantity: ledgerQuantity,
        fromLocation,
        toLocation,
        authorizedBy: 'Demo Inventory Operator',
        referenceDoc
      };
      const updatedProduct = {
        ...product,
        stockQuantity: nextQuantity,
        status: getProductStatus(nextQuantity, product.minimumStock, product.expiryDate)
      };
      setProducts(prev => prev.map(item => item.id === product.id ? updatedProduct : item));
      setMovements(prev => [newMovement, ...prev]);
      return;
    }

    const { createClient } = await import('@/utils/supabase/client');
    const { data, error } = await (createClient() as any).rpc(
      'record_inventory_movement',
      {
        target_product_id: product.id,
        movement_kind: movementType,
        movement_quantity: quantity,
        movement_from_location: fromLocation,
        movement_to_location: toLocation,
        movement_authorized_by: 'Inventory Operator',
        movement_reference_doc: referenceDoc
      }
    );
    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    const updatedProduct = mapProductRow(result.product);
    const newMovement = mapMovementRow(result.movement);
    setProducts(prev => prev.map(item => item.id === updatedProduct.id ? updatedProduct : item));
    setMovements(prev => [newMovement, ...prev]);
  };

  // Bulk operation triggers
  const handleBulkReorder = async () => {
    if (bulkCheckedIds.length === 0) return alert('No items selected. Please select items first.');
    const productsToReorder = products.filter(p => bulkCheckedIds.includes(p.id));

    setInventoryBusy(true);
    setInventoryError('');
    try {
      const newPo = await createPurchaseOrder(
        productsToReorder[0]?.supplierName || 'Unassigned Supplier',
        productsToReorder.length,
        productsToReorder.reduce((total, product) =>
          total + Math.max(product.minimumStock * 2 - product.stockQuantity, 1) * product.valuePerUnit, 0),
        'Net 30',
        productsToReorder.map(product => product.id)
      );
      setBulkCheckedIds([]);
      alert(`Purchase order ${newPo.poNumber} created for ${productsToReorder.length} products.`);
      setActiveTab('Procurement');
    } catch (error: any) {
      setInventoryError(error?.message || 'The purchase order could not be created.');
    } finally {
      setInventoryBusy(false);
    }
  };

  const handleBulkDisposal = async () => {
    if (bulkCheckedIds.length === 0) return alert('No items selected.');
    if (!confirm('Are you sure you want to flag selected batches for clinical biohazard disposal/audit?')) return;

    setInventoryBusy(true);
    setInventoryError('');
    try {
      for (const product of products.filter(item => bulkCheckedIds.includes(item.id))) {
        await recordMovement(
          product,
          'Adjustment',
          0,
          product.warehouse,
          'Clinical Waste Bin',
          `BIO-AUDIT-${new Date().getUTCFullYear()}`
        );
      }
      setBulkCheckedIds([]);
      alert('Selected items were written off with ledger entries.');
    } catch (error: any) {
      setInventoryError(error?.message || 'The inventory write-off could not be completed.');
    } finally {
      setInventoryBusy(false);
    }
  };

  // Add a new manual stock movement / transaction
  const [moveSku, setMoveSku] = useState(
    (demoMode ? INITIAL_PRODUCTS[1]?.sku : initialProducts[0]?.sku) || ''
  );
  const [moveQty, setMoveQty] = useState('100');
  const [moveType, setMoveType] = useState<'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment'>('Inbound');
  const [moveFrom, setMoveFrom] = useState('External Supplier Dock');
  const [moveTo, setMoveTo] = useState('HealthOS Central Warehouse');

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === moveSku);
    if (!product) return alert('Product SKU not found');

    const qty = parseInt(moveQty);
    if (isNaN(qty) || qty <= 0) return alert('Invalid quantity');

    setInventoryBusy(true);
    setInventoryError('');
    try {
      await recordMovement(product, moveType, qty, moveFrom, moveTo, 'MVT-MANUAL');
      setMoveQty('');
      alert('Stock movement recorded and inventory synchronized.');
    } catch (error: any) {
      setInventoryError(error?.message || 'The stock movement could not be recorded.');
    } finally {
      setInventoryBusy(false);
    }
  };

  // Create Purchase Order
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemCount = Number.parseInt(poItemsCount, 10);
    const totalCost = Number.parseFloat(poTotalCost);
    if (!poSupplier || !Number.isInteger(itemCount) || itemCount <= 0 || !Number.isFinite(totalCost) || totalCost < 0) {
      setInventoryError('Enter a supplier, a positive item count, and a valid total cost.');
      return;
    }
    setInventoryBusy(true);
    setInventoryError('');
    try {
      const newPo = await createPurchaseOrder(poSupplier, itemCount, totalCost, poPaymentTerms);
      alert(`Purchase order ${newPo.poNumber} submitted with status ${newPo.status}.`);
    } catch (error: any) {
      setInventoryError(error?.message || 'The purchase order could not be created.');
    } finally {
      setInventoryBusy(false);
    }
  };

  const handleApprovePO = async (po: PurchaseOrder) => {
    if (demoMode) {
      setPos(prev => prev.map(item => item.id === po.id ? { ...item, status: 'Approved' } : item));
      return alert(`PO ${po.poNumber} approved.`);
    }
    setInventoryBusy(true);
    setInventoryError('');
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const { data, error } = await (createClient() as any).rpc(
        'approve_inventory_purchase_order',
        { target_order_id: po.id }
      );
      if (error) throw error;
      const updatedOrder = mapPurchaseOrderRow(data);
      setPos(prev => prev.map(item => item.id === updatedOrder.id ? updatedOrder : item));
      alert(`PO ${updatedOrder.poNumber} approved.`);
    } catch (error: any) {
      setInventoryError(error?.message || 'The purchase order could not be approved.');
    } finally {
      setInventoryBusy(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!defaultUOM.trim() || !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
      setInventoryError('Enter a valid unit and non-negative low-stock threshold.');
      return;
    }
    if (demoMode) return alert('Demo inventory settings saved for this session.');

    setInventoryBusy(true);
    setInventoryError('');
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const { error } = await (createClient() as any)
        .from('inventory_settings')
        .upsert({
          default_uom: defaultUOM.trim(),
          require_po_approval: requirePOApproval,
          low_stock_threshold: lowStockThreshold
        });
      if (error) throw error;
      alert('Inventory settings saved.');
    } catch (error: any) {
      setInventoryError(error?.message || 'Inventory settings could not be saved.');
    } finally {
      setInventoryBusy(false);
    }
  };

  const handleRegisterProduct = async () => {
    const newSku = `MS-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const draft: Product = {
      id: crypto.randomUUID(),
      sku: newSku,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: 'Standard Normal Saline 0.9%',
      description: 'Intravenous infusion, standard 500ml bag.',
      category: 'Medical Supplies',
      brand: 'Sodium Chloride IV',
      manufacturer: 'Demo Medical Manufacturer',
      supplierName: suppliers[0]?.name || 'Unassigned Supplier',
      warehouse: warehouses[0]?.name || 'Main Warehouse',
      storageLocation: 'Aisle 2, Shelf F-1',
      batchNumber: 'DEMO-SAL-001',
      lotNumber: 'DEMO-LOT-001',
      expiryDate: '2028-12-01',
      stockQuantity: 1500,
      minimumStock: 250,
      unitOfMeasure: defaultUOM,
      status: 'In Stock',
      valuePerUnit: 1.85,
      attachments: []
    };

    if (demoMode) {
      setProducts(prev => [draft, ...prev]);
      setSelectedProductId(draft.id);
      return alert(`Demo product ${newSku} registered.`);
    }

    setInventoryBusy(true);
    setInventoryError('');
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const { data, error } = await (createClient() as any).rpc(
        'register_inventory_product',
        {
          product_sku: draft.sku,
          product_barcode: draft.barcode,
          product_name: draft.name,
          product_description: draft.description,
          product_category: draft.category,
          product_brand: draft.brand,
          product_manufacturer: draft.manufacturer,
          product_supplier_name: draft.supplierName,
          product_warehouse_name: draft.warehouse,
          product_storage_location: draft.storageLocation,
          product_batch_number: draft.batchNumber,
          product_lot_number: draft.lotNumber,
          product_expiry_date: draft.expiryDate,
          opening_quantity: draft.stockQuantity,
          product_minimum_stock: draft.minimumStock,
          product_unit_of_measure: draft.unitOfMeasure,
          product_value_per_unit: draft.valuePerUnit
        }
      );
      if (error) throw error;
      const product = mapProductRow(data);
      setProducts(prev => [product, ...prev]);
      setSelectedProductId(product.id);
      alert(`Product ${product.sku} registered with an opening-balance ledger entry.`);
    } catch (error: any) {
      setInventoryError(error?.message || 'The product could not be registered.');
    } finally {
      setInventoryBusy(false);
    }
  };

  const handleAdjustStock = async (product: Product) => {
    const newQuantity = prompt(`Set the counted stock quantity for ${product.brand}:`, String(product.stockQuantity));
    if (newQuantity === null) return;
    const parsed = Number.parseInt(newQuantity, 10);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setInventoryError('Stock quantity must be a non-negative whole number.');
      return;
    }

    setInventoryBusy(true);
    setInventoryError('');
    try {
      await recordMovement(
        product,
        'Adjustment',
        parsed,
        product.warehouse,
        product.warehouse,
        'CYCLE-COUNT'
      );
    } catch (error: any) {
      setInventoryError(error?.message || 'The stock count could not be adjusted.');
    } finally {
      setInventoryBusy(false);
    }
  };

  // AI Assistant generator
  const triggerAIAnalysis = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiReport(
        `**HEALTHOS AI INVENTORY FORECASTING & DEMAND CONTROLLER**\n\n` +
        `**1. PREDICTIVE STOCK SHORTAGES:**\n` +
        `â€¢ **SKU: PP-N95-FLT-M01 (Clinical N95 Respirator Mask)**: Current stock is **840 units**. Based on 14-day trailing outpatient admissions and historical flu-season consumption peaks, we project stock depletion in **12.4 days**. \n` +
        `  *Action Required*: Suggested immediate reorder of **2,000 units** to mitigate shortage.\n\n` +
        `**2. AUTOMATIC REORDER & COST OPTIMIZATION:**\n` +
        `â€¢ Roche Digital Glucometers (Accu-Chek) is currently **Out of Stock**. SafeMed Global is quoting $34.50/unit with a 7-day lead time. Roche Direct offers $32.00/unit with a 14-day lead. \n` +
        `  *Recommendation*: Purchase **50 units** from **SafeMed Global** for immediate triage, and place a bulk net-30 replenishment of **300 units** from **Roche Direct** to optimize unit economics.\n\n` +
        `**3. CLINICAL EXPIRY RISK ANALYSIS:**\n` +
        `â€¢ **SARS-CoV-2 PCR Test Reagents**: kit batches exp. **2026-08-25** are valued at **$20,250.00**. Present test rate averages only 8 kits/week. Suggest transferring 60% of cold vault reserve to Westside Pediatric hub where intake has surged by 44% last week.`
      );
      setAiAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="card-elevated rounded-3xl overflow-hidden flex flex-col h-[780px] font-sans antialiased relative">
      
      {/* BRAND & HEADER STATUS BAR */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: 'var(--velvet-surface-solid)', borderBottom: '1px solid var(--velvet-border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--velvet-accent-glow2)', border: '1px solid var(--velvet-border-strong)', color: 'var(--velvet-accent)' }}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title text-xs font-black uppercase tracking-wider">HealthOS Procurement & SCM</h2>
              <span className="badge text-2xs font-mono px-2 py-0.5 rounded-full">
                ERP CORE
              </span>
            </div>
            <p className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
              SCM Node ID: <span className="font-bold" style={{ color: 'var(--velvet-text)' }}>INV-9902-S8</span> â€¢ Real-time GS1 barcode integration
            </p>
          </div>
        </div>

        {/* TOP STATUS BAR ROW */}
        <div className="hidden lg:flex items-center gap-4 glass px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-2xs">
            <ThermometerSnowflake className="w-3.5 h-3.5" style={{ color: 'var(--velvet-info)' }} />
            <span className="font-bold" style={{ color: 'var(--velvet-text-sub)' }}>Cold Vault:</span>
            <span className="font-extrabold" style={{ color: 'var(--velvet-success)' }}>-18.4آ°C (Optimal)</span>
          </div>
          <div className="h-4 w-[1px]" style={{ background: 'var(--velvet-border)' }} />
          <div className="flex items-center gap-1.5 font-mono text-2xs">
            <Shield className="w-3.5 h-3.5" style={{ color: 'var(--velvet-text-muted)' }} />
            <span className="font-bold" style={{ color: 'var(--velvet-text-sub)' }}>FDA Compliance:</span>
            <span className="font-extrabold" style={{ color: 'var(--velvet-text)' }}>Validated (2026)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge flex items-center gap-1.5 text-2xs font-mono px-3 py-1.5">
            <Sliders className="w-3.5 h-3.5" /> GS1-Active
          </span>
        </div>
      </div>

      {/* WORKSPACE SIDEBAR NAVIGATION */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* MODULE LEFT NAVIGATION */}
        <div className="w-60 flex flex-col shrink-0 overflow-hidden select-none" style={{ background: 'var(--velvet-surface-solid)', borderRight: '1px solid var(--velvet-border)' }}>
          <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
            <span className="eyebrow text-2xs block mb-1">ERP Modules</span>
            <p className="text-2xs font-mono leading-relaxed" style={{ color: 'var(--velvet-text-sub)' }}>Enterprise Supply Chain Console:</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-none">
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
                  className={`nav-item w-full text-start text-xs font-bold font-mono justify-between ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="badge text-2xs font-mono px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 shrink-0 space-y-2" style={{ background: 'var(--velvet-bg-elevated)', borderTop: '1px solid var(--velvet-border)' }}>
            <span className="eyebrow text-2xs block">SCM Controller</span>
            <div className="card-elevated flex items-center gap-2.5 p-2 rounded-xl">
              <div className="bg-gold-gradient w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase shadow-soft" style={{ color: 'var(--velvet-bg)' }}>
                SC
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold truncate" style={{ color: 'var(--velvet-text)' }}>Supply Control</h5>
                <p className="text-2xs font-mono truncate" style={{ color: 'var(--velvet-text-muted)' }}>Role: Procurement Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE VIEW CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: 'var(--velvet-bg)' }}>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {inventoryError && (
              <div className="mb-4 rounded-xl px-4 py-3 text-xs font-mono" style={{ background: 'color-mix(in srgb, var(--velvet-error) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--velvet-error) 35%, transparent)', color: 'var(--velvet-error)' }}>
                {inventoryError}
              </div>
            )}
            <AnimatePresence mode="wait">
              
              {/* ==================================================
                  1. INVENTORY DASHBOARD
                  ================================================== */}
              {activeTab === 'Dashboard' && (
                <WorkspaceTabPanel
                  className="space-y-6"
                >
                  <div className="pb-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                    <div>
                      <h3 className="section-title text-base font-black uppercase tracking-tight">Enterprise SCM & Stock Operations</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Consolidated overview of pharmaceutical inventories, low stock levels, pending purchase orders, and supplier ratings.</p>
                    </div>
                    <span className="badge text-xs font-mono px-3 py-1 rounded-xl">
                      FDA & DEA Drug Compliant
                    </span>
                  </div>

                  {/* High Quality Bento Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="card-gradient card-luxury p-4 flex flex-col justify-between h-[105px] card-hover">
                      <span className="eyebrow text-2xs">Total Inventory Value</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-gradient text-xl font-black font-mono">${stats.totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <p className="text-2xs font-semibold flex items-center gap-1" style={{ color: 'var(--velvet-success)' }}>
                        <TrendingUp className="w-3 h-3" /> +4.2% vs last quarter
                      </p>
                    </div>

                    <div className="card-elevated p-4 flex flex-col justify-between h-[105px] card-hover">
                      <span className="eyebrow text-2xs">Stock Warnings</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black font-mono" style={{ color: 'var(--velvet-text)' }}>{stats.lowStockCount} Low</span>
                        <span className="text-xs font-black font-mono" style={{ color: 'var(--velvet-error)' }}>/ {stats.outOfStockCount} Out</span>
                      </div>
                      <p className="text-2xs font-mono flex items-center gap-1" style={{ color: 'var(--velvet-text-sub)' }}>
                        <AlertTriangle className="w-3 h-3" style={{ color: 'var(--velvet-warning)' }} /> {stats.expiringSoonCount} Expiring within 30 days
                      </p>
                    </div>

                    <div className="card-elevated p-4 flex flex-col justify-between h-[105px] card-hover">
                      <span className="eyebrow text-2xs">Purchase Orders</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black font-mono" style={{ color: 'var(--velvet-text)' }}>{stats.pendingPoCount} Pending</span>
                      </div>
                      <p className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
                        Awaiting financial approval workflow
                      </p>
                    </div>

                    <div className="card-elevated p-4 flex flex-col justify-between h-[105px] card-hover">
                      <span className="eyebrow text-2xs">Suppliers Directory</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono" style={{ color: 'var(--velvet-text)' }}>{stats.totalSuppliersCount} Connected</span>
                      </div>
                      <p className="text-2xs font-semibold" style={{ color: 'var(--velvet-success)' }}>
                        91.2% Average Performance
                      </p>
                    </div>
                  </div>

                  {/* Chart Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recharts Area Chart */}
                    <div className="card-elevated p-4 col-span-2 flex flex-col justify-between h-[280px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="eyebrow text-2xs font-mono">Total Capitalized Stock Value (YTD)</span>
                        <div className="flex gap-4 text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: 'var(--velvet-info)' }} /> Pharma</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: 'var(--velvet-accent)' }} /> Consumables</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stockValueTrendData}>
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
                    <div className="card-gradient p-4 flex flex-col justify-between h-[280px]">
                      <div>
                        <span className="eyebrow text-2xs font-mono block mb-3">Quick Logistics Dispatches</span>
                        <p className="text-2xs font-mono leading-relaxed mb-4" style={{ color: 'var(--velvet-text-sub)' }}>Direct dispatch links for immediate procurement operations.</p>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={() => { setActiveTab('Procurement') }}
                          className="btn-ghost w-full justify-start text-start p-2.5 rounded-xl flex items-center gap-3 text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg" style={{ background: 'var(--velvet-accent-glow2)', color: 'var(--velvet-accent)' }}>
                            <Plus className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: 'var(--velvet-text)' }}>Draft Purchase Order</p>
                            <p className="text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>Initiate bulk replenishment</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setActiveTab('StockMovements') }}
                          className="btn-ghost w-full justify-start text-start p-2.5 rounded-xl flex items-center gap-3 text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg" style={{ background: 'var(--velvet-accent-glow2)', color: 'var(--velvet-info)' }}>
                            <History className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: 'var(--velvet-text)' }}>Log Stock Movement</p>
                            <p className="text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>Record clinical consumption</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setActiveTab('AIAssistant') }}
                          className="btn-ghost w-full justify-start text-start p-2.5 rounded-xl flex items-center gap-3 text-xs font-bold font-mono cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg" style={{ background: 'var(--velvet-accent-glow2)', color: 'var(--velvet-accent)' }}>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: 'var(--velvet-text)' }}>AI Demand Forecast</p>
                            <p className="text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>Run clinical usage analytics</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM TELEMETRY BAR */}
                  <div className="card-elevated p-4 flex justify-between items-center text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--velvet-text-muted)' }}>Storage Node Integrity:</span>
                    <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--velvet-success)' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: 'var(--velvet-success)' }} /> Synchronized with US GS1 Registries
                    </span>
                    <span style={{ color: 'var(--velvet-text-sub)' }}>DEA Register: <span className="font-bold" style={{ color: 'var(--velvet-text)' }}>ACTIVE-DEA-2026</span></span>
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
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                    <div>
                      <h3 className="section-title text-base font-black uppercase tracking-tight">Active Product Registry</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>GS1 SKU database of drugs, disposable components, sterile shields and reagents.</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      {bulkCheckedIds.length > 0 && (
                        <div className="flex gap-2 items-center me-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                          <span className="font-mono" style={{ color: 'var(--velvet-text-sub)' }}>{bulkCheckedIds.length} checked</span>
                          <button 
                            onClick={handleBulkReorder}
                            className="btn-primary font-mono px-2 py-1 rounded text-2xs font-bold cursor-pointer"
                          >
                            Bulk Reorder
                          </button>
                          <button 
                            onClick={handleBulkDisposal}
                            className="btn-ghost font-mono px-2 py-1 rounded text-2xs font-bold cursor-pointer"
                            style={{ color: 'var(--velvet-error)' }}
                          >
                            Bulk Discard
                          </button>
                        </div>
                      )}

                      <button 
                        onClick={handleRegisterProduct}
                        disabled={inventoryBusy}
                        className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register SKU
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 card-elevated p-4">
                    <div className="relative md:col-span-1">
                      <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--velvet-text-muted)' }} />
                      <input
                        type="text"
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="Search SKU, name, brand, bar..."
                        className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl outline-none font-mono"
                      />
                    </div>

                    <div>
                      <select
                        value={catCategoryFilter}
                        onChange={(e) => setCatCategoryFilter(e.target.value)}
                        className="w-full rounded-xl text-xs font-mono p-1.5 outline-none"
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
                        className="w-full rounded-xl text-xs font-mono p-1.5 outline-none"
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
                        className="w-full rounded-xl text-xs font-mono p-1.5 outline-none"
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
                  <div className="card-elevated overflow-hidden rounded-3xl">
                    <table className="w-full text-start text-xs font-mono">
                      <thead className="text-2xs">
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
                          <th className="py-3 px-4 text-end">Physical Stock</th>
                          <th className="py-3 px-4 text-end">Unit Value</th>
                          <th className="py-3 px-4 text-end">Total Capital</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(p => {
                          const totalVal = p.stockQuantity * p.valuePerUnit;
                          const isChecked = bulkCheckedIds.includes(p.id);
                          return (
                            <tr key={p.id}>
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
                                <p className="text-2xs text-zinc-500">{p.sku}</p>
                              </td>
                              <td className="py-2.5 px-4 max-w-[200px] truncate text-zinc-400">
                                {p.name}
                              </td>
                              <td className="py-2.5 px-4 text-2xs">
                                <span className="badge px-2 py-0.5 rounded-md text-2xs">
                                  {p.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-end font-bold text-white">
                                {p.stockQuantity.toLocaleString()} <span className="text-2xs text-zinc-500">{p.unitOfMeasure}</span>
                              </td>
                              <td className="py-2.5 px-4 text-end text-zinc-400">
                                ${p.valuePerUnit.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-4 text-end text-emerald-400 font-bold">
                                ${totalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                                  p.status === 'In Stock' ? 'badge-success' :
                                  p.status === 'Low Stock' ? 'badge-warning' :
                                  p.status === 'Expiring Soon' ? 'badge-info' :
                                  'badge-danger'
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
                                    className="btn-ghost rounded"
                                    style={{ color: 'var(--velvet-text-sub)', padding: '0.25rem', borderRadius: '0.5rem' }}
                                    title="View Product Workspace"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleAdjustStock(p)}
                                    disabled={inventoryBusy}
                                    className="btn-ghost rounded"
                                    style={{ color: 'var(--velvet-text-sub)', padding: '0.25rem', borderRadius: '0.5rem' }}
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
                  <div className="flex items-center gap-2 text-xs font-mono pb-2" style={{ color: 'var(--velvet-text-muted)', borderBottom: '1px solid var(--velvet-border)' }}>
                    <span className="cursor-pointer hover:text-white" onClick={() => setActiveTab('Catalog')}>Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-bold" style={{ color: 'var(--velvet-text)' }}>{selectedProduct.sku}</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Detail Column */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="card-elevated p-6 space-y-4">
                        <div>
                          <span className="badge text-2xs font-mono font-black px-2.5 py-1 rounded-full">
                            {selectedProduct.category}
                          </span>
                          <h3 className="section-title text-xl font-bold mt-2">{selectedProduct.name}</h3>
                          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--velvet-text-sub)' }}>{selectedProduct.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4" style={{ borderTop: '1px solid var(--velvet-border)' }}>
                          <div>
                            <span className="text-2xs font-mono block" style={{ color: 'var(--velvet-text-muted)' }}>Brand</span>
                            <span className="text-xs font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>{selectedProduct.brand}</span>
                          </div>
                          <div>
                            <span className="text-2xs font-mono block" style={{ color: 'var(--velvet-text-muted)' }}>Manufacturer</span>
                            <span className="text-xs font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>{selectedProduct.manufacturer}</span>
                          </div>
                          <div>
                            <span className="text-2xs font-mono block" style={{ color: 'var(--velvet-text-muted)' }}>Preferred Supplier</span>
                            <span className="text-xs font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>{selectedProduct.supplierName}</span>
                          </div>
                          <div>
                            <span className="text-2xs font-mono block" style={{ color: 'var(--velvet-text-muted)' }}>Storage Location</span>
                            <span className="text-xs font-bold font-mono" style={{ color: 'var(--velvet-text)' }}>{selectedProduct.storageLocation}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 font-mono" style={{ borderTop: '1px solid var(--velvet-border)' }}>
                          <div>
                            <span className="text-2xs block" style={{ color: 'var(--velvet-text-muted)' }}>Batch Number</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--velvet-text-sub)' }}>{selectedProduct.batchNumber}</span>
                          </div>
                          <div>
                            <span className="text-2xs block" style={{ color: 'var(--velvet-text-muted)' }}>Lot Number</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--velvet-text-sub)' }}>{selectedProduct.lotNumber}</span>
                          </div>
                          <div>
                            <span className="text-2xs block" style={{ color: 'var(--velvet-text-muted)' }}>Barcode (EAN-13)</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--velvet-text-sub)' }}>{selectedProduct.barcode}</span>
                          </div>
                          <div>
                            <span className="text-2xs block" style={{ color: 'var(--velvet-text-muted)' }}>Expiration Date</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--velvet-warning)' }}>{selectedProduct.expiryDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stock History Audit Table */}
                      <div className="card-elevated p-5 space-y-3">
                        <h4 className="eyebrow text-xs font-bold flex items-center gap-2">
                          <History className="w-4 h-4" /> Stock Movement History
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-start text-xs font-mono">
                            <thead>
                              <tr className="text-2xs">
                                <th className="pb-2">Timestamp</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2 text-end">Quantity</th>
                                <th className="pb-2">Custodian</th>
                                <th className="pb-2">Reference Case/Doc</th>
                              </tr>
                            </thead>
                            <tbody>
                              {movements.filter(m => m.sku === selectedProduct.sku).map((m, idx) => (
                                <tr key={idx}>
                                  <td className="py-2" style={{ color: 'var(--velvet-text-sub)' }}>{m.timestamp}</td>
                                  <td className="py-2">
                                    <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                                      m.type === 'Inbound' ? 'badge-success' :
                                      m.type === 'Outbound' ? 'badge-warning' :
                                      m.type === 'Transfer' ? 'badge-info' :
                                      'badge'
                                    }`}>
                                      {m.type}
                                    </span>
                                  </td>
                                  <td className="py-2 text-end font-bold" style={{ color: 'var(--velvet-text)' }}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                                  <td className="py-2" style={{ color: 'var(--velvet-text-sub)' }}>{m.authorizedBy}</td>
                                  <td className="py-2" style={{ color: 'var(--velvet-text-muted)' }}>{m.referenceDoc}</td>
                                </tr>
                              ))}
                              {movements.filter(m => m.sku === selectedProduct.sku).length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-4 text-center font-mono text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>
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
                      <div className="card-elevated p-5 space-y-4">
                        <span className="eyebrow text-2xs font-mono block">Real-time Level Indicator</span>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span style={{ color: 'var(--velvet-text-sub)' }}>Current Qty</span>
                            <span className="font-bold" style={{ color: 'var(--velvet-text)' }}>{selectedProduct.stockQuantity} / {selectedProduct.minimumStock} min</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--velvet-surface-2)', border: '1px solid var(--velvet-border)' }}>
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
                          <span style={{ color: 'var(--velvet-text-muted)' }}>Stock Rating:</span>
                          <span className="font-bold" style={{ color: selectedProduct.status === 'In Stock' ? 'var(--velvet-success)' : 'var(--velvet-warning)' }}>{selectedProduct.status}</span>
                        </div>
                      </div>

                      {/* Attachments Section */}
                      <div className="card-elevated p-5 space-y-3">
                        <span className="eyebrow text-2xs font-mono block">Certificates & Specifications</span>
                        {selectedProduct.attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-xl font-mono text-xs" style={{ background: 'var(--velvet-glass-fill)', border: '1px solid var(--velvet-border)' }}>
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--velvet-info)' }} />
                              <span className="truncate" style={{ color: 'var(--velvet-text-sub)' }}>{file}</span>
                            </div>
                            <Download className="w-4 h-4 cursor-pointer" style={{ color: 'var(--velvet-text-muted)' }} />
                          </div>
                        ))}
                        {selectedProduct.attachments.length === 0 && (
                          <p className="text-2xs text-center font-mono py-2" style={{ color: 'var(--velvet-text-muted)' }}>No FDA COA attached.</p>
                        )}
                        <button className="btn-ghost w-full py-1.5 rounded-xl text-xs font-mono font-bold border border-dashed" style={{ borderColor: 'var(--velvet-border-strong)', color: 'var(--velvet-text-muted)' }}>
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
                    <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                      <div>
                        <h3 className="section-title text-base font-black uppercase tracking-tight">Purchase Orders (PO) Registry</h3>
                        <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Approve clinical replenishment schedules, track supplier delivery timetables.</p>
                      </div>
                    </div>

                    <div className="card-elevated overflow-hidden rounded-3xl">
                      <table className="w-full text-start text-xs font-mono">
                        <thead className="text-2xs">
                          <tr>
                            <th className="py-3 px-4">PO Number</th>
                            <th className="py-3 px-4">Supplier</th>
                            <th className="py-3 px-4">Order Date</th>
                            <th className="py-3 px-4 text-end">Items</th>
                            <th className="py-3 px-4 text-end">Total Cost</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pos.map(po => (
                            <tr key={po.id}>
                              <td className="py-2.5 px-4 font-bold" style={{ color: 'var(--velvet-text)' }}>{po.poNumber}</td>
                              <td className="py-2.5 px-4" style={{ color: 'var(--velvet-text-sub)' }}>{po.supplierName}</td>
                              <td className="py-2.5 px-4" style={{ color: 'var(--velvet-text-sub)' }}>{po.orderDate}</td>
                              <td className="py-2.5 px-4 text-end">{po.itemsCount}</td>
                              <td className="py-2.5 px-4 text-end font-bold" style={{ color: 'var(--velvet-success)' }}>${po.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                                  po.status === 'Received' ? 'badge-success' :
                                  po.status === 'Approved' ? 'badge-info' :
                                  po.status === 'Pending Approval' ? 'badge-warning' :
                                  'badge'
                                }`}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                {po.status === 'Pending Approval' ? (
                                  <button 
                                    onClick={() => handleApprovePO(po)}
                                    disabled={inventoryBusy}
                                    className="btn-primary font-mono text-2xs font-bold px-2 py-1 rounded cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <span className="text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Supplier Quote Comparison */}
                    <div className="card-elevated p-5 space-y-3">
                      <h4 className="eyebrow text-xs font-bold flex items-center gap-2">
                        <Sliders className="w-4 h-4" /> Procurement Quote Matrix (Bid Analysis)
                      </h4>
                      <p className="text-2xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Comparing multiple clinical bidders for Disposable Syringe bulk orders:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="card-elevated p-3 rounded-xl font-mono text-xs space-y-1">
                          <p className="font-bold" style={{ color: 'var(--velvet-text)' }}>Global MedSurg (Winner)</p>
                          <p style={{ color: 'var(--velvet-text-sub)' }}>Unit Bid: <span className="font-bold" style={{ color: 'var(--velvet-success)' }}>$0.08</span></p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Lead Time: <span style={{ color: 'var(--velvet-text)' }}>3 Days</span></p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Contract Rate: Locked</p>
                        </div>
                        <div className="card-elevated p-3 rounded-xl font-mono text-xs space-y-1 opacity-60">
                          <p className="font-bold" style={{ color: 'var(--velvet-text)' }}>PharmaLink Distributions</p>
                          <p style={{ color: 'var(--velvet-text-sub)' }}>Unit Bid: $0.10</p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Lead Time: 5 Days</p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Contract Rate: Open</p>
                        </div>
                        <div className="card-elevated p-3 rounded-xl font-mono text-xs space-y-1 opacity-60">
                          <p className="font-bold" style={{ color: 'var(--velvet-text)' }}>SafeMed Global</p>
                          <p style={{ color: 'var(--velvet-text-sub)' }}>Unit Bid: $0.11</p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Lead Time: 7 Days</p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Contract Rate: Spot</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PO Draft Form */}
                  <div className="space-y-4">
                    <form onSubmit={handleCreatePO} className="card-elevated p-5 space-y-4">
                      <span className="eyebrow text-2xs font-mono block">Draft PO Replenishment</span>

                      <div className="space-y-1.5 font-mono text-xs">
                        <label style={{ color: 'var(--velvet-text-sub)' }}>Preferred Supplier</label>
                        <select 
                          value={poSupplier}
                          onChange={(e) => setPoSupplier(e.target.value)}
                          className="w-full rounded-xl p-2 outline-none"
                        >
                          {suppliers.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="space-y-1.5">
                          <label style={{ color: 'var(--velvet-text-sub)' }}>Items Count</label>
                          <input 
                            type="number"
                            value={poItemsCount}
                            onChange={(e) => setPoItemsCount(e.target.value)}
                            className="w-full rounded-xl p-2 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label style={{ color: 'var(--velvet-text-sub)' }}>Payment Terms</label>
                          <select 
                            value={poPaymentTerms}
                            onChange={(e) => setPoPaymentTerms(e.target.value)}
                            className="w-full rounded-xl p-2 outline-none"
                          >
                            <option value="Net 30">Net 30</option>
                            <option value="Net 15">Net 15</option>
                            <option value="Net 45">Net 45</option>
                            <option value="Due on Receipt">Due on Receipt</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        <label style={{ color: 'var(--velvet-text-sub)' }}>Estimated Total Cost ($)</label>
                        <input 
                          type="text"
                          value={poTotalCost}
                          onChange={(e) => setPoTotalCost(e.target.value)}
                          className="w-full rounded-xl p-2 outline-none text-end font-bold"
                          style={{ color: 'var(--velvet-success) !important' }}
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={inventoryBusy}
                        className="btn-primary w-full py-2 font-bold text-xs rounded-xl font-mono cursor-pointer"
                      >
                        {inventoryBusy ? 'Saving...' : 'Submit Purchase Order Draft'}
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
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                    <div>
                      <h3 className="section-title text-base font-black uppercase tracking-tight">Validated Suppliers Directory</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>FDA approved pharmaceuticals & medical consumables logistics vendors.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {suppliers.map(s => (
                      <div key={s.id} className="card-elevated card-hover p-5 flex flex-col justify-between h-[190px] font-mono">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="section-title text-sm font-bold leading-tight">{s.name}</h4>
                            <span className={`text-2xs font-black px-1.5 py-0.5 rounded ${
                              s.performanceScore >= 90 ? 'badge-success' : 'badge-warning'
                            }`}>{s.performanceScore}% Score</span>
                          </div>
                          <p className="text-2xs mt-1" style={{ color: 'var(--velvet-text-muted)' }}>{s.contactName} â€¢ {s.phone}</p>
                          <p className="text-2xs mt-2 truncate" style={{ color: 'var(--velvet-text-sub)' }}>{s.email}</p>
                        </div>

                        <div className="space-y-1 pt-3 text-xs" style={{ borderTop: '1px solid var(--velvet-border)' }}>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--velvet-text-muted)' }}>Lead Time:</span>
                            <span className="font-bold" style={{ color: 'var(--velvet-text-sub)' }}>{s.leadTimeDays} Days</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--velvet-text-muted)' }}>Total Spent:</span>
                            <span className="font-bold" style={{ color: 'var(--velvet-success)' }}>${s.totalSpent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Supplier Contract Overview Table */}
                  <div className="card-elevated p-5 space-y-3">
                    <h4 className="eyebrow text-xs font-bold">Supplier Performance & SLA Contracts</h4>
                    <div className="overflow-hidden rounded-xl">
                      <table className="w-full text-start text-xs font-mono">
                        <thead className="text-2xs">
                          <tr>
                            <th className="p-2 px-3">Supplier Name</th>
                            <th className="p-2 px-3">Active Contracts</th>
                            <th className="p-2 px-3">SLA Compliance Rating</th>
                            <th className="p-2 px-3">Payment Terms</th>
                            <th className="p-2 px-3">Risk Assessment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 px-3 font-bold" style={{ color: 'var(--velvet-text)' }}>PharmaLink Distributions</td>
                            <td className="p-2 px-3">3 Active MSA</td>
                            <td className="p-2 px-3" style={{ color: 'var(--velvet-success)' }}>98% Ontime Delivery</td>
                            <td className="p-2 px-3">Net 30</td>
                            <td className="p-2 px-3" style={{ color: 'var(--velvet-success)' }}>Low Risk</td>
                          </tr>
                          <tr>
                            <td className="p-2 px-3 font-bold" style={{ color: 'var(--velvet-text)' }}>SafeMed Global</td>
                            <td className="p-2 px-3">1 MSA</td>
                            <td className="p-2 px-3" style={{ color: 'var(--velvet-warning)' }}>84% Ontime Delivery</td>
                            <td className="p-2 px-3">Net 15</td>
                            <td className="p-2 px-3" style={{ color: 'var(--velvet-warning)' }}>Moderate (Delayed Lead)</td>
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
                    <div className="pb-2" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                      <h3 className="section-title text-base font-black uppercase tracking-tight">Stock Movement Audit Trail</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Continuous digital log of inbound shipments, outbound patient treatments, transfers, and warehouse adjustments.</p>
                    </div>

                    <div className="card-elevated overflow-hidden rounded-3xl">
                      <table className="w-full text-start text-xs font-mono">
                        <thead className="text-2xs">
                          <tr>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">SKU / Product</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4 text-end">Quantity</th>
                            <th className="py-3 px-4">From â†’ To</th>
                            <th className="py-3 px-4">Authorized By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.map(m => (
                            <tr key={m.id}>
                              <td className="py-2.5 px-4 text-2xs" style={{ color: 'var(--velvet-text-sub)' }}>{m.timestamp}</td>
                              <td className="py-2.5 px-4">
                                <p className="font-bold" style={{ color: 'var(--velvet-text)' }}>{m.productName}</p>
                                <p className="text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>{m.sku}</p>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`text-2xs font-black px-2 py-0.5 rounded-full ${
                                  m.type === 'Inbound' ? 'badge-success' :
                                  m.type === 'Outbound' ? 'badge-danger' :
                                  m.type === 'Transfer' ? 'badge-info' :
                                  'badge'
                                }`}>
                                  {m.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-end font-bold" style={{ color: 'var(--velvet-text)' }}>
                                {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                              </td>
                              <td className="py-2.5 px-4 max-w-[120px] truncate" style={{ color: 'var(--velvet-text-sub)' }}>
                                {m.fromLocation} â†’ {m.toLocation}
                              </td>
                              <td className="py-2.5 px-4 text-2xs" style={{ color: 'var(--velvet-text-sub)' }}>{m.authorizedBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Manual Stock Dispatch Form */}
                  <div>
                    <form onSubmit={handleCreateMovement} className="card-elevated p-5 space-y-4 font-mono text-xs">
                      <span className="eyebrow text-2xs block">Dispatch Manual Stock</span>

                      <div className="space-y-1.5">
                        <label style={{ color: 'var(--velvet-text-sub)' }}>Select Registered SKU</label>
                        <select 
                          value={moveSku}
                          onChange={(e) => setMoveSku(e.target.value)}
                          className="w-full rounded-xl p-2 outline-none"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.sku}>{p.brand} ({p.sku})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label style={{ color: 'var(--velvet-text-sub)' }}>Movement Type</label>
                          <select 
                            value={moveType}
                            onChange={(e) => setMoveType(e.target.value as any)}
                            className="w-full rounded-xl p-2 outline-none"
                          >
                            <option value="Inbound">Inbound</option>
                            <option value="Outbound">Outbound</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Adjustment">Adjustment (Direct SET)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label style={{ color: 'var(--velvet-text-sub)' }}>Qty (UOM)</label>
                          <input 
                            type="number"
                            value={moveQty}
                            onChange={(e) => setMoveQty(e.target.value)}
                            className="w-full rounded-xl p-2 outline-none text-end font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label style={{ color: 'var(--velvet-text-sub)' }}>From Depot / Location</label>
                        <input 
                          type="text"
                          value={moveFrom}
                          onChange={(e) => setMoveFrom(e.target.value)}
                          className="w-full rounded-xl p-2 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label style={{ color: 'var(--velvet-text-sub)' }}>To Destination Depot</label>
                        <input 
                          type="text"
                          value={moveTo}
                          onChange={(e) => setMoveTo(e.target.value)}
                          className="w-full rounded-xl p-2 outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={inventoryBusy || products.length === 0}
                        className="btn-primary w-full py-2 font-bold rounded-xl cursor-pointer"
                      >
                        {inventoryBusy ? 'Saving...' : 'Commit Movement Transaction'}
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
                  <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                    <div>
                      <h3 className="section-title text-base font-black uppercase tracking-tight">Depot & Storage Area Registers</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Oversee multiple physical warehouses, cold storage vaults, clinical ward cupboards and lab reagent depots.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {warehouses.map(w => (
                      <div key={w.id} className="card-elevated card-hover p-5 flex flex-col justify-between h-[175px] font-mono">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="eyebrow text-2xs font-black uppercase">{w.type}</span>
                            <span className="text-2xs font-bold" style={{ color: 'var(--velvet-text-muted)' }}>Occupancy: {w.occupancyPercent}%</span>
                          </div>
                          <h4 className="section-title text-sm font-bold mt-1 leading-tight">{w.name}</h4>
                          <p className="text-2xs mt-1 truncate" style={{ color: 'var(--velvet-text-muted)' }}>{w.address}</p>
                        </div>

                        <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--velvet-border)' }}>
                          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--velvet-surface-2)' }}>
                            <div className="h-full" style={{ width: `${w.occupancyPercent}%`, background: 'var(--velvet-accent)' }} />
                          </div>
                          <div className="flex justify-between text-2xs" style={{ color: 'var(--velvet-text-muted)' }}>
                            <span>Shelves: {w.shelvesCount} sectors</span>
                            <span>Safe Range Checked</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cold Chain Storage Telemetry Panel */}
                  <div className="card-elevated p-5 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                    <div className="space-y-1">
                      <span className="eyebrow text-2xs block">Main Cold Vault</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black" style={{ color: 'var(--velvet-text)' }}>-18.4آ°C</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--velvet-success)' }}>Stable</span>
                      </div>
                      <p className="text-2xs leading-relaxed" style={{ color: 'var(--velvet-text-sub)' }}>Storage: Covid Reagents, Vaccines, RNA active chains.</p>
                    </div>

                    <div className="space-y-1">
                      <span className="eyebrow text-2xs block">Lab Depot Temperature</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black" style={{ color: 'var(--velvet-text)' }}>4.2آ°C</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--velvet-success)' }}>Stable</span>
                      </div>
                      <p className="text-2xs leading-relaxed" style={{ color: 'var(--velvet-text-sub)' }}>Storage: Normal insulin vials, enzyme buffers.</p>
                    </div>

                    <div className="space-y-1">
                      <span className="eyebrow text-2xs block">Humidity Sensor Node #4</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black" style={{ color: 'var(--velvet-text)' }}>38% rH</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--velvet-success)' }}>Optimal</span>
                      </div>
                      <p className="text-2xs leading-relaxed" style={{ color: 'var(--velvet-text-sub)' }}>Dry conditions preserved to prevent capsule degradation.</p>
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
                  <div className="pb-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
                    <div>
                      <h3 className="section-title text-base font-black uppercase tracking-tight">AI Stock & Demand Engine</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--velvet-text-muted)' }}>Automate clinical stock replenishment, predict stock shortages, calculate supplier lead times, and optimize SCM.</p>
                    </div>

                    <button 
                      onClick={triggerAIAnalysis}
                      disabled={aiAnalyzing}
                      className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer"
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
                      <div className="card-elevated p-5 space-y-4 font-mono">
                        <span className="eyebrow text-2xs block">Automatic Reorder Suggestion</span>
                        <div className="card-elevated p-3 rounded-xl space-y-1 text-xs">
                          <p className="font-bold" style={{ color: 'var(--velvet-text)' }}>SKU: PP-N95-FLT-M01</p>
                          <p style={{ color: 'var(--velvet-text-sub)' }}>Reorder Quantity: <span className="font-bold" style={{ color: 'var(--velvet-accent)' }}>2,000 Units</span></p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Suggested Supplier: <span style={{ color: 'var(--velvet-text)' }}>SafeMed Global</span></p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Est Savings: $240.00 via contract</p>
                        </div>
                      </div>

                      <div className="card-elevated p-5 space-y-4 font-mono">
                        <span className="eyebrow text-2xs block">Expiry Risk Warnings</span>
                        <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: 'color-mix(in srgb, var(--velvet-error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--velvet-error) 35%, transparent)' }}>
                          <p className="font-bold flex items-center gap-1.5" style={{ color: 'var(--velvet-error)' }}>
                            <AlertTriangle className="w-3.5 h-3.5" /> High Expiry Risk
                          </p>
                          <p style={{ color: 'var(--velvet-text)' }}>TaqPath COVID PCR (450 Kits)</p>
                          <p style={{ color: 'var(--velvet-text-sub)' }}>Expires: <span style={{ color: 'var(--velvet-text)' }}>2026-08-25</span></p>
                          <p style={{ color: 'var(--velvet-text-muted)' }}>Recommended: Transfer to Westside Pediatric</p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Report View */}
                    <div className="lg:col-span-2 p-6 bg-zinc-900/40 border border-zinc-850 rounded-3xl flex flex-col justify-between h-[420px]">
                      <div>
                        <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-3">AI SCM Optimization Report</span>
                        {aiReport ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 overflow-y-auto max-h-[300px] text-xs font-mono text-zinc-300 whitespace-pre-line leading-relaxed scrollbar-thin">
                            {aiReport}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[260px] border border-dashed border-zinc-800 rounded-xl text-center p-4">
                            <Sparkles className="w-8 h-8 text-zinc-700 animate-pulse mb-2" />
                            <h4 className="text-zinc-400 text-xs font-bold font-mono">Replenishment Engine Standby</h4>
                            <p className="text-zinc-550 text-2xs font-mono mt-1 max-w-xs">Click "Predict Demand & Optimize" to process GS1 logs, consumption data, and supplier lead times.</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-zinc-850 flex justify-between items-center text-2xs font-mono">
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
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-3xl h-[280px] flex flex-col justify-between">
                      <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Consumption by Department (YTD)</span>
                      <div className="flex-1 w-full min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={departmentConsumptionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {departmentConsumptionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-2xs font-mono">
                        {departmentConsumptionData.map((entry, index) => (
                          <span key={index} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded" style={{ backgroundColor: entry.color }} /> {entry.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top Used Materials Bar Chart */}
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-3xl h-[280px] flex flex-col justify-between">
                      <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-2">Top Material Consumption Logs</span>
                      <div className="flex-1 w-full min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={materialsUsageData}>
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
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-3xl h-[280px] flex flex-col justify-between font-mono">
                      <div>
                        <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 block mb-3">Waste & Shrinkage Report</span>
                        <div className="space-y-3 text-xs pt-1">
                          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Cold Chain Incidents:</span>
                              <span className="text-red-400">0.4%</span>
                            </div>
                            <p className="text-2xs text-zinc-500">Primarily due to temporary sub-vault maintenance.</p>
                          </div>

                          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Expiry Write-offs:</span>
                              <span className="text-emerald-400">1.2%</span>
                            </div>
                            <p className="text-2xs text-zinc-500">Outstanding clinical efficiency (GS1 warnings active).</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-2xs text-zinc-550">
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
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-3xl space-y-4 font-mono text-xs">
                      <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 block">Measurement Units & Expiry Rules</span>
                      
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
                    <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-3xl space-y-4 font-mono text-xs">
                      <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 block">Purchase Order Workflows</span>
                      
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
                            <p className="text-2xs text-zinc-500">Require double sign-off for PO values exceeding $5,000.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={inventoryBusy}
                      className="rounded-xl bg-blue-500 px-5 py-2 text-xs font-bold text-black transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {inventoryBusy ? 'Saving...' : 'Save Inventory Settings'}
                    </button>
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
