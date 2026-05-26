const items = [
  { icon: '💻', title: 'دروس Zoom المباشرة', desc: 'Join live classes from anywhere in the world with full audio, video, screen sharing, and interactive whiteboard features.', tag: 'Live via Zoom', wide: true },
  { icon: '📊', title: 'لوحة الطالب', desc: 'Track progress, attendance, and grades in your personal dashboard.', tag: 'Student Dashboard' },
  { icon: '📝', title: 'الواجبات والاختبارات', desc: 'Weekly assignments and tests with instant feedback from teachers.', tag: 'Assessments' },
  { icon: '🧩', title: 'تسجيلات الدروس', desc: 'All classes are recorded. Revisit any lesson anytime at your own pace.', tag: 'Recordings' },
  { icon: '🏅', title: 'الشهادات', desc: 'Earn official certificates upon completing courses and exams.', tag: 'Certified' },
  { icon: '💬', title: 'مجموعة الدعم', desc: 'Students and parents are added to a dedicated support WhatsApp group.', tag: 'Community' },
]

export default function Experience() {
  return (
    <section className="experience" id="experience">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag" style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)', borderColor: 'rgba(212,160,23,0.3)' }}>
            Online Experience
          </div>
          <h2 className="section-title section-title-white">تجربة التعلم الرقميّة</h2>
          <p className="section-sub section-sub-white">Everything you need for a world-class learning experience</p>
        </div>

        <div className="bento">
          {items.map((it, idx) => (
            <div key={idx} className={['bento-card', it.wide ? 'wide' : '', 'fade-up'].filter(Boolean).join(' ')}>
              <div className="bento-icon">{it.icon}</div>
              <div className="bento-title">{it.title}</div>
              <div className="bento-desc">{it.desc}</div>
              <div className="bento-tag">{it.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

