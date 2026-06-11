# Catering Pro 🍽️

Aplicación web para gestionar una empresa familiar de servicios de catering.
Todo se guarda en el navegador (localStorage): no necesita servidor ni base de datos.

## Funcionalidades

- **Platos y costos** — Cargá cada receta con sus ingredientes y obtené el
  costo por porción y el precio sugerido según tu margen de ganancia.
- **Calculadora de porciones** — Elegí platos y cantidad de invitados: la app
  escala los ingredientes, calcula el costo total y arma la lista de compras
  (copiable para mandar por WhatsApp).
- **Menús por evento** — Armá propuestas para cumpleaños de 15, casamientos,
  eventos corporativos, etc., con precio por persona automático.
- **Agenda de eventos** — Calendario mensual y listado de próximos eventos,
  con cliente, lugar, invitados, menú asignado y estado (consulta, señado…).
- **Presupuestos en PDF** — Generá presupuestos profesionales con numeración
  automática, detalle del menú, ítems, descuento, seña y condiciones.
  Botón directo para **enviar por WhatsApp**: en el celular comparte el PDF
  directamente; en la computadora lo descarga y abre el chat con el mensaje listo.
- **Configuración** — Nombre, eslogan y contacto del negocio (aparecen en el
  PDF), margen de ganancia y condiciones por defecto.

## Cómo correr la app

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
```

Se puede publicar gratis en Vercel, Netlify o GitHub Pages (es un sitio estático).

## Stack

React 18 · Vite · Tailwind CSS · Zustand (persistencia en localStorage) · jsPDF
