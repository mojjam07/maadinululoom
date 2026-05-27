import { useEffect, useState } from 'react'


type Subject = { id: string; title?: string }

type TeacherDashboardProps = {
  onOpenUpload?: () => void
  onOpenAssignments?: () => void
  onOpenGrading?: () => void
}

export default function TeacherDashboard({
  onOpenUpload,
  onOpenAssignments,
  onOpenGrading,
}: TeacherDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // No dedicated teacher-classes endpoint in this phase.
        // Keep dashboard lightweight; show a placeholder count when subjects loading is not available.
        // If later you add an endpoint, wire it here.
        // Currently: we just leave subjects empty.
        await new Promise((r) => setTimeout(r, 150))
        if (!mounted) return
        setSubjects([])
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'failed_to_load')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Teacher dashboard</div>
      <div className="maadin-muted">Manage lessons, create assignments, and grade submissions.</div>

      {error && <div style={{ color: '#b00020', marginTop: 10 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14 }}>
        <div className="maadin-card" style={{ padding: 14 }}>
          <div className="maadin-card-kpi" style={{ fontSize: 22, marginBottom: 8 }}>
            {loading ? '...' : '—'}
          </div>
          <div className="maadin-card-label">My subjects</div>
        </div>
        <div className="maadin-card" style={{ padding: 14 }}>
          <div className="maadin-card-kpi" style={{ fontSize: 22, marginBottom: 8 }}>
            {subjects.length}
          </div>
          <div className="maadin-card-label">Assigned</div>
        </div>
        <div className="maadin-card" style={{ padding: 14 }}>
          <div className="maadin-card-kpi" style={{ fontSize: 22, marginBottom: 8 }}>
            —
          </div>
          <div className="maadin-card-label">Submissions pending</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <button className="maadin-btn maadin-btn-emerald" type="button" onClick={onOpenUpload}>
          Upload lesson
        </button>
        <button className="maadin-btn maadin-btn-ghost" type="button" onClick={onOpenAssignments}>
          Create assignment
        </button>
        <button className="maadin-btn maadin-btn-ghost" type="button" onClick={onOpenGrading}>
          Grade submissions
        </button>
      </div>
    </section>
  )
}

