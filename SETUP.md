# Guía de setup — Turnos Centro Estética

Instrucciones completas para configurar el proyecto desde cero.

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| Cuenta Supabase | — | [supabase.com](https://supabase.com) |

---

## Paso 1 — Crear el proyecto en Supabase

1. Ingresar a [supabase.com](https://supabase.com) y hacer click en **Start your project**.
2. Iniciar sesión con GitHub, GitLab o email.
3. En el dashboard, click en **New project**.
4. Completar el formulario:
   - **Name**: `turnos-centro-estetica` (o el nombre que prefieras)
   - **Database Password**: generar una contraseña segura y **guardarla** (la necesitarás si usás conexión directa)
   - **Region**: elegir la más cercana a tus usuarios (ej. `South America (São Paulo)`)
   - **Pricing plan**: Free tier es suficiente para desarrollo
5. Click en **Create new project**.
6. Esperar aproximadamente 2 minutos mientras Supabase provisiona la base de datos. La pantalla mostrará un indicador de progreso.

---

## Paso 2 — Ejecutar el schema de base de datos

### 2.1 Abrir el SQL Editor

En el panel izquierdo del dashboard, click en **SQL Editor**.

### 2.2 Crear una nueva query

Click en **New query** (ícono `+` en la barra lateral del editor).

### 2.3 Pegar el schema

1. Abrir el archivo `supabase/schema.sql` de este repositorio.
2. Seleccionar todo el contenido (`Ctrl+A` / `Cmd+A`) y copiarlo.
3. Pegarlo en el editor de Supabase.

### 2.4 Ejecutar

Click en el botón **Run** (o presionar `Ctrl+Enter` / `Cmd+Enter`).

Deberías ver en el panel inferior:

```
Success. No rows returned
```

### 2.5 Verificar las tablas

1. En el panel izquierdo, click en **Table Editor**.
2. Confirmar que aparecen las siguientes tablas:

| Tabla | Descripción |
|---|---|
| `negocios` | Negocios registrados |
| `profesionales` | Empleados del negocio |
| `servicios` | Servicios ofrecidos |
| `profesional_servicio` | Relación profesional ↔ servicio |
| `clientes` | Clientes registrados |
| `turnos` | Reservas / citas |

> Si alguna tabla no aparece, verificar la pestaña **Logs** del SQL Editor para ver el error.

---

## Paso 3 — Obtener las credenciales de la API

1. En el panel izquierdo, click en el ícono de engranaje (**Project Settings**).
2. Click en **API** en el menú de configuración.
3. Copiar los siguientes valores:

| Campo en Supabase | Variable de entorno |
|---|---|
| **Project URL** | `VITE_SUPABASE_URL` |
| **Project API Keys → anon / public** | `VITE_SUPABASE_ANON_KEY` |

> La clave `anon` es segura para usar en el frontend. **Nunca uses la clave `service_role` en el cliente**.

---

## Paso 4 — Configurar las variables de entorno

### 4.1 Crear el archivo `.env.local`

Desde la raíz del proyecto:

```bash
cp .env.example .env.local
```

### 4.2 Completar los valores

Abrir `.env.local` con cualquier editor y reemplazar los placeholders:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXX
```

> `.env.local` está en `.gitignore` por defecto en Vite. Nunca subas credenciales reales al repositorio.

---

## Paso 5 — Instalar dependencias y arrancar la app

```bash
# Instalar paquetes
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Paso 6 — Verificar la conexión con Supabase

Para confirmar que las variables están bien configuradas, podés abrir la consola del navegador y ejecutar:

```js
import { supabase } from './src/lib/supabase.js'
const { data, error } = await supabase.from('negocios').select('*')
console.log(data, error)
```

Resultado esperado con RLS activo: `data: []` y `error: null` (lista vacía, sin errores de autenticación).

---

## Configuración adicional de Supabase (recomendada)

### Habilitar Email Auth

1. **Authentication → Providers → Email** → confirmar que está habilitado.
2. Para desarrollo, desactivar **Confirm email** (evita el paso de verificación):
   **Authentication → Settings → Email Auth → Enable email confirmations** → OFF.

### Configurar URL de redirección

En **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:5173` (desarrollo)
- **Redirect URLs**: agregar `http://localhost:5173/**`

Al hacer deploy en Vercel, agregar también la URL de producción.

---

## Solución de problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Invalid API key` en consola | Clave copiada incompleta | Verificar que no haya espacios al inicio/final en `.env.local` |
| Las tablas no aparecen en Table Editor | El schema no se ejecutó completo | Volver al SQL Editor y revisar errores en Logs |
| Error `new row violates RLS` | Políticas RLS activas sin auth | Deshabilitar temporalmente RLS en la tabla para testear, o usar un usuario autenticado |
| Puerto 5173 en uso | Otro proceso usando el puerto | `npm run dev -- --port 5174` |
| `uuid-ossp` extension error | Proyecto muy nuevo | Esperar 1 min y re-ejecutar el schema |
