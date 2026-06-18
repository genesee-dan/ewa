import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const MOM_RESPONSES = [
  { from: 'mom', text: "Of course honey 💕 Are you eating enough? You sound tired in your texts." },
  { from: 'mom', text: "Your cousin Darren just got promoted to regional manager. Have you thought about where you want to be in five years?" },
  { from: 'mom', text: "I read an article about budgeting apps. Have you tried one? I can send you the link." },
  { from: 'mom', text: "I'll Venmo you right now. But maybe we should set up a little savings account together? I just think—" },
  { from: 'you', text: "Mom. The Venmo." },
  { from: 'mom', text: "Sent! 💚 Love you. Call me Sunday." },
]

export default function FamilyPathScreen() {
  const navigate = useNavigate()
  const { scenario, gameCrises, currentRound, finishRound } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const [stage, setStage] = useState('open') // open | texting | done
  const [visible, setVisible] = useState(0)
  const [typing, setTyping] = useState(false)

  function sendText() {
    setStage('texting')
    revealNext(0)
  }

  function revealNext(idx) {
    if (idx >= MOM_RESPONSES.length) { setStage('done'); return }
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setVisible(idx + 1)
    }, MOM_RESPONSES[idx].from === 'mom' ? 1200 : 500)
  }

  function handleTap() {
    if (stage === 'texting' && !typing && visible < MOM_RESPONSES.length) {
      revealNext(visible)
    }
  }

  if (stage === 'open') return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Wednesday</p>
        <div className="text-5xl mb-5">👨‍👩‍👧</div>
        <h1 className="text-2xl font-extrabold mb-3">You decide to call in a favor.</h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          You text your mom asking for {fmt(crisis.amount)} until Friday.
        </p>
        <p className="text-slate-400 text-sm mt-3">She's always said to ask if you need anything.</p>
        <p className="text-slate-500 text-xs mt-4">This will go fine. Probably.</p>
      </div>
      <button
        onClick={sendText}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        Send the text →
      </button>
    </div>
  )

  if (stage === 'done') return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 bg-slate-900 text-white">
      <div>
        <div className="text-5xl mb-5">💸</div>
        <h1 className="text-2xl font-extrabold mb-3">You got the {fmt(crisis.amount)}.</h1>
        <div className="space-y-3">
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">Financial cost</span>
            <span className="font-bold text-green-400">$0.00</span>
          </div>
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">Emotional cost</span>
            <span className="font-bold text-amber-400">Incalculable</span>
          </div>
          <div className="flex justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
            <span className="text-slate-400">Sunday phone calls owed</span>
            <span className="font-bold">∞</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-5 text-center">
          You'll pay her back Friday. She'll say "don't worry about it" and then worry about it.
        </p>
      </div>
      <button
        onClick={() => { finishRound(0); navigate('/round-result') }}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        See how that went →
      </button>
    </div>
  )

  // texting
  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white" onClick={handleTap}>
      <div className="px-4 pt-4 pb-2 border-b border-slate-800 text-center">
        <p className="font-bold text-sm">Mom 👩</p>
        <p className="text-[10px] text-slate-500">tap to continue</p>
      </div>
      <div className="flex-1 px-4 pt-4 pb-4 space-y-3 overflow-hidden flex flex-col justify-end">
        {/* Player's opening text */}
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm max-w-[80%]">
            Hey mom, could I borrow {fmt(crisis.amount)} until Friday? 🙏
          </div>
        </div>
        {MOM_RESPONSES.slice(0, visible).map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[82%] ${
              msg.from === 'mom'
                ? 'bg-slate-700 text-white rounded-bl-sm'
                : 'bg-blue-500 text-white rounded-br-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {!typing && visible < MOM_RESPONSES.length && (
        <div className="px-4 pb-4">
          <div className="bg-slate-800 rounded-2xl px-4 py-3 text-center text-slate-500 text-xs">
            tap anywhere to continue
          </div>
        </div>
      )}
    </div>
  )
}
