import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

type Testimonial = {
  stars: number | null
  text: string
  avatar: string | null
  name: string | null
  country: string | null
  role: string | null
  created_at: string
}

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const json = await apiFetch<{ testimonials?: Testimonial[] }>('/api/testimonials')
        if (mounted) setItems(json.testimonials || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'testimonials_failed')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (items.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [items.length])

  const visibleItems = items.length > 0 ? [
    items[(currentIndex - 1 + items.length) % items.length],
    items[currentIndex],
    items[(currentIndex + 1) % items.length],
  ] : []

  return (
    <section className="testimonials" id="testimonials">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">آراء طلابنا</h2>
          <p className="section-sub">What parents and students say about معدن العلوم</p>
        </div>

        {loading ? (
          <div style={{ marginTop: 40, opacity: 0.8, textAlign: 'center' }}>Loading...</div>
        ) : error ? (
          <div style={{ marginTop: 40, opacity: 0.95, textAlign: 'center', padding: '0 12px' }}>
            Failed to load testimonials: {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 40, opacity: 0.8, textAlign: 'center' }}>No testimonials yet.</div>
        ) : (
          <div className="testimonials-carousel">
            <div className="carousel-track">
              {visibleItems.map((t, idx) => {
                const isCenter = idx === 1
                return (
                  <div
                    key={t.created_at + idx}
                    className={`test-card carousel-card ${isCenter ? 'center' : ''} fade-up`}
                    style={{
                      opacity: isCenter ? 1 : 0.5,
                      transform: isCenter ? 'scale(1)' : 'scale(0.88)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div className="test-stars">{t.stars ? '★★★★★' : '★★★★★'}</div>
                    <p className="test-text">{t.text}</p>
                    <div className="test-author">
                      <div className="test-avatar">{t.avatar || '🙂'}</div>
                      <div>
                        <div className="test-name">{t.name || 'Student'}</div>
                        <div className="test-country">
                          <span className="country-badge">{t.country || '—'}</span> — {t.role || 'Student'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Carousel controls */}
            <div className="carousel-controls">
              <button
                className="carousel-btn carousel-prev"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
                aria-label="Previous testimonial"
              >
                ←
              </button>
              <div className="carousel-dots">
                {items.map((_, idx) => (
                  <div
                    key={idx}
                    className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      background: idx === currentIndex ? 'var(--gold)' : 'rgba(212,160,23,0.3)',
                      cursor: 'pointer',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
              <button
                className="carousel-btn carousel-next"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                aria-label="Next testimonial"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


