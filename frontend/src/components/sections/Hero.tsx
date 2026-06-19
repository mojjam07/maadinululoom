import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  const bgRef = useRef<HTMLDivElement | null>(null)
  const leftRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Parallax background subtle movement
    const onScroll = () => {
      if (!bgRef.current) return
      const y = window.scrollY
      // translate a small amount for parallax
      bgRef.current.style.transform = `translateY(${y * -0.06}px)`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Animate stat numbers when left column becomes visible
    const el = leftRef.current
    if (!el) return
    const nums = Array.from(el.querySelectorAll<HTMLElement>('.stat-num[data-target]'))

    const startCounters = () => {
      nums.forEach((n) => {
        const target = parseInt(n.dataset.target || '0', 10)
        if (isNaN(target) || target <= 0) return
        let current = 0
        const duration = 1200
        const start = performance.now()
        const step = (t: number) => {
          const progress = Math.min((t - start) / duration, 1)
          n.textContent = Math.floor(progress * target).toString()
          if (progress < 1) requestAnimationFrame(step)
          else n.textContent = target.toString()
        }
        requestAnimationFrame(step)
      })
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            startCounters()
            obs.disconnect()
          }
        }
      },
      { threshold: 0.25 },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="hero" id="home">
      <div ref={bgRef} className="hero-bg">
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
        <div ref={leftRef} className="hero-left fade-up">
          <div className="hero-badge">🌟 علم الانسان مالـم يعلم</div>
          <h1 className="hero-ar">
            تعلم<span> العربية</span> والعلوم الإسلامية
            <br />
            من أي مكان في العالم
          </h1>
          <p className="hero-en">Learn Arabic &amp; Islamic Studies Online — Anytime, Anywhere in the World</p>

          <div className="hero-btns">
            <Link to="/register" className="btn-primary">
              انضم الآن — Join Now
            </Link>
            <a href="#subjects" className="btn-outline">
              View Courses →
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-badge">
              <div className="stat-num" data-target="500">0</div>
              <div className="stat-lbl">طالب نشط</div>
            </div>
            <div className="stat-badge">
              <div className="stat-num" data-target="10">0</div>
              <div className="stat-lbl">مادة دراسية</div>
            </div>
            <div className="stat-badge">
              <div className="stat-num">🌍</div>
              <div className="stat-lbl">عالمي</div>
            </div>
          </div>
        </div>

        <div className="hero-right fade-up">
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

