import { Link } from 'react-router-dom'
import useStore, { menuPrecioPersona } from '../store/useStore'
import { fmtMoney, fmtDate, todayISO } from '../lib/format'
import { PageHeader, Card, Badge } from '../components/ui'

const COLOR_ESTADO = {
  Consulta: 'gray',
  Confirmado: 'blue',
  Señado: 'amber',
  Realizado: 'green',
  Cancelado: 'red',
}

function Stat({ label, value, to }) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </Card>
    </Link>
  )
}

export default function Dashboard() {
  const { platos, menus, eventos, presupuestos, settings } = useStore()
  const hoy = todayISO()

  const proximos = eventos
    .filter((e) => e.fecha >= hoy && e.estado !== 'Cancelado')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const pendientes = presupuestos.filter(
    (p) => p.estado === 'Borrador' || p.estado === 'Enviado'
  )

  const facturacionEstimada = proximos.reduce((acc, e) => {
    const menu = menus.find((m) => m.id === e.menuId)
    if (!menu) return acc
    return acc + menuPrecioPersona(menu, platos, settings.margen) * (Number(e.invitados) || 0)
  }, 0)

  return (
    <div>
      <PageHeader
        title={`¡Hola! 👋`}
        subtitle="Resumen de tu catering"
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Platos cargados" value={platos.length} to="/platos" />
        <Stat label="Menús armados" value={menus.length} to="/menus" />
        <Stat label="Eventos próximos" value={proximos.length} to="/agenda" />
        <Stat label="Presupuestos pendientes" value={pendientes.length} to="/presupuestos" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Próximos eventos</h3>
          {proximos.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No hay eventos agendados.{' '}
              <Link to="/agenda" className="font-medium text-amber-600 hover:underline">
                Agendar uno
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {proximos.slice(0, 6).map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-20 shrink-0 text-sm font-semibold text-gray-900">
                    {fmtDate(e.fecha)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-900">
                      {e.cliente} · {e.tipoEvento}
                    </p>
                    <p className="text-xs text-gray-500">{e.invitados} invitados</p>
                  </div>
                  <Badge color={COLOR_ESTADO[e.estado] || 'gray'}>{e.estado}</Badge>
                </div>
              ))}
            </div>
          )}
          {facturacionEstimada > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">
                Facturación estimada (eventos próximos con menú)
              </p>
              <p className="text-lg font-bold text-amber-900">{fmtMoney(facturacionEstimada)}</p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-gray-900">Accesos rápidos</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { to: '/platos', titulo: 'Calcular el costo de un plato', desc: 'Cargá ingredientes y obtené costo por porción y precio sugerido' },
              { to: '/calculadora', titulo: 'Calcular porciones y compras', desc: 'Escalá recetas según los invitados y armá la lista de compras' },
              { to: '/menus', titulo: 'Armar un menú para un evento', desc: 'Quince, casamientos, corporativos y más' },
              { to: '/presupuestos', titulo: 'Generar un presupuesto', desc: 'PDF profesional listo para enviar por WhatsApp' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                <p className="text-sm font-medium text-gray-900">{a.titulo}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
