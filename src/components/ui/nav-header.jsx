import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

function Tab({ children, href, setPosition }) {
  const ref = useRef(null)
  const location = useLocation()
  const active = location.pathname === href

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return
        const { width } = ref.current.getBoundingClientRect()
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft })
      }}
      className="relative z-10 cursor-pointer"
    >
      <Link
        to={href}
        className={`block px-4 py-2 text-[10px] uppercase tracking-widest transition-colors duration-200
          ${active ? 'text-white font-medium' : 'text-white/70 hover:text-white'}`}
      >
        {children}
      </Link>
    </li>
  )
}

function Cursor({ position }) {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 top-1 bottom-1 rounded-full bg-[#C9A352]/80"
    />
  )
}

export function NavHeader({ tabs = [] }) {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 })

  return (
    <ul
      className="relative flex w-fit rounded-full border border-white/15 bg-black/60 backdrop-blur-md p-1"
      onMouseLeave={() => setPosition(pv => ({ ...pv, opacity: 0 }))}
    >
      {tabs.map((tab) => (
        <Tab key={tab.label} href={tab.href} setPosition={setPosition}>
          {tab.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  )
}

export default NavHeader
