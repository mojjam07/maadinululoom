import { useMemo } from 'react'

type RecentLesson = {
  id: string
  title: string
  subject: string
  updatedAt: string
}

const PLACEHOLDER_RECENTS: RecentLesson[] = [
  { id: 'r1', title: 'Variables: Warm-up', subject: 'Mathematics', updatedAt: 'Today, 10:20' },
  { id: 'r2', title: 'Equations: Quick Practice', subject: 'Mathematics', updatedAt: 'Yesterday' },
  { id: 'r3', title: 'Grammar: Adjectives', subject: 'Arabic', updatedAt: '2 days ago' },
]

export default function RecentLessons() {
  const items = useMemo(() => PLACEHOLDER_RECENTS, [])

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Recent lessons</div>
      <div className="maadin-muted">Last activity items with thumbnails (UI ready).</div>

      <div className="maadin-recent-list" role="list">
        {items.map((it) => (
          <div key={it.id} className="maadin-recent-item" role="listitem">
            <div className="maadin-thumb" aria-hidden />
            <div className="maadin-recent-main">
              <div className="maadin-recent-title">{it.title}</div>
              <div className="maadin-recent-sub">{it.subject}</div>
            </div>
            <div className="maadin-recent-right">
              <div className="maadin-recent-time">{it.updatedAt}</div>
              <button className="maadin-btn maadin-btn-ghost maadin-recent-action" type="button">
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


