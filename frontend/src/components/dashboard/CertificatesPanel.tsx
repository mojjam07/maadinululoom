import { useEffect, useMemo, useState } from 'react'
import { getMyCertificates, type CertificateItem } from '../../lib/api'

export default function CertificatesPanel() {
  const [items, setItems] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stable = useMemo(() => items, [items])

  useEffect(() => {
    let mounted = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const json = await getMyCertificates()
        if (mounted) setItems(json.certificates || [])
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'load_failed'
        if (mounted) {
          setError(msg)
          setItems([])
        }
      } finally {
        if (mounted) setLoading(false)
      }

    }

    void run()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Certificates</div>
      <div className="maadin-muted">Your issued certificates (PDF links are signed by the API).</div>

      {error && <div style={{ color: '#b00020', marginTop: 10 }}>{error}</div>}

      {loading ? (
        <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.55)', fontFamily: 'Tajawal, sans-serif' }}>Loading…</div>
      ) : stable.length === 0 ? (
        <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.55)', fontFamily: 'Tajawal, sans-serif' }}>No certificates yet.</div>
      ) : (
        <div className="maadin-list" aria-label="Certificates list">
          {stable.map((c) => (
            <div key={c.id ?? c.cert_id} className="maadin-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
              <div className="maadin-row-main">
                <div className="maadin-row-title">
                  {typeof c.subject_name === 'string'
                    ? c.subject_name
                    : c.subject_name?.name_en || c.subject_name?.name_ar || c.subject_id || 'Certificate'}
                </div>
                <div className="maadin-row-sub">
                  Issued: {c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}
                </div>
              </div>

              <div className="maadin-row-side">
                <span className={`maadin-pill ${c.status === 'active' ? 'maadin-pill-active' : 'maadin-pill-locked'}`}>
                  {c.status}
                </span>
              </div>

              <div className="maadin-table-col-actions">
                {c.pdf_url ? (
                  <a
                    className="maadin-btn maadin-btn-emerald"
                    href={c.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    View PDF
                  </a>
                ) : (
                  <button className="maadin-btn maadin-btn-ghost" type="button" disabled>
                    No PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

