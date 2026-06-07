export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <svg viewBox="0 0 1400 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon
                points="40,0 80,20 80,60 40,80 0,60 0,20"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="1400" height="800" fill="url(#geo)" />
        </svg>
      </div>

      <div className="geo-float" />
      <div className="geo-float" />
      <div className="geo-float" />

      <div className="hero-content">
        <div className="hero-left fade-up">
          <div className="hero-badge">🌟 علم الانسان مالـم يعلم</div>
          <h1 className="hero-ar">
            تعلم<span> العربية</span> والعلوم الإسلامية
            <br />
            من أي مكان في العالم
          </h1>
          <p className="hero-en">Learn Arabic &amp; Islamic Studies Online — Anytime, Anywhere in the World</p>

          <div className="hero-btns">
            <a href="/register" className="btn-primary">
              انضم الآن — Join Now
            </a>
            <a href="#subjects" className="btn-outline">
              View Courses →
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-badge">
              <div className="stat-num">500+</div>
              <div className="stat-lbl">طالب نشط</div>
            </div>
            <div className="stat-badge">
              <div className="stat-num">10+</div>
              <div className="stat-lbl">مادة دراسية</div>
            </div>
            <div className="stat-badge">
              <div className="stat-num">🌍</div>
              <div className="stat-lbl">عالمي</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="hero-card-main">
              <div className="hero-icon-ring">💖</div>
              <div className="hero-card-title">مدرسة معدن العلوم</div>
              <div className="hero-card-sub">Online Arabic &amp; Islamic Academy</div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(212,160,23,0.15)',
                    color: 'var(--gold)',
                    padding: '5px 12px',
                    borderRadius: 50,
                    fontSize: 11,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  🎓 Certified
                </span>
                <span
                  style={{
                    background: 'rgba(212,160,23,0.15)',
                    color: 'var(--gold)',
                    padding: '5px 12px',
                    borderRadius: 50,
                    fontSize: 11,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  📡 Live Classes
                </span>
                <span
                  style={{
                    background: 'rgba(212,160,23,0.15)',
                    color: 'var(--gold)',
                    padding: '5px 12px',
                    borderRadius: 50,
                    fontSize: 11,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  🌐 Global
                </span>
              </div>
            </div>

            <div className="floating-chip chip1">📌 Zoom Classes</div>
            <div className="floating-chip chip2">📚 Recordings</div>
            <div className="floating-chip chip3">✅ Certificates</div>
          </div>
        </div>
      </div>
    </section>
  )
}

