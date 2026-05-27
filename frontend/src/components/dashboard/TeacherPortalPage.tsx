import { useState } from 'react'
import TeacherDashboard from './TeacherDashboard'
import TeacherUploadLessonForm from './TeacherUploadLessonForm'
import TeacherCreateAssignmentForm from './TeacherCreateAssignmentForm'
import TeacherGradeSubmissionsPanel from './TeacherGradeSubmissionsPanel'

export default function TeacherPortalPage() {
  const [tab, setTab] = useState<'dashboard' | 'upload' | 'assignments' | 'grading'>('dashboard')

  return (
    <div className="maadin-dashboard-shell">
      {/* Sidebar already handled by DashboardPage based on role */}
      <main className="maadin-dashboard-main">
        {tab === 'dashboard' && (
          <TeacherDashboard
            onOpenUpload={() => setTab('upload')}
            onOpenAssignments={() => setTab('assignments')}
            onOpenGrading={() => setTab('grading')}
          />
        )}

        {tab === 'upload' && (
          <>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <button className="maadin-btn maadin-btn-ghost" type="button" onClick={() => setTab('dashboard')}>
                ← Back
              </button>
              <div className="maadin-dashboard-title" style={{ margin: 0, fontSize: 24 }}>
                Upload lesson
              </div>
            </div>
            <TeacherUploadLessonForm onSuccess={() => setTab('dashboard')} />
          </>
        )}

        {tab === 'assignments' && (
          <>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <button className="maadin-btn maadin-btn-ghost" type="button" onClick={() => setTab('dashboard')}>
                ← Back
              </button>
              <div className="maadin-dashboard-title" style={{ margin: 0, fontSize: 24 }}>
                Create assignment
              </div>
            </div>
            <TeacherCreateAssignmentForm onSuccess={() => setTab('dashboard')} />
          </>
        )}

        {tab === 'grading' && (
          <>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <button className="maadin-btn maadin-btn-ghost" type="button" onClick={() => setTab('dashboard')}>
                ← Back
              </button>
              <div className="maadin-dashboard-title" style={{ margin: 0, fontSize: 24 }}>
                Grade submissions
              </div>
            </div>
            <TeacherGradeSubmissionsPanel onSuccess={() => setTab('dashboard')} />
          </>
        )}
      </main>
    </div>
  )
}

