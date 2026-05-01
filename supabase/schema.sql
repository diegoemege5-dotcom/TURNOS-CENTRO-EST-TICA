-- ============================================================
-- TURNOS CENTRO ESTÉTICA — Schema Supabase
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase en este orden.
-- Requiere la extensión pgcrypto (habilitada por defecto en Supabase).
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONES
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- NEGOCIOS
-- Centro de estética, peluquería, spa, etc.
-- ------------------------------------------------------------
create table negocios (
  id           uuid primary key default uuid_generate_v4(),
  nombre       text        not null,
  descripcion  text,
  email        text        unique,
  telefono     text,
  direccion    text,
  logo_url     text,
  activo       boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROFESIONALES
-- Empleados/as que atienden turnos dentro de un negocio.
-- ------------------------------------------------------------
create table profesionales (
  id          uuid primary key default uuid_generate_v4(),
  negocio_id  uuid        not null references negocios(id) on delete cascade,
  nombre      text        not null,
  email       text,
  telefono    text,
  bio         text,
  avatar_url  text,
  activo      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profesionales_negocio on profesionales(negocio_id);

-- ------------------------------------------------------------
-- SERVICIOS
-- Tipos de tratamiento/servicio que ofrece el negocio.
-- ------------------------------------------------------------
create table servicios (
  id                uuid primary key default uuid_generate_v4(),
  negocio_id        uuid          not null references negocios(id) on delete cascade,
  nombre            text          not null,
  descripcion       text,
  duracion_minutos  integer       not null check (duracion_minutos > 0),
  precio            numeric(10,2) not null check (precio >= 0),
  activo            boolean       not null default true,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

create index idx_servicios_negocio on servicios(negocio_id);

-- Tabla puente: qué profesionales ofrecen qué servicios
create table profesional_servicio (
  profesional_id  uuid not null references profesionales(id) on delete cascade,
  servicio_id     uuid not null references servicios(id) on delete cascade,
  primary key (profesional_id, servicio_id)
);

-- ------------------------------------------------------------
-- CLIENTES
-- Personas que reservan turnos. Un cliente pertenece a un negocio.
-- ------------------------------------------------------------
create table clientes (
  id          uuid primary key default uuid_generate_v4(),
  negocio_id  uuid        not null references negocios(id) on delete cascade,
  nombre      text        not null,
  email       text,
  telefono    text,
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (negocio_id, email)
);

create index idx_clientes_negocio    on clientes(negocio_id);
create index idx_clientes_email      on clientes(email);

-- ------------------------------------------------------------
-- TURNOS
-- Reserva concreta de un servicio con un profesional.
-- ------------------------------------------------------------
create type estado_turno as enum (
  'pendiente',
  'confirmado',
  'cancelado',
  'completado',
  'no_asistio'
);

create table turnos (
  id               uuid        primary key default uuid_generate_v4(),
  negocio_id       uuid        not null references negocios(id) on delete cascade,
  profesional_id   uuid        not null references profesionales(id),
  servicio_id      uuid        not null references servicios(id),
  cliente_id       uuid        not null references clientes(id),
  fecha_hora_inicio timestamptz not null,
  fecha_hora_fin    timestamptz not null,
  estado           estado_turno not null default 'pendiente',
  notas            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint turno_rango_valido check (fecha_hora_fin > fecha_hora_inicio)
);

create index idx_turnos_negocio        on turnos(negocio_id);
create index idx_turnos_profesional    on turnos(profesional_id);
create index idx_turnos_cliente        on turnos(cliente_id);
create index idx_turnos_fecha_inicio   on turnos(fecha_hora_inicio);
-- Índice compuesto para detectar solapamiento de agenda
create index idx_turnos_agenda         on turnos(profesional_id, fecha_hora_inicio, fecha_hora_fin);

-- ------------------------------------------------------------
-- FUNCIÓN: actualizar updated_at automáticamente
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_negocios_updated_at
  before update on negocios
  for each row execute function set_updated_at();

create trigger trg_profesionales_updated_at
  before update on profesionales
  for each row execute function set_updated_at();

create trigger trg_servicios_updated_at
  before update on servicios
  for each row execute function set_updated_at();

create trigger trg_clientes_updated_at
  before update on clientes
  for each row execute function set_updated_at();

create trigger trg_turnos_updated_at
  before update on turnos
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Cada negocio solo ve sus propios datos.
-- Ajustar las políticas según el sistema de auth elegido.
-- ------------------------------------------------------------
alter table negocios         enable row level security;
alter table profesionales    enable row level security;
alter table servicios        enable row level security;
alter table profesional_servicio enable row level security;
alter table clientes         enable row level security;
alter table turnos           enable row level security;

-- Política base: los usuarios autenticados ven solo su negocio.
-- Se asume que el JWT contiene un claim "negocio_id".
-- Reemplazar con tu lógica real de auth.

create policy "negocios: propietario" on negocios
  for all using (id = (auth.jwt() ->> 'negocio_id')::uuid);

create policy "profesionales: mismo negocio" on profesionales
  for all using (negocio_id = (auth.jwt() ->> 'negocio_id')::uuid);

create policy "servicios: mismo negocio" on servicios
  for all using (negocio_id = (auth.jwt() ->> 'negocio_id')::uuid);

create policy "profesional_servicio: mismo negocio" on profesional_servicio
  for all using (
    exists (
      select 1 from profesionales p
      where p.id = profesional_id
        and p.negocio_id = (auth.jwt() ->> 'negocio_id')::uuid
    )
  );

create policy "clientes: mismo negocio" on clientes
  for all using (negocio_id = (auth.jwt() ->> 'negocio_id')::uuid);

create policy "turnos: mismo negocio" on turnos
  for all using (negocio_id = (auth.jwt() ->> 'negocio_id')::uuid);
