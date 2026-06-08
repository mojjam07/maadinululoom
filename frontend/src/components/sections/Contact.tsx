import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { FormEvent } from 'react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState<null | { kind: 'success' | 'error'; text: string }>(null)

  // apiFetch handles API_BASE; no local apiBase needed here.

  const onSubmit = async (e: FormEvent) => {

    e.preventDefault()
    setStatus(null)

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          message: message.trim(),
          source: 'landing',
        }),
      })

      setStatus({ kind: 'success', text: 'شكراً! تم استلام رسالتك. سيتم التواصل معك قريباً.' })
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch {
      setStatus({ kind: 'error', text: 'تعذر إرسال الرسالة حالياً. حاول مرة أخرى.' })
    }

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
          {status && (
            <div
              style={{
                gridColumn: '1 / -1',
                marginBottom: 10,
                padding: '10px 12px',
                borderRadius: 12,
                border: status.kind === 'success' ? '1px solid rgba(212,160,23,0.35)' : '1px solid rgba(220,20,60,0.35)',
                background: status.kind === 'success' ? 'rgba(212,160,23,0.12)' : 'rgba(220,20,60,0.12)',
                color: 'rgba(255,255,255,0.9)',
                fontFamily: "'Tajawal',sans-serif",
              }}
              role="status"
              aria-live="polite"
            >
              {status.text}
            </div>
          )}
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

