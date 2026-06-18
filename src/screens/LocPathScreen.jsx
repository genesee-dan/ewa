import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const STEPS = [
  { day: 'Wednesday', content: 'transfer' },
  { day: 'Friday', content: 'repay' },
]

export default function LocPathScreen() {
  const navigate = useNavigate()
  const { scenario, gameCrises, currentRound, finishRound } = useApp()
  const { daysToPayday, payday } = scenario
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const interest = crisis.amount * 0.13 * (daysToPayday / 365)
  const [step, setStep] = useState(0)

  if (step === 0) return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Wednesday</p>
        <div className="text-5xl mb-5">🏦</div>
        <h1 className="text-2xl font-extrabold mb-4">You open your credit union app.</h1>
        <div className="bg-slate-800 rounded-2xl p-5 space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Draw from line of credit</span>
            <span className="font-bold">{fmt(crisis.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Transferred to checking</span>
            <span className="font-bold text-green-400">Instantly ✅</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Rate</span>
            <span className="font-bold">13% APR</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm">You pay your bill. You go buy groceries.</p>
        <p className="text-slate-500 text-sm mt-2">No guilt screens. No countdown timer. No "tip the app."</p>
      </div>
      <button
        onClick={() => setStep(1)}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        Fast forward to {payday} →
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">{payday} — Payday</p>
        <div className="text-5xl mb-5">✅</div>
        <h1 className="text-2xl font-extrabold mb-4">Paycheck lands.</h1>
        <p className="text-slate-300 text-sm mb-6">The line of credit repays automatically from your account.</p>
        <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-5 text-center mb-5">
          <p className="text-green-300 text-xs mb-1">Total interest charged</p>
          <p className="text-5xl font-extrabold text-green-400">{fmt(interest)}</p>
          <p className="text-slate-400 text-xs mt-2">for {daysToPayday} days on {fmt(crisis.amount)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">That's it.</p>
          <p className="text-white font-bold mt-1">You go about your week.</p>
        </div>
      </div>
      <button
        onClick={() => { finishRound(interest); navigate('/round-result') }}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        See how you did →
      </button>
    </div>
  )
}
