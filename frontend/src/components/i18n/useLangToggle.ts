import { useState } from 'react'
import { useLanguage } from './LanguageProvider'

export function useLangToggle() {
  const { lang, setLang } = useLanguage()
  const [busy] = useState(false)

  const toggle = () => {
    const next = lang === 'ar' ? 'en' : 'ar'
    setLang(next)
  }

  return { lang, toggle, busy }
}

