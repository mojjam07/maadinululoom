import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Lang } from '../../i18n'
import { getDir, initI18n } from '../../i18n'
import { getInitialLang, setLang as persistLang } from '../../lang'
import i18n from 'i18next'

type LanguageContextType = {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: PropsWithChildren) {
  const [lang, setLangState] = useState<Lang>(() => getInitialLang())

  useEffect(() => {
    initI18n()
    i18n.changeLanguage(lang)
    // keep storage in sync on initial mount too
    persistLang(lang)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const ctx = useMemo<LanguageContextType>(() => {
    return {
      lang,
      dir: getDir(lang),
      setLang: (l: Lang) => {
        setLangState(l)
        persistLang(l)
        i18n.changeLanguage(l)
      },
    }
  }, [lang])

  return <LanguageContext.Provider value={ctx}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const v = useContext(LanguageContext)
  if (!v) throw new Error('useLanguage must be used within LanguageProvider')
  return v
}

