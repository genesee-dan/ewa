import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function SituationScreen() {
  const navigate = useNavigate()
  const { scenario, profile } = useApp()
  const { crisis, earned, payday, daysToPayday } = scenario
  const name = profile?.name && profile.name !== 'Player' ? `, ${profile.name}` : ''

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 text-white"
      style={{ background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)' }}>

      <div>
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">Wednesday. Payday is {payday}.</p>

        <div className="text-6xl mb-6">{crisis.emoji}</div>

        <h1 className="text-2xl font-extrabold leading-snug mb-4">
          {crisis.what}
        </h1>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-baseline bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">Unexpected expense</span>
            <span className="text-red-400 font-extrabold text-lg">{fmt(crisis.amount)}</span>
          </div>
          <div className="flex justify-between items-baseline bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">Your account balance right now</span>
            <span className="text-white font-extrabold text-lg">{fmt(Math.min(earned.available * 0.3, 47))}</span>
          </div>
          <div className="flex justify-between items-baseline bg-slate-800 rounded-xl px-4 py-3">
            <span className="text-slate-400 text-sm">Days until payday</span>
            <span className="text-white font-extrabold text-lg">{daysToPayday}</span>
          </div>
        </div>

        <p className="text-slate-300 text-base leading-relaxed">
          You need about <strong className="text-white">{fmt(crisis.amount)}</strong> and you need it today{name}.
          What do you do?
        </p>
      </div>

      <button
        onClick={() => navigate('/choice')}
        className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform mt-8"
      >
        Okay... →
      </button>
    </div>
  )
}
