import { useState } from 'react'
import useStore, { menuPrecioPersona } from '../store/useStore'
import { TIPOS_EVENTO, ESTADOS_PRESUPUESTO } from '../data/seed'
import { fmtMoney, fmtDate, todayISO, uid } from '../lib/format'
import { descargarPresupuestoPdf, compartirPresupuestoWhatsApp } from '../lib/pdf'
import {
  PageHeader, Card, Button, Field, Input, Select, Textarea, Modal, EmptyState, Badge,
} from '../components/ui'

const COLOR_ESTADO = {
  Borrador: 'gray',
  Enviado: 'blue',
  Aceptado: 'green',
  Rechazado: 'red',
}

const totalPresu = (p) => {
  const subtotal = (p.items || []).reduce(
    (acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0),
    0
  )
  return subtotal * (1 - (Number(p.descuentoPct) || 0) / 100)
}

function FormPresupuesto({ inicial, onSave, onCancel }) {
  const { eventos, menus, platos, settings } = useStore()
  const margen = settings.margen
  const [presu, setPresu] = useState(inicial)
  const set = (patch) => setPresu((p) => ({ ...p, ...patch }))

  const setItem = (id, patch) =>
    set({ items: presu.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })

  const detalleDeMenu = (menu) =>
    menu.cursos
      .map((c) => {
        const nombres = c.platoIds
          .map((id) => platos.find((p) => p.id === id)?.nombre)
          .filter(Boolean)
        return nombres.length ? `${c.nombre}: ${nombres.join(', ')}.` : null
      })
      .filter(Boolean)
      .join(' ')

  const cargarEvento = (eventoId) => {
    const ev = eventos.find((e) => e.id === eventoId)
    if (!ev) return
    const menu = menus.find((m) => m.id === ev.menuId)
    const patch = {
      eventoId,
      cliente: ev.cliente,
      telefonoCliente: ev.telefono,
      tipoEvento: ev.tipoEvento,
      fechaEvento: ev.fecha,
      lugar: ev.lugar,
      invitados: ev.invitados,
    }
    if (menu) {
      patch.detalleMenu = `${menu.nombre}. ${menu.descripcion ? `${menu.descripcion} ` : ''}${detalleDeMenu(menu)}`
      patch.items = [
        {
          id: uid(),
          descripcion: `Servicio de catering — ${menu.nombre}`,
          cantidad: Number(ev.invitados) || 1,
          precioUnitario: Math.round(menuPrecioPersona(menu, platos, margen)),
        },
      ]
    }
    set(patch)
  }

  const cargarMenu = (menuId) => {
    const menu = menus.find((m) => m.id === menuId)
    if (!menu) return
    set({
      detalleMenu: `${menu.nombre}. ${menu.descripcion ? `${menu.descripcion} ` : ''}${detalleDeMenu(menu)}`,
      items: [
        ...presu.items.filter((it) => !it.descripcion.startsWith('Servicio de catering')),
        {
          id: uid(),
          descripcion: `Servicio de catering — ${menu.nombre}`,
          cantidad: Number(presu.invitados) || 1,
          precioUnitario: Math.round(menuPrecioPersona(menu, platos, margen)),
        },
      ],
    })
  }

  const subtotal = (presu.items || []).reduce(
    (acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0),
    0
  )
  const total = subtotal * (1 - (Number(presu.descuentoPct) || 0) / 100)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!presu.cliente.trim() || presu.items.length === 0) return
        onSave(presu)
      }}
      className="space-y-4"
    >
      {(eventos.length > 0 || menus.length > 0) && (
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-3 sm:grid-cols-2">
          {eventos.length > 0 && (
            <Field label="Precargar desde un evento de la agenda">
              <Select value={presu.eventoId || ''} onChange={(e) => cargarEvento(e.target.value)}>
                <option value="">Elegir evento…</option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {fmtDate(ev.fecha)} — {ev.cliente} ({ev.tipoEvento})
                  </option>
                ))}
              </Select>
            </Field>
          )}
          {menus.length > 0 && (
            <Field label="Agregar un menú como ítem">
              <Select value="" onChange={(e) => e.target.value && cargarMenu(e.target.value)}>
                <option value="">Elegir menú…</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} — {fmtMoney(menuPrecioPersona(m, platos, margen))}/persona
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cliente">
          <Input
            value={presu.cliente}
            onChange={(e) => set({ cliente: e.target.value })}
            placeholder="Nombre y apellido"
            required
          />
        </Field>
        <Field label="WhatsApp del cliente (con cód. de país)">
          <Input
            value={presu.telefonoCliente}
            onChange={(e) => set({ telefonoCliente: e.target.value })}
            placeholder="549351..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Tipo de evento">
          <Select value={presu.tipoEvento} onChange={(e) => set({ tipoEvento: e.target.value })}>
            {TIPOS_EVENTO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha del evento">
          <Input
            type="date"
            value={presu.fechaEvento}
            onChange={(e) => set({ fechaEvento: e.target.value })}
          />
        </Field>
        <Field label="Lugar">
          <Input value={presu.lugar} onChange={(e) => set({ lugar: e.target.value })} />
        </Field>
        <Field label="Invitados">
          <Input
            type="number"
            min="1"
            value={presu.invitados}
            onChange={(e) => set({ invitados: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Propuesta gastronómica (texto que aparece en el PDF)">
        <Textarea
          value={presu.detalleMenu}
          onChange={(e) => set({ detalleMenu: e.target.value })}
          rows={3}
          placeholder="Detalle del menú propuesto…"
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Ítems del presupuesto
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              set({
                items: [
                  ...presu.items,
                  { id: uid(), descripcion: '', cantidad: 1, precioUnitario: 0 },
                ],
              })
            }
          >
            + Ítem
          </Button>
        </div>
        {presu.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-sm text-gray-400">
            Agregá al menos un ítem (servicio de catering, vajilla, mozos, traslado…)
          </p>
        ) : (
          <div className="space-y-2">
            {presu.items.map((it) => (
              <div key={it.id} className="flex items-end gap-2">
                <Field label="Descripción" className="flex-1">
                  <Input
                    value={it.descripcion}
                    onChange={(e) => setItem(it.id, { descripcion: e.target.value })}
                    placeholder="Ej: Servicio de mozos (2)"
                    required
                  />
                </Field>
                <Field label="Cant." className="w-20">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={it.cantidad}
                    onChange={(e) => setItem(it.id, { cantidad: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Precio unit." className="w-32">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={it.precioUnitario}
                    onChange={(e) => setItem(it.id, { precioUnitario: e.target.value })}
                    required
                  />
                </Field>
                <div className="mb-1 w-28 text-right">
                  <p className="text-[11px] text-gray-500">Importe</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {fmtMoney((Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set({ items: presu.items.filter((x) => x.id !== it.id) })}
                  className="mb-1 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Quitar ítem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Descuento %">
          <Input
            type="number"
            min="0"
            max="100"
            value={presu.descuentoPct}
            onChange={(e) => set({ descuentoPct: e.target.value })}
          />
        </Field>
        <Field label="Seña %">
          <Input
            type="number"
            min="0"
            max="100"
            value={presu.seniaPct}
            onChange={(e) => set({ seniaPct: e.target.value })}
          />
        </Field>
        <Field label="Validez (días)">
          <Input
            type="number"
            min="1"
            value={presu.validezDias}
            onChange={(e) => set({ validezDias: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Notas adicionales (aparecen en condiciones)">
        <Textarea
          value={presu.notas}
          onChange={(e) => set({ notas: e.target.value })}
          rows={2}
        />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">
          Subtotal {fmtMoney(subtotal)}
          {Number(presu.descuentoPct) > 0 && ` · Descuento ${presu.descuentoPct}%`}
        </p>
        <p className="text-lg font-bold text-amber-900">Total {fmtMoney(total)}</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar presupuesto</Button>
      </div>
    </form>
  )
}

export default function Presupuestos() {
  const { presupuestos, settings, addPresupuesto, updatePresupuesto, removePresupuesto } =
    useStore()
  const [modal, setModal] = useState(null)

  const presuVacio = () => ({
    fecha: todayISO(),
    eventoId: '',
    cliente: '',
    telefonoCliente: '',
    tipoEvento: TIPOS_EVENTO[0],
    fechaEvento: '',
    lugar: '',
    invitados: 50,
    detalleMenu: '',
    items: [],
    descuentoPct: 0,
    seniaPct: settings.seniaPct,
    validezDias: settings.validezDias,
    condiciones: settings.condiciones,
    notas: '',
    estado: 'Borrador',
  })

  const enviarWhatsApp = async (p) => {
    const resultado = await compartirPresupuestoWhatsApp(p, settings)
    if (resultado !== 'cancelado' && p.estado === 'Borrador') {
      updatePresupuesto(p.id, { estado: 'Enviado' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        subtitle="Generá presupuestos en PDF profesionales y envialos por WhatsApp"
        action={<Button onClick={() => setModal('nuevo')}>+ Nuevo presupuesto</Button>}
      />

      {presupuestos.length === 0 ? (
        <EmptyState
          message="Todavía no generaste presupuestos."
          action={<Button onClick={() => setModal('nuevo')}>Crear el primero</Button>}
        />
      ) : (
        <Card className="divide-y divide-gray-100 p-0">
          {[...presupuestos].reverse().map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="w-20 shrink-0">
                <p className="text-sm font-bold text-gray-900">
                  N° {String(p.numero).padStart(4, '0')}
                </p>
                <p className="text-xs text-gray-500">{fmtDate(p.fecha)}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {p.cliente} · {p.tipoEvento}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {p.fechaEvento && `Evento: ${fmtDate(p.fechaEvento)} · `}
                  {p.invitados} invitados · Total {fmtMoney(totalPresu(p))}
                </p>
              </div>
              <Select
                value={p.estado}
                onChange={(e) => updatePresupuesto(p.id, { estado: e.target.value })}
                style={{ width: '8.5rem' }}
              >
                {ESTADOS_PRESUPUESTO.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <Badge color={COLOR_ESTADO[p.estado] || 'gray'}>{p.estado}</Badge>
              <div className="flex flex-wrap gap-1">
                <Button variant="secondary" onClick={() => descargarPresupuestoPdf(p, settings)}>
                  PDF
                </Button>
                <Button
                  onClick={() => enviarWhatsApp(p)}
                  className="!bg-green-600 hover:!bg-green-700"
                >
                  WhatsApp
                </Button>
                <Button variant="ghost" onClick={() => setModal(p)}>
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el presupuesto N° ${p.numero}?`))
                      removePresupuesto(p.id)
                  }}
                >
                  Borrar
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'nuevo' ? 'Nuevo presupuesto' : `Editar presupuesto N° ${modal?.numero}`}
        wide
      >
        {modal !== null && (
          <FormPresupuesto
            inicial={modal === 'nuevo' ? presuVacio() : modal}
            onCancel={() => setModal(null)}
            onSave={(presu) => {
              if (modal === 'nuevo') addPresupuesto(presu)
              else updatePresupuesto(modal.id, presu)
              setModal(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
