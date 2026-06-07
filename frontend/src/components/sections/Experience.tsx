import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../../lib/supabaseClient'

const items = [
  {
    icon: '💻',
    title: 'دروس Zoom المباشرة',
    desc: 'Join live classes from anywhere in the world with full audio, video, screen sharing, and interactive whiteboard features.',
    tag: 'Live via Zoom',
    wide: true,
  },
  {
    icon: '📊',
    title: 'لوحة الطالب',
    desc: 'Track progress, attendance, and grades in your personal dashboard.',
    tag: 'Student Dashboard',
  },
  {
    icon: '📝',
    title: 'الواجبات والاختبارات',
    desc: 'Weekly assignments and tests with instant feedback from teachers.',
    tag: 'Assessments',
  },
  {
    icon: '🧩',
    title: 'تسجيلات الدروس',
    desc: 'All classes are recorded. Revisit any lesson anytime at your own pace.',
    tag: 'Recordings',
  },
  { icon: '🏅', title: 'الشهادات', desc: 'Earn official certificates upon completing courses and exams.', tag: 'Certified' },
  { icon: '💬', title: 'مجموعة الدعم', desc: 'Students and parents are added to a dedicated support WhatsApp group.', tag: 'Community' },
]

export default function Experience() {
  const navigate = useNavigate()

  const handleStudentDashboardClick = useCallback(async () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

    try {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        navigate('/login', { replace: true })
        return
      }

      const res = await fetch(`${apiBase}/api/profile/${session.user.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      const json = (await res.json().catch(() => ({}))) as
        | { profile?: { role?: 'student' | 'teacher' | 'admin' } }
        | Record<string, unknown>

      const role =
        'profile' in json && typeof (json as { profile?: { role?: string } }).profile?.role === 'string'
          ? ((json as { profile?: { role?: string } }).profile?.role as 'student' | 'teacher' | 'admin' | undefined)
          : undefined

      if (role === 'teacher') navigate('/dashboard/teacher', { replace: true })
      else if (role === 'student' || role === 'admin') navigate('/dashboard', { replace: true })
      else navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <section className="experience" id="experience">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div
            className="section-tag"
            style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)', borderColor: 'rgba(212,160,23,0.3)' }}
          >
            Online Experience
          </div>
          <h2 className="section-title section-title-white">تجربة التعلم الرقميّة</h2>
          <p className="section-sub section-sub-white">Everything you need for a world-class learning experience</p>
        </div>

        <div className="bento">
          {items.map((it, idx) => {
            const isStudentDashboard = it.tag === 'Student Dashboard'
            return (
              <div
                key={idx}
                className={['bento-card', it.wide ? 'wide' : '', 'fade-up'].filter(Boolean).join(' ')}
                style={isStudentDashboard ? { cursor: 'pointer' } : undefined}
                role={isStudentDashboard ? 'button' : undefined}
                tabIndex={isStudentDashboard ? 0 : undefined}
                onClick={isStudentDashboard ? handleStudentDashboardClick : undefined}
                onKeyDown={(e) => {
                  if (!isStudentDashboard) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    void handleStudentDashboardClick()
                  }
                }}
              >
                <div className="bento-icon">{it.icon}</div>
                <div className="bento-title">{it.title}</div>
                <div className="bento-desc">{it.desc}</div>
                <div className="bento-tag">{it.tag}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

