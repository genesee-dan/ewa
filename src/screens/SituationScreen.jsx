import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function SituationScreen() {
  const navigate = useNavigate()
  const { scenario, profile, gameCrises, currentRound, numRounds } = useApp()
  const { earned, payday, daysToPayday } = scenario
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const name = profile?.name && profile.name !== 'Player' ? `, ${profile.name}` : ''

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-8 pb-8 text-white"
      style={{ background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)' }}>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            {numRounds > 1 ? `Situation ${currentRound + 1} of ${numRounds}` : 'The situation'}
          </p>
          <p className="text-xs text-slate-500">Payday {payday}</p>
        </div>

        {numRounds > 1 && (
          <div className="flex gap-1.5 mb-5">
            {Array.from({ length: numRounds }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentRound ? 'bg-amber-400' : i === currentRound ? 'bg-amber-400/50' : 'bg-slate-700'
              }`} />
            ))}
          </div>
        )}

        <div className="text-6xl mb-5">{crisis.emoji}</div>

        <h1 className="text-2xl font-extrabold leading-snug mb-4">{crisis.what}</h1>

        <div className="space-y-2.5 mb-6">
          <div className="flex justify-between items-baseline bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">You need</span>
            <span className="text-red-400 font-extrabold text-lg">{fmt(crisis.amount)}</span>
          </div>
          <div className="flex justify-between items-baseline bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">In your account right now</span>
            <span className="text-white font-extrabold text-lg">{fmt(Math.min(earned.available * 0.3, 47))}</span>
          </div>
          <div className="flex justify-between items-baseline bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">Days until payday</span>
            <span className="text-white font-extrabold text-lg">{daysToPayday}</span>
          </div>
        </div>

        <p className="text-slate-300 text-base leading-relaxed">
          You need <strong className="text-white">{fmt(crisis.amount)}</strong> and you need it now{name}. What do you do?
        </p>
      </div>

      <button
        onClick={() => navigate('/choice')}
        className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        Okay... →
      </button>
    </div>
  )
}
