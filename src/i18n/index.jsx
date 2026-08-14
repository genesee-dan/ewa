import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

// Every language lives as a folder of dictionary fragments under src/i18n/<code>/.
// They're auto-discovered here — adding a language is a new folder + a row in
// LANGUAGES below. `rtl` flips layout direction; `beta` shows a tag in the picker.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文', beta: true },
  { code: 'ar', label: 'العربية', rtl: true, beta: true },
  { code: 'so', label: 'Soomaali', beta: true },
  { code: 'prs', label: 'دری', rtl: true, beta: true },
  { code: 'ne', label: 'नेपाली', beta: true },
]

// Build one merged dictionary per language folder: './ar/data.js' → DICTS.ar
const modules = import.meta.glob('./*/*.js', { eager: true })
const DICTS = {}
for (const [path, mod] of Object.entries(modules)) {
  const code = path.split('/')[1]
  DICTS[code] = Object.assign(DICTS[code] || {}, mod.default || {})
}

const RTL = new Set(LANGUAGES.filter((l) => l.rtl).map((l) => l.code))
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
    if (!DICTS[code] && code !== 'en') return
    setLangState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
  }, [])

  // Keep the document's language + text direction in sync (RTL for ar/prs).
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr'
  }, [lang])

  // t(key, vars?) — current language, then English fallback, then the key.
  const t = useCallback((key, vars) => {
    const dict = DICTS[lang] || DICTS.en
    let str = dict[key]
    if (str == null) str = DICTS.en[key]
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

export function useT() {
  return useLang().t
}
