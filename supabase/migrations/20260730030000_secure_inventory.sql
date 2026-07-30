-- Owner-isolated inventory, procurement, and an immutable stock ledger.

create table if not exists public.inventory_suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  lead_time_days integer not null default 0 check (lead_time_days >= 0),
  performance_score numeric(5,2) not null default 0 check (performance_score between 0 and 100),
  payment_terms text not null default 'Net 30',
  active_contracts integer not null default 0 check (active_contracts >= 0),
  total_spent numeric(14,2) not null default 0 check (total_spent >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, name)
);

create table if not exists public.inventory_warehouses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  warehouse_type text not null default 'General'
    check (warehouse_type in ('General', 'Cold Storage', 'Clinic Stock', 'Lab Depot')),
  address text not null default '',
  shelves_count integer not null default 0 check (shelves_count >= 0),
  occupancy_percent numeric(5,2) not null default 0 check (occupancy_percent between 0 and 100),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, name)
);

create table if not exists public.inventory_products (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sku text not null,
  barcode text not null default '',
  name text not null,
  description text not null default '',
  category text not null
    check (category in ('Pharmaceuticals', 'Medical Supplies', 'Protective Gear', 'Diagnostics', 'Lab Reagents')),
  brand text not null default '',
  manufacturer text not null default '',
  supplier_name text not null default '',
  warehouse_name text not null default '',
  storage_location text not null default '',
  batch_number text not null default '',
  lot_number text not null default '',
  serial_number text,
  expiry_date date,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  unit_of_measure text not null default 'Units',
  value_per_unit numeric(14,4) not null default 0 check (value_per_unit >= 0),
  attachments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(attachments) = 'array'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, sku)
);

create table if not exists public.inventory_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  po_number text not null,
  supplier_name text not null,
  order_date date not null default current_date,
  delivery_date date not null default (current_date + 10),
  items_count integer not null check (items_count > 0),
  total_cost numeric(14,2) not null check (total_cost >= 0),
  status text not null default 'Draft'
    check (status in ('Draft', 'Pending Approval', 'Approved', 'Received', 'Cancelled')),
  payment_terms text not null default 'Net 30',
  product_ids jsonb not null default '[]'::jsonb
    check (jsonb_typeof(product_ids) = 'array'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, po_number)
);

create table if not exists public.inventory_stock_movements (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.inventory_products(id) on delete restrict,
  sku text not null,
  product_name text not null,
  movement_type text not null
    check (movement_type in ('Inbound', 'Outbound', 'Transfer', 'Adjustment', 'Consumption', 'Return')),
  quantity integer not null,
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  from_location text not null default '',
  to_location text not null default '',
  authorized_by text not null default 'Inventory Operator',
  reference_doc text not null default '',
  occurred_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.inventory_settings (
  owner_user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  default_uom text not null default 'Units'
    check (char_length(trim(default_uom)) between 1 and 40),
  require_po_approval boolean not null default true,
  low_stock_threshold integer not null default 150 check (low_stock_threshold >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists inventory_products_owner_status_idx
  on public.inventory_products(owner_user_id, stock_quantity, minimum_stock);
create index if not exists inventory_products_owner_expiry_idx
  on public.inventory_products(owner_user_id, expiry_date);
create unique index if not exists inventory_products_owner_barcode_idx
  on public.inventory_products(owner_user_id, barcode)
  where trim(barcode) <> '';
create index if not exists inventory_movements_owner_occurred_idx
  on public.inventory_stock_movements(owner_user_id, occurred_at desc);
create index if not exists inventory_orders_owner_status_idx
  on public.inventory_purchase_orders(owner_user_id, status, order_date desc);

alter table public.inventory_suppliers enable row level security;
alter table public.inventory_warehouses enable row level security;
alter table public.inventory_products enable row level security;
alter table public.inventory_purchase_orders enable row level security;
alter table public.inventory_stock_movements enable row level security;
alter table public.inventory_settings enable row level security;

drop policy if exists "Inventory suppliers are isolated by owner" on public.inventory_suppliers;
create policy "Inventory suppliers are isolated by owner"
  on public.inventory_suppliers for all to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Inventory warehouses are isolated by owner" on public.inventory_warehouses;
create policy "Inventory warehouses are isolated by owner"
  on public.inventory_warehouses for all to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Inventory products are isolated by owner" on public.inventory_products;
create policy "Inventory products are isolated by owner"
  on public.inventory_products for all to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Inventory purchase orders are isolated by owner" on public.inventory_purchase_orders;
create policy "Inventory purchase orders are isolated by owner"
  on public.inventory_purchase_orders for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists "Inventory stock ledger is isolated by owner" on public.inventory_stock_movements;
create policy "Inventory stock ledger is isolated by owner"
  on public.inventory_stock_movements for select to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.inventory_products
      where inventory_products.id = inventory_stock_movements.product_id
        and inventory_products.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Inventory settings are isolated by owner" on public.inventory_settings;
create policy "Inventory settings are isolated by owner"
  on public.inventory_settings for all to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

grant select, insert, delete on public.inventory_suppliers to authenticated;
grant select, insert, update, delete on public.inventory_warehouses to authenticated;
grant select on public.inventory_products to authenticated;
revoke insert, update, delete on public.inventory_products from authenticated;
grant select on public.inventory_purchase_orders to authenticated;
revoke insert, update, delete on public.inventory_purchase_orders from authenticated;
grant select on public.inventory_stock_movements to authenticated;
revoke insert, update, delete on public.inventory_stock_movements from authenticated;
grant select, insert, update, delete on public.inventory_settings to authenticated;

create or replace function public.register_inventory_product(
  product_sku text,
  product_barcode text,
  product_name text,
  product_description text,
  product_category text,
  product_brand text,
  product_manufacturer text,
  product_supplier_name text,
  product_warehouse_name text,
  product_storage_location text,
  product_batch_number text,
  product_lot_number text,
  product_expiry_date date,
  opening_quantity integer,
  product_minimum_stock integer,
  product_unit_of_measure text,
  product_value_per_unit numeric
)
returns public.inventory_products
language plpgsql
security definer
set search_path = public
as $$
declare
  product_record public.inventory_products;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if trim(coalesce(product_sku, '')) = '' or trim(coalesce(product_name, '')) = '' then
    raise exception 'SKU and product name are required';
  end if;
  if opening_quantity < 0 or product_minimum_stock < 0 or product_value_per_unit < 0 then
    raise exception 'Inventory values cannot be negative';
  end if;

  insert into public.inventory_products (
    owner_user_id, sku, barcode, name, description, category, brand,
    manufacturer, supplier_name, warehouse_name, storage_location,
    batch_number, lot_number, expiry_date, stock_quantity, minimum_stock,
    unit_of_measure, value_per_unit
  )
  values (
    auth.uid(), trim(product_sku), trim(coalesce(product_barcode, '')),
    trim(product_name), coalesce(product_description, ''), product_category,
    coalesce(product_brand, ''), coalesce(product_manufacturer, ''),
    coalesce(product_supplier_name, ''), coalesce(product_warehouse_name, ''),
    coalesce(product_storage_location, ''), coalesce(product_batch_number, ''),
    coalesce(product_lot_number, ''), product_expiry_date, opening_quantity,
    product_minimum_stock, coalesce(nullif(trim(product_unit_of_measure), ''), 'Units'),
    product_value_per_unit
  )
  returning * into product_record;

  if opening_quantity > 0 then
    insert into public.inventory_stock_movements (
      owner_user_id, product_id, sku, product_name, movement_type, quantity,
      quantity_before, quantity_after, from_location, to_location,
      authorized_by, reference_doc
    )
    values (
      auth.uid(), product_record.id, product_record.sku, product_record.name,
      'Inbound', opening_quantity, 0, opening_quantity, 'Opening Balance',
      product_record.warehouse_name, 'Inventory Operator', 'OPENING-BALANCE'
    );
  end if;

  return product_record;
end;
$$;

create or replace function public.record_inventory_movement(
  target_product_id uuid,
  movement_kind text,
  movement_quantity integer,
  movement_from_location text,
  movement_to_location text,
  movement_authorized_by text,
  movement_reference_doc text
)
returns table (
  product public.inventory_products,
  movement public.inventory_stock_movements
)
language plpgsql
security definer
set search_path = public
as $$
declare
  product_record public.inventory_products;
  movement_record public.inventory_stock_movements;
  previous_quantity integer;
  next_quantity integer;
  ledger_quantity integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into product_record
  from public.inventory_products
  where id = target_product_id and owner_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Inventory product not found';
  end if;
  if movement_kind not in ('Inbound', 'Outbound', 'Transfer', 'Adjustment', 'Consumption', 'Return') then
    raise exception 'Invalid movement type';
  end if;
  if movement_quantity < 0 then
    raise exception 'Movement quantity cannot be negative';
  end if;

  previous_quantity := product_record.stock_quantity;
  next_quantity := case
    when movement_kind in ('Inbound', 'Return') then product_record.stock_quantity + movement_quantity
    when movement_kind in ('Outbound', 'Consumption') then product_record.stock_quantity - movement_quantity
    when movement_kind = 'Adjustment' then movement_quantity
    else product_record.stock_quantity
  end;

  if next_quantity < 0 then
    raise exception 'Insufficient stock: % available', product_record.stock_quantity;
  end if;

  ledger_quantity := case
    when movement_kind in ('Outbound', 'Consumption') then -movement_quantity
    when movement_kind = 'Adjustment' then next_quantity - product_record.stock_quantity
    else movement_quantity
  end;

  update public.inventory_products
  set stock_quantity = next_quantity,
      updated_at = timezone('utc'::text, now())
  where id = product_record.id
  returning * into product_record;

  insert into public.inventory_stock_movements (
    owner_user_id, product_id, sku, product_name, movement_type, quantity,
    quantity_before, quantity_after, from_location, to_location,
    authorized_by, reference_doc
  )
  values (
    auth.uid(), product_record.id, product_record.sku, product_record.name,
    movement_kind, ledger_quantity, previous_quantity,
    next_quantity, coalesce(movement_from_location, ''),
    coalesce(movement_to_location, ''),
    coalesce(nullif(trim(movement_authorized_by), ''), 'Inventory Operator'),
    coalesce(movement_reference_doc, '')
  )
  returning * into movement_record;

  return query select product_record, movement_record;
end;
$$;

create or replace function public.create_inventory_purchase_order(
  order_supplier_name text,
  order_items_count integer,
  order_total_cost numeric,
  order_payment_terms text,
  order_requires_approval boolean,
  order_product_ids jsonb default '[]'::jsonb
)
returns public.inventory_purchase_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_record public.inventory_purchase_orders;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if trim(coalesce(order_supplier_name, '')) = '' then
    raise exception 'Supplier is required';
  end if;
  if order_items_count <= 0 or order_total_cost < 0 then
    raise exception 'Invalid purchase order values';
  end if;
  if jsonb_typeof(coalesce(order_product_ids, '[]'::jsonb)) <> 'array' then
    raise exception 'Product list must be an array';
  end if;

  insert into public.inventory_purchase_orders (
    owner_user_id, po_number, supplier_name, order_date, delivery_date,
    items_count, total_cost, status, payment_terms, product_ids
  )
  values (
    auth.uid(),
    'PO-' || to_char(timezone('utc'::text, now()), 'YYYYMMDD-HH24MISSMS'),
    trim(order_supplier_name), current_date, current_date + 10,
    order_items_count, order_total_cost,
    case when order_requires_approval then 'Pending Approval' else 'Approved' end,
    coalesce(nullif(trim(order_payment_terms), ''), 'Net 30'),
    coalesce(order_product_ids, '[]'::jsonb)
  )
  returning * into order_record;

  return order_record;
end;
$$;

create or replace function public.approve_inventory_purchase_order(target_order_id uuid)
returns public.inventory_purchase_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_record public.inventory_purchase_orders;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.inventory_purchase_orders
  set status = 'Approved',
      updated_at = timezone('utc'::text, now())
  where id = target_order_id
    and owner_user_id = auth.uid()
    and status = 'Pending Approval'
  returning * into order_record;

  if not found then
    raise exception 'Pending purchase order not found';
  end if;

  return order_record;
end;
$$;

create or replace function public.inventory_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists inventory_suppliers_set_updated_at on public.inventory_suppliers;
create trigger inventory_suppliers_set_updated_at
before update on public.inventory_suppliers
for each row execute function public.inventory_set_updated_at();

drop trigger if exists inventory_warehouses_set_updated_at on public.inventory_warehouses;
create trigger inventory_warehouses_set_updated_at
before update on public.inventory_warehouses
for each row execute function public.inventory_set_updated_at();

drop trigger if exists inventory_settings_set_updated_at on public.inventory_settings;
create trigger inventory_settings_set_updated_at
before update on public.inventory_settings
for each row execute function public.inventory_set_updated_at();

revoke all on function public.register_inventory_product(
  text, text, text, text, text, text, text, text, text, text, text, text,
  date, integer, integer, text, numeric
) from public;
revoke all on function public.record_inventory_movement(
  uuid, text, integer, text, text, text, text
) from public;
revoke all on function public.create_inventory_purchase_order(
  text, integer, numeric, text, boolean, jsonb
) from public;
revoke all on function public.approve_inventory_purchase_order(uuid) from public;

grant execute on function public.register_inventory_product(
  text, text, text, text, text, text, text, text, text, text, text, text,
  date, integer, integer, text, numeric
) to authenticated;
grant execute on function public.record_inventory_movement(
  uuid, text, integer, text, text, text, text
) to authenticated;
grant execute on function public.create_inventory_purchase_order(
  text, integer, numeric, text, boolean, jsonb
) to authenticated;
grant execute on function public.approve_inventory_purchase_order(uuid) to authenticated;
