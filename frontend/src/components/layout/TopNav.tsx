export default function TopNav() {
  return (
    <nav>
      <div className="nav-inner">
        <div className="logo">
          <div className="logo-icon">💖</div>
          <div className="logo-text">
            معدن العلوم
            <span>Arabic &amp; Islamic Studies</span>
          </div>
        </div>
        <ul className="nav-links">
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
        <a href="/register" className="nav-cta" aria-label="Enroll Now">
          Enroll Now
        </a>
      </div>
    </nav>
  )
}

