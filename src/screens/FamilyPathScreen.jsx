import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { pick } from '../data/scenario'
import { useT } from '../i18n'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const REFLECTIONS = [
  { emoji: '💛', idx: 0 },
  { emoji: '😬', idx: 1 },
  { emoji: '🤝', idx: 2 },
]

export default function FamilyPathScreen() {
  const navigate = useNavigate()
  const t = useT()
  const { scenario, gameCrises, currentRound, finishRound, gameMode } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const [reflection] = useState(() => pick(REFLECTIONS))
  const [stage, setStage] = useState('reflect')

  if (stage === 'reflect') return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-safe-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">{t('family.eyebrow')}</p>
        <div className="text-5xl mb-5">{reflection.emoji}</div>
        <h1 className="text-2xl font-extrabold mb-4">{t(`family.reflection.${reflection.idx}.heading`)}</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">{t(`family.reflection.${reflection.idx}.body`)}</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          {t('family.reachOut', { amount: fmt(crisis.amount) })}
        </p>
      </div>
      <button
        onClick={() => setStage('done')}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        {t('family.sendMoney')}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-safe-8 bg-slate-900 text-white">
      <div>
        <div className="text-5xl mb-5">💸</div>
        <h1 className="text-2xl font-extrabold mb-3">{t('family.gotAmount', { amount: fmt(crisis.amount) })}</h1>
        <div className="space-y-3 mb-5">
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">{t('family.financialCost')}</span>
            <span className="font-bold text-green-400">$0.00</span>
          </div>
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">{t('family.repaidOnPayday')}</span>
            <span className="font-bold text-slate-300">{fmt(crisis.amount)}</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed text-center">
          {t('family.noFees')}
        </p>
      </div>
      <button
        onClick={() => {
          if (gameMode) { flushSync(() => { finishRound(0) }); navigate('/round-result') }
          else navigate('/cost')
        }}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        {gameMode ? t('family.seeHowThatWent') : t('family.back')}
      </button>
    </div>
  )
}
