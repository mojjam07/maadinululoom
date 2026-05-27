import { useState } from 'react'
import { apiFetch } from '../../lib/api'

type FormState = {
  lesson_id: string
  title: string
  due_date: string
  instructions: string
}

const DEFAULT_STATE: FormState = {
  lesson_id: '',
  title: '',
  due_date: '',
  instructions: '',
}

export default function TeacherCreateAssignmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch<{ assignment: { id: string } }>('/api/teacher/assignments', {

        method: 'POST',
        body: JSON.stringify({
          lesson_id: form.lesson_id,
          title: form.title,
          due_date: form.due_date || undefined,
          instructions: form.instructions || undefined,
        }),
      })
      setForm(DEFAULT_STATE)
      onSuccess?.()
      alert('Assignment created successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'create_failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Create assignment</div>
      <div className="maadin-muted">Assign work to students for a given lesson.</div>

      <form onSubmit={onSubmit} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Lesson ID</span>
          <input
            value={form.lesson_id}
            onChange={(e) => setForm((s) => ({ ...s, lesson_id: e.target.value }))}
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
            placeholder="Assignment title"
            required
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Due date</span>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((s) => ({ ...s, due_date: e.target.value }))}
            className="maadin-form-input"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>Instructions (optional)</span>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))}
            className="maadin-form-input"
            placeholder="Write instructions for students..."
          />
        </label>

        {error && <div style={{ color: '#b00020' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="maadin-btn maadin-btn-emerald" disabled={submitting} type="submit">
            {submitting ? 'Creating...' : 'Create assignment'}
          </button>
          <button className="maadin-btn maadin-btn-ghost" disabled={submitting} type="button" onClick={() => setForm(DEFAULT_STATE)}>
            Reset
          </button>
        </div>
      </form>
    </section>
  )
}

