-- Secure patient core for authenticated HealthOS accounts.

create table if not exists public.patients (
  id text primary key,
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  photo_url text not null default '',
  age integer not null default 0 check (age between 0 and 130),
  gender text not null default '',
  blood_group text not null default '',
  allergy_status text not null default 'No Known Allergies',
  medical_alerts jsonb not null default '[]'::jsonb,
  phone text not null default '',
  email text not null default '',
  primary_doctor text not null default '',
  current_treatment text not null default '',
  status text not null default 'Active'
    check (status in ('Active', 'New', 'Under Treatment', 'Completed')),
  last_visit date,
  next_appointment text not null default 'Not scheduled',
  ai_risk_flag text not null default 'Low'
    check (ai_risk_flag in ('High', 'Medium', 'Low')),
  risk_description text not null default '',
  summary text not null default '',
  medical_history jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists patients_owner_user_id_idx
  on public.patients(owner_user_id);

alter table public.patients enable row level security;

drop policy if exists "Patients are isolated by owner" on public.patients;
create policy "Patients are isolated by owner"
  on public.patients
  for all
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create table if not exists public.patient_cases (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'In Design',
  priority text not null default 'Standard',
  clinician text not null default '',
  stage text not null default '',
  progress integer not null default 0 check (progress between 0 and 100),
  created_date date not null default current_date,
  due_date date,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists patient_cases_owner_patient_idx
  on public.patient_cases(owner_user_id, patient_id);

alter table public.patient_cases enable row level security;

drop policy if exists "Patient cases are isolated by owner" on public.patient_cases;
create policy "Patient cases are isolated by owner"
  on public.patient_cases
  for all
  to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = patient_cases.patient_id
        and patients.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = patient_cases.patient_id
        and patients.owner_user_id = auth.uid()
    )
  );

create table if not exists public.patient_records (
  patient_id text primary key references public.patients(id) on delete cascade,
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  treatment_plans jsonb not null default '[]'::jsonb,
  soap_notes jsonb not null default '[]'::jsonb,
  imaging_gallery jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  recall_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists patient_records_owner_user_id_idx
  on public.patient_records(owner_user_id);

alter table public.patient_records enable row level security;

drop policy if exists "Patient records are isolated by owner" on public.patient_records;
create policy "Patient records are isolated by owner"
  on public.patient_records
  for all
  to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = patient_records.patient_id
        and patients.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = patient_records.patient_id
        and patients.owner_user_id = auth.uid()
    )
  );

-- Replace the original preview-wide clinical history access with owner isolation.
alter table public.clinical_histories
  add column if not exists owner_user_id uuid default auth.uid()
    references auth.users(id) on delete cascade;

create index if not exists clinical_histories_owner_user_id_idx
  on public.clinical_histories(owner_user_id);

drop policy if exists "Allow select for all" on public.clinical_histories;
drop policy if exists "Allow insert for all" on public.clinical_histories;
drop policy if exists "Allow update for all" on public.clinical_histories;
drop policy if exists "Allow delete for all" on public.clinical_histories;
drop policy if exists "Clinical histories are isolated by owner" on public.clinical_histories;

create policy "Clinical histories are isolated by owner"
  on public.clinical_histories
  for all
  to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = clinical_histories.patient_id
        and patients.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = clinical_histories.patient_id
        and patients.owner_user_id = auth.uid()
    )
  );

create or replace function public.set_healthos_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_healthos_updated_at();

drop trigger if exists patient_cases_set_updated_at on public.patient_cases;
create trigger patient_cases_set_updated_at
before update on public.patient_cases
for each row execute function public.set_healthos_updated_at();

drop trigger if exists patient_records_set_updated_at on public.patient_records;
create trigger patient_records_set_updated_at
before update on public.patient_records
for each row execute function public.set_healthos_updated_at();
