export const negocio = {
  nombre: 'Studio Bellas',
  descripcion: 'Centro de estética integral',
}

export const profesionales = [
  { id: '1', nombre: 'Laura Gómez',     especialidad: 'Peluquería & Color' },
  { id: '2', nombre: 'Sofía Martínez',  especialidad: 'Manicura & Pedicura' },
  { id: '3', nombre: 'Diego Fernández', especialidad: 'Estética facial' },
]

export const servicios = [
  { id: '1', nombre: 'Corte de pelo',   duracion: 45,  precio: 2500 },
  { id: '2', nombre: 'Manicura',        duracion: 60,  precio: 1800 },
  { id: '3', nombre: 'Limpieza facial', duracion: 90,  precio: 4500 },
  { id: '4', nombre: 'Tinte',           duracion: 120, precio: 6000 },
  { id: '5', nombre: 'Pedicura',        duracion: 75,  precio: 2200 },
]

export const turnosHoy = [
  {
    id: '1',
    hora: '09:00', horaFin: '09:45',
    cliente:      { nombre: 'María Rodríguez',  telefono: '+54 11 1234-5678' },
    servicio:     'Corte de pelo',
    profesional:  'Laura Gómez',
    estado:       'completado',
    precio:       2500,
  },
  {
    id: '2',
    hora: '09:30', horaFin: '10:30',
    cliente:      { nombre: 'Ana López',         telefono: '+54 11 2345-6789' },
    servicio:     'Manicura',
    profesional:  'Sofía Martínez',
    estado:       'completado',
    precio:       1800,
  },
  {
    id: '3',
    hora: '10:30', horaFin: '12:00',
    cliente:      { nombre: 'Valentina Torres',  telefono: '+54 11 3456-7890' },
    servicio:     'Limpieza facial',
    profesional:  'Diego Fernández',
    estado:       'en_curso',
    precio:       4500,
  },
  {
    id: '4',
    hora: '11:00', horaFin: '11:45',
    cliente:      { nombre: 'Camila Pérez',      telefono: '+54 11 4567-8901' },
    servicio:     'Corte de pelo',
    profesional:  'Laura Gómez',
    estado:       'confirmado',
    precio:       2500,
  },
  {
    id: '5',
    hora: '14:00', horaFin: '15:15',
    cliente:      { nombre: 'Lucía García',      telefono: '+54 11 5678-9012' },
    servicio:     'Pedicura',
    profesional:  'Sofía Martínez',
    estado:       'pendiente',
    precio:       2200,
  },
  {
    id: '6',
    hora: '15:00', horaFin: '17:00',
    cliente:      { nombre: 'Florencia Díaz',    telefono: '+54 11 6789-0123' },
    servicio:     'Tinte',
    profesional:  'Laura Gómez',
    estado:       'pendiente',
    precio:       6000,
  },
  {
    id: '7',
    hora: '16:30', horaFin: '17:30',
    cliente:      { nombre: 'Martina Sánchez',   telefono: '+54 11 7890-1234' },
    servicio:     'Manicura',
    profesional:  'Sofía Martínez',
    estado:       'pendiente',
    precio:       1800,
  },
]

export const turnosProximos = [
  {
    id: '8',
    fecha: 'Mañana',         hora: '10:00',
    cliente:     { nombre: 'Paula Morales' },
    servicio:    'Corte de pelo',
    profesional: 'Laura Gómez',
    estado:      'confirmado',
  },
  {
    id: '9',
    fecha: 'Mañana',         hora: '11:30',
    cliente:     { nombre: 'Daniela Ruiz' },
    servicio:    'Limpieza facial',
    profesional: 'Diego Fernández',
    estado:      'pendiente',
  },
  {
    id: '10',
    fecha: 'Mañana',         hora: '15:00',
    cliente:     { nombre: 'Carolina Vega' },
    servicio:    'Tinte',
    profesional: 'Laura Gómez',
    estado:      'confirmado',
  },
  {
    id: '11',
    fecha: 'Pasado mañana',  hora: '09:30',
    cliente:     { nombre: 'Romina Castro' },
    servicio:    'Manicura',
    profesional: 'Sofía Martínez',
    estado:      'pendiente',
  },
  {
    id: '12',
    fecha: 'Pasado mañana',  hora: '14:00',
    cliente:     { nombre: 'Gabriela Luna' },
    servicio:    'Pedicura',
    profesional: 'Sofía Martínez',
    estado:      'confirmado',
  },
]
