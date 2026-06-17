import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PROFESSIONS } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function GameSetupScreen() {
  const { startGame, setGameMode } = useApp()
  const [name, setName] = useState('')
  const [prof, setProf] = useState(PROFESSIONS[0])
  const [weeklyPay, setWeeklyPay] = useState(650)

  const annual = weeklyPay * 52

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white px-6 pt-8 pb-8" style={{ scrollbarWidth: 'none' }}>
      <button onClick={() => setGameMode(false)} className="text-slate-400 text-sm mb-4">← Back</button>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Set up your situation</p>
      <h1 className="text-2xl font-extrabold mb-1">Live it for yourself</h1>
      <p className="text-sm text-slate-400 mb-7">
        Enter your real situation, then go through what these apps actually put you through.
      </p>

      {/* Name */}
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Your first name</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Optional"
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3.5 text-base font-semibold text-white outline-none focus:border-amber-400 mb-6"
      />

      {/* Profession */}
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Your job</label>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {PROFESSIONS.map(p => (
          <button
            key={p.role}
            onClick={() => setProf(p)}
            className={`text-left px-3 py-3 rounded-xl border-2 transition-colors ${
              prof.role === p.role ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-slate-800'
            }`}
          >
            <span className={`text-sm font-bold ${prof.role === p.role ? 'text-amber-300' : 'text-slate-200'}`}>
              {p.role}
            </span>
          </button>
        ))}
      </div>

      {/* Weekly pay slider */}
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
        Your weekly take-home pay
      </label>
      <div className="bg-slate-800 rounded-2xl p-5 mb-8">
        <div className="text-center mb-4">
          <span className="text-4xl font-extrabold text-amber-400">{fmt(weeklyPay)}</span>
          <span className="text-slate-400 text-sm">/week</span>
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
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>$300</span>
          <span>$1,500</span>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">
          About <strong className="text-slate-200">{fmt(annual)}</strong> a year
        </p>
      </div>

      <button
        onClick={() => startGame({ name, profession: prof, weeklyPay })}
        className="w-full bg-amber-500 text-slate-900 font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        Enter the simulation →
      </button>
      <p className="text-center text-[11px] text-slate-500 mt-4">
        We'll show you how you did at the end — no scores while you play.
      </p>
    </div>
  )
}
