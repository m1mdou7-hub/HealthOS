export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/ui/DashboardShell';
import InventoryWorkspace from '@/components/ui/InventoryWorkspace';

export default async function InventoryPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  const tInv = await getTranslations('InventoryWorkspace');

  if (!user) {
    return redirect('/signin');
  }

  const demoMode = Boolean((user as any).isDevBypass);
  const [
    { data: productRows },
    { data: orderRows },
    { data: supplierRows },
    { data: movementRows },
    { data: warehouseRows },
    { data: settingsRow }
  ] = demoMode
    ? [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: null }
      ]
    : await Promise.all([
        (supabase as any).from('inventory_products').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('inventory_purchase_orders').select('*').order('order_date', { ascending: false }),
        (supabase as any).from('inventory_suppliers').select('*').order('name', { ascending: true }),
        (supabase as any).from('inventory_stock_movements').select('*').order('occurred_at', { ascending: false }),
        (supabase as any).from('inventory_warehouses').select('*').order('name', { ascending: true }),
        (supabase as any).from('inventory_settings').select('*').maybeSingle()
      ]);

  const initialProducts = (productRows || []).map((row: any) => ({
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
    status: row.stock_quantity <= 0
      ? 'Out of Stock'
      : row.expiry_date && new Date(row.expiry_date).getTime() <= Date.now() + 90 * 86400000
        ? 'Expiring Soon'
        : row.stock_quantity < row.minimum_stock
          ? 'Low Stock'
          : 'In Stock',
    valuePerUnit: Number(row.value_per_unit || 0),
    attachments: row.attachments || []
  }));

  const initialPurchaseOrders = (orderRows || []).map((row: any) => ({
    id: row.id,
    poNumber: row.po_number,
    supplierName: row.supplier_name,
    orderDate: row.order_date,
    deliveryDate: row.delivery_date,
    itemsCount: row.items_count,
    totalCost: Number(row.total_cost || 0),
    status: row.status,
    paymentTerms: row.payment_terms
  }));

  const initialSuppliers = (supplierRows || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    leadTimeDays: row.lead_time_days,
    performanceScore: Number(row.performance_score || 0),
    paymentTerms: row.payment_terms,
    activeContracts: row.active_contracts,
    totalSpent: Number(row.total_spent || 0)
  }));

  const initialMovements = (movementRows || []).map((row: any) => ({
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
  }));

  const initialWarehouses = (warehouseRows || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    type: row.warehouse_type,
    address: row.address,
    shelvesCount: row.shelves_count,
    occupancyPercent: Number(row.occupancy_percent || 0)
  }));

  return (
    <DashboardShell user={user}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl font-sans">
            {tInv('headerTitle')}
          </h2>
          <p className="mt-1 text-zinc-400 text-sm">
            Oversee pharmaceutical drug registrations, cold chain logistics, automated supplier reorders, and stock movement ledger audits.
          </p>
        </div>

        <InventoryWorkspace
          demoMode={demoMode}
          initialProducts={initialProducts}
          initialPurchaseOrders={initialPurchaseOrders}
          initialSuppliers={initialSuppliers}
          initialMovements={initialMovements}
          initialWarehouses={initialWarehouses}
          initialSettings={settingsRow ? {
            defaultUOM: settingsRow.default_uom,
            requirePOApproval: settingsRow.require_po_approval,
            lowStockThreshold: settingsRow.low_stock_threshold
          } : undefined}
        />
      </div>
    </DashboardShell>
  );
}
