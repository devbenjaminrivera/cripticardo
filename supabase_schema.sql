-- =========================================================================
-- ESQUEMA DE BASE DE DATOS PARA CRIPTICARDO (SUPABASE / POSTGRESQL)
-- Copia y pega todo este contenido directamente en el SQL Editor de Supabase
-- =========================================================================

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. Crear tabla principal de crípticos
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

-- 3. Crear índices para consultas optimizadas por fecha y estado
create index if not exists idx_cryptics_scheduled_date on public.cryptics (scheduled_date);
create index if not exists idx_cryptics_status on public.cryptics (status);

-- 4. Habilitar Row Level Security (RLS)
alter table public.cryptics enable row level security;

-- 5. Eliminar políticas previas si ya existían (para evitar duplicados al reejecutar)
drop policy if exists "Permitir acceso completo a la aplicación" on public.cryptics;
drop policy if exists "Público solo puede ver crípticos de hoy o anteriores en Chile" on public.cryptics;
drop policy if exists "Autor autenticado tiene control total" on public.cryptics;

-- 6. POLÍTICA DE ACCESO:
-- Permite lectura, creación y edición directa para que el panel de administración funcione
-- de inmediato con usuario y contraseña sin requerir configuración de correos en Supabase Auth.
create policy "Permitir acceso completo a la aplicación"
on public.cryptics
for all
using (true)
with check (true);

-- 7. Función y trigger para actualizar automáticamente el campo updated_at
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
-- (OPCIONAL) CARGA INICIAL: 3 Crípticos del manual de Daniel Fajardo
-- Descomenta este bloque si deseas empezar con 3 crípticos ya cargados
-- =========================================================================
/*
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
*/
