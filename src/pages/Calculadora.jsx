import { useState } from 'react'
import useStore, { costoPorcion, listaCompras } from '../store/useStore'
import { fmtMoney, fmtQty, uid } from '../lib/format'
import {
  PageHeader, Card, Button, Field, Input, Select, EmptyState,
} from '../components/ui'

export default function Calculadora() {
  const platos = useStore((s) => s.platos)
  const [invitados, setInvitados] = useState(50)
  const [items, setItems] = useState([]) // [{id, platoId, porciones}]

  const addItem = () => {
    const primero = platos[0]
    if (!primero) return
    setItems((arr) => [
      ...arr,
      { id: uid(), platoId: primero.id, porciones: invitados },
    ])
  }

  const setItem = (id, patch) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const compras = listaCompras(items, platos)
  const costoTotal = items.reduce((acc, it) => {
    const plato = platos.find((p) => p.id === it.platoId)
    return acc + (plato ? costoPorcion(plato) * (Number(it.porciones) || 0) : 0)
  }, 0)

  const copiarLista = () => {
    const texto = [
      '🛒 Lista de compras',
      ...compras.map(
        (c) => `• ${c.nombre}: ${fmtQty(c.cantidad)} ${c.unidad} (${fmtMoney(c.costo)})`
      ),
      `Total estimado: ${fmtMoney(compras.reduce((a, c) => a + c.costo, 0))}`,
    ].join('\n')
    navigator.clipboard?.writeText(texto)
  }

  if (platos.length === 0) {
    return (
      <div>
        <PageHeader title="Calculadora de porciones" />
        <EmptyState message="Primero cargá platos en la sección «Platos y costos» para poder calcular porciones." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Calculadora de porciones"
        subtitle="Elegí los platos y la cantidad de porciones: la app escala los ingredientes y arma la lista de compras"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-end gap-3">
            <Field label="Invitados (porciones por defecto)" className="w-48">
              <Input
                type="number"
                min="1"
                value={invitados}
                onChange={(e) => setInvitados(e.target.value)}
              />
            </Field>
            <Button onClick={addItem}>+ Agregar plato</Button>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-400">
              Agregá platos para calcular
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((it) => {
                const plato = platos.find((p) => p.id === it.platoId)
                return (
                  <div key={it.id} className="flex items-end gap-2">
                    <Field label="Plato" className="flex-1">
                      <Select
                        value={it.platoId}
                        onChange={(e) => setItem(it.id, { platoId: e.target.value })}
                      >
                        {platos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Porciones" className="w-28">
                      <Input
                        type="number"
                        min="0"
                        value={it.porciones}
                        onChange={(e) => setItem(it.id, { porciones: e.target.value })}
                      />
                    </Field>
                    <div className="mb-1 w-28 text-right">
                      <p className="text-[11px] text-gray-500">Costo</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {plato
                          ? fmtMoney(costoPorcion(plato) * (Number(it.porciones) || 0))
                          : '—'}
                      </p>
                    </div>
                    <button
                      onClick={() => setItems((arr) => arr.filter((x) => x.id !== it.id))}
                      className="mb-1 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="Quitar plato"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">Costo total de insumos</p>
              <p className="text-lg font-bold text-amber-900">{fmtMoney(costoTotal)}</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">🛒 Lista de compras</h3>
            {compras.length > 0 && (
              <Button variant="secondary" onClick={copiarLista}>
                Copiar lista
              </Button>
            )}
          </div>
          {compras.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              La lista se arma sola cuando agregás platos
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2">Ingrediente</th>
                  <th className="py-2 text-right">Cantidad</th>
                  <th className="py-2 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c) => (
                  <tr key={`${c.nombre}|${c.unidad}`} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{c.nombre}</td>
                    <td className="py-2 text-right text-gray-700">
                      {fmtQty(c.cantidad)} {c.unidad}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {fmtMoney(c.costo)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-semibold text-gray-900" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 text-right font-bold text-amber-700">
                    {fmtMoney(compras.reduce((a, c) => a + c.costo, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
