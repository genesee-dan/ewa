import { useApp } from '../context/AppContext'

export default function LandingScreen() {
  const { setLanded } = useApp()

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-7 text-center text-white"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <div className="text-6xl mb-6">💸</div>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Educational Demo</p>
      <h1 className="text-3xl font-extrabold leading-tight mb-4">
        See how earned wage access apps cost you money
      </h1>
      <p className="text-slate-300 text-sm leading-relaxed mb-10">
        Apps like DailyPay, Dave, and EarnIn promise "your pay, early — for free."
        This demo shows you exactly how much those fees, tips, and memberships
        actually cost over a year.
      </p>
      <button
        onClick={() => setLanded(true)}
        className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base shadow-xl active:scale-95 transition-transform mb-4"
      >
        Start Demo
      </button>
      <p className="text-slate-500 text-xs">
        No real money moves. Educational purposes only.
      </p>
    </div>
  )
}
