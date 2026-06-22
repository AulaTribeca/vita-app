import Icon from './Icon.jsx'

const nav = [
  { key: 'today', label: 'Hoy', icon: 'Home' },
  { key: 'health', label: 'Salud', icon: 'Heart' },
  { key: 'appointments', label: 'Citas', icon: 'CalendarDays' },
  { key: 'medication', label: 'Medicación', icon: 'Pill' },
  { key: 'home', label: 'Hogar', icon: 'House' }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottomNav" aria-label="Navegación principal">
      {nav.map((item) => (
        <button
          key={item.key}
          className={active === item.key ? 'navItem active' : 'navItem'}
          type="button"
          onClick={() => onChange(item.key)}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
