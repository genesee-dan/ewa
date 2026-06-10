import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const BANKS = [
  { name: 'Chase', emoji: '🏦' },
  { name: 'Bank of America', emoji: '🏛️' },
  { name: 'Wells Fargo', emoji: '🐎' },
  { name: 'Citi', emoji: '🌆' },
  { name: 'US Bank', emoji: '🇺🇸' },
  { name: 'Capital One', emoji: '💳' },
  { name: 'My Credit Union', emoji: '🤝' },
  { name: 'Other', emoji: '🏧' },
]

export default function OnboardingScreen() {
  const { setProfile } = useApp()
  const [step, setStep] = useState('welcome') // welcome | name | bank | connecting
  const [name, setName] = useState('')
  const [bank, setBank] = useState(null)

  useEffect(() => {
    if (step === 'connecting') {
      const t = setTimeout(() => setProfile({ name: name.trim(), bank }), 2200)
      return () => clearTimeout(t)
    }
  }, [step, name, bank, setProfile])

  if (step === 'welcome') {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-7 text-center text-white"
        style={{ background: 'linear-gradient(160deg, #16a34a 0%, #14532d 100%)' }}
      >
        <div className="text-6xl mb-5">⚡</div>
        <h1 className="text-3xl font-extrabold mb-3">EarnNow</h1>
        <p className="text-green-100 text-lg font-semibold mb-2">
          Get up to <span className="text-white font-extrabold">$750</span> of your pay — today.
        </p>
        <p className="text-green-200 text-sm mb-10">
          No credit check. No interest. It's your money — why wait for payday?
        </p>
        <button
          onClick={() => setStep('name')}
          className="w-full bg-white text-green-700 font-bold py-4 rounded-2xl text-base shadow-xl active:scale-95 transition-transform"
        >
          Get My Money
        </button>
        <p className="text-green-300 text-xs mt-4">Join 4 million members 🎉</p>
      </div>
    )
  }

  if (step === 'name') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-10 bg-white">
        <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Step 1 of 2</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">What's your name?</h1>
        <p className="text-sm text-slate-400 mb-8">So we can say hi properly 👋</p>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="border-2 border-green-500 rounded-2xl px-4 py-4 text-lg font-semibold text-slate-900 outline-none mb-6"
        />
        <button
          onClick={() => name.trim() && setStep('bank')}
          disabled={!name.trim()}
          className={`w-full font-bold py-4 rounded-2xl text-base transition-all ${
            name.trim()
              ? 'bg-green-500 text-white shadow-lg shadow-green-200 active:scale-95'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          Continue
        </button>
      </div>
    )
  }

  if (step === 'bank') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-10 bg-white overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Step 2 of 2</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Link your bank</h1>
        <p className="text-sm text-slate-400 mb-6">
          So we know where to send your money. <span className="text-slate-300">(Demo — nothing is really linked.)</span>
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {BANKS.map(b => (
            <button
              key={b.name}
              onClick={() => setBank(b.name)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-colors ${
                bank === b.name ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'
              }`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className={`text-xs font-bold ${bank === b.name ? 'text-green-700' : 'text-slate-600'}`}>
                {b.name}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => bank && setStep('connecting')}
          disabled={!bank}
          className={`w-full font-bold py-4 rounded-2xl text-base mb-8 transition-all ${
            bank
              ? 'bg-green-500 text-white shadow-lg shadow-green-200 active:scale-95'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          Securely Connect
        </button>
      </div>
    )
  }

  // connecting
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-white text-center">
      <div className="w-14 h-14 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mb-6" />
      <p className="text-lg font-bold text-slate-800 mb-1">Connecting to {bank}…</p>
      <p className="text-sm text-slate-400">Verifying your paycheck deposits</p>
    </div>
  )
}
