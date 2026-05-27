import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

type Submission = {
  student_id: string
  assignment_id: string
  file_url?: string | null
  grade?: number | null
  feedback?: string | null
}

export default function TeacherGradeSubmissionsPanel({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [error, setError] = useState<string | null>(null)

  // grade editing
  const [gradeByKey, setGradeByKey] = useState<Record<string, string>>({})
  const [feedbackByKey, setFeedbackByKey] = useState<Record<string, string>>({})

  const makeKey = (s: { student_id: string; assignment_id: string }) => `${s.student_id}::${s.assignment_id}`

  useEffect(() => {
    // Initialize grade/feedback buffers when submissions change
    const nextGrade: Record<string, string> = {}
    const nextFeedback: Record<string, string> = {}
    for (const s of submissions) {
      const k = makeKey(s)
      nextGrade[k] = s.grade === null || s.grade === undefined ? '' : String(s.grade)
      nextFeedback[k] = s.feedback ?? ''
    }

    // React-safe: compute then set in a microtask to avoid synchronous effect update warnings.
    queueMicrotask(() => {
      setGradeByKey(nextGrade)
      setFeedbackByKey(nextFeedback)
    })
  }, [submissions])


  async function loadForStudent() {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      // GET /api/assignments/:studentId is available; it should return assignments list for student.
      // For grading we need submissions; current backend exposes /api/submissions for POST + PATCH.
      // We'll rely on the assignments endpoint for listing and then grade via PATCH for each row.
      // In this phase, we implement UI that loads and then grades by studentId + assignmentId.

      // The backend GET /api/assignments/:studentId likely includes submission/grade data.
      const json = await apiFetch<{ assignments?: Array<{ id: string; student_id?: string; file_url?: string | null; grade?: number | null; feedback?: string | null; assignment_id?: string }> }>(
        `/api/assignments/${encodeURIComponent(studentId)}`
      )

      const rows = json.assignments ?? []

      // Normalize into Submission-like rows.
      const normalized: Submission[] = rows.map((r) => ({
        student_id: r.student_id ?? studentId,
        assignment_id: (r.assignment_id ?? r.id ?? '') as string,

        file_url: r.file_url ?? null,

        grade: r.grade ?? null,
        feedback: r.feedback ?? null,
      }))


      setSubmissions(normalized.filter((x) => Boolean(x.assignment_id)))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  async function saveGrade(s: Submission) {
    setLoading(true)
    setError(null)
    try {
      const k = makeKey(s)
      const gradeRaw = gradeByKey[k]
      const feedbackRaw = feedbackByKey[k]

      const gradeNum = gradeRaw.trim() === '' ? null : Number(gradeRaw)
      await apiFetch(`/api/teacher/submissions/${encodeURIComponent(s.student_id)}/${encodeURIComponent(s.assignment_id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          grade: gradeNum === null || !Number.isFinite(gradeNum) ? null : gradeNum,
          feedback: feedbackRaw.trim() === '' ? null : feedbackRaw,
        }),
      })

      alert('Grade saved.')
      onSuccess?.()
      await loadForStudent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="maadin-card">
      <div className="maadin-card-h">Grade submissions</div>
      <div className="maadin-muted">Pick a student and submit grades + feedback.</div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'Tajawal, sans-serif', fontWeight: 800, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}>
            Student ID
          </span>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="maadin-form-input"
            placeholder="student uuid"
          />
        </div>
        <button className="maadin-btn maadin-btn-emerald" type="button" disabled={loading} onClick={loadForStudent}>
          {loading ? 'Loading...' : 'Load submissions'}
        </button>
      </div>

      {error && <div style={{ color: '#b00020', marginTop: 10 }}>{error}</div>}

      <div style={{ marginTop: 14 }}>
        <div className="maadin-table" role="table" aria-label="Submissions">
          <div className="maadin-table-head" role="row">
            <div role="columnheader">Assignment ID</div>
            <div role="columnheader">Current grade</div>
            <div role="columnheader">Feedback</div>
            <div role="columnheader" className="maadin-table-col-actions">
              Action
            </div>
          </div>

          <div className="maadin-table-body" role="rowgroup">
            {submissions.length === 0 ? (
              <div style={{ padding: 12, color: 'rgba(0,0,0,0.55)', fontFamily: 'Tajawal, sans-serif' }}>
                No submissions loaded.
              </div>
            ) : (
              submissions.map((s) => {
                const k = makeKey(s)
                return (
                  <div key={k} className="maadin-table-row" role="row">
                    <div className="maadin-table-cell">
                      <div className="maadin-table-title">{s.assignment_id}</div>
                    </div>
                    <div className="maadin-table-cell">
                      <input
                        className="maadin-form-input"
                        value={gradeByKey[k] ?? ''}
                        onChange={(e) => setGradeByKey((m) => ({ ...m, [k]: e.target.value }))}
                        placeholder="0-100"
                      />
                    </div>
                    <div className="maadin-table-cell">
                      <input
                        className="maadin-form-input"
                        value={feedbackByKey[k] ?? ''}
                        onChange={(e) => setFeedbackByKey((m) => ({ ...m, [k]: e.target.value }))}
                        placeholder="Feedback text"
                      />
                    </div>
                    <div className="maadin-table-cell maadin-table-col-actions">
                      <button className="maadin-btn maadin-btn-emerald" disabled={loading} type="button" onClick={() => saveGrade(s)}>
                        Save
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

