import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api'

type TabKey = 'dashboard' | 'manage_classes' | 'assign_teachers' | 'attendance_stats'

type ClassRow = {
  id: string
  topic: string
  start_time: string
  duration_mins: number
  zoom_link: string
  recording_url: string | null
  canceled_at: string | null
}

export default function AdminPortalPage() {

  const [tab, setTab] = useState<TabKey>('dashboard')

  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [scheduleTopic, setScheduleTopic] = useState('')
  const [scheduleStart, setScheduleStart] = useState('')
  const [scheduleDuration, setScheduleDuration] = useState<number>(60)
  const [scheduleTimezone, setScheduleTimezone] = useState('UTC')
  const [scheduleTeacherProfileId, setScheduleTeacherProfileId] = useState('')

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [rescheduleStart, setRescheduleStart] = useState('')
  const [rescheduleDuration, setRescheduleDuration] = useState<number>(60)
  const [cancelToggle, setCancelToggle] = useState(false)

  useEffect(() => {
    if (tab === 'manage_classes' || tab === 'dashboard') {
      void loadClasses()
    }
  }, [tab])


  async function loadClasses() {
    setLoadingClasses(true)
    setError(null)
    try {
      const json = await apiFetch<{ classes: ClassRow[] }>('/api/admin/classes', {
        method: 'GET',
      } as RequestInit)

      setClasses(json.classes || [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingClasses(false)
    }
  }

  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) ?? null
  }, [classes, selectedClassId])

  async function onScheduleClass() {
    setError(null)
    const topic = scheduleTopic.trim()
    if (!topic) return setError('Missing topic')
    if (!scheduleStart) return setError('Missing start time')
    if (!scheduleDuration || scheduleDuration <= 0) return setError('Invalid duration')

    try {
      await apiFetch<{ class: ClassRow }>('/api/admin/classes', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          start_time: scheduleStart,
          duration_mins: scheduleDuration,
          timezone: scheduleTimezone || undefined,
          teacher_profile_id: scheduleTeacherProfileId.trim() ? scheduleTeacherProfileId.trim() : undefined,
        }),
      } as RequestInit)


      // reset + reload
      setScheduleTopic('')
      setScheduleStart('')
      setScheduleDuration(60)
      setScheduleTeacherProfileId('')
      await loadClasses()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function onUpdateClass() {
    if (!selectedClassId) return setError('Select a class')
    setError(null)

    try {
      const canceled_at = cancelToggle ? new Date().toISOString() : undefined

      await apiFetch<{ class: ClassRow }>(`/api/admin/classes/${encodeURIComponent(selectedClassId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          start_time: rescheduleStart ? rescheduleStart : undefined,
          duration_mins: rescheduleDuration,
          canceled_at,
        }),
      } as RequestInit)


      setCancelToggle(false)
      await loadClasses()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          className={`maadin-btn ${tab === 'dashboard' ? 'maadin-btn-primary' : 'maadin-btn-ghost'}`}
          type="button"
          onClick={() => setTab('dashboard')}
        >
          Admin dashboard
        </button>
        <button
          className={`maadin-btn ${tab === 'manage_classes' ? 'maadin-btn-primary' : 'maadin-btn-ghost'}`}
          type="button"
          onClick={() => setTab('manage_classes')}
        >
          Manage classes
        </button>
        <button
          className={`maadin-btn ${tab === 'assign_teachers' ? 'maadin-btn-primary' : 'maadin-btn-ghost'}`}
          type="button"
          onClick={() => setTab('assign_teachers')}
        >
          Assign teacher↔subject
        </button>
        <button
          className={`maadin-btn ${tab === 'attendance_stats' ? 'maadin-btn-primary' : 'maadin-btn-ghost'}`}
          type="button"
          onClick={() => setTab('attendance_stats')}
        >
          Attendance stats
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, border: '1px solid #ffb4b4', background: '#ffeaea', marginBottom: 12 }}>
          <b>Admin UI error:</b> {error}
        </div>
      )}

      {tab === 'dashboard' && (
        <div>
          <h2 className="maadin-dashboard-title" style={{ fontSize: 22, marginTop: 0 }}>
            Schedule a new class
          </h2>

          <div className="maadin-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                Topic
                <input className="maadin-input" value={scheduleTopic} onChange={(e) => setScheduleTopic(e.target.value)} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                Start time (ISO)
                <input
                  className="maadin-input"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  placeholder="2026-01-01T12:00:00Z"
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                Duration (minutes)
                <input
                  className="maadin-input"
                  type="number"
                  value={scheduleDuration}
                  onChange={(e) => setScheduleDuration(Number(e.target.value))}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                Timezone
                <input className="maadin-input" value={scheduleTimezone} onChange={(e) => setScheduleTimezone(e.target.value)} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                Teacher profile id (optional)
                <input
                  className="maadin-input"
                  value={scheduleTeacherProfileId}
                  onChange={(e) => setScheduleTeacherProfileId(e.target.value)}
                  placeholder="UUID"
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="maadin-btn maadin-btn-primary" type="button" onClick={onScheduleClass}>
                Create class
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'manage_classes' && (
        <div>
          <h2 className="maadin-dashboard-title" style={{ fontSize: 22, marginTop: 0 }}>
            Manage classes
          </h2>

          <div className="maadin-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <b>Classes</b>
                <div style={{ opacity: 0.8, fontSize: 13 }}>
                  {loadingClasses ? 'Loading...' : `${classes.length} found`}
                </div>
              </div>
              <button className="maadin-btn maadin-btn-ghost" type="button" onClick={() => void loadClasses()}>
                Refresh
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              {classes.length === 0 ? (
                <div style={{ opacity: 0.8 }}>No classes yet.</div>
              ) : (
                classes
                  .slice()
                  .sort((a, b) => (a.start_time < b.start_time ? 1 : -1))
                  .map((c) => {
                    const isSelected = c.id === selectedClassId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`maadin-btn ${isSelected ? 'maadin-btn-primary' : 'maadin-btn-ghost'}`}
                        style={{ textAlign: 'left', padding: 12, borderRadius: 10 }}
                        onClick={() => {
                          setSelectedClassId(c.id)
                          setRescheduleStart(c.start_time)
                          setRescheduleDuration(c.duration_mins)
                          setCancelToggle(!!c.canceled_at)
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{c.topic}</div>
                        <div style={{ fontSize: 13, opacity: 0.85 }}>
                          {new Date(c.start_time).toLocaleString()} · {c.duration_mins}m
                          {c.canceled_at ? ' · CANCELED' : ''}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.75, wordBreak: 'break-all' }}>{c.zoom_link}</div>
                      </button>
                    )
                  })
              )}
            </div>
          </div>

          <div className="maadin-card">
            <h3 style={{ marginTop: 0 }}>Selected class update</h3>
            {!selectedClass ? (
              <div style={{ opacity: 0.8 }}>Select a class on the left.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  New start time (ISO)
                  <input className="maadin-input" value={rescheduleStart} onChange={(e) => setRescheduleStart(e.target.value)} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  New duration (mins)
                  <input
                    className="maadin-input"
                    type="number"
                    value={rescheduleDuration}
                    onChange={(e) => setRescheduleDuration(Number(e.target.value))}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, gridColumn: '1 / -1', marginTop: 2 }}>
                  <input type="checkbox" checked={cancelToggle} onChange={(e) => setCancelToggle(e.target.checked)} />
                  Cancel this class
                </label>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button className="maadin-btn maadin-btn-ghost" type="button" onClick={() => setCancelToggle(false)}>
                    Not canceled
                  </button>
                  <button className="maadin-btn maadin-btn-primary" type="button" onClick={() => void onUpdateClass()}>
                    Save changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'assign_teachers' && (
        <div>
          <h2 className="maadin-dashboard-title" style={{ fontSize: 22, marginTop: 0 }}>
            Assign teacher to subject
          </h2>
          <div className="maadin-card" style={{ opacity: 0.85 }}>
            <b>UI placeholder</b>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              Backend endpoints for editing <code>teacher_subjects</code> are not exposed yet in this codebase.
              This tab will be wired once corresponding admin APIs exist.
            </div>
          </div>
        </div>
      )}

      {tab === 'attendance_stats' && (
        <div>
          <h2 className="maadin-dashboard-title" style={{ fontSize: 22, marginTop: 0 }}>
            Attendance stats
          </h2>
          <div className="maadin-card" style={{ opacity: 0.85 }}>
            <b>UI placeholder</b>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              Current backend only supports student-specific attendance: <code>GET /api/attendance/:studentId</code>.
              Aggregate stats per class/subject can be added later.
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

