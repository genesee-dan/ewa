import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { pick } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtShort(n) {
  return n < 1 ? `${Math.round(n * 100)}¢` : fmt(n)
}

const PATH_META = {
  ewa:    { emoji: '🤳', label: 'Used the EarnNow app',     color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30' },
  loc:    { emoji: '🏦', label: 'Credit union LOC',          color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30' },
  family: { emoji: '👨‍👩‍👧', label: 'Asked family',           color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30' },
  cut:    { emoji: '✂️', label: 'Cut spending',              color: 'text-slate-300',  bg: 'bg-slate-700/50 border-slate-600/30' },
  wait:   { emoji: '🤷', label: 'Waited it out',             color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
}

const NARRATIVES = {
  ewa:    ['The money landed. So did the fee.', "App worked. You paid for the privilege.", 'Solved. But they got their cut.', 'Easy button. At a cost.'],
  loc:    ['Barely noticed. That\'s the point.', 'Done. No drama, no guilt screens.', 'Pennies. Because fair credit is boring in the best way.'],
  family: ['Mom came through. Sunday calls owed.', 'Family saved the day. They always do.', 'Problem solved. Thanksgiving may be weird.'],
  cut:    ['The money was yours all along.', 'Skipped a few things. Handled your business.', 'Found it by not spending it.'],
  wait:   ['You held out. Nothing caught fire.', 'Cereal for dinner, payday came.', 'The urgency was invented. You called the bluff.'],
}

const EWA_TAUNTS = [
  '"💰 EarnNow: You still have money available! Don\'t let it expire tonight."',
  '"🔔 EarnNow: Your boosted limit is waiting. Tap to claim before midnight."',
  '"⚡ EarnNow: 3 friends got paid early today. Don\'t miss out — your limit resets soon."',
  '"💸 EarnNow: Your earned wages are just sitting here. Why wait for payday?"',
  '"🎯 EarnNow: You\'ve been pre-approved for an instant transfer. Offer expires in 1:47:22."',
]

export default function RoundResultScreen() {
  const navigate = useNavigate()
  const {
    chosenPath,
    roundResults,
    currentRound,
    numRounds,
    scenario,
    gameCrises,
    lastTransfer,
  } = useApp()

  // The crisis for the round we just finished is at currentRound
  // (finishRound hasn't been called yet — that happens on button tap)
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const path = chosenPath
  const meta = PATH_META[path] ?? PATH_META.ewa

  // Compute cost for this round
  let costOnce = 0
  if (path === 'ewa' && lastTransfer) costOnce = lastTransfer.fee + lastTransfer.tip
  if (path === 'loc') costOnce = crisis.amount * 0.13 * (scenario.daysToPayday / 365)

  const narrative = pick(NARRATIVES[path] ?? NARRATIVES.ewa)

  const prevTotal = roundResults.reduce((s, r) => s + r.costOnce, 0)
  const runningTotal = prevTotal + costOnce

  const roundsDone = currentRound + 1
  const isLastRound = roundsDone >= numRounds
  const showTaunt = path !== 'ewa' && !isLastRound

  const { finishRound } = useApp()

  function handleContinue() {
    finishRound(costOnce)
    navigate(isLastRound ? '/game-result' : '/situation')
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-7 pb-7 bg-slate-900 text-white" style={{ scrollbarWidth: 'none', overflowY: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Situation {roundsDone} of {numRounds}
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: numRounds }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < roundsDone ? 'bg-amber-400' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>

      <h1 className="text-xl font-extrabold mb-4">
        {path === 'ewa' ? 'You used the app.' : 'You found another way.'}
      </h1>

      {/* What you chose + cost */}
      <div className={`rounded-2xl border p-4 mb-3 ${meta.bg}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <p className={`font-extrabold text-sm ${meta.color}`}>{meta.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">{narrative}</p>
          </div>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
          <span className="text-xs text-slate-400">Cost this situation</span>
          <span className={`font-extrabold text-xl ${costOnce === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmtShort(costOnce)}
          </span>
        </div>
      </div>

      {/* Running total */}
      <div className="bg-slate-800 rounded-2xl px-5 py-4 mb-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400">Total paid to EWA so far</p>
          <p className={`text-2xl font-extrabold mt-0.5 ${runningTotal === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmtShort(runningTotal)}
          </p>
        </div>
        {runningTotal === 0 ? <span className="text-3xl">🏆</span> : <span className="text-3xl">😬</span>}
      </div>

      {/* EWA pushes back between rounds */}
      {showTaunt && (
        <div className="bg-green-950/60 border border-green-700/40 rounded-2xl px-4 py-3 mb-3">
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1.5">Meanwhile, on your phone…</p>
          <p className="text-green-300 text-xs font-medium leading-relaxed">{pick(EWA_TAUNTS)}</p>
          <p className="text-slate-500 text-[10px] mt-2 italic">You close the notification.</p>
        </div>
      )}

      {/* Streak if they avoided EWA */}
      {path !== 'ewa' && roundsDone > 1 && roundResults.every(r => r.path !== 'ewa') && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 mb-3 text-center">
          <p className="text-amber-400 font-extrabold text-sm">🔥 {roundsDone}-round streak — haven't touched the app yet!</p>
        </div>
      )}

      <div className="mt-auto pt-2">
        <button
          onClick={handleContinue}
          style={{ touchAction: 'manipulation' }}
          className={`w-full font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform ${
            isLastRound ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-white'
          }`}
        >
          {isLastRound ? 'See your final score →' : `Next situation →`}
        </button>
      </div>
    </div>
  )
}
