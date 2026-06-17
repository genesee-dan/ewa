import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const PLUS_MONTHLY = 9.99

function grade(extraRatio) {
  if (extraRatio <= 0) return { letter: 'S', label: 'Untouchable', color: '#4ade80', blurb: "You paid them nothing. Almost nobody manages this — that's the point." }
  if (extraRatio <= 0.02) return { letter: 'A', label: 'Sharp', color: '#86efac', blurb: 'You dodged nearly everything. They still got a little.' }
  if (extraRatio <= 0.05) return { letter: 'B', label: 'Holding on', color: '#fde047', blurb: 'You resisted, but the nudges still cost you.' }
  if (extraRatio <= 0.1) return { letter: 'C', label: 'Worn down', color: '#fb923c', blurb: 'The dark patterns did their job on you.' }
  return { letter: 'D', label: 'Caught in the loop', color: '#f87171', blurb: 'This is exactly how the business model works.' }
}

export default function GameResultScreen() {
  const navigate = useNavigate()
  const { lastTransfer, isPlus, scenario, profile, setProfile } = useApp()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600)
    return () => clearTimeout(t)
  }, [])

  if (!lastTransfer) return <Navigate to="/" replace />

  const { amount, fee, tip, dodgeTaps } = lastTransfer
  const subThis = isPlus ? PLUS_MONTHLY / 2 : 0
  const extra = fee + tip + subThis
  const extraRatio = amount > 0 ? extra / amount : 0
  const g = grade(extraRatio)

  const advances = scenario.advancesPerYear
  const annualExtra = (fee + tip) * advances + (isPlus ? PLUS_MONTHLY * 12 : 0)

  // Credit union 13% line of credit doing the same thing, repaid each payday
  const locAnnual = amount * 0.13 * (scenario.daysToPayday / 365) * advances
  const saved = annualExtra - locAnnual

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white px-6 pt-8 pb-8" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Simulation complete</p>
      <h1 className="text-2xl font-extrabold mb-6">
        Here's how that went{profile?.name && profile.name !== 'Player' ? `, ${profile.name}` : ''}.
      </h1>

      {/* Grade reveal */}
      <div
        className="rounded-3xl border-2 p-7 text-center mb-6 transition-all duration-700"
        style={{
          borderColor: g.color + '66',
          background: g.color + '14',
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'scale(1)' : 'scale(0.9)',
        }}
      >
        <div className="text-7xl font-black mb-1" style={{ color: g.color }}>{g.letter}</div>
        <p className="text-lg font-extrabold" style={{ color: g.color }}>{g.label}</p>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{g.blurb}</p>
      </div>

      {/* What it cost */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">This advance</p>
        <Row label="You borrowed (your own pay)" value={fmt(amount)} />
        <Row label="The provider took from you" value={fmt(extra)} accent />
        {dodgeTaps > 0 && (
          <p className="text-[11px] text-slate-400 mt-3">
            You clicked through <strong className="text-red-300">{dodgeTaps} guilt screens</strong> trying to avoid
            the tip. Accepting always takes 1 tap — declining never does.
          </p>
        )}
      </div>

      {/* The year */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">If this is your routine</p>
        <p className="text-[11px] text-slate-400 mb-3">
          At {advances} advances a year — what frequent users actually do:
        </p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-xs text-red-300 mb-1">You'd pay this app, per year</p>
          <p className="text-4xl font-extrabold text-red-400">{fmt(annualExtra)}</p>
          <p className="text-[11px] text-slate-400 mt-2">just to reach your own paycheck a few days early</p>
        </div>
      </div>

      {/* Credit union alternative */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-6">
        <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-3">The same money, the better way</p>
        <p className="text-[11px] text-slate-400 mb-3">
          A 13% credit union line of credit — drawn the same way, repaid each payday:
        </p>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center mb-3">
          <p className="text-xs text-green-300 mb-1">Credit union line of credit, per year</p>
          <p className="text-4xl font-extrabold text-green-400">{fmt(locAnnual)}</p>
          <p className="text-[11px] text-slate-400 mt-2">interest only — no fees, no tips, no membership</p>
        </div>
        <p className="text-center text-sm text-slate-200">
          You'd keep <strong className="text-green-400">{fmt(saved)}</strong> a year.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/watch-loc')}
          className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform leading-tight px-4"
        >
          ▶ Learn how to save using a credit union line of credit instead
        </button>
        <button
          onClick={() => navigate('/watch')}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          ▶ Why these apps cost you money
        </button>
        <button
          onClick={() => setProfile(null)}
          className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          Try a different situation
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-sm py-1">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold whitespace-nowrap ${accent ? 'text-red-400 text-lg' : 'text-slate-100'}`}>{value}</span>
    </div>
  )
}
