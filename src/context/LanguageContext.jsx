import { createContext, useContext, useState } from 'react'
import { translations } from '@/i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const t = (section, key) => {
    return translations[lang]?.[section]?.[key] ?? translations.en?.[section]?.[key] ?? key
  }

  const toggle = () => setLang(l => l === 'en' ? 'es' : 'en')

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
