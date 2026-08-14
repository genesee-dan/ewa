import { useApp } from '../context/AppContext'
import { useT } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'

const SHOW_GAME = import.meta.env.VITE_SHOW_GAME === 'true'

export default function LandingScreen() {
  const { setLanded, setGameMode } = useApp()
  const t = useT()

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-7 text-center text-white relative"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <LanguageSwitcher className="absolute top-4 right-4" />
      <div className="text-6xl mb-6">💸</div>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{t('landing.badge')}</p>
      <h1 className="text-3xl font-extrabold leading-tight mb-4">
        {t('landing.hook')}
      </h1>
      <p className="text-slate-300 text-sm leading-relaxed mb-10">
        {t('landing.body')}
      </p>
      <button
        onClick={() => { setGameMode(false); setLanded(true) }}
        className="w-full bg-amber-500 text-slate-900 font-extrabold py-4 rounded-2xl text-base shadow-xl active:scale-95 transition-transform mb-3"
        style={{ touchAction: 'manipulation' }}
      >
        {SHOW_GAME ? t('landing.exploreDemo') : t('landing.startDemo')}
      </button>
      {SHOW_GAME && (
        <button
          onClick={() => { setGameMode(true); setLanded(true) }}
          className="w-full bg-slate-700 text-white font-extrabold py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-transform mb-4"
          style={{ touchAction: 'manipulation' }}
        >
          {t('landing.playSim')}
        </button>
      )}
      <p className="text-slate-500 text-xs">
        {t('landing.disclaimer1')}
      </p>
      <p className="text-slate-600 text-xs mt-3 leading-relaxed">
        {t('landing.disclaimer2')}
      </p>
    </div>
  )
}
