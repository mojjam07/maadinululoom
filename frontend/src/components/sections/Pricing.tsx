export default function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Finance</div>
          <h2 className="section-title">بوابة التمويل</h2>
          <p className="section-sub">ساهم في استمرار التعليم الشرعي — كل مساهمة تساعدنا في رعاية الطلاب وتوفير الموارد</p>
        </div>

        <div className="pricing-grid">
          <div className="price-card green fade-up">
            <div className="price-badge">🤲 دعم طالب</div>
            <div style={{ marginTop: 30 }}>
              <div className="price-label">مساهمة شهرية</div>
              <div className="price-amount">
                ₦1000<span className="price-period">/شهر</span>
              </div>
            </div>
            <ul className="price-features">
              <li>
                <span className="check">✓</span> دعم محتوى الدروس والمواد التعليمية
              </li>
              <li>
                <span className="check">✓</span> متابعة الواجبات والتقارير للطلاب
              </li>
              <li>
                <span className="check">✓</span> توفير ملخصات وموارد مساندة
              </li>
              <li>
                <span className="check">✓</span> دعم الاستمرارية خلال الشهر
              </li>
              <li>
                <span className="check">✓</span> قناة تواصل للطلاب (WhatsApp)
              </li>
              <li>
                <span className="check">✓</span> دعم تجهيزات المتابعة والتصحيح
              </li>
            </ul>
            <a href="/contact" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              ادعم الآن — Support
            </a>
          </div>

          <div className="price-card gold fade-up">
            <div className="price-badge">🌟 راعٍ تعليمي</div>
            <div style={{ marginTop: 30 }}>
              <div className="price-label">مساهمة شهرية</div>
              <div className="price-amount">
                $1<span className="price-period">/month</span>
              </div>
            </div>
            <ul className="price-features">
              <li>
                <span className="check">✓</span> تمويل تجهيزات التعليم عن بُعد
              </li>
              <li>
                <span className="check">✓</span> دعم إعداد الدروس وتسجيلها
              </li>
              <li>
                <span className="check">✓</span> مساعدة في دعم المحتوى والموارد
              </li>
              <li>
                <span className="check">✓</span> تمكين استمرار المعلمين والاختصاصيين
              </li>
              <li>
                <span className="check">✓</span> دعم برامج التحفيز والمتابعة
              </li>
              <li>
                <span className="check">✓</span> مساهمة في توفير شهادات إتمام الدراسة
              </li>
            </ul>
            <a href="/contact" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              كن راعياً — Become a Sponsor
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}


