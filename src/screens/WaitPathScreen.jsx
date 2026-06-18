import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function WaitPathScreen() {
  const navigate = useNavigate()
  const { scenario, gameCrises, currentRound, finishRound } = useApp()
  const { payday } = scenario
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const [step, setStep] = useState(0)

  const STEPS = [
    {
      day: 'Wednesday night',
      emoji: '🥣',
      text: `Your card declines at the grocery store. You put back the good cereal and get the store brand. It's fine. You've had worse.`,
      sub: null,
    },
    {
      day: 'Thursday',
      emoji: '📱',
      text: 'You get a push notification from EarnNow:',
      sub: '💰 "$340 is waiting for you! Don\'t miss out — your boosted limit expires in 2:59:14"',
      subStyle: 'bg-green-900/40 border border-green-600/40 rounded-xl p-3 text-green-300 text-xs mt-3',
      extra: 'You close the notification. You eat more cereal.',
    },
    {
      day: `${payday} — 9:14am`,
      emoji: '🎉',
      text: 'Paycheck hits.',
      sub: `You pay the ${fmt(crisis.amount)}. You buy the good cereal.`,
      final: true,
    },
  ]

  const s = STEPS[step]

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">{s.day}</p>
        <div className="text-5xl mb-5">{s.emoji}</div>
        <p className="text-lg font-bold text-white leading-relaxed mb-3">{s.text}</p>
        {s.sub && (
          <div className={s.subStyle || 'text-slate-300 text-sm mt-2'}>
            {s.sub}
          </div>
        )}
        {s.extra && <p className="text-slate-400 text-sm mt-4">{s.extra}</p>}
        {s.final && (
          <div className="mt-6 bg-green-900/30 border border-green-500/30 rounded-2xl p-5 text-center">
            <p className="text-green-300 text-xs mb-1">Total cost of waiting</p>
            <p className="text-5xl font-extrabold text-green-400">$0.00</p>
            <p className="text-slate-400 text-xs mt-2">The countdown was invented. The urgency was fake.</p>
          </div>
        )}
      </div>

      {step < STEPS.length - 1 ? (
        <button
          onClick={() => setStep(s => s + 1)}
          className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          {step === 0 ? 'Thursday...' : 'Friday...'}
        </button>
      ) : (
        <button
          onClick={() => { finishRound(0); navigate('/round-result') }}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          See how you did →
        </button>
      )}
    </div>
  )
}
