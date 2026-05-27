import { useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api'

type FormState = {
  subject_id: string
  title: string
  video_url: string
  notes_url: string
  duration: string
}

const DEFAULT_STATE: FormState = {
  subject_id: '',
  title: '',
  video_url: '',
  notes_url: '',
  duration: '',
}

export default function TeacherUploadLessonForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const durationVal = useMemo(() => {
    const n = Number(form.duration)
    if (!form.duration) return undefined
    return Number.isFinite(n) ? n : undefined
  }, [form.duration])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch<{ lesson: { id: string } }>('/api/teacher/lessons', {

        method: 'POST',
        body: JSON.stringify({
          subject_id: form.subject_id,
          title: form.title,
          video_url: form.video_url || undefined,
          notes_url: form.notes_url || undefined,
          duration: durationVal,
        }),
      })
      setForm(DEFAULT_STATE)
      onSuccess?.()
      alert('Lesson uploaded successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload_failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Upload lesson</div>
      <div className="maadin-muted">Teacher lesson upload (video URL + notes URL + duration).</div>

      <form onSubmit={onSubmit} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Subject ID</span>
          <input
            value={form.subject_id}
            onChange={(e) => setForm((s) => ({ ...s, subject_id: e.target.value }))}
            className="maadin-form-input"
            placeholder="e.g. 1"
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            className="maadin-form-input"
            placeholder="Lesson title"
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Video URL (optional)</span>
          <input
            value={form.video_url}
            onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))}
            className="maadin-form-input"
            placeholder="https://..."
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Notes URL (optional)</span>
          <input
            value={form.notes_url}
            onChange={(e) => setForm((s) => ({ ...s, notes_url: e.target.value }))}
            className="maadin-form-input"
            placeholder="https://..."
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Duration (minutes, optional)</span>
          <input
            value={form.duration}
            onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
            className="maadin-form-input"
            placeholder="30"
          />
        </label>

        {error && <div style={{ color: '#b00020' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="maadin-btn maadin-btn-emerald" disabled={submitting} type="submit">
            {submitting ? 'Uploading...' : 'Upload lesson'}
          </button>
          <button className="maadin-btn maadin-btn-ghost" disabled={submitting} type="button" onClick={() => setForm(DEFAULT_STATE)}>
            Reset
          </button>
        </div>
      </form>
    </section>
  )
}

