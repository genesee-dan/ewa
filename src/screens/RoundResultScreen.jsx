import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { pick } from '../data/scenario'

function fmtSigned(n) {
  const abs = Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  return n >= 0 ? `+${abs}` : `-${Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
}

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtShort(n) {
  return n < 1 ? `${Math.round(n * 100)}¢` : fmt(n)
}

const PATH_META = {
  ewa:    { emoji: '🤳', label: 'Used the EarnNow app',  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30' },
  loc:    { emoji: '🏦', label: 'Credit union LOC',       color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30' },
  family: { emoji: '👨‍👩‍👧', label: 'Friends & Family',    color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30' },
  cut:    { emoji: '✂️', label: 'Cut spending',           color: 'text-slate-300',  bg: 'bg-slate-700/50 border-slate-600/30' },
  wait:   { emoji: '🤷', label: 'Waited it out',          color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
}

const NARRATIVES = {
  ewa:    ['The money landed. So did the fee.', 'App worked. You paid for the privilege.', 'Solved. But they got their cut.'],
  loc:    ["Barely noticed. That's the point.", 'Done. No drama, no guilt screens.', 'Pennies. Because fair credit is boring in the best way.'],
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
  const { roundResults, currentRound, numRounds, scenario, profile } = useApp()

  // finishRound already ran before we navigated here, so read from roundResults
  // currentRound has been incremented — the round we just finished is at index currentRound - 1
  const lastResult = roundResults[currentRound - 1]

  if (!lastResult) return <Navigate to="/situation" replace />

  const { path, costOnce, crisis } = lastResult
  const meta = PATH_META[path] ?? PATH_META.ewa
  const narrative = pick(NARRATIVES[path] ?? NARRATIVES.ewa)

  const roundsDone = currentRound  // currentRound was already incremented by finishRound
  const isLastRound = currentRound >= numRounds
  const runningTotal = roundResults.reduce((s, r) => s + r.costOnce, 0)

  const showTaunt = path !== 'ewa' && !isLastRound
  const allAvoidedEWA = roundResults.every(r => r.path !== 'ewa')
  const showStreak = path !== 'ewa' && roundsDone > 1 && allAvoidedEWA

  return (
    <div className="flex-1 flex flex-col px-6 pt-7 pb-7 bg-slate-900 text-white" style={{ scrollbarWidth: 'none', overflowY: 'auto' }}>
      {/* Header with progress dots */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Week {roundsDone} of {numRounds}
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
          <span className="text-xs text-slate-400">Cost this week</span>
          <span className={`font-extrabold text-xl ${costOnce === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmtShort(costOnce)}
          </span>
        </div>
      </div>

      {/* Running total */}
      <div className="bg-slate-800 rounded-2xl px-5 py-4 mb-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400">Total cost so far</p>
          <p className={`text-2xl font-extrabold mt-0.5 ${runningTotal === 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fmtShort(runningTotal)}
          </p>
        </div>
        {runningTotal === 0 ? <span className="text-3xl">🏆</span> : <span className="text-3xl">😬</span>}
      </div>

      {/* Wallet recap — shows between rounds only, so player sees the cycle */}
      {!isLastRound && profile?.weeklyPay && (() => {
        const weeklyPay = profile.weeklyPay
        const crisisAmt = crisis.amount
        const appFee = costOnce  // what the app/path cost (0 for non-EWA)
        // rough weekly expenses = pay minus what was left before the crisis
        const weeklyExpenses = weeklyPay - (scenario.available ?? 47) - crisisAmt
        const startBalance = scenario.available ?? 47
        const endBalance = startBalance + crisisAmt - crisisAmt + weeklyPay - appFee - weeklyExpenses
        const rows = [
          { label: 'Started with', value: startBalance, color: 'text-slate-300' },
          { label: `Borrowed for ${crisis.emoji ? crisis.emoji.trim() : 'the crisis'}`, value: crisisAmt, color: 'text-blue-400', signed: true },
          { label: 'Payday hit 🎉', value: weeklyPay, color: 'text-green-400', signed: true },
          { label: 'Advance repaid' + (appFee > 0 ? ` + ${fmt(appFee)} fee` : ''), value: -(crisisAmt + appFee), color: appFee > 0 ? 'text-red-400' : 'text-slate-300', signed: true },
          { label: 'Week\'s expenses', value: -weeklyExpenses, color: 'text-slate-400', signed: true },
        ]
        return (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 mb-3">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Your wallet this week</p>
            <div className="space-y-1.5">
              {rows.map((r, i) => (
                <div key={i} className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">{r.label}</span>
                  <span className={`font-bold ${r.color}`}>
                    {r.signed ? fmtSigned(r.value) : fmt(r.value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-baseline text-sm pt-1.5 border-t border-slate-600 mt-1">
                <span className="text-slate-300 font-bold">Starting next week</span>
                <span className={`font-extrabold ${endBalance < 50 ? 'text-red-400' : 'text-green-400'}`}>
                  {fmt(Math.max(0, endBalance))}
                </span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* EWA pushes back between rounds */}
      {showTaunt && (
        <div className="bg-green-950/60 border border-green-700/40 rounded-2xl px-4 py-3 mb-3">
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1.5">Meanwhile, on your phone…</p>
          <p className="text-green-300 text-xs font-medium leading-relaxed">{pick(EWA_TAUNTS)}</p>
          <p className="text-slate-500 text-[10px] mt-2 italic">You close the notification.</p>
        </div>
      )}

      {/* Streak badge */}
      {showStreak && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 mb-3 text-center">
          <p className="text-amber-400 font-extrabold text-sm">🔥 {roundsDone} weeks and haven't touched the app!</p>
        </div>
      )}

      <div className="mt-auto pt-2">
        <button
          onClick={() => navigate(isLastRound ? '/game-result' : '/situation')}
          style={{ touchAction: 'manipulation' }}
          className={`w-full font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform ${
            isLastRound ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-white'
          }`}
        >
          {isLastRound ? 'See what that cost you →' : 'Next week →'}
        </button>
      </div>
    </div>
  )
}
