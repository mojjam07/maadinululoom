import { useContext } from 'react'
import type { LanguageContextType } from './LanguageContext'
import { LanguageContext } from './LanguageContext'


export function useLanguage(): LanguageContextType {
  const v = useContext(LanguageContext)
  if (!v) throw new Error('useLanguage must be used within LanguageProvider')
  return v
}

