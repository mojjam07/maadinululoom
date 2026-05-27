import { createContext } from 'react'
import type { Lang } from '../../i18n'

export type LanguageContextType = {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

