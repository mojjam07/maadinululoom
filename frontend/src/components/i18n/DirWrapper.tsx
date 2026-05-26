import type { PropsWithChildren } from 'react'
import { useLanguage } from './LanguageProvider'

export default function DirWrapper({ children }: PropsWithChildren) {
  const { dir, lang } = useLanguage()
  return (
    <div dir={dir} lang={lang}>
      {children}
    </div>
  )
}

