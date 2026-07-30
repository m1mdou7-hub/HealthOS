-- Secure, owner-isolated appointment scheduling.

create extension if not exists btree_gist;

create table if not exists public.appointments (
  id text primary key,
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  patient_id text not null references public.patients(id) on delete cascade,
  patient_name text not null,
  doctor_id text not null,
  doctor_name text not null,
  procedure text not null,
  chair text not null,
  appointment_date date not null,
  start_time time not null,
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  status text not null default 'Confirmed'
    check (status in ('Confirmed', 'Pending', 'In-Progress', 'Completed', 'Cancelled')),
  category text not null default 'Treatment'
    check (category in ('Consultation', 'Treatment', 'Surgery', 'Lab', 'Recall')),
  recurring_group_id uuid,
  is_recurring boolean not null default false,
  slot tsrange generated always as (
    tsrange(
      appointment_date + start_time,
      appointment_date + start_time + make_interval(mins => duration_minutes),
      '[)'
    )
  ) stored,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists appointments_owner_date_idx
  on public.appointments(owner_user_id, appointment_date);

create index if not exists appointments_owner_patient_idx
  on public.appointments(owner_user_id, patient_id);

alter table public.appointments enable row level security;

drop policy if exists "Appointments are isolated by owner" on public.appointments;
create policy "Appointments are isolated by owner"
  on public.appointments
  for all
  to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = appointments.patient_id
        and patients.owner_user_id = auth.uid()
    )
  )
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1
      from public.patients
      where patients.id = appointments.patient_id
        and patients.owner_user_id = auth.uid()
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_doctor_no_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_doctor_no_overlap
      exclude using gist (
        owner_user_id with =,
        doctor_id with =,
        slot with &&
      )
      where (status <> 'Cancelled');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_chair_no_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_chair_no_overlap
      exclude using gist (
        owner_user_id with =,
        chair with =,
        slot with &&
      )
      where (status <> 'Cancelled');
  end if;
end;
$$;

create or replace function public.refresh_patient_next_appointment(target_patient_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_value text;
begin
  select
    to_char(appointment_date, 'YYYY-MM-DD') || ' ' ||
    to_char(start_time, 'HH24:MI') || ' (' || procedure || ')'
  into next_value
  from public.appointments
  where patient_id = target_patient_id
    and owner_user_id = auth.uid()
    and status not in ('Cancelled', 'Completed')
    and appointment_date + start_time >= localtimestamp
  order by appointment_date, start_time
  limit 1;

  update public.patients
  set next_appointment = coalesce(next_value, 'Not scheduled')
  where id = target_patient_id
    and owner_user_id = auth.uid();
end;
$$;

create or replace function public.sync_patient_next_appointment()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_patient_next_appointment(old.patient_id);
    return old;
  end if;

  perform public.refresh_patient_next_appointment(new.patient_id);

  if tg_op = 'UPDATE' and old.patient_id <> new.patient_id then
    perform public.refresh_patient_next_appointment(old.patient_id);
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_healthos_updated_at();

drop trigger if exists appointments_sync_patient_next on public.appointments;
create trigger appointments_sync_patient_next
after insert or update or delete on public.appointments
for each row execute function public.sync_patient_next_appointment();
