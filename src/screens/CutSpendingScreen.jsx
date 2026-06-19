import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const ITEMS = [
  { id: 'coffee', emoji: '☕', label: 'Morning coffee run', desc: '2 days × $5.50', amount: 11.00 },
  { id: 'lunch', emoji: '🍕', label: 'Lunch out Thursday', desc: 'You were going to treat yourself', amount: 14.00 },
  { id: 'streaming', emoji: '📺', label: 'Streaming subscription', desc: "Wait — you forgot you had this", amount: 15.99 },
  { id: 'drinks', emoji: '🍺', label: 'Friday happy hour', desc: 'The group chat is already planning it', amount: 22.00 },
  { id: 'delivery', emoji: '🛵', label: 'Food delivery tonight', desc: 'Delivery fee + tip + surge', amount: 18.50 },
  { id: 'parking', emoji: '🅿️', label: 'Paid parking this week', desc: 'You could take the bus twice', amount: 9.00 },
]

export const ITEMS_MAX = ITEMS.reduce((s, i) => s + i.amount, 0)

export default function CutSpendingScreen() {
  const navigate = useNavigate()
  const { scenario, gameCrises, currentRound, finishRound, gameMode } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const [selected, setSelected] = useState(new Set())
  const [done, setDone] = useState(false)

  // If this crisis is too large to cut your way out of, show a dead end
  if (ITEMS_MAX < crisis.amount) return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cut spending</p>
        <div className="text-5xl mb-5">😬</div>
        <h1 className="text-2xl font-extrabold mb-3">There's not enough to cut.</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          Even if you skipped everything discretionary this week, you'd only find {fmt(ITEMS_MAX)}.
          You need {fmt(crisis.amount)}. Sometimes cutting isn't the answer.
        </p>
        <div className="bg-slate-800 rounded-2xl px-5 py-4 text-center">
          <p className="text-slate-400 text-sm">Max you could free up</p>
          <p className="text-2xl font-extrabold text-red-400 mt-1">{fmt(ITEMS_MAX)}</p>
          <p className="text-slate-500 text-xs mt-1">vs {fmt(crisis.amount)} needed</p>
        </div>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        ← Go back and choose differently
      </button>
    </div>
  )

  const total = [...selected].reduce((sum, id) => {
    const item = ITEMS.find(i => i.id === id)
    return sum + (item?.amount || 0)
  }, 0)

  const covered = total >= crisis.amount

  function toggle(id) {
    if (done) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (done) return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">You found it.</p>
        <div className="text-5xl mb-5">💡</div>
        <h1 className="text-2xl font-extrabold mb-3">The money was already yours.</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          You didn't need to borrow anything. You just needed to see where it was going.
        </p>
        <div className="space-y-2">
          {[...selected].map(id => {
            const item = ITEMS.find(i => i.id === id)
            return (
              <div key={id} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3 text-sm">
                <span className="text-slate-300">{item.emoji} {item.label}</span>
                <span className="text-green-400 font-bold">{fmt(item.amount)}</span>
              </div>
            )
          })}
          <div className="flex justify-between items-center bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-sm mt-1">
            <span className="text-green-300 font-bold">You kept</span>
            <span className="text-green-400 font-extrabold text-base">{fmt(total)}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          if (gameMode) { finishRound(0); navigate('/round-result') }
          else navigate('/cost')
        }}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        {gameMode ? 'See how you did →' : '← Back'}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-5 bg-slate-900 text-white">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Cut spending this week</p>
      <h1 className="text-lg font-extrabold mb-1">Find {fmt(crisis.amount)} somewhere in here.</h1>
      <p className="text-slate-400 text-xs mb-4">Tap things to skip them this week.</p>

      <div className="space-y-2 mb-4">
        {ITEMS.map(item => {
          const on = selected.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                on ? 'border-green-500 bg-green-900/20' : 'border-slate-700 bg-slate-800'
              }`}
            >
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight ${on ? 'line-through text-slate-400' : 'text-white'}`}>
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
              </div>
              <span className={`font-extrabold text-sm shrink-0 ${on ? 'text-green-400' : 'text-slate-400'}`}>
                {fmt(item.amount)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Running total */}
      <div className={`rounded-2xl px-5 py-3 flex justify-between items-center mb-3 transition-colors ${
        covered ? 'bg-green-900/30 border border-green-500/30' : 'bg-slate-800'
      }`}>
        <span className={`text-sm font-bold ${covered ? 'text-green-300' : 'text-slate-400'}`}>
          {covered ? '✓ Found enough' : 'Found so far'}
        </span>
        <span className={`font-extrabold text-lg ${covered ? 'text-green-400' : 'text-slate-200'}`}>
          {fmt(total)}
        </span>
      </div>

      <button
        onClick={() => setDone(true)}
        disabled={!covered}
        className={`w-full font-extrabold py-3.5 rounded-2xl text-base active:scale-95 transition-all ${
          covered ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-500'
        }`}
      >
        {covered ? "That'll do it →" : `Need ${fmt(crisis.amount - total)} more`}
      </button>
    </div>
  )
}
