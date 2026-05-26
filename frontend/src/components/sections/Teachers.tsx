const teachers = [
  { avatar: '👨‍🎓', name: 'الأستاذ إبراهيم', qual: 'BA Islamic Studies · Al-Azhar', subj: "Qur'an & Tajweed" },
  { avatar: '👩‍🎓', name: 'الأستاذة نـفـيـسة', qual: 'MA Arabic Language', subj: 'Arabic Language' },
  { avatar: '👨‍🎓', name: 'الشيخ يوسف', qual: 'Diploma in Fiqh & Usool', subj: 'Fiqh & Tawheed' },
  { avatar: '👩‍🎓', name: 'الأستاذة زينب', qual: 'Hifz Certificate', subj: 'Hifzul Qur\'an' },
]

export default function Teachers() {
  return (
    <section className="teachers" id="teachers">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Our Teachers</div>
          <h2 className="section-title">المدرسون المتخصصون</h2>
          <p className="section-sub">Qualified scholars dedicated to your learning journey</p>
        </div>

        <div className="teachers-grid">
          {teachers.map((t, idx) => (
            <div key={idx} className="teacher-card fade-up">
              <div className="teacher-avatar">{t.avatar}</div>
              <div className="teacher-name">{t.name}</div>
              <div className="teacher-qual">{t.qual}</div>
              <div className="teacher-subj">{t.subj}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

