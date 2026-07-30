-- Secure, owner-isolated patient billing and atomic payment recording.

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  invoice_number text not null,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text not null,
  doctor_name text not null default 'Unassigned',
  clinic_name text not null default 'Main Clinic',
  issue_date date not null default current_date,
  due_date date not null default (current_date + 14),
  treatment_items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(treatment_items) = 'array'),
  insurance_coverage_percent numeric(5,2) not null default 0
    check (insurance_coverage_percent between 0 and 100),
  insurance_claim_status text not null default 'None'
    check (insurance_claim_status in ('None', 'Pending', 'Approved', 'Rejected', 'Resubmitted')),
  insurance_provider text not null default 'Self-Pay',
  payment_status text not null default 'Pending'
    check (payment_status in ('Paid', 'Pending', 'Overdue', 'Partially Paid', 'Refunded')),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  notes text not null default '',
  attachments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(attachments) = 'array'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, invoice_number)
);

create table if not exists public.billing_estimates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  estimate_number text not null,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text not null,
  doctor_name text not null default 'Unassigned',
  clinic_name text not null default 'Main Clinic',
  issue_date date not null default current_date,
  expiration_date date not null default (current_date + 30),
  treatment_items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(treatment_items) = 'array'),
  approval_status text not null default 'Pending Approval'
    check (approval_status in ('Pending Approval', 'Approved', 'Expired')),
  converted_invoice_id uuid references public.billing_invoices(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, estimate_number)
);

create table if not exists public.billing_claims (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.billing_invoices(id) on delete cascade,
  invoice_number text not null,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text not null,
  provider text not null,
  policy_number text not null default '',
  pre_auth_required boolean not null default false,
  pre_auth_status text not null default 'Not Required'
    check (pre_auth_status in ('Approved', 'Not Required', 'Pending', 'Denied')),
  amount_claimed numeric(12,2) not null default 0 check (amount_claimed >= 0),
  amount_approved numeric(12,2) not null default 0 check (amount_approved >= 0),
  status text not null default 'Draft'
    check (status in ('Draft', 'Submitted', 'In Review', 'Approved', 'Rejected')),
  timeline jsonb not null default '[]'::jsonb
    check (jsonb_typeof(timeline) = 'array'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.billing_invoices(id) on delete cascade,
  invoice_number text not null,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null
    check (payment_method in ('Cash', 'Credit Card', 'Bank Transfer', 'Online Gateway')),
  recorded_at timestamptz not null default timezone('utc'::text, now()),
  type text not null default 'Payment'
    check (type in ('Payment', 'Refund', 'Partial')),
  receipt_number text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (owner_user_id, receipt_number)
);

create table if not exists public.billing_timeline_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  invoice_id uuid references public.billing_invoices(id) on delete cascade,
  event_type text not null
    check (event_type in ('invoice_created', 'payment_received', 'claim_submitted', 'claim_approved', 'refund_issued')),
  title text not null,
  description text not null default '',
  occurred_at timestamptz not null default timezone('utc'::text, now()),
  amount numeric(12,2),
  actor_name text not null default 'Practice Admin'
);

create table if not exists public.billing_settings (
  owner_user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  currency text not null default 'USD ($)',
  tax_rate_percent numeric(5,2) not null default 0
    check (tax_rate_percent between 0 and 100),
  invoice_prefix text not null default 'INV-'
    check (char_length(trim(invoice_prefix)) between 1 and 20),
  auto_submit_insurance boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists billing_invoices_owner_patient_idx
  on public.billing_invoices(owner_user_id, patient_id);
create index if not exists billing_invoices_owner_due_idx
  on public.billing_invoices(owner_user_id, due_date);
create index if not exists billing_estimates_owner_patient_idx
  on public.billing_estimates(owner_user_id, patient_id);
create index if not exists billing_claims_owner_invoice_idx
  on public.billing_claims(owner_user_id, invoice_id);
create index if not exists billing_payments_owner_invoice_idx
  on public.billing_payments(owner_user_id, invoice_id);
create index if not exists billing_timeline_owner_occurred_idx
  on public.billing_timeline_events(owner_user_id, occurred_at desc);

alter table public.billing_invoices enable row level security;
alter table public.billing_estimates enable row level security;
alter table public.billing_claims enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_timeline_events enable row level security;
alter table public.billing_settings enable row level security;

drop policy if exists "Billing invoices are isolated by owner" on public.billing_invoices;
create policy "Billing invoices are isolated by owner"
  on public.billing_invoices for all to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.patients
      where patients.id = billing_invoices.patient_id
        and patients.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.patients
      where patients.id = billing_invoices.patient_id
        and patients.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Billing estimates are isolated by owner" on public.billing_estimates;
create policy "Billing estimates are isolated by owner"
  on public.billing_estimates for all to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.patients
      where patients.id = billing_estimates.patient_id
        and patients.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.patients
      where patients.id = billing_estimates.patient_id
        and patients.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Billing claims are isolated by owner" on public.billing_claims;
create policy "Billing claims are isolated by owner"
  on public.billing_claims for all to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.billing_invoices
      where billing_invoices.id = billing_claims.invoice_id
        and billing_invoices.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.billing_invoices
      where billing_invoices.id = billing_claims.invoice_id
        and billing_invoices.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Billing payments are isolated by owner" on public.billing_payments;
create policy "Billing payments are isolated by owner"
  on public.billing_payments for select to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.billing_invoices
      where billing_invoices.id = billing_payments.invoice_id
        and billing_invoices.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Billing events are isolated by owner" on public.billing_timeline_events;
create policy "Billing events are isolated by owner"
  on public.billing_timeline_events for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists "Billing settings are isolated by owner" on public.billing_settings;
create policy "Billing settings are isolated by owner"
  on public.billing_settings for all to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Financial totals and the immutable journal can only be mutated through the
-- guarded functions below, never directly through the browser data API.
revoke insert, delete on public.billing_invoices from authenticated;
revoke update on public.billing_invoices from authenticated;
grant select on public.billing_invoices to authenticated;

revoke insert, update, delete on public.billing_payments from authenticated;
grant select on public.billing_payments to authenticated;

revoke insert, update, delete on public.billing_timeline_events from authenticated;
grant select on public.billing_timeline_events to authenticated;

revoke insert, update, delete on public.billing_claims from authenticated;
grant select on public.billing_claims to authenticated;

revoke insert, update, delete on public.billing_estimates from authenticated;
grant select on public.billing_estimates to authenticated;
grant select, insert, update, delete on public.billing_settings to authenticated;

create or replace function public.healthos_invoice_total(items jsonb)
returns numeric
language sql
immutable
set search_path = public
as $$
  select coalesce(
    sum(
      coalesce((item->>'quantity')::numeric, 0)
      * coalesce((item->>'unitPrice')::numeric, 0)
      * (1 - coalesce((item->>'discount')::numeric, 0) / 100)
      * (1 + coalesce((item->>'tax')::numeric, 0) / 100)
    ),
    0
  )
  from jsonb_array_elements(coalesce(items, '[]'::jsonb)) item;
$$;

create or replace function public.create_billing_invoice(
  target_patient_id text,
  invoice_doctor_name text,
  invoice_clinic_name text,
  invoice_treatment_items jsonb,
  invoice_due_date date,
  invoice_insurance_coverage numeric default 0,
  invoice_insurance_provider text default 'Self-Pay',
  invoice_notes text default ''
)
returns public.billing_invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_record public.patients;
  new_invoice public.billing_invoices;
  number_suffix text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  prefix_value text;
begin
  select * into patient_record
  from public.patients
  where id = target_patient_id and owner_user_id = auth.uid();

  if not found then
    raise exception 'Patient not found or not accessible';
  end if;

  if jsonb_typeof(invoice_treatment_items) <> 'array'
    or jsonb_array_length(invoice_treatment_items) = 0 then
    raise exception 'At least one treatment item is required';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(invoice_treatment_items) item
    where jsonb_typeof(item) <> 'object'
      or coalesce((item->>'quantity')::numeric, 0) <= 0
      or coalesce((item->>'unitPrice')::numeric, -1) < 0
      or coalesce((item->>'discount')::numeric, -1) not between 0 and 100
      or coalesce((item->>'tax')::numeric, -1) not between 0 and 100
      or nullif(trim(item->>'code'), '') is null
      or nullif(trim(item->>'name'), '') is null
  ) then
    raise exception 'Treatment item values are invalid';
  end if;

  select invoice_prefix into prefix_value
  from public.billing_settings
  where owner_user_id = auth.uid();

  insert into public.billing_invoices (
    invoice_number, patient_id, patient_name, doctor_name, clinic_name,
    due_date, treatment_items, insurance_coverage_percent,
    insurance_claim_status, insurance_provider, notes
  )
  values (
    coalesce(nullif(trim(prefix_value), ''), 'INV-')
      || to_char(current_date, 'YYYY') || '-' || number_suffix,
    patient_record.id,
    patient_record.name,
    coalesce(nullif(trim(invoice_doctor_name), ''), 'Unassigned'),
    coalesce(nullif(trim(invoice_clinic_name), ''), 'Main Clinic'),
    greatest(invoice_due_date, current_date),
    invoice_treatment_items,
    greatest(0, least(100, invoice_insurance_coverage)),
    case when invoice_insurance_coverage > 0 then 'Pending' else 'None' end,
    coalesce(nullif(trim(invoice_insurance_provider), ''), 'Self-Pay'),
    coalesce(invoice_notes, '')
  )
  returning * into new_invoice;

  insert into public.billing_timeline_events (
    invoice_id, event_type, title, description, amount
  )
  values (
    new_invoice.id,
    'invoice_created',
    'Invoice ' || new_invoice.invoice_number || ' created',
    'Invoice created for ' || new_invoice.patient_name || '.',
    public.healthos_invoice_total(new_invoice.treatment_items)
  );

  return new_invoice;
end;
$$;

create or replace function public.record_billing_payment(
  target_invoice_id uuid,
  payment_amount numeric,
  selected_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_record public.billing_invoices;
  invoice_total numeric;
  remaining_balance numeric;
  new_amount_paid numeric;
  new_status text;
  generated_receipt text := 'REC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  payment_record public.billing_payments;
begin
  if payment_amount is null or payment_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  if selected_payment_method not in ('Cash', 'Credit Card', 'Bank Transfer', 'Online Gateway') then
    raise exception 'Unsupported payment method';
  end if;

  select * into invoice_record
  from public.billing_invoices
  where id = target_invoice_id and owner_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Invoice not found or not accessible';
  end if;

  invoice_total := public.healthos_invoice_total(invoice_record.treatment_items);
  remaining_balance := greatest(invoice_total - invoice_record.amount_paid, 0);

  if remaining_balance = 0 then
    raise exception 'Invoice is already paid';
  end if;

  if payment_amount > remaining_balance then
    raise exception 'Payment exceeds the remaining invoice balance';
  end if;

  new_amount_paid := invoice_record.amount_paid + payment_amount;
  new_status := case
    when new_amount_paid >= invoice_total then 'Paid'
    else 'Partially Paid'
  end;

  insert into public.billing_payments (
    invoice_id, invoice_number, patient_id, patient_name, amount,
    payment_method, type, receipt_number
  )
  values (
    invoice_record.id, invoice_record.invoice_number, invoice_record.patient_id,
    invoice_record.patient_name, payment_amount, selected_payment_method,
    case when payment_amount < remaining_balance then 'Partial' else 'Payment' end,
    generated_receipt
  )
  returning * into payment_record;

  update public.billing_invoices
  set amount_paid = new_amount_paid, payment_status = new_status
  where id = invoice_record.id;

  insert into public.billing_timeline_events (
    invoice_id, event_type, title, description, amount
  )
  values (
    invoice_record.id,
    'payment_received',
    'Payment on ' || invoice_record.invoice_number,
    selected_payment_method || ' payment recorded for ' || invoice_record.patient_name || '.',
    payment_amount
  );

  return jsonb_build_object(
    'payment', to_jsonb(payment_record),
    'amount_paid', new_amount_paid,
    'payment_status', new_status
  );
end;
$$;

create or replace function public.convert_billing_estimate(
  target_estimate_id uuid
)
returns public.billing_invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  estimate_record public.billing_estimates;
  new_invoice public.billing_invoices;
begin
  select * into estimate_record
  from public.billing_estimates
  where id = target_estimate_id and owner_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Estimate not found or not accessible';
  end if;

  if estimate_record.converted_invoice_id is not null then
    raise exception 'Estimate has already been converted';
  end if;

  select * into new_invoice
  from public.create_billing_invoice(
    estimate_record.patient_id,
    estimate_record.doctor_name,
    estimate_record.clinic_name,
    estimate_record.treatment_items,
    current_date + 14,
    0,
    'Self-Pay',
    'Converted from estimate ' || estimate_record.estimate_number || '.'
  );

  update public.billing_estimates
  set
    approval_status = 'Approved',
    converted_invoice_id = new_invoice.id
  where id = estimate_record.id;

  return new_invoice;
end;
$$;

create or replace function public.resubmit_billing_claim(
  target_claim_id uuid,
  procedure_code text,
  resubmission_notes text
)
returns public.billing_claims
language plpgsql
security definer
set search_path = public
as $$
declare
  claim_record public.billing_claims;
begin
  select * into claim_record
  from public.billing_claims
  where id = target_claim_id and owner_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Claim not found or not accessible';
  end if;

  update public.billing_claims
  set
    status = 'In Review',
    timeline = timeline || jsonb_build_array(jsonb_build_object(
      'title', 'Claim Resubmitted',
      'date', to_char(timezone('utc'::text, now()), 'YYYY-MM-DD HH24:MI'),
      'description', 'Corrected procedure code ' || procedure_code || '. Note: ' || resubmission_notes
    ))
  where id = claim_record.id
  returning * into claim_record;

  update public.billing_invoices
  set insurance_claim_status = 'Resubmitted'
  where id = claim_record.invoice_id and owner_user_id = auth.uid();

  insert into public.billing_timeline_events (
    invoice_id, event_type, title, description
  )
  values (
    claim_record.invoice_id,
    'claim_submitted',
    'Claim resubmitted for ' || claim_record.invoice_number,
    'Corrected procedure code ' || procedure_code || ' was submitted to ' || claim_record.provider || '.'
  );

  return claim_record;
end;
$$;

drop trigger if exists billing_invoices_set_updated_at on public.billing_invoices;
create trigger billing_invoices_set_updated_at
before update on public.billing_invoices
for each row execute function public.set_healthos_updated_at();

drop trigger if exists billing_estimates_set_updated_at on public.billing_estimates;
create trigger billing_estimates_set_updated_at
before update on public.billing_estimates
for each row execute function public.set_healthos_updated_at();

drop trigger if exists billing_claims_set_updated_at on public.billing_claims;
create trigger billing_claims_set_updated_at
before update on public.billing_claims
for each row execute function public.set_healthos_updated_at();

drop trigger if exists billing_settings_set_updated_at on public.billing_settings;
create trigger billing_settings_set_updated_at
before update on public.billing_settings
for each row execute function public.set_healthos_updated_at();

revoke all on function public.create_billing_invoice(text, text, text, jsonb, date, numeric, text, text)
  from public;
revoke all on function public.record_billing_payment(uuid, numeric, text)
  from public;
revoke all on function public.convert_billing_estimate(uuid)
  from public;
revoke all on function public.resubmit_billing_claim(uuid, text, text)
  from public;

grant execute on function public.create_billing_invoice(text, text, text, jsonb, date, numeric, text, text)
  to authenticated;
grant execute on function public.record_billing_payment(uuid, numeric, text)
  to authenticated;
grant execute on function public.convert_billing_estimate(uuid)
  to authenticated;
grant execute on function public.resubmit_billing_claim(uuid, text, text)
  to authenticated;
