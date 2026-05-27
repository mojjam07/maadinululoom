import { useEffect, useMemo, useState } from 'react'
import { getMyAssignments } from '../../lib/api'

type AssignmentStatus = 'not_started' | 'submitted' | 'graded'

type AssignmentRow = {
  id: string
  title: string
  dueDate: string
  status: AssignmentStatus
  grade?: string
}

function statusPill(status: AssignmentStatus) {
  if (status === 'graded') return { label: 'Graded', className: 'maadin-pill-completed' }
  if (status === 'submitted') return { label: 'Submitted', className: 'maadin-pill-active' }
  return { label: 'Not started', className: 'maadin-pill-locked' }
}

export default function AssignmentsPanel() {
  const [items, setItems] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stableItems = useMemo(() => items, [items])

  useEffect(() => {
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const json = await getMyAssignments()

        // Current backend assignments endpoint does not include submission/submission grade.
        // So we mark everything as not_started for now.
        const normalized: AssignmentRow[] = (json.assignments || []).map((a) => ({
          id: a.id,
          title: a.title,
          dueDate: a.due_date ? new Date(a.due_date).toISOString().slice(0, 10) : '—',
          status: 'not_started',
        }))

        setItems(normalized)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'load_failed')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Assignments</div>
      <div className="maadin-muted">Due dates + status (status populated once submissions are joined to assignments).</div>

      <div className="maadin-table" role="table" aria-label="Assignments">
        <div className="maadin-table-head" role="row">
          <div role="columnheader">Assignment</div>
          <div role="columnheader">Due</div>
          <div role="columnheader">Status</div>
          <div role="columnheader" className="maadin-table-col-actions">
            Action
          </div>
        </div>

        <div className="maadin-table-body" role="rowgroup">
          {loading ? (
            <div style={{ padding: 12, color: 'rgba(0,0,0,0.55)', fontFamily: 'Tajawal, sans-serif' }}>Loading…</div>
          ) : error ? (
            <div style={{ padding: 12, color: '#b00020', fontFamily: 'Tajawal, sans-serif' }}>{error}</div>
          ) : stableItems.length === 0 ? (
            <div style={{ padding: 12, color: 'rgba(0,0,0,0.55)', fontFamily: 'Tajawal, sans-serif' }}>No assignments.</div>
          ) : (
            stableItems.map((a) => {
              const pill = statusPill(a.status)
              return (
                <div key={a.id} className="maadin-table-row" role="row">
                  <div className="maadin-table-cell">
                    <div className="maadin-table-title">{a.title}</div>
                  </div>
                  <div className="maadin-table-cell">
                    <div className="maadin-table-sub">{a.dueDate}</div>
                  </div>
                  <div className="maadin-table-cell">
                    <div className="maadin-pill-wrap">
                      <span className={`maadin-pill ${pill.className}`}>{pill.label}</span>
                      {a.grade && <span className="maadin-grade">{a.grade}</span>}
                    </div>
                  </div>
                  <div className="maadin-table-cell maadin-table-col-actions">
                    <button className="maadin-btn maadin-btn-ghost" type="button">
                      View
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}





