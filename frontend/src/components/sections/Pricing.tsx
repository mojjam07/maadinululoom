export default function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">Pricing</div>
          <h2 className="section-title">الاشتراكات</h2>
          <p className="section-sub">Affordable excellence — quality Islamic education for every budget</p>
        </div>

        <div className="pricing-grid">
          <div className="price-card green fade-up">
            <div className="price-badge">🇳🇬 Nigeria</div>
            <div style={{ marginTop: 30 }}>
              <div className="price-label">للطلاب النيجيريين</div>
              <div className="price-amount">
                ₦5,000<span className="price-period">/شهر</span>
              </div>
            </div>
            <ul className="price-features">
              <li>
                <span className="check">✓</span> Access to all live classes
              </li>
              <li>
                <span className="check">✓</span> Study materials &amp; resources
              </li>
              <li>
                <span className="check">✓</span> Class recordings
              </li>
              <li>
                <span className="check">✓</span> Weekly assignments
              </li>
              <li>
                <span className="check">✓</span> WhatsApp support group
              </li>
              <li>
                <span className="check">✓</span> Certificate on completion
              </li>
            </ul>
            <a href="/register" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              سـجـّل الآن — Register
            </a>
          </div>

          <div className="price-card gold fade-up">
            <div className="price-badge">🌍 International</div>
            <div style={{ marginTop: 30 }}>
              <div className="price-label">للطلاب الدوليين</div>
              <div className="price-amount">
                $5<span className="price-period">/month</span>
              </div>
            </div>
            <ul className="price-features">
              <li>
                <span className="check">✓</span> Access to all live classes
              </li>
              <li>
                <span className="check">✓</span> Study materials &amp; resources
              </li>
              <li>
                <span className="check">✓</span> Class recordings
              </li>
              <li>
                <span className="check">✓</span> Weekly assignments
              </li>
              <li>
                <span className="check">✓</span> WhatsApp support group
              </li>
              <li>
                <span className="check">✓</span> Certificate on completion
              </li>
            </ul>
            <a href="/register" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              Register Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

