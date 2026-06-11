import { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { TIPOS_EVENTO, ESTADOS_EVENTO } from '../data/seed'
import { fmtDate, todayISO } from '../lib/format'
import {
  PageHeader, Card, Button, Field, Input, Select, Textarea, Modal, Badge,
} from '../components/ui'

const COLOR_ESTADO = {
  Consulta: 'gray',
  Confirmado: 'blue',
  Señado: 'amber',
  Realizado: 'green',
  Cancelado: 'red',
}

const eventoVacio = () => ({
  fecha: todayISO(),
  hora: '21:00',
  tipoEvento: TIPOS_EVENTO[0],
  cliente: '',
  telefono: '',
  lugar: '',
  invitados: 50,
  menuId: '',
  estado: 'Consulta',
  notas: '',
})

function FormEvento({ inicial, onSave, onCancel }) {
  const menus = useStore((s) => s.menus)
  const [ev, setEv] = useState(inicial)
  const set = (patch) => setEv((e) => ({ ...e, ...patch }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!ev.cliente.trim()) return
        onSave(ev)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha">
          <Input type="date" value={ev.fecha} onChange={(e) => set({ fecha: e.target.value })} required />
        </Field>
        <Field label="Hora">
          <Input type="time" value={ev.hora} onChange={(e) => set({ hora: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cliente">
          <Input
            value={ev.cliente}
            onChange={(e) => set({ cliente: e.target.value })}
            placeholder="Nombre y apellido"
            required
          />
        </Field>
        <Field label="WhatsApp (con cód. de país)">
          <Input
            value={ev.telefono}
            onChange={(e) => set({ telefono: e.target.value })}
            placeholder="549351..."
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo de evento">
          <Select value={ev.tipoEvento} onChange={(e) => set({ tipoEvento: e.target.value })}>
            {TIPOS_EVENTO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Invitados">
          <Input
            type="number"
            min="1"
            value={ev.invitados}
            onChange={(e) => set({ invitados: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Lugar">
          <Input
            value={ev.lugar}
            onChange={(e) => set({ lugar: e.target.value })}
            placeholder="Salón, domicilio…"
          />
        </Field>
        <Field label="Menú">
          <Select value={ev.menuId} onChange={(e) => set({ menuId: e.target.value })}>
            <option value="">Sin menú asignado</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Estado">
          <Select value={ev.estado} onChange={(e) => set({ estado: e.target.value })}>
            {ESTADOS_EVENTO.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Notas">
        <Textarea
          value={ev.notas}
          onChange={(e) => set({ notas: e.target.value })}
          rows={2}
          placeholder="Alergias, horarios de armado, detalles…"
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar evento</Button>
      </div>
    </form>
  )
}

function CalendarioMes({ eventos, mes, setMes, onDiaClick }) {
  const [anio, mesIdx] = mes
  const primerDia = new Date(anio, mesIdx, 1)
  const diasEnMes = new Date(anio, mesIdx + 1, 0).getDate()
  // Semana arrancando en lunes
  const offset = (primerDia.getDay() + 6) % 7
  const celdas = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ]
  const pad = (x) => String(x).padStart(2, '0')
  const hoy = todayISO()

  const titulo = primerDia.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold capitalize text-gray-900">{titulo}</h3>
        <div className="flex gap-1">
          <Button variant="secondary" onClick={() => setMes(mesIdx === 0 ? [anio - 1, 11] : [anio, mesIdx - 1])}>
            ←
          </Button>
          <Button variant="secondary" onClick={() => setMes(mesIdx === 11 ? [anio + 1, 0] : [anio, mesIdx + 1])}>
            →
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={`x${i}`} />
          const iso = `${anio}-${pad(mesIdx + 1)}-${pad(dia)}`
          const delDia = eventos.filter((e) => e.fecha === iso && e.estado !== 'Cancelado')
          return (
            <button
              key={iso}
              onClick={() => onDiaClick(iso)}
              className={`min-h-[3.2rem] rounded-lg border p-1 text-left text-xs transition-colors ${
                iso === hoy ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className={`font-medium ${iso === hoy ? 'text-amber-700' : 'text-gray-700'}`}>
                {dia}
              </span>
              {delDia.slice(0, 2).map((e) => (
                <p key={e.id} className="truncate rounded bg-amber-600/90 px-1 text-[10px] leading-4 text-white">
                  {e.cliente}
                </p>
              ))}
              {delDia.length > 2 && (
                <p className="text-[10px] text-gray-400">+{delDia.length - 2} más</p>
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

export default function Agenda() {
  const { eventos, menus, addEvento, updateEvento, removeEvento } = useStore()
  const [modal, setModal] = useState(null)
  const hoyDate = new Date()
  const [mes, setMes] = useState([hoyDate.getFullYear(), hoyDate.getMonth()])

  const ordenados = useMemo(
    () =>
      [...eventos].sort((a, b) =>
        `${a.fecha} ${a.hora || ''}`.localeCompare(`${b.fecha} ${b.hora || ''}`)
      ),
    [eventos]
  )
  const hoy = todayISO()
  const proximos = ordenados.filter((e) => e.fecha >= hoy && e.estado !== 'Cancelado')
  const pasados = ordenados.filter((e) => e.fecha < hoy || e.estado === 'Cancelado').reverse()

  const FilaEvento = ({ e }) => (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 py-3 last:border-0">
      <div className="w-24 shrink-0">
        <p className="text-sm font-semibold text-gray-900">{fmtDate(e.fecha)}</p>
        <p className="text-xs text-gray-500">{e.hora}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {e.cliente} · {e.tipoEvento}
        </p>
        <p className="truncate text-xs text-gray-500">
          {e.invitados} invitados
          {e.lugar && ` · ${e.lugar}`}
          {e.menuId && ` · ${menus.find((m) => m.id === e.menuId)?.nombre || ''}`}
        </p>
      </div>
      <Badge color={COLOR_ESTADO[e.estado] || 'gray'}>{e.estado}</Badge>
      <div className="flex gap-1">
        <Button variant="ghost" onClick={() => setModal(e)}>Editar</Button>
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm(`¿Eliminar el evento de ${e.cliente}?`)) removeEvento(e.id)
          }}
        >
          Borrar
        </Button>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Agenda de eventos"
        subtitle="Calendario y listado de todos tus eventos"
        action={<Button onClick={() => setModal('nuevo')}>+ Nuevo evento</Button>}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CalendarioMes
          eventos={eventos}
          mes={mes}
          setMes={setMes}
          onDiaClick={(iso) => setModal({ ...eventoVacio(), fecha: iso })}
        />

        <div className="space-y-6">
          <Card>
            <h3 className="mb-2 font-semibold text-gray-900">Próximos eventos</h3>
            {proximos.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                No hay eventos próximos. Hacé clic en un día del calendario para agendar uno.
              </p>
            ) : (
              proximos.map((e) => <FilaEvento key={e.id} e={e} />)
            )}
          </Card>

          {pasados.length > 0 && (
            <Card>
              <h3 className="mb-2 font-semibold text-gray-900">Historial</h3>
              {pasados.slice(0, 10).map((e) => (
                <FilaEvento key={e.id} e={e} />
              ))}
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'nuevo' || !modal?.id ? 'Nuevo evento' : 'Editar evento'}
        wide
      >
        {modal !== null && (
          <FormEvento
            inicial={modal === 'nuevo' ? eventoVacio() : modal}
            onCancel={() => setModal(null)}
            onSave={(ev) => {
              if (modal === 'nuevo' || !modal.id) addEvento(ev)
              else updateEvento(modal.id, ev)
              setModal(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
