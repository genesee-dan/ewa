import { ChevronDown, Globe } from 'lucide-react'
import { useLang, LANGUAGES } from '../i18n'

// Language dropdown. The OUTER element takes the caller's positioning class
// (e.g. `absolute top-4 right-4`); a separate INNER wrapper is `relative` so the
// globe/chevron icons anchor to it — keeping the two position contexts from
// colliding. Lists every LANGUAGES entry automatically.
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useLang()
  return (
    <div className={`z-30 ${className}`}>
      <div className="relative inline-flex items-center">
        <Globe size={13} className="absolute left-2.5 text-slate-300 pointer-events-none" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label={t('lang.label')}
          className="appearance-none bg-slate-800/90 border border-slate-600 text-slate-100 text-xs font-bold rounded-full pl-7 pr-7 py-1.5 outline-none focus:border-amber-400"
          style={{ touchAction: 'manipulation' }}
        >
          {LANGUAGES.map(({ code, label, beta }) => (
            <option key={code} value={code} className="bg-slate-800 text-slate-100">
              {label}{beta ? ' (beta)' : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2 text-slate-300 pointer-events-none" />
      </div>
    </div>
  )
}
