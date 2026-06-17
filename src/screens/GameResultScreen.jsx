import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtShort(n) {
  return n < 1 ? `${Math.round(n * 100)}¢` : fmt(n)
}

const PLUS_MONTHLY = 9.99

function grade(extraRatio) {
  if (extraRatio <= 0) return { letter: 'S', label: 'Untouchable', color: '#4ade80', blurb: "You paid them nothing. Almost nobody manages this — that's the point." }
  if (extraRatio <= 0.02) return { letter: 'A', label: 'Sharp', color: '#86efac', blurb: 'You dodged nearly everything. They still got a little.' }
  if (extraRatio <= 0.05) return { letter: 'B', label: 'Holding on', color: '#fde047', blurb: 'You resisted, but the nudges still cost you.' }
  if (extraRatio <= 0.1) return { letter: 'C', label: 'Worn down', color: '#fb923c', blurb: 'The dark patterns did their job on you.' }
  return { letter: 'D', label: 'Caught in the loop', color: '#f87171', blurb: 'This is exactly how the business model works.' }
}

const PATH_LABELS = {
  ewa: { emoji: '🤳', label: 'EarnNow app' },
  loc: { emoji: '🏦', label: 'Credit union LOC' },
  family: { emoji: '👨‍👩‍👧', label: 'Ask family' },
  cut: { emoji: '✂️', label: 'Cut spending' },
  wait: { emoji: '🤷', label: 'Wait it out' },
}

export default function GameResultScreen() {
  const navigate = useNavigate()
  const { lastTransfer, isPlus, scenario, profile, chosenPath, setProfile } = useApp()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(t)
  }, [])

  if (!chosenPath) return <Navigate to="/choice" replace />

  const { crisis, advancesPerYear, daysToPayday } = scenario
  const crisisAmt = crisis.amount

  // EWA cost
  const ewaExtra = lastTransfer
    ? lastTransfer.fee + lastTransfer.tip + (isPlus ? PLUS_MONTHLY / 2 : 0)
    : crisisAmt * 0.12
  const ewaAnnual = lastTransfer
    ? (lastTransfer.fee + lastTransfer.tip) * advancesPerYear + (isPlus ? PLUS_MONTHLY * 12 : 0)
    : ewaExtra * advancesPerYear

  // LOC cost
  const locOnce = crisisAmt * 0.13 * (daysToPayday / 365)
  const locAnnual = locOnce * advancesPerYear

  const paths = [
    { id: 'ewa', once: ewaExtra, annual: ewaAnnual, note: null },
    { id: 'loc', once: locOnce, annual: locAnnual, note: 'interest only' },
    { id: 'family', once: 0, annual: 0, note: '+ emotional labor' },
    { id: 'cut', once: 0, annual: 0, note: 'money was already yours' },
    { id: 'wait', once: 0, annual: 0, note: 'urgency was invented' },
  ]

  const chosenPathData = paths.find(p => p.id === chosenPath)
  const tookEWA = chosenPath === 'ewa'
  const extraRatio = tookEWA && lastTransfer ? ewaExtra / (lastTransfer.amount || crisisAmt) : 0
  const g = tookEWA ? grade(extraRatio) : { letter: '✓', label: 'You beat it', color: '#4ade80', blurb: "You found a better way. Most people don't know they have options." }

  const name = profile?.name && profile.name !== 'Player' ? `, ${profile.name}` : ''
  const saved = ewaAnnual - locAnnual

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white px-6 pt-7 pb-8" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Simulation complete</p>
      <h1 className="text-2xl font-extrabold mb-5">
        {tookEWA ? `Here's how that went${name}.` : `You chose differently${name}.`}
      </h1>

      {/* Grade */}
      <div
        className="rounded-3xl border-2 p-6 text-center mb-5 transition-all duration-700"
        style={{
          borderColor: g.color + '55',
          background: g.color + '12',
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'scale(1)' : 'scale(0.92)',
        }}
      >
        <div className="text-6xl font-black mb-1" style={{ color: g.color }}>{g.letter}</div>
        <p className="text-lg font-extrabold" style={{ color: g.color }}>{g.label}</p>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">{g.blurb}</p>
        {tookEWA && lastTransfer && (
          <p className="text-xs text-slate-400 mt-3">
            They took <strong className="text-red-300">{fmt(ewaExtra)}</strong> from you this time.
            {lastTransfer.dodgeTaps > 0 && ` You clicked through ${lastTransfer.dodgeTaps} guilt screens.`}
          </p>
        )}
      </div>

      {/* What each path costs — the big comparison */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
          What each path actually costs — for {fmt(crisisAmt)}
        </p>
        <div className="space-y-2">
          {paths.map(p => {
            const info = PATH_LABELS[p.id]
            const isChosen = p.id === chosenPath
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  isChosen ? 'bg-amber-400/10 border border-amber-400/40' : 'bg-slate-700/50'
                }`}
              >
                <span className="text-lg shrink-0">{info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold leading-tight ${isChosen ? 'text-amber-300' : 'text-slate-300'}`}>
                    {info.label} {isChosen && '← you'}
                  </p>
                  {p.note && <p className="text-[10px] text-slate-500">{p.note}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-extrabold ${p.once === 0 ? 'text-green-400' : p.id === 'ewa' ? 'text-red-400' : 'text-slate-200'}`}>
                    {fmtShort(p.once)}
                  </p>
                  <p className="text-[10px] text-slate-500">{fmtShort(p.annual)}/yr</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Annual projection for EWA */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center mb-4">
        <p className="text-xs text-red-300 mb-1">If you used the app every payday ({advancesPerYear}× / year)</p>
        <p className="text-3xl font-extrabold text-red-400">{fmt(ewaAnnual)}</p>
        <p className="text-[11px] text-slate-400 mt-1">to receive your own paycheck a few days early</p>
      </div>

      {/* LOC savings comparison */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center mb-6">
        <p className="text-xs text-green-300 mb-1">Same thing with a 13% credit union line of credit</p>
        <p className="text-3xl font-extrabold text-green-400">{fmt(locAnnual)}/yr</p>
        <p className="text-white text-sm font-bold mt-2">
          You'd keep <span className="text-green-400">{fmt(saved)}</span> a year.
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
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          ▶ Why these apps cost you money
        </button>
        <button
          onClick={() => setProfile(null)}
          className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          Try a different path
        </button>
      </div>
    </div>
  )
}
