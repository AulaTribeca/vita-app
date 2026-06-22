export function Card({ children, className = '', tone = '' }) {
  return <section className={`card ${tone} ${className}`}>{children}</section>
}

export function SectionTitle({ children, action }) {
  return (
    <div className="sectionTitle">
      <h2>{children}</h2>
      {action ? <button type="button">{action}</button> : null}
    </div>
  )
}
