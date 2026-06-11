import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmtMoney, fmtDate, fmtDateLong } from './format'

const AMBAR = [217, 119, 6]
const GRIS_OSCURO = [30, 41, 59]
const GRIS = [100, 116, 139]

const numeroFmt = (n) => `N° ${String(n).padStart(4, '0')}`

export function buildPresupuestoPdf(presu, settings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 16

  // ---- Encabezado ----
  doc.setFillColor(...GRIS_OSCURO)
  doc.rect(0, 0, W, 34, 'F')
  doc.setFillColor(...AMBAR)
  doc.rect(0, 34, W, 1.6, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.text(settings.nombre || 'Catering', M, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(203, 213, 225)
  if (settings.slogan) doc.text(settings.slogan, M, 21.5)

  const contacto = [
    settings.telefono && `Tel: ${settings.telefono}`,
    settings.email,
    settings.instagram && `IG: ${settings.instagram}`,
    settings.direccion,
  ]
    .filter(Boolean)
    .join('   ·   ')
  if (contacto) doc.text(contacto, M, 28)

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('PRESUPUESTO', W - M, 15, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(numeroFmt(presu.numero), W - M, 21.5, { align: 'right' })
  doc.text(`Fecha: ${fmtDate(presu.fecha)}`, W - M, 28, { align: 'right' })

  // ---- Cliente y evento ----
  let y = 46
  doc.setTextColor(...GRIS_OSCURO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text('CLIENTE', M, y)
  doc.text('EVENTO', W / 2 + 4, y)
  doc.setDrawColor(...AMBAR)
  doc.setLineWidth(0.5)
  doc.line(M, y + 1.5, M + 30, y + 1.5)
  doc.line(W / 2 + 4, y + 1.5, W / 2 + 34, y + 1.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GRIS)
  const clienteLineas = [
    presu.cliente,
    presu.telefonoCliente && `Tel: ${presu.telefonoCliente}`,
  ].filter(Boolean)
  const eventoLineas = [
    presu.tipoEvento,
    presu.fechaEvento && fmtDateLong(presu.fechaEvento),
    presu.lugar && `Lugar: ${presu.lugar}`,
    presu.invitados && `${presu.invitados} invitados`,
  ].filter(Boolean)
  clienteLineas.forEach((l, i) => doc.text(String(l), M, y + 7 + i * 5))
  eventoLineas.forEach((l, i) => doc.text(String(l), W / 2 + 4, y + 7 + i * 5))

  y += 9 + Math.max(clienteLineas.length, eventoLineas.length, 1) * 5

  // ---- Detalle del menú (opcional) ----
  if (presu.detalleMenu) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...GRIS_OSCURO)
    doc.text('PROPUESTA GASTRONÓMICA', M, y + 4)
    doc.line(M, y + 5.5, M + 52, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...GRIS)
    const lineas = doc.splitTextToSize(presu.detalleMenu, W - M * 2)
    doc.text(lineas, M, y + 11)
    y += 13 + lineas.length * 4.4
  } else {
    y += 4
  }

  // ---- Tabla de ítems ----
  const body = (presu.items || []).map((it) => [
    it.descripcion,
    String(it.cantidad),
    fmtMoney(it.precioUnitario),
    fmtMoney((Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0)),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Descripción', 'Cant.', 'Precio unit.', 'Importe']],
    body,
    theme: 'striped',
    headStyles: {
      fillColor: GRIS_OSCURO,
      textColor: 255,
      fontSize: 9.5,
      fontStyle: 'bold',
    },
    styles: { fontSize: 9.5, cellPadding: 3, textColor: GRIS_OSCURO },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
    },
  })

  y = doc.lastAutoTable.finalY + 6

  // ---- Totales ----
  const subtotal = (presu.items || []).reduce(
    (acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0),
    0
  )
  const descuento = subtotal * ((Number(presu.descuentoPct) || 0) / 100)
  const total = subtotal - descuento
  const senia = total * ((Number(presu.seniaPct) || 0) / 100)

  const filaTotal = (label, valor, destacado = false) => {
    if (destacado) {
      doc.setFillColor(...AMBAR)
      doc.roundedRect(W - M - 78, y - 5, 78, 9, 1.5, 1.5, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
    } else {
      doc.setTextColor(...GRIS)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
    }
    doc.text(label, W - M - 74, y + 1)
    doc.text(valor, W - M - 4, y + 1, { align: 'right' })
    y += destacado ? 11 : 6.5
  }

  filaTotal('Subtotal', fmtMoney(subtotal))
  if (descuento > 0)
    filaTotal(`Descuento (${presu.descuentoPct}%)`, `- ${fmtMoney(descuento)}`)
  y += 1.5
  filaTotal('TOTAL', fmtMoney(total), true)
  if (senia > 0)
    filaTotal(`Seña para reservar (${presu.seniaPct}%)`, fmtMoney(senia))

  // ---- Condiciones ----
  const condiciones = [
    presu.validezDias &&
      `Presupuesto válido por ${presu.validezDias} días desde la fecha de emisión.`,
    presu.condiciones,
    presu.notas,
  ]
    .filter(Boolean)
    .join(' ')

  if (condiciones) {
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...GRIS_OSCURO)
    doc.text('Condiciones', M, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS)
    const lineas = doc.splitTextToSize(condiciones, W - M * 2)
    doc.text(lineas, M, y + 5)
    y += 5 + lineas.length * 4.2
  }

  // ---- Pie ----
  const H = doc.internal.pageSize.getHeight()
  doc.setFillColor(...AMBAR)
  doc.rect(0, H - 14, W, 1, 'F')
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...GRIS)
  doc.text(
    `¡Gracias por consultarnos! ${settings.nombre || ''}`.trim(),
    W / 2,
    H - 7,
    { align: 'center' }
  )

  return doc
}

export const pdfFileName = (presu) =>
  `Presupuesto-${String(presu.numero).padStart(4, '0')}-${(presu.cliente || 'cliente')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')}.pdf`

export function descargarPresupuestoPdf(presu, settings) {
  buildPresupuestoPdf(presu, settings).save(pdfFileName(presu))
}

// Comparte el PDF por WhatsApp. En celulares con Web Share API comparte el
// archivo directamente; si no, lo descarga y abre WhatsApp con el mensaje.
export async function compartirPresupuestoWhatsApp(presu, settings) {
  const doc = buildPresupuestoPdf(presu, settings)
  const nombre = pdfFileName(presu)
  const mensaje =
    `¡Hola${presu.cliente ? ` ${presu.cliente}` : ''}! ` +
    `Te enviamos el presupuesto ${numeroFmt(presu.numero)} de ${settings.nombre || 'nuestro catering'}` +
    `${presu.tipoEvento ? ` para tu ${presu.tipoEvento}` : ''}. ` +
    'Cualquier consulta estamos a disposición. ¡Gracias!'

  const file = new File([doc.output('blob')], nombre, { type: 'application/pdf' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: mensaje, title: nombre })
      return 'compartido'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelado'
    }
  }

  doc.save(nombre)
  const tel = (presu.telefonoCliente || '').replace(/\D/g, '')
  const url = tel
    ? `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank', 'noopener')
  return 'descargado'
}
