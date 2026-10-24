-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA CRIPTICARDO (SUPABASE / POSTGRESQL)
-- Copia y pega todo este contenido directamente en el SQL Editor de Supabase
-- =========================================================================

-- 1. Habilitar extensiones necesarias (UUID y pgcrypto para encriptación de contraseñas)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- SECCIÓN A: TABLA DE CRÍPTICOS
-- =========================================================================

create table if not exists public.cryptics (
  id uuid primary key default gen_random_uuid(),
  clue_number serial,
  scheduled_date date unique not null,
  clue text not null,
  answer text not null,
  letter_count int not null,
  difficulty text check (difficulty in ('Fácil', 'Medio', 'Difícil')) default 'Medio',
  category text default '',
  def_part text not null,
  mechanism_part text not null,
  mechanism_text text not null,
  status text check (status in ('draft', 'published')) default 'published',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para consultas optimizadas por fecha y estado
create index if not exists idx_cryptics_scheduled_date on public.cryptics (scheduled_date);
create index if not exists idx_cryptics_status on public.cryptics (status);

-- Habilitar Row Level Security (RLS) en crípticos
alter table public.cryptics enable row level security;

-- Políticas de acceso para cryptics
drop policy if exists "Permitir acceso completo a la aplicación" on public.cryptics;
drop policy if exists "Público solo puede ver crípticos de hoy o anteriores en Chile" on public.cryptics;
drop policy if exists "Autor autenticado tiene control total" on public.cryptics;

create policy "Permitir acceso completo a la aplicación"
on public.cryptics
for all
using (true)
with check (true);

-- Trigger para updated_at automático
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_cryptics_updated_at on public.cryptics;
create trigger set_cryptics_updated_at
before update on public.cryptics
for each row
execute function public.handle_updated_at();

-- =========================================================================
-- SECCIÓN B: AUTENTICACIÓN SEGURA DE ADMINISTRADORES
-- =========================================================================

-- 1. Tabla de administradores con contraseñas encriptadas con Blowfish / Bcrypt
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text default 'admin',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. RLS estricto: nadie puede leer ni modificar la tabla directamente desde el cliente web
alter table public.admin_users enable row level security;

-- 3. Función segura (SECURITY DEFINER) para verificar usuario y contraseña
-- Compara el hash bcrypt sin exponer nunca la contraseña ni los registros al cliente
create or replace function public.verify_admin_credentials(p_username text, p_password text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_match boolean;
begin
  select (password_hash = crypt(p_password, password_hash))
  into v_match
  from public.admin_users
  where lower(username) = lower(p_username);

  return coalesce(v_match, false);
end;
$$;

-- 4. Función utilitaria para crear o actualizar administradores con hash automático
create or replace function public.create_or_update_admin(p_username text, p_password text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.admin_users (username, password_hash)
  values (lower(trim(p_username)), crypt(trim(p_password), gen_salt('bf', 10)))
  on conflict (username) do update
  set password_hash = crypt(trim(p_password), gen_salt('bf', 10)),
      updated_at = now();
end;
$$;

-- 5. Crear usuario administrador inicial
-- Puedes cambiar 'admin' y 'cripticardo2026' por las credenciales que prefieras:
select public.create_or_update_admin('admin', 'cripticardo2026');

-- =========================================================================
-- SECCIÓN C: (OPCIONAL) 3 CRÍPTICOS DEL MANUAL DE DANIEL FAJARDO
-- (Si ya ejecutaste esto anteriormente, no duplicará por el 'on conflict')
-- =========================================================================
insert into public.cryptics (
  scheduled_date, clue, answer, letter_count, difficulty, category, def_part, mechanism_part, mechanism_text, status
) values
(
  (current_timestamp at time zone 'America/Santiago')::date,
  'Pido a Dios el precioso metal (3)',
  'ORO',
  3,
  'Fácil',
  'Doble definición',
  'precioso metal',
  'Pido a Dios',
  'Doble sentido: "Oro" del verbo orar (pido a Dios) y "oro" como el metal precioso.',
  'published'
),
(
  (current_timestamp at time zone 'America/Santiago')::date + interval '1 day',
  'Pido tu nardo enloquecido. ¡Qué coyuntura! (11)',
  'OPORTUNIDAD',
  11,
  'Medio',
  'Anagrama',
  '¡Qué coyuntura!',
  'Pido tu nardo enloquecido',
  'Anagrama: "enloquecido" es el indicador de que debes reordenar las letras de "PIDO TU NARDO" para formar OPORTUNIDAD.',
  'published'
),
(
  (current_timestamp at time zone 'America/Santiago')::date + interval '2 days',
  'Sable con cincuenta incrustaciones al dorso (7)',
  'ESPALDA',
  7,
  'Medio',
  'Palabras dentro de palabras',
  'al dorso',
  'Sable con cincuenta incrustaciones',
  'Contenedor: SABLE + L (cincuenta en números romanos) incrustado dentro de espada/sable = ESPALDA.',
  'published'
)
on conflict (scheduled_date) do nothing;
