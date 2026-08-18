import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'

// Every language lives as a folder of dictionary fragments under src/i18n/<code>/.
// English is bundled eagerly (it's the default AND the fallback, so it must
// always be present). Every other language is code-split and fetched on demand
// the first time it's selected. Adding a language is a new folder + a row here.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文', beta: true },
  { code: 'ar', label: 'العربية', rtl: true, beta: true },
  { code: 'so', label: 'Soomaali', beta: true },
  { code: 'prs', label: 'دری', rtl: true, beta: true },
  { code: 'ne', label: 'नेपाली', beta: true },
]

// English: eager (always available synchronously).
const enModules = import.meta.glob('./en/*.js', { eager: true })
const EN = Object.assign({}, ...Object.values(enModules).map((m) => m.default || {}))

// All languages: lazy loaders grouped by folder → each is a dynamic import()
// chunk that Vite splits out. English is skipped (already bundled).
const lazyModules = import.meta.glob(['./*/*.js', '!./en/*.js'])
const LOADERS = {}
for (const [path, load] of Object.entries(lazyModules)) {
  const code = path.split('/')[1]
  ;(LOADERS[code] ||= []).push(load)
}

const RTL = new Set(LANGUAGES.filter((l) => l.rtl).map((l) => l.code))
const STORAGE_KEY = 'ewa-lang'

function isKnown(code) {
  return code === 'en' || !!LOADERS[code]
}

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isKnown(saved)) return saved
  } catch { /* ignore */ }
  return 'en'
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  const [dicts, setDicts] = useState({ en: EN })
  const loadingRef = useRef(new Set())

  const loadDict = useCallback((code) => {
    if (code === 'en' || loadingRef.current.has(code) || !LOADERS[code]) return
    loadingRef.current.add(code)
    Promise.all(LOADERS[code].map((l) => l()))
      .then((mods) => {
        const merged = Object.assign({}, ...mods.map((m) => m.default || {}))
        setDicts((d) => ({ ...d, [code]: merged }))
      })
      .catch(() => { loadingRef.current.delete(code) })
  }, [])

  // Kick off a fetch for the persisted language on first mount.
  useEffect(() => { loadDict(lang) }, [lang, loadDict])

  const setLang = useCallback((code) => {
    if (!isKnown(code)) return
    loadDict(code)                 // optimistic: switch now, text fills in when the chunk lands
    setLangState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
  }, [loadDict])

  // Keep the document's language + text direction in sync (RTL for ar/prs).
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr'
  }, [lang])

  // t(key, vars?) — current language (once loaded), else English, else the key.
  const t = useCallback((key, vars) => {
    const dict = dicts[lang] || EN
    let str = dict[key]
    if (str == null) str = EN[key]
    if (str == null) return key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v))
      }
    }
    return str
  }, [lang, dicts])

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
