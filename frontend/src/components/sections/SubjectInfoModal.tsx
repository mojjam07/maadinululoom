import { useEffect } from 'react'

export type SubjectInfo = {
  id?: string
  name_ar: string
  name_en: string
  description?: string | null
  icon?: string | null
}

export default function SubjectInfoModal({
  open,
  subject,
  onClose,
}: {
  open: boolean
  subject: SubjectInfo | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !subject) return null

  return (
    <div
      className="subject-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Subject details"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="subject-modal">
        <div className="subject-modal-header">
          <div className="subject-modal-title">
            <span className="subject-modal-icon">{subject.icon ?? '📘'}</span>
            <div>
              <div className="subject-modal-name-ar">{subject.name_ar}</div>
              <div className="subject-modal-name-en">{subject.name_en}</div>
            </div>
          </div>

          <button type="button" className="subject-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="subject-modal-body">
          <div className="subject-modal-desc">
            {subject.description ? subject.description : 'No description available for this subject.'}
          </div>

          <div className="subject-modal-hint">
            <b>Tip:</b> Enroll to get lessons and progress tracking for this subject.
          </div>
        </div>
      </div>
    </div>
  )
}

