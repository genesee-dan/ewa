import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { pick } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const REFLECTIONS = [
  {
    emoji: '💛',
    heading: 'Sometimes it feels easy.',
    body: "For some people, asking a friend or family member is no big deal — they're happy to help, no questions asked. It works out fine and everyone moves on.",
  },
  {
    emoji: '😬',
    heading: 'Sometimes it feels complicated.',
    body: "For others it's stressful — worrying about being judged, feeling like a burden, or not wanting to mix money and relationships. Both feelings are completely normal.",
  },
  {
    emoji: '🤝',
    heading: 'It depends on your situation.',
    body: "Whether borrowing from people you know is a good option really comes down to who's in your life and how those relationships work. There's no wrong answer.",
  },
]

export default function FamilyPathScreen() {
  const navigate = useNavigate()
  const { scenario, gameCrises, currentRound, finishRound, gameMode } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const [reflection] = useState(() => pick(REFLECTIONS))
  const [stage, setStage] = useState('reflect')

  if (stage === 'reflect') return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Friends &amp; Family</p>
        <div className="text-5xl mb-5">{reflection.emoji}</div>
        <h1 className="text-2xl font-extrabold mb-4">{reflection.heading}</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">{reflection.body}</p>
        <p className="text-slate-400 text-sm leading-relaxed">
          In this scenario, you reach out — and they come through with {fmt(crisis.amount)}.
        </p>
      </div>
      <button
        onClick={() => setStage('done')}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        They send you the money →
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <div className="text-5xl mb-5">💸</div>
        <h1 className="text-2xl font-extrabold mb-3">You got the {fmt(crisis.amount)}.</h1>
        <div className="space-y-3 mb-5">
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">Financial cost</span>
            <span className="font-bold text-green-400">$0.00</span>
          </div>
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">Repaid on payday</span>
            <span className="font-bold text-slate-300">{fmt(crisis.amount)}</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed text-center">
          No fees. No interest. Whether it felt easy or hard, the math worked out — this time.
        </p>
      </div>
      <button
        onClick={() => {
          if (gameMode) { flushSync(() => { finishRound(0) }); navigate('/round-result') }
          else navigate('/cost')
        }}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        {gameMode ? 'See how that went →' : '← Back'}
      </button>
    </div>
  )
}
