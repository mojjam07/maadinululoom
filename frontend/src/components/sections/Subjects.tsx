const subjects = [
  { icon: '📖', ar: 'قراءة القرآن', en: "Qur'an Reading" },
  { icon: '🧠', ar: 'حفظ القرآن', en: 'Hifzul Qur\'an' },
  { icon: '🔍', ar: 'اللغة العربية', en: 'Arabic Language' },
  { icon: '📚', ar: 'الحديث الشر يف', en: 'Hadith' },
  { icon: '⚖️', ar: 'الفقه الإسلامي', en: 'Fiqh' },
  { icon: '📌', ar: 'التوحيد', en: 'Tawheed' },
  { icon: '📙', ar: 'التفسير', en: 'Tafseer' },
  { icon: '📜', ar: 'السيرة النبوية', en: 'Seerah' },
  { icon: '❤️', ar: 'الأخلاق الإسلامية', en: 'Islamic Morals' },
  { icon: '➗', ar: 'الرياضيات الأساسية', en: 'Basic Mathematics' },
]

export default function Subjects() {
  return (
    <section className="subjects" id="subjects">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Our Subjects</div>
          <h2 className="section-title">المواد الدراسية</h2>
          <p className="section-sub">Comprehensive Islamic and Arabic curriculum for all levels</p>
        </div>

        <div className="subjects-grid">
          {subjects.map((s, idx) => (
            <div key={idx} className="subject-card fade-up">
              <div className="subj-icon">{s.icon}</div>
              <div className="subj-ar">{s.ar}</div>
              <div className="subj-en">{s.en}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

