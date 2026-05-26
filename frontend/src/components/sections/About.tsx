export default function About() {
  return (
    <section className="about" id="about">
      <div className="section-inner">
        <div className="about-grid">
          <div className="about-img-wrap fade-up">
            <div className="about-img-frame">
              <span style={{ fontSize: 90 }}>🤥</span>
            </div>
            <div className="about-badge">📜 خبـرة في التعليم الإسلامي</div>
          </div>

          <div className="fade-up">
            <div className="section-tag">About Us</div>
            <h2 className="section-title">معدن العلوم</h2>

            <p
              style={{
                fontFamily: "'Tajawal',sans-serif",
                fontSize: 15,
                color: '#444',
                lineHeight: 1.9,
                marginBottom: 14,
                direction: 'rtl',
              }}
            >
              نـحـن مـؤسسة تعليميـة مـتـخـصـصـة فـي تـدريـس الـغـة الـعـربيـة و الـعـلوم الإسلامية عبر الإنترنت، نجمـع
              بيـن الأصالة و الحـداثـة لتقـديـم تعليـم عـالـي الـجـودة لــكـل مـسـلم فـي الـعـالم.
            </p>

            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 24 }}>
              Our mission is to deliver authentic Islamic education through modern technology — making quality Arabic and
              Islamic learning accessible to every Muslim globally.
            </p>

            <div className="about-features">
              <div className="about-feat">
                <div className="feat-icon">👨‍🎓</div>
                <div>
                  <div className="feat-title">مدرسون مؤهلون</div>
                  <div className="feat-desc">Qualified &amp; certified teachers</div>
                </div>
              </div>
              <div className="about-feat">
                <div className="feat-icon">📡</div>
                <div>
                  <div className="feat-title">دروس مباشرة</div>
                  <div className="feat-desc">Live interactive classes</div>
                </div>
              </div>
              <div className="about-feat">
                <div className="feat-icon">⏰</div>
                <div>
                  <div className="feat-title">جدول مرن</div>
                  <div className="feat-desc">Flexible scheduling</div>
                </div>
              </div>
              <div className="about-feat">
                <div className="feat-icon">🌱</div>
                <div>
                  <div className="feat-title">للمبتدئين</div>
                  <div className="feat-desc">Beginner friendly levels</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

