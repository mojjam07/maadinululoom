import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { apiFetch } from '../../lib/api'

export default function Pricing() {
  const [amount, setAmount] = useState<number>(1000)
  const [currency, setCurrency] = useState<string>('NGN')
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Mouse gradient follow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPosition({ x, y })
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  async function initPayment(provider: 'stripe' | 'paystack') {
    try {
      setLoading(true)
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) {
        if (confirm('To process donations please sign in or register. Go to register?')) {
          window.location.href = '/register'
        }
        return
      }
      const json = await apiFetch<{
        ok?: boolean
        error?: string
        details?: string
        init?: { authorization_url?: string; client_secret?: string }
        payment_ref?: string
      }>('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({ provider, amount, currency, student_id: session.user.id }),
      })
      if (!json.ok) return alert(json.error || json.details || 'payment_init_failed')

      if (json.init?.authorization_url) {
        window.location.href = json.init.authorization_url
        return
      }

      if (json.init?.client_secret) {
        alert('Payment initialized (client secret): ' + json.init.client_secret)
        return
      }

      alert('Payment initialized — reference: ' + json.payment_ref)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert('Payment init error: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="pricing" id="pricing">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Finance</div>
          <h2 className="section-title">بوابة التمويل</h2>
          <p className="section-sub">ساهم في استمرار التعليم الشرعي — كل مساهمة تساعدنا في رعاية الطلاب وتوفير الموارد</p>
        </div>

        <div className="pricing-grid">
          <div
            ref={cardRef}
            className="price-card support fade-up price-card-interactive"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              if (cardRef.current) {
                cardRef.current.style.setProperty('--mouse-x', '50%')
                cardRef.current.style.setProperty('--mouse-y', '50%')
              }
            }}
          >
            <div className="price-badge">🤲 دعم المشروع</div>
            <div style={{ marginTop: 30 }}>
              <div className="price-label">اختر المبلغ والعملة</div>
              <div className="price-amount price-amount-glow">
                {currency === 'NGN' ? '₦' : '$'}{amount}
                <span className="price-period">/تبرع</span>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ marginRight: 8 }}>
                <input
                  type="radio"
                  name="currency"
                  checked={currency === 'NGN'}
                  onChange={() => {
                    setCurrency('NGN')
                    setAmount(1000)
                  }}
                />{' '}
                NGN
              </label>
              <label>
                <input
                  type="radio"
                  name="currency"
                  checked={currency === 'USD'}
                  onChange={() => {
                    setCurrency('USD')
                    setAmount(1)
                  }}
                />{' '}
                USD
              </label>
            </div>

            <div style={{ marginTop: 14 }}>
              <input
                aria-label="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="price-input-enhance"
                placeholder="Enter amount"
                style={{ width: 140, padding: '8px 10px' }}
              />
            </div>

            <ul className="price-features">
              <li>
                <span className="check">✓</span> دعم مباشر للطلاب والمحتوى
              </li>
              <li>
                <span className="check">✓</span> شكر وذكر في مصادر المشروع
              </li>
              <li>
                <span className="check">✓</span> يمكنك اختيار وسيلة الدفع المفضلة
              </li>
            </ul>

            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary btn-payment" disabled={loading} onClick={() => initPayment('paystack')}>دفع عبر Paystack</button>
              <button className="btn-primary btn-payment" disabled={loading} onClick={() => initPayment('stripe')}>دفع عبر Stripe</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


