import { useMemo } from 'react'

type CourseProgress = {
  id: string
  title: string
  progressPct: number
  completedLessons: number
  totalLessons: number
  locked?: boolean
}

const PLACEHOLDER_COURSES: CourseProgress[] = [
  { id: 'c1', title: 'Mathematics: Algebra Basics', progressPct: 62, completedLessons: 12, totalLessons: 20 },
  { id: 'c2', title: 'Science: Earth & Space', progressPct: 18, completedLessons: 3, totalLessons: 17 },
  { id: 'c3', title: 'Arabic: Grammar (Level 1)', progressPct: 0, completedLessons: 0, totalLessons: 14, locked: true },
]

export default function CoursesProgress() {
  const courses = useMemo(() => PLACEHOLDER_COURSES, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Enrolled courses</div>
      <div className="maadin-muted">Progress overview (not wired yet: summary endpoint not available).</div>


      <div className="maadin-list" aria-label="Courses progress">
        {courses.map((c) => {
          const pct = Math.max(0, Math.min(100, c.progressPct))
          return (
            <div key={c.id} className={`maadin-row ${c.locked ? 'is-locked' : ''}`}>
              <div className="maadin-row-main">
                <div className="maadin-row-title">{c.title}</div>
                <div className="maadin-row-sub">
                  {c.locked ? 'Locked' : `${c.completedLessons}/${c.totalLessons} lessons`}
                </div>
              </div>
              <div className="maadin-row-side">
                <div className="maadin-progress-text">{c.locked ? '—' : `${Math.round(pct)}%`}</div>
              </div>
              <div className="maadin-row-bar" aria-hidden>
                <div className="maadin-progress">
                  <div className="maadin-progress-bar" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}


