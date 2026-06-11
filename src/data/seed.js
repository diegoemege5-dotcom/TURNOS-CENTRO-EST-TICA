// Datos iniciales de ejemplo para arrancar la app con contenido real.
// Se cargan una sola vez; después todo se edita desde la interfaz.

export const TIPOS_EVENTO = [
  'Cumpleaños de 15',
  'Casamiento',
  'Cumpleaños',
  'Evento corporativo',
  'Bautismo / Comunión',
  'Aniversario',
  'Otro',
]

export const CATEGORIAS_PLATO = [
  'Recepción / Finger food',
  'Entrada',
  'Plato principal',
  'Postre',
  'Mesa dulce',
  'Bebidas',
]

export const UNIDADES = ['kg', 'g', 'l', 'ml', 'unidad', 'docena', 'paquete', 'atado']

export const ESTADOS_EVENTO = ['Consulta', 'Confirmado', 'Señado', 'Realizado', 'Cancelado']

export const ESTADOS_PRESUPUESTO = ['Borrador', 'Enviado', 'Aceptado', 'Rechazado']

export const seedSettings = {
  nombre: 'Catering Familiar',
  slogan: 'Sabores que hacen tu evento inolvidable',
  telefono: '',
  email: '',
  direccion: '',
  instagram: '',
  margen: 70,
  seniaPct: 30,
  validezDias: 15,
  condiciones:
    'Los precios incluyen elaboración y presentación de los platos. ' +
    'Para reservar la fecha se requiere una seña. El saldo se abona 48 hs antes del evento. ' +
    'El número final de invitados debe confirmarse 7 días antes del evento.',
}

export const seedPlatos = [
  {
    id: 'seed-empanadas',
    nombre: 'Empanadas criollas',
    categoria: 'Recepción / Finger food',
    rinde: 12,
    ingredientes: [
      { id: 'i1', nombre: 'Tapas de empanada', cantidad: 1, unidad: 'docena', costoUnitario: 1800 },
      { id: 'i2', nombre: 'Carne picada', cantidad: 0.5, unidad: 'kg', costoUnitario: 7500 },
      { id: 'i3', nombre: 'Cebolla', cantidad: 0.3, unidad: 'kg', costoUnitario: 900 },
      { id: 'i4', nombre: 'Huevo', cantidad: 2, unidad: 'unidad', costoUnitario: 250 },
      { id: 'i5', nombre: 'Condimentos', cantidad: 1, unidad: 'unidad', costoUnitario: 500 },
    ],
    costoExtraPorcion: 50,
    notas: 'Rinde 12 unidades. Se calcula 1 porción = 1 empanada.',
  },
  {
    id: 'seed-lomo',
    nombre: 'Lomo al malbec con papas rústicas',
    categoria: 'Plato principal',
    rinde: 10,
    ingredientes: [
      { id: 'i1', nombre: 'Lomo', cantidad: 2.5, unidad: 'kg', costoUnitario: 18000 },
      { id: 'i2', nombre: 'Papas', cantidad: 3, unidad: 'kg', costoUnitario: 1200 },
      { id: 'i3', nombre: 'Vino malbec (cocción)', cantidad: 0.75, unidad: 'l', costoUnitario: 4000 },
      { id: 'i4', nombre: 'Crema', cantidad: 0.5, unidad: 'l', costoUnitario: 3600 },
      { id: 'i5', nombre: 'Verduras y aromáticas', cantidad: 1, unidad: 'unidad', costoUnitario: 2500 },
    ],
    costoExtraPorcion: 300,
    notas: '',
  },
  {
    id: 'seed-mesa-dulce',
    nombre: 'Mesa dulce clásica (por persona)',
    categoria: 'Mesa dulce',
    rinde: 20,
    ingredientes: [
      { id: 'i1', nombre: 'Brownies', cantidad: 2, unidad: 'unidad', costoUnitario: 800 },
      { id: 'i2', nombre: 'Mini lemon pie', cantidad: 20, unidad: 'unidad', costoUnitario: 650 },
      { id: 'i3', nombre: 'Alfajorcitos de maicena', cantidad: 40, unidad: 'unidad', costoUnitario: 350 },
      { id: 'i4', nombre: 'Frutillas con chocolate', cantidad: 1, unidad: 'kg', costoUnitario: 6000 },
    ],
    costoExtraPorcion: 200,
    notas: 'Cantidades pensadas para 20 personas.',
  },
]

export const seedMenus = [
  {
    id: 'seed-menu-15',
    nombre: 'Menú Quince Clásico',
    tipoEvento: 'Cumpleaños de 15',
    descripcion: 'Recepción + plato principal + mesa dulce. Ideal para fiestas de 15 con cena formal.',
    cursos: [
      { id: 'c1', nombre: 'Recepción', platoIds: ['seed-empanadas'] },
      { id: 'c2', nombre: 'Plato principal', platoIds: ['seed-lomo'] },
      { id: 'c3', nombre: 'Mesa dulce', platoIds: ['seed-mesa-dulce'] },
    ],
    precioPersona: 0,
  },
]
