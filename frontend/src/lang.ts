import type { Lang } from './i18n'

const STORAGE_KEY = 'maadin_lang'

export function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ar' || stored === 'en') return stored

  // fallback: browser language
  const browser = (navigator.language || '').toLowerCase()
  if (browser.startsWith('ar')) return 'ar'
  return 'en'
}

export function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang)
}

