import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtShort(n) {
  return n < 1 ? `${Math.round(n * 100)}¢` : fmt(n)
}

const PLUS_MONTHLY = 9.99

const PATH_LABELS = {
  ewa:    { emoji: '🤳', label: 'EarnNow app' },
  loc:    { emoji: '🏦', label: 'Credit union LOC' },
  family: { emoji: '👨‍👩‍👧', label: 'Ask family' },
  cut:    { emoji: '✂️', label: 'Cut spending' },
  wait:   { emoji: '🤷', label: 'Wait it out' },
}

export default function GameResultScreen() {
  const navigate = useNavigate()
  const { roundResults, scenario, profile, isPlus, restartGame, numRounds, setCostPage, lastTransfer } = useApp()

  if (!roundResults.length) return <Navigate to="/situation" replace />

  const { advancesPerYear, daysToPayday } = scenario

  const totalFees = roundResults.reduce((s, r) => s + r.costOnce, 0)
  const ewaRounds = roundResults.filter(r => r.path === 'ewa')
  const tookEWA = ewaRounds.length > 0

  const avgEwaFee = tookEWA ? totalFees / ewaRounds.length : 0
  const ewaAnnual = tookEWA
    ? avgEwaFee * advancesPerYear + (isPlus ? PLUS_MONTHLY * 12 : 0)
    : 0

  // APR from the actual EWA transfer — includes subscription cost if isPlus
  const apr = lastTransfer && lastTransfer.amount > 0
    ? ((lastTransfer.fee + lastTransfer.tip + (lastTransfer.subCost || 0)) / lastTransfer.amount) * (365 / daysToPayday) * 100
    : null

  const name = profile?.name && profile.name !== 'Player' ? `, ${profile.name}` : ''

  function goToFullBreakdown() {
    setCostPage(0)
    navigate('/cost')
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white px-6 pt-7 pb-8" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Simulation complete</p>
      <h1 className="text-2xl font-extrabold mb-4">
        {tookEWA ? `Here's what it cost you${name}.` : `You found another way${name}.`}
      </h1>

      {/* APR — lead with the gut-punch */}
      {tookEWA && apr !== null && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center mb-4">
          <p className="text-sm text-red-300 mb-1">You paid the equivalent of</p>
          <p className="text-red-400 leading-none">
            <span className="text-6xl font-extrabold">{apr.toFixed(0)}%</span>
            <span className="text-2xl font-bold ml-1">APR</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-3">
            A typical credit card is ~24% APR. A payday loan is ~400%.<br />
            The app called it a "fee" and a "tip."
          </p>
        </div>
      )}

      {/* Annual projection — right below APR */}
      {tookEWA && (
        <div className="bg-slate-800 rounded-2xl p-4 text-center mb-4">
          <p className="text-xs text-slate-400 mb-1">If you used the app every payday ({advancesPerYear}× / year)</p>
          <p className="text-3xl font-extrabold text-red-400">{fmt(ewaAnnual)}</p>
          <p className="text-[11px] text-slate-500 mt-1">to receive your own paycheck a few days early</p>
        </div>
      )}

      {/* $0 callout for non-EWA runs */}
      {!tookEWA && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center mb-4">
          <p className="text-sm text-green-300 mb-1">EarnNow collected</p>
          <p className="text-5xl font-extrabold text-green-400">$0.00</p>
          <p className="text-xs text-slate-400 mt-2">You found a better way every time.</p>
        </div>
      )}

      {/* Per-round breakdown */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">How each week went</p>
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
                <p className={`text-sm font-extrabold shrink-0 ${r.costOnce === 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fmtShort(r.costOnce)}
                </p>
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

      <div className="space-y-3">
        <button
          onClick={goToFullBreakdown}
          className="w-full bg-amber-500 text-slate-900 font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          See how EWA really works →
        </button>
        <button
          onClick={restartGame}
          className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          Play again
        </button>
      </div>
    </div>
  )
}
