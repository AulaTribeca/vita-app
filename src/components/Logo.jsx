export default function Logo() {
  return (
    <div className="logoWrap" aria-label="VITA">
      <svg className="logoMark" viewBox="0 0 128 128" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="leafA" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#60d4cf"/>
            <stop offset="1" stopColor="#7c5fd6"/>
          </linearGradient>
          <linearGradient id="leafB" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#9c7de5"/>
            <stop offset="1" stopColor="#4bb7b0"/>
          </linearGradient>
        </defs>
        <path d="M64 18c14 16 17 34 4 52-17-12-20-31-4-52Z" fill="#7c5fd6"/>
        <path d="M34 38c21 5 33 17 33 38-21 0-34-14-33-38Z" fill="url(#leafA)"/>
        <path d="M93 42c-1 22-13 35-34 38 0-22 12-35 34-38Z" fill="url(#leafB)"/>
        <path d="M63 73c-8 15-10 27-8 37" fill="none" stroke="#433463" strokeWidth="7" strokeLinecap="round"/>
      </svg>
      <span>VITA</span>
    </div>
  )
}
