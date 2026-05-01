# Turnos Centro Estética

Web app de gestión de turnos para centros de estética (peluquería, manicura, spa, etc.).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS |
| Estado global | Zustand |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Hosting | Vercel (frontend) |

---

## Arquitectura

```
Cliente (browser)
      │
      ▼
React + Vite  ──→  Supabase JS SDK
      │                  │
      │            ┌─────┴──────┐
      │            │  Supabase  │
      │            │  Cloud     │
      │            │            │
      │            │ • Auth     │
      │            │ • Database │
      │            │ • Storage  │
      │            │ • Realtime │
      │            └────────────┘
      │
  Vercel CDN
```

### Flujo de autenticación

1. El dueño del negocio se registra con email/password vía Supabase Auth.
2. Al crear cuenta se genera un registro en la tabla `negocios` y se almacena el `negocio_id` en el JWT claim.
3. Todas las queries aplican RLS basado en ese `negocio_id`: cada negocio ve solo sus datos.

---

## Estructura de carpetas

```
/
├── public/                     # Assets estáticos (favicon, og-image)
├── src/
│   ├── assets/                 # Imágenes, íconos SVG
│   ├── components/
│   │   ├── ui/                 # Primitivos reutilizables (Button, Modal, Badge…)
│   │   ├── layout/             # Navbar, Sidebar, PageShell
│   │   ├── appointments/       # Calendario, tarjeta de turno, modal de reserva
│   │   ├── professionals/      # Lista y form de profesionales
│   │   ├── services/           # Lista y form de servicios
│   │   └── clients/            # Lista y form de clientes
│   ├── pages/                  # Componentes de ruta (Dashboard, Agenda, Clientes…)
│   ├── hooks/                  # Custom hooks (useAppointments, useClients, …)
│   ├── lib/
│   │   └── supabase.js         # Cliente Supabase singleton
│   ├── store/                  # Zustand stores (authStore, uiStore)
│   ├── utils/                  # Helpers (formatDate, calcEndTime, …)
│   ├── App.jsx                 # Rutas con react-router-dom
│   └── main.jsx                # Entry point
├── supabase/
│   └── schema.sql              # DDL completo para ejecutar en Supabase
├── .env.example                # Variables de entorno necesarias
├── index.html
├── vite.config.js
└── package.json
```

---

## Base de datos

### Diagrama de relaciones

```
negocios
  │
  ├──< profesionales >──< profesional_servicio >──< servicios
  │
  ├──< clientes
  │
  └──< turnos >── profesionales
              └── servicios
              └── clientes
```

### Tablas

| Tabla | Descripción |
|---|---|
| `negocios` | Negocio (peluquería, spa…). Unidad raíz de RLS. |
| `profesionales` | Empleados que atienden turnos. |
| `servicios` | Tipos de servicio con duración y precio. |
| `profesional_servicio` | Qué servicios puede ofrecer cada profesional. |
| `clientes` | Clientes registrados en el negocio. |
| `turnos` | Reservas con fecha/hora, profesional, servicio y cliente. |

### Estados de un turno

`pendiente` → `confirmado` → `completado`  
`pendiente` / `confirmado` → `cancelado`  
`confirmado` → `no_asistio`

---

## Variables de entorno

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

---

## Setup rápido para desarrolladores

> Guía detallada paso a paso: ver [SETUP.md](./SETUP.md)

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegir organización, nombre y región (ej. South America)
3. Guardar la contraseña de base de datos que se genera
4. Esperar ~2 min a que el proyecto quede activo

### 2. Ejecutar el schema

1. En el dashboard → **SQL Editor** → **New query**
2. Pegar el contenido de `supabase/schema.sql`
3. Click en **Run** (o `Ctrl+Enter`)
4. Verificar en **Table Editor** que aparecen las 6 tablas

### 3. Obtener las credenciales

En **Project Settings → API**:
- `Project URL` → valor de `VITE_SUPABASE_URL`
- `anon / public` key → valor de `VITE_SUPABASE_ANON_KEY`

### 4. Configurar el entorno local

```bash
cp .env.example .env.local
# Editar .env.local con los valores del paso anterior
```

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Arrancar la app

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Roadmap

- [ ] Auth + onboarding del negocio
- [ ] CRUD de profesionales y servicios
- [ ] CRUD de clientes
- [ ] Calendario semanal de turnos
- [ ] Modal de nueva reserva con validación de solapamiento
- [ ] Notificaciones por email (Supabase Edge Functions + Resend)
- [ ] Panel de estadísticas (turnos por semana, ingresos estimados)
- [ ] Vista pública de reserva online para el cliente final
