import { useState } from 'react'
import useStore, { costoPorcion, precioSugerido } from '../store/useStore'
import { CATEGORIAS_PLATO, UNIDADES } from '../data/seed'
import { fmtMoney, uid } from '../lib/format'
import {
  PageHeader, Card, Button, Field, Input, Select, Textarea, Modal, EmptyState, Badge,
} from '../components/ui'

const platoVacio = () => ({
  nombre: '',
  categoria: CATEGORIAS_PLATO[0],
  rinde: 10,
  ingredientes: [],
  costoExtraPorcion: 0,
  notas: '',
})

function FormPlato({ inicial, onSave, onCancel }) {
  const margen = useStore((s) => s.settings.margen)
  const [plato, setPlato] = useState(inicial)

  const set = (patch) => setPlato((p) => ({ ...p, ...patch }))

  const setIng = (id, patch) =>
    set({
      ingredientes: plato.ingredientes.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      ),
    })

  const addIng = () =>
    set({
      ingredientes: [
        ...plato.ingredientes,
        { id: uid(), nombre: '', cantidad: 1, unidad: 'kg', costoUnitario: 0 },
      ],
    })

  const costo = costoPorcion(plato)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!plato.nombre.trim()) return
        onSave(plato)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Nombre del plato" className="sm:col-span-2">
          <Input
            value={plato.nombre}
            onChange={(e) => set({ nombre: e.target.value })}
            placeholder="Ej: Lomo al malbec"
            required
          />
        </Field>
        <Field label="Categoría">
          <Select value={plato.categoria} onChange={(e) => set({ categoria: e.target.value })}>
            {CATEGORIAS_PLATO.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="La receta rinde (porciones)">
          <Input
            type="number"
            min="1"
            value={plato.rinde}
            onChange={(e) => set({ rinde: e.target.value })}
            required
          />
        </Field>
        <Field label="Costo extra por porción (gas, descartables…)">
          <Input
            type="number"
            min="0"
            value={plato.costoExtraPorcion}
            onChange={(e) => set({ costoExtraPorcion: e.target.value })}
          />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Ingredientes (para {plato.rinde || '?'} porciones)
          </span>
          <Button type="button" variant="secondary" onClick={addIng}>
            + Ingrediente
          </Button>
        </div>
        {plato.ingredientes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-sm text-gray-400">
            Agregá los ingredientes para calcular el costo
          </p>
        ) : (
          <div className="space-y-2">
            {plato.ingredientes.map((ing) => (
              <div key={ing.id} className="flex items-end gap-2">
                <Field label="Ingrediente" className="flex-1">
                  <Input
                    value={ing.nombre}
                    onChange={(e) => setIng(ing.id, { nombre: e.target.value })}
                    placeholder="Ej: Carne picada"
                    required
                  />
                </Field>
                <Field label="Cant." className="w-20">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={ing.cantidad}
                    onChange={(e) => setIng(ing.id, { cantidad: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Unidad" className="w-28">
                  <Select
                    value={ing.unidad}
                    onChange={(e) => setIng(ing.id, { unidad: e.target.value })}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="$ x unidad" className="w-28">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={ing.costoUnitario}
                    onChange={(e) => setIng(ing.id, { costoUnitario: e.target.value })}
                    required
                  />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    set({ ingredientes: plato.ingredientes.filter((i) => i.id !== ing.id) })
                  }
                  className="mb-1 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Quitar ingrediente"
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

      <Field label="Notas">
        <Textarea
          value={plato.notas}
          onChange={(e) => set({ notas: e.target.value })}
          rows={2}
          placeholder="Aclaraciones de la receta…"
        />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
        <div>
          <p className="text-xs text-amber-700">Costo por porción</p>
          <p className="text-lg font-bold text-amber-900">{fmtMoney(costo)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-amber-700">Precio sugerido (+{margen}%)</p>
          <p className="text-lg font-bold text-amber-900">
            {fmtMoney(precioSugerido(plato, margen))}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar plato</Button>
      </div>
    </form>
  )
}

export default function Platos() {
  const { platos, addPlato, updatePlato, removePlato } = useStore()
  const margen = useStore((s) => s.settings.margen)
  const [modal, setModal] = useState(null) // null | 'nuevo' | plato a editar
  const [filtro, setFiltro] = useState('Todas')

  const visibles = platos.filter(
    (p) => filtro === 'Todas' || p.categoria === filtro
  )

  return (
    <div>
      <PageHeader
        title="Platos y costos"
        subtitle="Recetas con sus ingredientes, costo por porción y precio sugerido"
        action={<Button onClick={() => setModal('nuevo')}>+ Nuevo plato</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['Todas', ...CATEGORIAS_PLATO].map((c) => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filtro === c
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          message="Todavía no hay platos en esta categoría."
          action={<Button onClick={() => setModal('nuevo')}>Crear el primero</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibles.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                  <Badge color="amber">{p.categoria}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => setModal(p)}>Editar</Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${p.nombre}"?`)) removePlato(p.id)
                    }}
                  >
                    Borrar
                  </Button>
                </div>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Rinde {p.rinde} porciones · {p.ingredientes.length} ingredientes
              </p>
              <div className="mt-auto flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-[11px] text-gray-500">Costo / porción</p>
                  <p className="font-semibold text-gray-900">{fmtMoney(costoPorcion(p))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-500">Precio sugerido</p>
                  <p className="font-semibold text-amber-700">
                    {fmtMoney(precioSugerido(p, margen))}
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
        title={modal === 'nuevo' ? 'Nuevo plato' : 'Editar plato'}
        wide
      >
        {modal !== null && (
          <FormPlato
            inicial={modal === 'nuevo' ? platoVacio() : modal}
            onCancel={() => setModal(null)}
            onSave={(plato) => {
              if (modal === 'nuevo') addPlato(plato)
              else updatePlato(modal.id, plato)
              setModal(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
