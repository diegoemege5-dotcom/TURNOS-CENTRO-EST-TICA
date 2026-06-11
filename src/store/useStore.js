import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/format'
import { seedSettings, seedPlatos, seedMenus } from '../data/seed'

const useStore = create(
  persist(
    (set, get) => ({
      settings: seedSettings,
      platos: seedPlatos,
      menus: seedMenus,
      eventos: [],
      presupuestos: [],
      nextNumero: 1,

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // ---- Platos ----
      addPlato: (plato) => {
        const nuevo = { ...plato, id: uid() }
        set((s) => ({ platos: [...s.platos, nuevo] }))
        return nuevo.id
      },
      updatePlato: (id, patch) =>
        set((s) => ({
          platos: s.platos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePlato: (id) =>
        set((s) => ({
          platos: s.platos.filter((p) => p.id !== id),
          menus: s.menus.map((m) => ({
            ...m,
            cursos: m.cursos.map((c) => ({
              ...c,
              platoIds: c.platoIds.filter((pid) => pid !== id),
            })),
          })),
        })),

      // ---- Menús ----
      addMenu: (menu) => {
        const nuevo = { ...menu, id: uid() }
        set((s) => ({ menus: [...s.menus, nuevo] }))
        return nuevo.id
      },
      updateMenu: (id, patch) =>
        set((s) => ({
          menus: s.menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMenu: (id) =>
        set((s) => ({
          menus: s.menus.filter((m) => m.id !== id),
          eventos: s.eventos.map((e) =>
            e.menuId === id ? { ...e, menuId: '' } : e
          ),
        })),

      // ---- Eventos ----
      addEvento: (evento) => {
        const nuevo = { ...evento, id: uid() }
        set((s) => ({ eventos: [...s.eventos, nuevo] }))
        return nuevo.id
      },
      updateEvento: (id, patch) =>
        set((s) => ({
          eventos: s.eventos.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeEvento: (id) =>
        set((s) => ({ eventos: s.eventos.filter((e) => e.id !== id) })),

      // ---- Presupuestos ----
      addPresupuesto: (presu) => {
        const numero = get().nextNumero
        const nuevo = { ...presu, id: uid(), numero }
        set((s) => ({
          presupuestos: [...s.presupuestos, nuevo],
          nextNumero: numero + 1,
        }))
        return nuevo.id
      },
      updatePresupuesto: (id, patch) =>
        set((s) => ({
          presupuestos: s.presupuestos.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),
      removePresupuesto: (id) =>
        set((s) => ({
          presupuestos: s.presupuestos.filter((p) => p.id !== id),
        })),
    }),
    { name: 'catering-pro' }
  )
)

// ---- Cálculos derivados ----

export const costoPorcion = (plato) => {
  if (!plato) return 0
  const rinde = Number(plato.rinde) || 1
  const ingredientes = (plato.ingredientes || []).reduce(
    (acc, i) => acc + (Number(i.cantidad) || 0) * (Number(i.costoUnitario) || 0),
    0
  )
  return ingredientes / rinde + (Number(plato.costoExtraPorcion) || 0)
}

export const precioSugerido = (plato, margen) =>
  costoPorcion(plato) * (1 + (Number(margen) || 0) / 100)

export const menuPlatos = (menu, platos) =>
  (menu?.cursos || []).flatMap((c) =>
    c.platoIds.map((id) => platos.find((p) => p.id === id)).filter(Boolean)
  )

export const menuCostoPersona = (menu, platos) =>
  menuPlatos(menu, platos).reduce((acc, p) => acc + costoPorcion(p), 0)

export const menuPrecioPersona = (menu, platos, margen) => {
  if (Number(menu?.precioPersona) > 0) return Number(menu.precioPersona)
  return menuPlatos(menu, platos).reduce(
    (acc, p) => acc + precioSugerido(p, margen),
    0
  )
}

// Lista de compras: escala los ingredientes de cada plato a la cantidad de
// porciones pedida y agrupa por nombre + unidad.
export const listaCompras = (items, platos) => {
  const mapa = new Map()
  for (const { platoId, porciones } of items) {
    const plato = platos.find((p) => p.id === platoId)
    if (!plato) continue
    const factor = (Number(porciones) || 0) / (Number(plato.rinde) || 1)
    for (const ing of plato.ingredientes || []) {
      const key = `${ing.nombre.trim().toLowerCase()}|${ing.unidad}`
      const prev = mapa.get(key) || {
        nombre: ing.nombre,
        unidad: ing.unidad,
        cantidad: 0,
        costo: 0,
      }
      prev.cantidad += (Number(ing.cantidad) || 0) * factor
      prev.costo += (Number(ing.cantidad) || 0) * factor * (Number(ing.costoUnitario) || 0)
      mapa.set(key, prev)
    }
  }
  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export default useStore
