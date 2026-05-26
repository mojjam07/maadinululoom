import { useState } from 'react'
import type { FormEvent } from 'react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const submitMessage =
    'شكراً! سيتم التواصل معك قريباً. Thank you! We will contact you soon.'

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    alert(submitMessage)
  }

  return (
    <section className="contact" id="contact">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag" style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)', borderColor: 'rgba(212,160,23,0.3)' }}>
            Contact Us
          </div>
          <h2 className="section-title section-title-white">تواصل معنا</h2>
          <p className="section-sub section-sub-white">Ready to start your journey? Reach out and we'll guide you through enrollment</p>
        </div>

        <div className="contact-grid">
          <div className="fade-up">
            <div className="contact-item">
              <div className="contact-icon">📱</div>
              <div>
                <div className="contact-label">واتساب — WhatsApp</div>
                <div className="contact-val">+234 xxx xxx xxxx</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div>
                <div className="contact-label">البريد الإلكتروني — Email</div>
                <div className="contact-val">info@maadinululoom.com</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📋</div>
              <div>
                <div className="contact-label">الموقع الإلكتروني — Website</div>
                <div className="contact-val">www.maadinululoom.com</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 30,
                background: 'rgba(212,160,23,0.12)',
                border: '1px solid rgba(212,160,23,0.25)',
                borderRadius: 16,
                padding: 20,
                direction: 'rtl',
              }}
            >
              <div style={{ fontFamily: "'Cairo',sans-serif", color: 'var(--gold)', fontWeight: 700, marginBottom: 8, fontSize: 15 }}>
                📌 ساعات العمل
              </div>
              <div style={{ fontFamily: "'Tajawal',sans-serif", color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 2 }}>
                الأحد — الخميس: ٩ص — ٩م<br />
                الجمعة: ٢م — ٩م<br />
                السبت: ١٠ص — ٦م
              </div>
            </div>
          </div>

          <form className="contact-form fade-up" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">الاسم الكامل — Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="form-input"
                placeholder="أدخل اسمك بالكامل"
              />
            </div>

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني — Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-input"
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف — Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="form-input"
                placeholder="+234..."
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">رسالتك — Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form-input"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>

            <button type="submit" className="form-btn">
              إرسال — Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

