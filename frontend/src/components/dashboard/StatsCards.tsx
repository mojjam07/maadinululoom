import { useEffect, useState } from 'react'
import { getMyAttendance } from '../../lib/api'

type Stats = {
  activeCourses: number
  attendancePct: number
  lessonsDone: number
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    activeCourses: 0,
    attendancePct: 0,
    lessonsDone: 0,
  })

  useEffect(() => {
    async function run() {
      try {
        const { attendance } = await getMyAttendance()

        // Backend does not yet provide a schedule table for true attendance%.
        // Approximation: in last 7 days, attendance% = (distinct attendance days with duration>0) / 7 * 100.
        const now = Date.now()
        const cutoff = now - 7 * 24 * 60 * 60 * 1000
        const days = new Set<string>()

        for (const a of attendance) {
          if (!a.joined_at) continue
          const t = new Date(a.joined_at).getTime()
          if (!Number.isFinite(t) || t < cutoff) continue
          const dur = typeof a.duration_mins === 'number' ? a.duration_mins : 0
          if (dur > 0) days.add(new Date(t).toISOString().slice(0, 10))
        }

        const attendancePct = clamp((days.size / 7) * 100, 0, 100)

        setStats((s) => ({ ...s, attendancePct }))
      } catch {
        // keep placeholders
      }
    }

    void run()
  }, [])

  return (
    <section className="maadin-stats">
      <div className="maadin-card">
        <div className="maadin-card-kpi">{stats.activeCourses}</div>
        <div className="maadin-card-label">Active courses</div>
      </div>
      <div className="maadin-card">
        <div className="maadin-card-kpi">{Math.round(stats.attendancePct)}%</div>
        <div className="maadin-card-label">Attendance %</div>
      </div>
      <div className="maadin-card">
        <div className="maadin-card-kpi">{stats.lessonsDone}</div>
        <div className="maadin-card-label">Lessons done</div>
      </div>
    </section>
  )
}


