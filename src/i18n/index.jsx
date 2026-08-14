import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { en } from './en'
import { es } from './es'

// Add a language here and it becomes available everywhere — no other code changes.
// `label` is what shows in the picker; it's always written in that language.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

const DICTS = { en, es }
const STORAGE_KEY = 'ewa-lang'

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && DICTS[saved]) return saved
  } catch { /* ignore */ }
  return 'en'
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  const setLang = useCallback((code) => {
    if (!DICTS[code]) return
    setLangState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
  }, [])

  // t(key, vars?) — looks up the current language, falls back to English, then
  // to the key itself. English is always the source of truth, so a missing
  // translation degrades gracefully to English rather than breaking.
  const t = useCallback((key, vars) => {
    const dict = DICTS[lang] || en
    let str = dict[key]
    if (str == null) str = en[key]
    if (str == null) return key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v))
      }
    }
    return str
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

// Convenience hook when a component only needs the translate function.
export function useT() {
  return useLang().t
}
