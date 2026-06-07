import { useEffect, useMemo, useState } from 'react'

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

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', [])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${apiBase}/api/testimonials`, { method: 'GET' })
        const json = (await res.json().catch(() => ({}))) as { testimonials?: Testimonial[]; error?: string }
        if (!res.ok) {
          const msg = typeof json.error === 'string' ? json.error : 'testimonials_failed'
          throw new Error(`HTTP ${res.status}: ${msg}`)
        }
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
  }, [apiBase])

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
        ) : (

          <div className="test-grid">
            {items.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', opacity: 0.8, textAlign: 'center' }}>No testimonials yet.</div>
            ) : (
              items.map((t, idx) => (
                <div key={t.created_at + idx} className="test-card fade-up">
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
              ))
            )}
          </div>
        )}
      </div>
    </section>
  )
}


