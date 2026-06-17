import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PROFESSIONS } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const OTHER = { role: 'Other', employer: 'My Employer', rate: [12, 30], defaultRate: 18, job: null }
const ALL_PROFS = [...PROFESSIONS, OTHER]

export default function GameSetupScreen() {
  const { startGame, setGameMode } = useApp()
  const [step, setStep] = useState(0) // 0=name, 1=profession, 2=pay
  const [name, setName] = useState('')
  const [prof, setProf] = useState(null)
  const [customJob, setCustomJob] = useState('')
  const [weeklyPay, setWeeklyPay] = useState(650)

  const selectedProf = prof?.role === 'Other'
    ? { ...OTHER, role: customJob.trim() || 'Worker', job: PROFESSIONS[0].job }
    : prof

  function handleEnter() {
    startGame({ name, profession: selectedProf, weeklyPay })
  }

  if (step === 0) return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6 bg-slate-900 text-white">
      <button onClick={() => setGameMode(false)} className="text-slate-400 text-sm mb-5">← Back</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Step 1 of 3</p>
      <h1 className="text-2xl font-extrabold mb-1">What's your name?</h1>
      <p className="text-sm text-slate-400 mb-8">We'll personalize the reveal at the end.</p>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && setStep(1)}
        placeholder="First name (optional)"
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-4 text-base font-semibold text-white outline-none focus:border-amber-400 mb-auto"
      />
      <button
        onClick={() => setStep(1)}
        className="w-full bg-amber-500 text-slate-900 font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform mt-8"
      >
        Next →
      </button>
    </div>
  )

  if (step === 1) return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6 bg-slate-900 text-white">
      <button onClick={() => setStep(0)} className="text-slate-400 text-sm mb-5">← Back</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Step 2 of 3</p>
      <h1 className="text-2xl font-extrabold mb-5">What's your job?</h1>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {ALL_PROFS.map(p => (
          <button
            key={p.role}
            onClick={() => setProf(p)}
            className={`text-left px-3 py-2.5 rounded-xl border-2 transition-colors ${
              prof?.role === p.role ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-slate-800'
            }`}
          >
            <span className={`text-sm font-bold leading-tight block ${prof?.role === p.role ? 'text-amber-300' : 'text-slate-200'}`}>
              {p.role}
            </span>
          </button>
        ))}
      </div>
      {prof?.role === 'Other' && (
        <input
          autoFocus
          type="text"
          value={customJob}
          onChange={e => setCustomJob(e.target.value)}
          placeholder="Enter your job title"
          className="w-full bg-slate-800 border-2 border-amber-400 rounded-2xl px-4 py-3 text-sm font-semibold text-white outline-none mb-1"
        />
      )}
      <button
        onClick={() => setStep(2)}
        disabled={!prof || (prof.role === 'Other' && !customJob.trim())}
        className={`w-full font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform mt-auto ${
          prof && !(prof.role === 'Other' && !customJob.trim())
            ? 'bg-amber-500 text-slate-900'
            : 'bg-slate-700 text-slate-500'
        }`}
      >
        Next →
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6 bg-slate-900 text-white">
      <button onClick={() => setStep(1)} className="text-slate-400 text-sm mb-5">← Back</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Step 3 of 3</p>
      <h1 className="text-2xl font-extrabold mb-1">Your weekly take-home pay</h1>
      <p className="text-sm text-slate-400 mb-8">After taxes, what lands in your account each week?</p>
      <div className="bg-slate-800 rounded-2xl p-6 mb-auto">
        <div className="text-center mb-6">
          <span className="text-5xl font-extrabold text-amber-400">{fmt(weeklyPay)}</span>
          <span className="text-slate-400 text-base ml-1">/week</span>
          <p className="text-sm text-slate-400 mt-2">{fmt(weeklyPay * 52)} / year</p>
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
        Enter the simulation →
      </button>
      <p className="text-center text-[11px] text-slate-500 mt-3">
        No scores shown during play — only at the end.
      </p>
    </div>
  )
}
