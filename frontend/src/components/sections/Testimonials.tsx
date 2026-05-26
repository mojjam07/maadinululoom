const testimonials = [
  {
    stars: '★★★★★',
    text: 'ابني تعلم القراءة وقـراءة القرآن خلال شهـرين فقط! المدرس صبور ومتفهمون وجدول مرن جدا لصحيـح العمل.',
    avatar: 'أ',
    name: 'أم أحمد',
    country: '🇳🇬 Nigeria',
    role: 'Parent',
  },
  {
    stars: '★★★★★',
    text: 'I started with zero Arabic knowledge. After 3 months, I can read the Qur\'an and understand basic conversations. Amazing teachers!',
    avatar: 'F',
    name: 'Fatimah K.',
    country: '🇬🇧 UK',
    role: 'Adult Student',
  },
  {
    stars: '★★★★★',
    text: 'The live Zoom classes are engaging and interactive. My daughter loves her teacher and looks forward to every session. Highly recommended!',
    avatar: 'S',
    name: 'Sister Safia',
    country: '🇨🇦 Canada',
    role: 'Parent',
  },
  {
    stars: '★★★★★',
    text: 'كنت مبتدئًا في اللغة العربية، الآن أستطيع قراءة القرآن بشكل صحيح. شكراً لفريق معدن العلوم! ',
    avatar: 'ع',
    name: 'عبدالله مالك',
    country: '🇸🇦 Saudi Arabia',
    role: 'Teen Student',
  },
  {
    stars: '★★★★★',
    text: 'The price is unbeatable for the quality of education. For just $5 a month, my children get top-tier Islamic education. Truly a blessing.',
    avatar: 'H',
    name: 'Hassan Al-Amin',
    country: '🇺🇸 USA',
    role: 'Parent',
  },
  {
    stars: '★★★★★',
    text: 'التسجيلات تساعدني كثيرا لمراجعة الدروس في أي وقت. الشهادات أضياء جميلة ومفيددة. أنصح الجميع بالنضامامام',
    avatar: 'م',
    name: 'مريم بكر',
    country: '🇲🇾 Malaysia',
    role: 'Adult Student',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">آراء طلابنا</h2>
          <p className="section-sub">What parents and students say about معدن العلوم</p>
        </div>

        <div className="test-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="test-card fade-up">
              <div className="test-stars">{t.stars}</div>
              <p className="test-text">{t.text}</p>
              <div className="test-author">
                <div className="test-avatar">{t.avatar}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-country">
                    <span className="country-badge">{t.country}</span> — {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

