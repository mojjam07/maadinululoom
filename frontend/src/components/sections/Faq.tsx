import { useMemo, useState } from 'react'

type FaqItem = { q: string; a: string }

export default function Faq() {
  const items = useMemo<FaqItem[]>(
    () => [
      {
        q: 'كيف تعمل الدروس؟ — How do classes work?',
        a: 'الدروس تتم عبر Zoom مباشرة. بعد التسجيل، ستتلقى رابط الجدول والدروس عبر واتساب.',
      },
      {
        q: 'هل تتوفر تسجيلات للدروس؟ — Are recordings available?',
        a: 'نعم! جميع الدروس تُسجل وتُشارك مع الطلاب المسجلين.',
      },
      {
        q: 'هل المنهج مناسب للمبتدئين؟ — Is it beginner friendly?',
        a: 'بالتأكيد! نقبل الطلاب من جميع المستويات، بما في ذلك المبتدئين تماماً.',
      },
      {
        q: 'ما هي الفئات العمرية المقبولة؟ — What age groups are accepted?',
        a: 'نقبل الأطفال من عمر 5 سنوات، والمراهقين، والبالغين. المنهج يتم تخصيصه لكل فئة.',
      },
      {
        q: 'كيف يتم الدفع؟ — How do payments work?',
        a: 'الدفع أسبوعياً أو شهرياً حسب الاتفاق. الطلاب النيجيريون يدفعون ₦5,000/شهر، بينما الطلاب الدوليون يدفعون $5/شهر عبر التحويل البنكي أو الدفع عبر الهاتف.',
      },
    ],
    [],
  )

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="faq" id="faq">
      <div className="section-inner">
        <div className="text-center fade-up">
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">الأسئلة الشائعة</h2>
          <p className="section-sub">Everything you need to know before enrolling</p>
        </div>

        <div className="faq-list">
          {items.map((it, idx) => {
            const isOpen = openIndex === idx
            return (
                <div
                  key={idx}
                  className={['faq-item', isOpen ? 'open' : '', 'fade-up'].filter(Boolean).join(' ')}
                >
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${idx}`}
                    id={`faq-q-${idx}`}
                    onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
                  >
                    {it.q}
                    <span className="faq-arrow">⌄</span>
                  </button>

                  <div
                    id={`faq-a-${idx}`}
                    className="faq-a"
                    role="region"
                    aria-labelledby={`faq-q-${idx}`}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {it.a}
                  </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

