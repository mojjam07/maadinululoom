import { useMemo } from 'react'

type UpcomingClass = {
  id: string
  title: string
  date: string
  time: string
  room: string
}

const PLACEHOLDER_CLASSES: UpcomingClass[] = [
  { id: 'u1', title: 'Mathematics • Algebra', date: '2026-06-01', time: '16:00', room: 'Online' },
  { id: 'u2', title: 'Science • Earth & Space', date: '2026-06-03', time: '16:00', room: 'Lab 2' },
  { id: 'u3', title: 'Arabic • Grammar', date: '2026-06-05', time: '15:30', room: 'Online' },
]

export default function UpcomingClasses() {
  const classes = useMemo(() => PLACEHOLDER_CLASSES, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Upcoming classes</div>
      <div className="maadin-muted">Approximate schedule until a dedicated classes table exists.</div>

      <div className="maadin-upcoming-list" role="list">
        {classes.map((c) => (
          <div key={c.id} className="maadin-upcoming-item" role="listitem">
            <div className="maadin-upcoming-left">
              <div className="maadin-upcoming-title">{c.title}</div>
              <div className="maadin-upcoming-sub">{c.room}</div>
            </div>
            <div className="maadin-upcoming-right">
              <div className="maadin-upcoming-date">{c.date}</div>
              <div className="maadin-upcoming-time">{c.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="maadin-note">Tip: Step 7 will replace this with real schedule data.</div>
    </section>
  )
}


