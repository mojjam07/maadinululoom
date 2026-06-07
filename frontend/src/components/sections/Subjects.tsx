import { useCallback, useEffect, useState } from 'react'

import { apiFetch } from '../../lib/api'
import SubjectInfoModal, { type SubjectInfo } from './SubjectInfoModal'

import './subjects.css'

export default function Subjects() {
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<SubjectInfo | null>(null)
  const [open, setOpen] = useState(false)

  const loadSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await apiFetch<{ subjects: SubjectInfo[] }>('/api/subjects')
      setSubjects(json.subjects || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'subjects_failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await loadSubjects()
    })()
  }, [loadSubjects])


  function openModal(s: SubjectInfo) {
    setSelected(s)
    setOpen(true)
  }

  return (
    <section className="subjects" id="subjects">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Our Subjects</div>
          <h2 className="section-title">المواد الدراسية</h2>
          <p className="section-sub">Comprehensive Islamic and Arabic curriculum for all levels</p>
        </div>

        {error && (
          <div
            style={{
              marginTop: 18,
              textAlign: 'center',
              color: '#8b6400',
              fontFamily: 'Tajawal, sans-serif',
            }}
          >
            Failed to load subjects.
          </div>
        )}

        <div className="subjects-grid">
          {loading ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                opacity: 0.8,
                fontFamily: 'Tajawal, sans-serif',
              }}
            >
              Loading...
            </div>
          ) : subjects.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                opacity: 0.9,
                fontFamily: 'Tajawal, sans-serif',
                padding: '22px 0',
              }}
            >
              No subjects found.
            </div>
          ) : (
            subjects.map((s) => (
              <button
                key={s.id ?? s.name_ar}
                type="button"
                className="subject-card fade-up subject-card-button"
                onClick={() => openModal(s)}
              >
                <div className="subj-icon">{s.icon ?? '📘'}</div>
                <div className="subj-ar">{s.name_ar}</div>
                <div className="subj-en">{s.name_en}</div>
              </button>
            ))
          )}
        </div>

        <SubjectInfoModal
          open={open}
          subject={selected}
          onClose={() => {
            setOpen(false)
            setSelected(null)
          }}
        />
      </div>
    </section>
  )
}

