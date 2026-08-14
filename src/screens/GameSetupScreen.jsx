import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'
import { PROFESSIONS } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const OTHER = { role: 'Other', employer: 'My Employer', rate: [12, 30], defaultRate: 18, job: null }
const ALL_PROFS = [...PROFESSIONS, OTHER]

export default function GameSetupScreen() {
  const { startGame, setGameMode } = useApp()
  const t = useT()
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0=name, 1=profession, 2=pay
  const [name, setName] = useState('')
  const [prof, setProf] = useState(null)
  const [customJob, setCustomJob] = useState('')
  const [weeklyPay, setWeeklyPay] = useState(650)

  // Push a history entry for each step so browser back walks through them
  useEffect(() => {
    const onPop = () => {
      setStep(s => {
        if (s > 0) {
          // re-push so back can walk again from the previous step
          window.history.pushState(null, '', window.location.href)
          return s - 1
        }
        // step 0: let history go back naturally (returns to landing)
        setGameMode(false)
        return s
      })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setGameMode])

  function goStep(n) {
    window.history.pushState(null, '', window.location.href)
    setStep(n)
  }

  const selectedProf = prof?.role === 'Other'
    ? { ...OTHER, role: customJob.trim() || 'Worker', job: PROFESSIONS[0].job }
    : prof

  function handleEnter() {
    startGame({ name, profession: selectedProf, weeklyPay })
    navigate('/situation')
  }

  if (step === 0) return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-safe-6 bg-slate-900 text-white">
      <button onClick={() => setGameMode(false)} className="text-slate-400 text-sm mb-5">{t('setup.back')}</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">{t('setup.step1')}</p>
      <h1 className="text-2xl font-extrabold mb-1">{t('setup.nameQ')}</h1>
      <p className="text-sm text-slate-400 mb-8">{t('setup.nameSub')}</p>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && goStep(1)}
        placeholder={t('setup.namePlaceholder')}
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-4 text-base font-semibold text-white outline-none focus:border-amber-400 mb-auto"
      />
      <button
        onClick={() => goStep(1)}
        className="w-full bg-amber-500 text-slate-900 font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform mt-8"
      >
        {t('setup.next')}
      </button>
    </div>
  )

  if (step === 1) return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-safe-6 bg-slate-900 text-white min-h-0">
      <button onClick={() => setStep(0)} className="text-slate-400 text-sm mb-4 shrink-0" style={{ touchAction: 'manipulation' }}>{t('setup.back')}</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 shrink-0">{t('setup.step2')}</p>
      <h1 className="text-2xl font-extrabold mb-3 shrink-0">{t('setup.jobQ')}</h1>
      <div className="flex-1 overflow-y-auto min-h-0 mb-3" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PROFS.map(p => (
            <button
              key={p.role}
              onClick={() => setProf(p)}
              style={{ touchAction: 'manipulation' }}
              className={`text-left px-3 py-2.5 rounded-xl border-2 transition-colors ${
                prof?.role === p.role ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-slate-800'
              }`}
            >
              <span className={`text-sm font-bold leading-tight block ${prof?.role === p.role ? 'text-amber-300' : 'text-slate-200'}`}>
                {p.role === 'Other' ? t('setup.other') : p.role}
              </span>
            </button>
          ))}
        </div>
        {prof?.role === 'Other' && (
          <input
            type="text"
            value={customJob}
            onChange={e => setCustomJob(e.target.value)}
            placeholder={t('setup.jobPlaceholder')}
            style={{ fontSize: '16px' }}
            className="w-full bg-slate-800 border-2 border-amber-400 rounded-2xl px-4 py-3 font-semibold text-white outline-none mt-2"
          />
        )}
      </div>
      <button
        onClick={() => goStep(2)}
        disabled={!prof || (prof.role === 'Other' && !customJob.trim())}
        style={{ touchAction: 'manipulation' }}
        className={`w-full font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform shrink-0 ${
          prof && !(prof.role === 'Other' && !customJob.trim())
            ? 'bg-amber-500 text-slate-900'
            : 'bg-slate-700 text-slate-500'
        }`}
      >
        {t('setup.next')}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-safe-6 bg-slate-900 text-white">
      <button onClick={() => setStep(1)} className="text-slate-400 text-sm mb-5" style={{ touchAction: 'manipulation' }}>{t('setup.back')}</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">{t('setup.step3')}</p>
      <h1 className="text-2xl font-extrabold mb-1">{t('setup.payQ')}</h1>
      <p className="text-sm text-slate-400 mb-8">{t('setup.paySub')}</p>
      <div className="bg-slate-800 rounded-2xl p-6 mb-auto">
        <div className="text-center mb-6">
          <span className="text-5xl font-extrabold text-amber-400">{fmt(weeklyPay)}</span>
          <span className="text-slate-400 text-base ml-1">{t('setup.perWeek')}</span>
          <p className="text-sm text-slate-400 mt-2">{t('setup.perYear', { amount: fmt(weeklyPay * 52) })}</p>
        </div>
        <input
          type="range"
          min="300"
          max="1500"
          step="25"
          value={weeklyPay}
          onChange={e => setWeeklyPay(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$300</span>
          <span>$1,500</span>
        </div>
      </div>
      <button
        onClick={handleEnter}
        className="w-full bg-amber-500 text-slate-900 font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform mt-6"
      >
        {t('setup.enter')}
      </button>
      <p className="text-center text-[11px] text-slate-500 mt-3">
        {t('setup.noScores')}
      </p>
    </div>
  )
}
