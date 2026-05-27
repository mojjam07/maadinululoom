import { useEffect, useState } from 'react'
import { getLessonsBySubject, getSubjects } from '../../lib/api'

type LessonCard = {
  id: string
  title: string
  subject: string
  order: number
  status: 'completed' | 'in_progress' | 'locked'
}

export default function LessonsPanel() {
  const [lessons, setLessons] = useState<LessonCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        setLoading(true)
        setError(null)

        // Best-effort: choose first subject and load its lessons.
        // (No enrolled-subjects endpoint exists yet.)
        const { subjects } = await getSubjects()
        const first = subjects?.[0]
        if (!first) {
          setLessons([])
          return
        }

        const { lessons: lessonRows } = await getLessonsBySubject(first.id)

        setLessons(
          (lessonRows || []).map((l, idx) => ({
            id: l.id,
            title: l.title,
            subject: first.name_en || first.name_ar || first.id,
            order: idx + 1,
            // Progress/join with lesson_progress not implemented in existing endpoints.
            status: 'locked',
          }))
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : 'load_failed')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Lessons</div>
      <div className="maadin-muted">Continue where you left off (lesson list wired; progress status pending).</div>

      <div className="maadin-lessons-grid">
        {loading ? (
          <div style={{ padding: 12, color: 'rgba(0,0,0,0.55)', fontFamily: 'Tajawal, sans-serif' }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: 12, color: '#b00020', fontFamily: 'Tajawal, sans-serif' }}>{error}</div>
        ) : (
          lessons.map((l) => {
            const statusClass =
              l.status === 'completed' ? 'is-completed' : l.status === 'in_progress' ? 'is-in-progress' : 'is-locked'

            return (
              <div key={l.id} className={`maadin-lesson-card ${statusClass}`}>
                <div className="maadin-lesson-top">
                  <div className="maadin-lesson-subject">{l.subject}</div>
                  <div className="maadin-lesson-order">#{l.order}</div>
                </div>
                <div className="maadin-lesson-title">{l.title}</div>

                <div className="maadin-lesson-meta">
                  {l.status === 'completed' && (
                    <span className="maadin-pill maadin-pill-completed">Completed</span>
                  )}
                  {l.status === 'in_progress' && (
                    <span className="maadin-pill maadin-pill-active">In progress</span>
                  )}
                  {l.status === 'locked' && <span className="maadin-pill maadin-pill-locked">Locked</span>}
                </div>

                <div className="maadin-lesson-actions">
                  <button
                    className="maadin-btn maadin-btn-emerald"
                    disabled={l.status === 'locked'}
                    type="button"
                  >
                    {l.status === 'completed' ? 'Review' : l.status === 'in_progress' ? 'Continue' : 'Start'}
                  </button>
                  <button
                    className="maadin-btn maadin-btn-ghost"
                    disabled={l.status === 'locked'}
                    type="button"
                  >
                    Details
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}



