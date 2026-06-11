import { useState } from 'react'
import useStore from '../store/useStore'
import { PageHeader, Card, Button, Field, Input, Textarea } from '../components/ui'

export default function Configuracion() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const [form, setForm] = useState(settings)
  const [guardado, setGuardado] = useState(false)

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setGuardado(false)
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Datos de tu negocio: aparecen en el encabezado de los presupuestos PDF"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateSettings(form)
          setGuardado(true)
        }}
        className="max-w-3xl space-y-6"
      >
        <Card className="space-y-4">
          <h3 className="font-semibold text-gray-900">Identidad del negocio</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre del catering">
              <Input
                value={form.nombre}
                onChange={(e) => set({ nombre: e.target.value })}
                required
              />
            </Field>
            <Field label="Eslogan">
              <Input value={form.slogan} onChange={(e) => set({ slogan: e.target.value })} />
            </Field>
            <Field label="Teléfono / WhatsApp">
              <Input
                value={form.telefono}
                onChange={(e) => set({ telefono: e.target.value })}
                placeholder="549351..."
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={form.instagram}
                onChange={(e) => set({ instagram: e.target.value })}
                placeholder="@tucatering"
              />
            </Field>
            <Field label="Dirección / Zona">
              <Input value={form.direccion} onChange={(e) => set({ direccion: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-gray-900">Precios y condiciones por defecto</h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Margen de ganancia %">
              <Input
                type="number"
                min="0"
                value={form.margen}
                onChange={(e) => set({ margen: Number(e.target.value) })}
              />
            </Field>
            <Field label="Seña % por defecto">
              <Input
                type="number"
                min="0"
                max="100"
                value={form.seniaPct}
                onChange={(e) => set({ seniaPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Validez presupuestos (días)">
              <Input
                type="number"
                min="1"
                value={form.validezDias}
                onChange={(e) => set({ validezDias: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Condiciones (aparecen al pie de cada presupuesto)">
            <Textarea
              value={form.condiciones}
              onChange={(e) => set({ condiciones: e.target.value })}
              rows={4}
            />
          </Field>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Guardar cambios</Button>
          {guardado && <span className="text-sm font-medium text-green-600">✓ Guardado</span>}
        </div>
      </form>
    </div>
  )
}
