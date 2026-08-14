import { ChevronDown, Globe } from 'lucide-react'
import { useLang, LANGUAGES } from '../i18n'

// Language dropdown. Lists every entry in LANGUAGES automatically, so adding a
// language (a new dictionary + a LANGUAGES row) makes it appear here with no
// changes to this component. The choice persists across the session.
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useLang()
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe size={13} className="absolute left-2.5 text-slate-300 pointer-events-none" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label={t('lang.label')}
        className="appearance-none bg-slate-800/80 border border-slate-600 text-slate-100 text-xs font-bold rounded-full pl-7 pr-7 py-1.5 outline-none focus:border-amber-400"
        style={{ touchAction: 'manipulation' }}
      >
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code} className="bg-slate-800 text-slate-100">
            {label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 text-slate-300 pointer-events-none" />
    </div>
  )
}
