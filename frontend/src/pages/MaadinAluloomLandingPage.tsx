import { useEffect } from 'react'
import TopNav from '../components/layout/TopNav'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Subjects from '../components/sections/Subjects'
import Experience from '../components/sections/Experience.tsx'

import Pricing from '../components/sections/Pricing.tsx'

import Testimonials from '../components/sections/Testimonials.tsx'
import Teachers from '../components/sections/Teachers.tsx'
import Faq from '../components/sections/Faq.tsx'
import Contact from '../components/sections/Contact.tsx'

import Footer from '../components/layout/Footer.tsx'


import '../styles/maadin.css'

function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.fade-up'))
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

function useHeroImmediateReveal() {
  useEffect(() => {
    const heroEls = Array.from(document.querySelectorAll<HTMLElement>('.hero .fade-up'))
    heroEls.forEach((el) => {
      window.setTimeout(() => el.classList.add('visible'), 200)
    })
  }, [])
}

export default function MaadinAluloomLandingPage() {
  useScrollReveal()
  useHeroImmediateReveal()

  return (
    <>
      <script type="application/ld+json">
        {`{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "معدن العلوم",
          "url": "https://maadinul.vercel.app",
          "logo": "https://maadinul.vercel.app/og-image.png",
          "description": "Online Islamic and Arabic learning platform offering courses, live classes, and certifications.",
          "sameAs": []
        }`}
      </script>
      <TopNav />
      <main>
        <Hero />
        <About />
        <Subjects />
        <Experience />
        <Pricing />
        <Testimonials />
        <Teachers />
        <Faq />
        <Contact />
        <div className="geo-divider" />
      </main>
      <Footer />
    </>
  )
}


