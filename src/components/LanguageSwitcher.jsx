import { useLang, LANGUAGES } from '../i18n'

// Compact segmented language picker. Placed on the landing screen; the choice
// persists (localStorage) across the whole session.
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`inline-flex rounded-full border border-slate-600 overflow-hidden ${className}`}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            lang === code ? 'bg-amber-500 text-slate-900' : 'bg-transparent text-slate-300'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
