export const todayTasks = [
  { id: 1, title: 'Llevar volante al especialista', done: false, category: 'Salud' },
  { id: 2, title: 'Comprar medicación', done: true, category: 'Medicación' },
  { id: 3, title: 'Pagar factura de luz', done: false, category: 'Hogar' }
]

export const upcomingAppointments = [
  {
    id: 1,
    specialty: 'Endocrinología',
    professional: 'Dra. Laura Gómez',
    date: '20 mayo',
    day: 'MAR',
    time: '10:30',
    place: 'Hospital Virxe da Xunqueira',
    room: 'Sala 17',
    needsReferral: true
  }
]

export const medication = [
  {
    id: 1,
    name: 'Medicamento diario 1',
    detail: '1 comprimido',
    schedule: ['10:00', '22:00'],
    remaining: 14,
    lowStockInDays: 5,
    status: 'En stock'
  },
  {
    id: 2,
    name: 'Medicamento diario 2',
    detail: '1 comprimido',
    schedule: ['08:00'],
    remaining: 8,
    lowStockInDays: 3,
    status: 'Comprar pronto'
  }
]

export const homeItems = [
  { id: 1, title: 'Factura de luz', subtitle: 'Vence el 28 mayo', amount: '45,80 €', badge: '3 días', type: 'luz' },
  { id: 2, title: 'Hipoteca', subtitle: 'Vence el 01 junio', amount: '850,00 €', badge: '7 días', type: 'hipoteca' },
  { id: 3, title: 'Seguro del coche', subtitle: 'Vence el 12 junio', amount: '320,50 €', badge: '18 días', type: 'coche' },
  { id: 4, title: 'Obras', subtitle: 'Revisión de presupuestos', amount: '', badge: 'En curso', type: 'obras' }
]

export const quickHealth = [
  { key: 'bathroom', label: 'Baño', icon: 'ShowerHead', tone: 'teal' },
  { key: 'symptoms', label: 'Síntomas', icon: 'UserRound', tone: 'violet' },
  { key: 'sleep', label: 'Sueño', icon: 'Moon', tone: 'lilac' },
  { key: 'period', label: 'Regla', icon: 'Droplet', tone: 'pink' },
  { key: 'pain', label: 'Dolor', icon: 'Zap', tone: 'peach' },
  { key: 'mood', label: 'Ánimo', icon: 'Smile', tone: 'yellow' },
  { key: 'note', label: 'Nota rápida', icon: 'PencilLine', tone: 'blue', wide: true }
]
