import { turnosHoy, turnosProximos } from '../data/mockData'

// ── Helpers ────────────────────────────────────────────────────────────────

const ESTADO = {
  confirmado: { label: 'Confirmado', cls: 'bg-green-100 text-green-700' },
  pendiente:  { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
  en_curso:   { label: 'En curso',   cls: 'bg-violet-100 text-violet-700' },
  completado: { label: 'Completado', cls: 'bg-gray-100 text-gray-500' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-red-100 text-red-600' },
  no_asistio: { label: 'No asistió', cls: 'bg-red-100 text-red-600' },
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-amber-500',  'bg-rose-500', 'bg-cyan-500',
]

function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name) {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

// ── Small components ───────────────────────────────────────────────────────

function Badge({ estado }) {
  const e = ESTADO[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${e.cls}`}>
      {e.label}
    </span>
  )
}

function Avatar({ nombre }) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(nombre)}`}
    >
      {initials(nombre)}
    </span>
  )
}

function StatCard({ label, value, sub, iconD, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-6 w-6 ${iconColor}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconD} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

// ── Icon paths (Heroicons outline) ─────────────────────────────────────────

const I = {
  calendar:  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  check:     'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  clock:     'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  currency:  'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  plus:      'M12 4.5v15m7.5-7.5h-15',
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const hour  = new Date().getHours()
  const saludo = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const fecha  = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const completados = turnosHoy.filter(t => t.estado === 'completado').length
  const confirmados = turnosHoy.filter(t => t.estado === 'confirmado').length
  const enCurso     = turnosHoy.filter(t => t.estado === 'en_curso').length
  const pendientes  = turnosHoy.filter(t => t.estado === 'pendiente').length
  const ingresos    = turnosHoy
    .filter(t => ['completado', 'en_curso', 'confirmado'].includes(t.estado))
    .reduce((acc, t) => acc + t.precio, 0)

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{saludo}, Studio Bellas</h1>
          <p className="mt-0.5 capitalize text-sm text-gray-500">{fecha}</p>
        </div>
        <button className="inline-flex items-center gap-2 self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d={I.plus} />
          </svg>
          Nuevo turno
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Turnos hoy"
          value={turnosHoy.length}
          sub={`${completados} completado${completados !== 1 ? 's' : ''}`}
          iconD={I.calendar}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Confirmados"
          value={confirmados}
          sub="Listos para atender"
          iconD={I.check}
          iconBg="bg-green-50"
          iconColor="text-green-500"
        />
        <StatCard
          label="En curso / pendientes"
          value={`${enCurso} / ${pendientes}`}
          sub="Atendiendo ahora"
          iconD={I.clock}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
        />
        <StatCard
          label="Ingresos estimados"
          value={`$${ingresos.toLocaleString('es-AR')}`}
          sub="Turnos no cancelados"
          iconD={I.currency}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
      </div>

      {/* ── Agenda de hoy ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Agenda de hoy</h2>
          <span className="text-sm text-gray-400">{turnosHoy.length} turnos</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {turnosHoy.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No hay turnos agendados para hoy.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {turnosHoy.map(turno => (
                <li
                  key={turno.id}
                  className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
                >
                  {/* Hora */}
                  <div className="w-28 shrink-0">
                    <span className="text-sm font-semibold text-gray-800">{turno.hora}</span>
                    <span className="text-xs text-gray-400"> – {turno.horaFin}</span>
                  </div>

                  {/* Cliente + servicio */}
                  <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                    <Avatar nombre={turno.cliente.nombre} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {turno.cliente.nombre}
                      </p>
                      <p className="truncate text-xs text-gray-400">{turno.servicio}</p>
                    </div>
                  </div>

                  {/* Profesional (oculto en mobile) */}
                  <div className="hidden w-44 shrink-0 items-center gap-2 sm:flex">
                    <Avatar nombre={turno.profesional} />
                    <span className="truncate text-sm text-gray-600">
                      {turno.profesional}
                    </span>
                  </div>

                  {/* Estado + precio */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Badge estado={turno.estado} />
                    <span className="shrink-0 text-sm font-medium text-gray-700">
                      ${turno.precio.toLocaleString('es-AR')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Próximos turnos ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Próximos turnos</h2>
          <span className="text-sm text-gray-400">{turnosProximos.length} turnos</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {turnosProximos.map(turno => (
              <li
                key={turno.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                {/* Fecha + hora */}
                <div className="w-32 shrink-0">
                  <p className="text-xs font-medium text-violet-600">{turno.fecha}</p>
                  <p className="text-sm font-semibold text-gray-800">{turno.hora}</p>
                </div>

                {/* Cliente + detalle */}
                <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                  <Avatar nombre={turno.cliente.nombre} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {turno.cliente.nombre}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {turno.servicio} · {turno.profesional}
                    </p>
                  </div>
                </div>

                <Badge estado={turno.estado} />
              </li>
            ))}
          </ul>
        </div>
      </section>

    </div>
  )
}
