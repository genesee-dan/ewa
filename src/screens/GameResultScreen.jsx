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
  ewa:    { emoji: '🤳', label: 'EarnNow app' },
  loc:    { emoji: '🏦', label: 'Credit union LOC' },
  family: { emoji: '👨‍👩‍👧', label: 'Ask family' },
  cut:    { emoji: '✂️', label: 'Cut spending' },
  wait:   { emoji: '🤷', label: 'Wait it out' },
}

export default function GameResultScreen() {
  const navigate = useNavigate()
  const { roundResults, scenario, profile, isPlus, setProfile, numRounds } = useApp()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(t)
  }, [])

  if (!roundResults.length) return <Navigate to="/situation" replace />

  const { advancesPerYear } = scenario

  const totalFees = roundResults.reduce((s, r) => s + r.costOnce, 0)
  const totalCrisisAmt = roundResults.reduce((s, r) => s + r.crisis.amount, 0)
  const ewaRounds = roundResults.filter(r => r.path === 'ewa')
  const tookEWA = ewaRounds.length > 0

  const avgEwaFee = tookEWA ? totalFees / ewaRounds.length : 0
  const ewaAnnual = tookEWA
    ? avgEwaFee * advancesPerYear + (isPlus ? PLUS_MONTHLY * 12 : 0)
    : 0

  const avgCrisisAmt = totalCrisisAmt / roundResults.length
  const locOnce = avgCrisisAmt * 0.13 * (scenario.daysToPayday / 365)
  const locAnnual = locOnce * advancesPerYear
  const saved = ewaAnnual - locAnnual

  const extraRatio = tookEWA ? totalFees / totalCrisisAmt : 0
  const g = tookEWA
    ? grade(extraRatio)
    : { letter: '✓', label: 'You beat it', color: '#4ade80', blurb: "You found better ways every time. Most people don't know they have options." }

  const name = profile?.name && profile.name !== 'Player' ? `, ${profile.name}` : ''

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
        {tookEWA && (
          <p className="text-xs text-slate-400 mt-3">
            They took <strong className="text-red-300">{fmt(totalFees)}</strong> from you across {numRounds} situation{numRounds !== 1 ? 's' : ''}.
          </p>
        )}
      </div>

      {/* Per-round breakdown */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">How each situation went</p>
        <div className="space-y-2">
          {roundResults.map((r, i) => {
            const info = PATH_LABELS[r.path]
            return (
              <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                r.path === 'ewa' ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-700/50'
              }`}>
                <span className="text-base shrink-0">{r.crisis.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 leading-tight truncate">{r.crisis.what.split('.')[0]}</p>
                  <p className="text-xs font-bold text-slate-300 mt-0.5">{info.emoji} {info.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-extrabold ${r.costOnce === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fmtShort(r.costOnce)}
                  </p>
                </div>
              </div>
            )
          })}
          <div className="flex justify-between items-center px-3 py-2 border-t border-slate-600 mt-1">
            <span className="text-xs font-bold text-slate-400">Total paid to EWA</span>
            <span className={`font-extrabold text-base ${totalFees === 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fmtShort(totalFees)}
            </span>
          </div>
        </div>
      </div>

      {/* Annual projection */}
      {tookEWA ? (
        <>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center mb-4">
            <p className="text-xs text-red-300 mb-1">If you used the app every payday ({advancesPerYear}× / year)</p>
            <p className="text-3xl font-extrabold text-red-400">{fmt(ewaAnnual)}</p>
            <p className="text-[11px] text-slate-400 mt-1">to receive your own paycheck a few days early</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center mb-6">
            <p className="text-xs text-green-300 mb-1">Same thing with a 13% credit union line of credit</p>
            <p className="text-3xl font-extrabold text-green-400">{fmt(locAnnual)}/yr</p>
            <p className="text-white text-sm font-bold mt-2">
              You'd keep <span className="text-green-400">{fmt(saved)}</span> a year.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center mb-6">
          <p className="text-xs text-green-300 mb-1">Total fees paid to EWA</p>
          <p className="text-5xl font-extrabold text-green-400">$0.00</p>
          <p className="text-slate-300 text-sm font-bold mt-2">You found a better way every time.</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => navigate('/watch-loc')}
          className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform leading-tight px-4"
          style={{ touchAction: 'manipulation' }}
        >
          ▶ Learn how to save using a credit union line of credit instead
        </button>
        <button
          onClick={() => navigate('/watch')}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          ▶ Why these apps cost you money
        </button>
        <button
          onClick={() => setProfile(null)}
          className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          Play again
        </button>
      </div>
    </div>
  )
}
