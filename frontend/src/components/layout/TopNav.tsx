import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function TopNav() {
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <nav className={open ? 'nav-open' : ''}>
      <div className="nav-inner">
        <div className="logo">
          <div className="logo-icon">💖</div>
          <div className="logo-text">
            معدن العلوم
            <span>Arabic &amp; Islamic Studies</span>
          </div>
        </div>

        <button
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span className="hamburger" />
        </button>

        <ul className="nav-links" onClick={close}>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#subjects">Subjects</a>
          </li>
          <li>
            <a href="#pricing">Finance</a>
          </li>
          <li>
            <a href="#teachers">Teachers</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>

        <Link to="/register" className="nav-cta" aria-label="Enroll Now" onClick={close}>
          Enroll Now
        </Link>
      </div>
    </nav>
  )
}

