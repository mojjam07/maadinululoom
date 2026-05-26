import { useTranslation } from 'react-i18next'

export type I18nTextProps = {
  k: string
  fallback?: string
}

export function I18nText({ k, fallback }: I18nTextProps) {
  const { t } = useTranslation()
  return <>{t(k, { defaultValue: fallback })}</>
}


