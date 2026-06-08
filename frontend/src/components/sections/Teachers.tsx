const teachers = [
  { avatar: '👨‍🎓', name: 'الأستاذ إبراهيم', qual: 'BA Islamic Studies · Al-Azhar', subj: "Qur'an & Tajweed" },
  { avatar: '👩‍🎓', name: 'الأستاذة نـفـيـسة', qual: 'MA Arabic Language', subj: 'Arabic Language' },
  { avatar: '👨‍🎓', name: 'الشيخ يوسف', qual: 'Diploma in Fiqh & Usool', subj: 'Fiqh & Tawheed' },
  { avatar: '👩‍🎓', name: 'الأستاذة زينب', qual: 'Hifz Certificate', subj: 'Hifzul Qur\'an' },
]

import { useRef } from 'react'

export default function Teachers() {
  const ref = useRef<HTMLDivElement | null>(null)

  function scrollBy(offset: number) {
    if (!ref.current) return
    ref.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section className="teachers" id="teachers">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Our Teachers</div>
          <h2 className="section-title">المدرسون المتخصصون</h2>
          <p className="section-sub">Qualified scholars dedicated to your learning journey</p>
        </div>

        <div style={{ position: 'relative' }}>
          <button className="teachers-scroll-btn left" onClick={() => scrollBy(-300)} aria-label="Scroll left">◀</button>
          <div ref={ref} className="teachers-grid">
            {teachers.map((t, idx) => (
              <div key={idx} className="teacher-card fade-up">
                <div className="teacher-avatar">{t.avatar}</div>
                <div className="teacher-name">{t.name}</div>
                <div className="teacher-qual">{t.qual}</div>
                <div className="teacher-subj">{t.subj}</div>
              </div>
            ))}
          </div>
          <button className="teachers-scroll-btn right" onClick={() => scrollBy(300)} aria-label="Scroll right">▶</button>
        </div>
      </div>
    </section>
  )
}

