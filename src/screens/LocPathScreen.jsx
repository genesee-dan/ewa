import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function LocPathScreen() {
  const navigate = useNavigate()
  const t = useT()
  const { scenario, gameCrises, currentRound, finishRound } = useApp()
  const { daysToPayday, payday } = scenario
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const interest = crisis.amount * 0.13 * (daysToPayday / 365)
  const [step, setStep] = useState(0)

  if (step === 0) return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-safe-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">{t('loc.wednesday')}</p>
        <div className="text-5xl mb-5">🏦</div>
        <h1 className="text-2xl font-extrabold mb-4">{t('loc.openApp')}</h1>
        <div className="bg-slate-800 rounded-2xl p-5 space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t('loc.drawFrom')}</span>
            <span className="font-bold">{fmt(crisis.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t('loc.transferredToChecking')}</span>
            <span className="font-bold text-green-400">{t('loc.instantly')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t('loc.rate')}</span>
            <span className="font-bold">{t('loc.apr')}</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm">{t('loc.payBill')}</p>
        <p className="text-slate-500 text-sm mt-2">{t('loc.noGuilt')}</p>
      </div>
      <button
        onClick={() => setStep(1)}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        {t('loc.fastForward', { payday })}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-safe-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">{t('loc.paydayLabel', { payday })}</p>
        <div className="text-5xl mb-5">✅</div>
        <h1 className="text-2xl font-extrabold mb-4">{t('loc.paycheckLands')}</h1>
        <p className="text-slate-300 text-sm mb-6">{t('loc.repaysAuto')}</p>
        <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-5 text-center mb-5">
          <p className="text-green-300 text-xs mb-1">{t('loc.totalInterest')}</p>
          <p className="text-5xl font-extrabold text-green-400">{fmt(interest)}</p>
          <p className="text-slate-400 text-xs mt-2">{t('loc.forDays', { days: daysToPayday, amount: fmt(crisis.amount) })}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">{t('loc.thatsIt')}</p>
          <p className="text-white font-bold mt-1">{t('loc.goAbout')}</p>
        </div>
      </div>
      <button
        onClick={() => { flushSync(() => { finishRound(interest) }); navigate('/round-result') }}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        {t('loc.seeHowYouDid')}
      </button>
    </div>
  )
}
