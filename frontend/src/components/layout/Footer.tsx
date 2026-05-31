export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-icon">💖</div>
            <div className="logo-text" style={{ fontSize: 18, color: '#fff' }}>
              معدن العلوم
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                للدر اسا ت العربية و الاسلامية
              </span>
            </div>
          </div>
          <p className="footer-tagline">علم الانسان مالهم يعْلم</p>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            He taught man what he knew not.
          </p>
        </div>

        <div>
          <div className="footer-heading">Quick Links</div>
          <ul className="footer-links">
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#subjects">Subjects</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#teachers">Teachers</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>
        </div>

        <div>
          <div className="footer-heading">تواصل معنا</div>
          <ul className="footer-links">
            <li>
              <a href="#">📱 WhatsApp</a>
            </li>
            <li>
              <a href="#">📧 Email</a>
            </li>
            <li>
              <a href="#">🌐 Website</a>
            </li>
            <li>
              <a href="#">📘 Facebook</a>
            </li>
            <li>
              <a href="#">📸 Instagram</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© 2025 معدن العلوم للدرا ساته العربية و الاسلامية. All rights reserved.</div>
        <div className="social-links">
          <a className="social-link" href="#">
            👍
          </a>
          <a className="social-link" href="#">
            👨‍💻
          </a>
          <a className="social-link" href="#">
            🎦
          </a>
          <a className="social-link" href="#">
            ▶️
          </a>
        </div>
      </div>
    </footer>
  )
}

