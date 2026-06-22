import { useMemo, useState } from 'react'
import Logo from './components/Logo.jsx'
import Icon from './components/Icon.jsx'
import BottomNav from './components/BottomNav.jsx'
import { Card, SectionTitle } from './components/Card.jsx'
import { homeItems, medication, quickHealth, todayTasks, upcomingAppointments } from './data.js'
import { isSupabaseConfigured } from './lib/supabaseClient.js'

const todayLabel = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
}).format(new Date())

function Header({ title, subtitle, showLogo = false }) {
  return (
    <header className="screenHeader">
      <div>
        {showLogo ? <Logo /> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <button className="iconButton" type="button" aria-label="Ajustes">
        <Icon name="Bell" size={21} />
        <span className="dot" />
      </button>
    </header>
  )
}

function TodayScreen({ onNavigate }) {
  const pendingCount = todayTasks.filter((task) => !task.done).length
  const nextAppointment = upcomingAppointments[0]

  return (
    <main className="screen">
      <Header title="Hola, Patricia 👋" subtitle={todayLabel} showLogo />
      {!isSupabaseConfigured ? (
        <div className="setupNotice">
          Modo diseño: Supabase se conectará en el siguiente nivel.
        </div>
      ) : null}

      <div className="summaryGrid">
        <Card tone="lilac">
          <span className="metric">{pendingCount}</span>
          <span>tareas hoy</span>
          <Icon name="CheckCircle2" />
        </Card>
        <Card tone="teal">
          <span className="metric">2</span>
          <span>tomas hoy</span>
          <Icon name="Pill" />
        </Card>
        <Card tone="blue">
          <span className="metric">20</span>
          <span>mayo, 10:30</span>
          <Icon name="CalendarDays" />
        </Card>
        <Card tone="coral">
          <span className="metric">1</span>
          <span>volante pendiente</span>
          <Icon name="FileText" />
        </Card>
      </div>

      <SectionTitle>Lo importante de hoy</SectionTitle>
      <Card className="taskList">
        {todayTasks.map((task) => (
          <label className="taskRow" key={task.id}>
            <span className={task.done ? 'check checked' : 'check'} />
            <span>{task.title}</span>
            <em>{task.category}</em>
          </label>
        ))}
      </Card>

      <Card className="appointmentCard" tone="mint" onClick={() => onNavigate('appointments')}>
        <div className="appointmentDate">
          <strong>20</strong>
          <span>MAY</span>
        </div>
        <div>
          <h3>Próxima cita</h3>
          <p>{nextAppointment.specialty}, {nextAppointment.time}</p>
          <small>{nextAppointment.place}</small>
        </div>
        <Icon name="CalendarDays" />
      </Card>

      <div className="quickActions">
        <button type="button" onClick={() => onNavigate('health')}><Icon name="Heart" />Registro salud</button>
        <button type="button" onClick={() => onNavigate('appointments')}><Icon name="UploadCloud" />Guardar volante</button>
        <button type="button" onClick={() => onNavigate('medication')}><Icon name="ShoppingCart" />Medicación</button>
        <button type="button" onClick={() => onNavigate('home')}><Icon name="House" />Hogar</button>
      </div>
    </main>
  )
}

function HealthScreen() {
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vita-health-records') || '[]')
    } catch {
      return []
    }
  })

  function addRecord(item) {
    const next = [
      {
        id: crypto.randomUUID(),
        type: item.label,
        createdAt: new Date().toISOString(),
        note: item.label === 'Baño' ? 'Registro rápido de baño' : 'Registro rápido'
      },
      ...records
    ]
    setRecords(next)
    localStorage.setItem('vita-health-records', JSON.stringify(next))
  }

  return (
    <main className="screen">
      <Header title="Registro rápido" subtitle="¿Qué necesitas guardar hoy?" />
      <div className="quickGrid">
        {quickHealth.map((item) => (
          <button
            key={item.key}
            className={`quickTile ${item.tone} ${item.wide ? 'wide' : ''}`}
            type="button"
            onClick={() => addRecord(item)}
          >
            <Icon name={item.icon} size={30} />
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <SectionTitle action="Ver todo">Actividad reciente</SectionTitle>
      <Card className="activityList">
        {records.length === 0 ? (
          <p className="empty">Todavía no hay registros. Usa los botones superiores para probar la pantalla.</p>
        ) : (
          records.slice(0, 5).map((record) => (
            <div className="activityRow" key={record.id}>
              <Icon name="NotebookText" />
              <div>
                <strong>{record.type}</strong>
                <span>{record.note}</span>
              </div>
              <small>{new Date(record.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
          ))
        )}
      </Card>
    </main>
  )
}

function AppointmentsScreen() {
  return (
    <main className="screen">
      <Header title="Mis citas" subtitle="Citas, volantes y acciones pendientes" />
      <div className="tabs">
        <button className="active" type="button">Próximas</button>
        <button type="button">Historial</button>
      </div>

      <SectionTitle>Próxima cita</SectionTitle>
      <Card className="medicalCard" tone="mint">
        <div className="dateBox">
          <span>MAY</span>
          <strong>20</strong>
          <span>MAR</span>
        </div>
        <div>
          <h3>Endocrinología</h3>
          <p>10:30, Hospital Virxe da Xunqueira</p>
          <small>Sala 17</small>
        </div>
      </Card>

      <Card className="warningCard">
        <div>
          <Icon name="Bell" />
          <h3>Acción pendiente</h3>
          <p>Después de la cita, guarda el volante en Salud. Si ya lo tienes, VITA te recordará llevarlo al especialista.</p>
        </div>
        <button type="button"><Icon name="UploadCloud" /> Guardar volante</button>
        <button className="secondary" type="button"><Icon name="FileText" /> Llevar volante</button>
      </Card>
    </main>
  )
}

function MedicationScreen() {
  const nextPurchase = useMemo(() => Math.min(...medication.map((item) => item.lowStockInDays)), [])

  return (
    <main className="screen">
      <Header title="Mi medicación" subtitle="Stock, tomas y avisos de compra" />
      <div className="tabs">
        <button className="active" type="button">Hoy</button>
        <button type="button">Stock</button>
        <button type="button">Historial</button>
      </div>

      <div className="medicationList">
        {medication.map((item) => (
          <Card className="medicineCard" key={item.id}>
            <div className="medicineIcon"><Icon name="Pill" /></div>
            <div className="medicineInfo">
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
              <div className="timeRow">
                {item.schedule.map((time) => <span key={time}>{time}</span>)}
              </div>
              <small>Quedan {item.remaining} comprimidos</small>
              <div className="progress"><span style={{ width: `${Math.min(item.remaining * 5, 100)}%` }} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Card tone="coral" className="purchaseAlert">
        <div>
          <small>Recordatorio</small>
          <h3>Comprar medicación en {nextPurchase} días</h3>
        </div>
        <Icon name="ShoppingCart" size={34} />
      </Card>
    </main>
  )
}

function HomeScreen() {
  return (
    <main className="screen">
      <Header title="Hogar" subtitle="Casa, pagos, coche y gestiones compartidas" />
      <div className="household">
        <span>P</span>
        <span>R</span>
        <button type="button"><Icon name="Plus" size={16} /></button>
      </div>

      <SectionTitle>Próximos pagos y gestiones</SectionTitle>
      <div className="homeList">
        {homeItems.map((item) => (
          <Card className="homeItem" key={item.id}>
            <div className={`homeIcon ${item.type}`}><Icon name={item.type === 'obras' ? 'Hammer' : item.type === 'coche' ? 'Car' : item.type === 'luz' ? 'Zap' : 'House'} /></div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
            <div className="amount">
              <strong>{item.amount}</strong>
              <span>{item.badge}</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle action="Ver todo">Lista compartida</SectionTitle>
      <Card className="taskList">
        {['Comprar bombillas', 'Pedir cita ITV', 'Pintar habitación', 'Revisar presupuesto obras'].map((text, index) => (
          <label className="taskRow" key={text}>
            <span className={index < 2 ? 'check checked' : 'check'} />
            <span>{text}</span>
          </label>
        ))}
      </Card>
    </main>
  )
}

function App() {
  const [activeScreen, setActiveScreen] = useState('today')

  return (
    <div className="appShell">
      <div className="phoneFrame">
        {activeScreen === 'today' ? <TodayScreen onNavigate={setActiveScreen} /> : null}
        {activeScreen === 'health' ? <HealthScreen /> : null}
        {activeScreen === 'appointments' ? <AppointmentsScreen /> : null}
        {activeScreen === 'medication' ? <MedicationScreen /> : null}
        {activeScreen === 'home' ? <HomeScreen /> : null}
        <BottomNav active={activeScreen} onChange={setActiveScreen} />
      </div>
    </div>
  )
}

export default App
