import { useState } from 'react'
import useStore, {
  precioSugerido, menuCostoPersona, menuPrecioPersona,
} from '../store/useStore'
import { TIPOS_EVENTO } from '../data/seed'
import { fmtMoney, uid } from '../lib/format'
import {
  PageHeader, Card, Button, Field, Input, Select, Textarea, Modal, EmptyState, Badge,
} from '../components/ui'

const menuVacio = () => ({
  nombre: '',
  tipoEvento: TIPOS_EVENTO[0],
  descripcion: '',
  cursos: [
    { id: uid(), nombre: 'Recepción', platoIds: [] },
    { id: uid(), nombre: 'Plato principal', platoIds: [] },
    { id: uid(), nombre: 'Postre', platoIds: [] },
  ],
  precioPersona: 0,
})

function FormMenu({ inicial, onSave, onCancel }) {
  const platos = useStore((s) => s.platos)
  const margen = useStore((s) => s.settings.margen)
  const [menu, setMenu] = useState(inicial)

  const set = (patch) => setMenu((m) => ({ ...m, ...patch }))
  const setCurso = (id, patch) =>
    set({ cursos: menu.cursos.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  const togglePlato = (cursoId, platoId) => {
    const curso = menu.cursos.find((c) => c.id === cursoId)
    const tiene = curso.platoIds.includes(platoId)
    setCurso(cursoId, {
      platoIds: tiene
        ? curso.platoIds.filter((id) => id !== platoId)
        : [...curso.platoIds, platoId],
    })
  }

  const costo = menuCostoPersona(menu, platos)
  const precio = menuPrecioPersona(menu, platos, margen)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!menu.nombre.trim()) return
        onSave(menu)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre del menú">
          <Input
            value={menu.nombre}
            onChange={(e) => set({ nombre: e.target.value })}
            placeholder="Ej: Menú Quince Clásico"
            required
          />
        </Field>
        <Field label="Tipo de evento">
          <Select value={menu.tipoEvento} onChange={(e) => set({ tipoEvento: e.target.value })}>
            {TIPOS_EVENTO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Descripción (aparece en el presupuesto)">
        <Textarea
          value={menu.descripcion}
          onChange={(e) => set({ descripcion: e.target.value })}
          rows={2}
          placeholder="Breve descripción de la propuesta…"
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Pasos del menú
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              set({ cursos: [...menu.cursos, { id: uid(), nombre: 'Nuevo paso', platoIds: [] }] })
            }
          >
            + Paso
          </Button>
        </div>
        <div className="space-y-3">
          {menu.cursos.map((curso) => (
            <div key={curso.id} className="rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Input
                  value={curso.nombre}
                  onChange={(e) => setCurso(curso.id, { nombre: e.target.value })}
                  placeholder="Nombre del paso (Ej: Entrada)"
                />
                <button
                  type="button"
                  onClick={() => set({ cursos: menu.cursos.filter((c) => c.id !== curso.id) })}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Quitar paso"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {platos.length === 0 ? (
                <p className="text-xs text-gray-400">No hay platos cargados todavía.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {platos.map((p) => {
                    const activo = curso.platoIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlato(curso.id, p.id)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          activo
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p.nombre} · {fmtMoney(precioSugerido(p, margen))}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Precio por persona (0 = usar precio sugerido)">
          <Input
            type="number"
            min="0"
            value={menu.precioPersona}
            onChange={(e) => set({ precioPersona: e.target.value })}
          />
        </Field>
        <div className="flex items-end">
          <div className="w-full rounded-lg bg-amber-50 px-4 py-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">Costo x persona: <b>{fmtMoney(costo)}</b></span>
              <span className="text-amber-900">Precio: <b>{fmtMoney(precio)}</b></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar menú</Button>
      </div>
    </form>
  )
}

export default function Menus() {
  const { menus, platos, addMenu, updateMenu, removeMenu } = useStore()
  const margen = useStore((s) => s.settings.margen)
  const [modal, setModal] = useState(null)

  return (
    <div>
      <PageHeader
        title="Menús por evento"
        subtitle="Armá propuestas para cumples de 15, casamientos, eventos corporativos y más"
        action={<Button onClick={() => setModal('nuevo')}>+ Nuevo menú</Button>}
      />

      {menus.length === 0 ? (
        <EmptyState
          message="Todavía no hay menús armados."
          action={<Button onClick={() => setModal('nuevo')}>Crear el primero</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {menus.map((m) => (
            <Card key={m.id}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{m.nombre}</h3>
                  <Badge color="violet">{m.tipoEvento}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => setModal(m)}>Editar</Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${m.nombre}"?`)) removeMenu(m.id)
                    }}
                  >
                    Borrar
                  </Button>
                </div>
              </div>
              {m.descripcion && (
                <p className="mb-3 text-sm text-gray-500">{m.descripcion}</p>
              )}
              <div className="mb-3 space-y-1.5">
                {m.cursos.map((c) => {
                  const nombres = c.platoIds
                    .map((id) => platos.find((p) => p.id === id)?.nombre)
                    .filter(Boolean)
                  if (nombres.length === 0) return null
                  return (
                    <p key={c.id} className="text-sm">
                      <span className="font-medium text-gray-700">{c.nombre}:</span>{' '}
                      <span className="text-gray-500">{nombres.join(', ')}</span>
                    </p>
                  )
                })}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-[11px] text-gray-500">Costo x persona</p>
                  <p className="font-semibold text-gray-900">
                    {fmtMoney(menuCostoPersona(m, platos))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-500">Precio x persona</p>
                  <p className="font-semibold text-amber-700">
                    {fmtMoney(menuPrecioPersona(m, platos, margen))}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'nuevo' ? 'Nuevo menú' : 'Editar menú'}
        wide
      >
        {modal !== null && (
          <FormMenu
            inicial={modal === 'nuevo' ? menuVacio() : modal}
            onCancel={() => setModal(null)}
            onSave={(menu) => {
              if (modal === 'nuevo') addMenu(menu)
              else updateMenu(modal.id, menu)
              setModal(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
