import { useState } from 'react'
import { comprobantes as todosLosComprobantes } from '../data/mockData'

// ── Helpers ────────────────────────────────────────────────────────────────

const ESTADO = {
  verificado: { label: 'Verificado', cls: 'bg-green-100 text-green-700' },
  pendiente:  { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
  revisar:    { label: 'Revisar',    cls: 'bg-orange-100 text-orange-700' },
  rechazado:  { label: 'Rechazado', cls: 'bg-red-100 text-red-600' },
}

const TIPO_LABEL = {
  transferencia: 'Transferencia',
  deposito:      'Depósito',
  qr:            'QR',
  efectivo:      'Efectivo',
  otro:          'Otro',
}

function fmt(monto) {
  return `$${Number(monto).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
}

function fmtFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function confianzaColor(v) {
  if (v == null) return 'text-gray-400'
  if (v >= 0.85) return 'text-green-600'
  if (v >= 0.65) return 'text-amber-600'
  return 'text-red-500'
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function Badge({ estado }) {
  const e = ESTADO[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${e.cls}`}>
      {e.label}
    </span>
  )
}

function StatCard({ label, value, sub, iconD, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 ${iconColor}`}>
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

const ICON = {
  receipt:  'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  check:    'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warn:     'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  currency: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  brain:    'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
}

// ── Filtros ─────────────────────────────────────────────────────────────────

const FILTROS = [
  { key: 'todos',      label: 'Todos' },
  { key: 'verificado', label: 'Verificados' },
  { key: 'revisar',    label: 'Revisar' },
  { key: 'pendiente',  label: 'Pendientes' },
]

// ── Página ──────────────────────────────────────────────────────────────────

export default function Comprobantes() {
  const [filtro, setFiltro] = useState('todos')

  const lista = filtro === 'todos'
    ? todosLosComprobantes
    : todosLosComprobantes.filter(c => c.estado === filtro)

  const verificados  = todosLosComprobantes.filter(c => c.estado === 'verificado').length
  const paraRevisar  = todosLosComprobantes.filter(c => c.estado === 'revisar' || c.estado === 'pendiente').length
  const montoTotal   = todosLosComprobantes
    .filter(c => c.estado === 'verificado')
    .reduce((acc, c) => acc + c.monto, 0)
  const confMedia    = todosLosComprobantes
    .filter(c => c.confianza_ia != null)
    .reduce((acc, c, _, arr) => acc + c.confianza_ia / arr.length, 0)

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comprobantes de Pago</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Procesados automáticamente por WhatsApp + Gemini AI
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-violet-600">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICON.brain} />
          </svg>
          <span className="text-xs font-medium text-violet-700">Gemini 1.5 Flash activo</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total recibidos"
          value={todosLosComprobantes.length}
          sub="en todos los estados"
          iconD={ICON.receipt}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Verificados"
          value={verificados}
          sub="confianza ≥ 85 %"
          iconD={ICON.check}
          iconBg="bg-green-50"
          iconColor="text-green-500"
        />
        <StatCard
          label="Para revisar"
          value={paraRevisar}
          sub="requieren atención"
          iconD={ICON.warn}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        <StatCard
          label="Monto verificado"
          value={fmt(montoTotal)}
          sub={`Confianza media: ${(confMedia * 100).toFixed(0)} %`}
          iconD={ICON.currency}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filtro === f.key
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {lista.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No hay comprobantes con este filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Fecha', 'Emisor', 'Tipo', 'Origen', 'Nro. Transacción', 'Monto', 'Confianza IA', 'Estado'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lista.map(c => (
                  <tr key={c.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      <p className="font-medium">{fmtFecha(c.fecha_pago)}</p>
                      {c.hora_pago && <p className="text-xs text-gray-400">{c.hora_pago}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {c.emisor ?? <span className="italic text-gray-400">Desconocido</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {TIPO_LABEL[c.tipo] ?? c.tipo}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.banco_origen ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {c.nro_transaccion ?? <span className="font-sans text-gray-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                      {fmt(c.monto)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {c.confianza_ia != null ? (
                        <span className={`font-semibold ${confianzaColor(c.confianza_ia)}`}>
                          {(c.confianza_ia * 100).toFixed(0)} %
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge estado={c.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Info footer ── */}
      <p className="text-center text-xs text-gray-400">
        Los comprobantes son procesados por el script Python <code className="rounded bg-gray-100 px-1">scripts/whatsapp_gemini.py</code>.
        Confianza ≥ 85 % → verificado automáticamente · &lt; 65 % → requiere revisión manual.
      </p>

    </div>
  )
}
