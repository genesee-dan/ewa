import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { pick } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// Each conversation: { contact, emoji, opener (fn), messages, closing }
// opener is a function so it can include the crisis amount
const CONVERSATIONS = [
  {
    contact: 'Mom', emoji: '👩',
    openerKey: 'mom',
    messages: [
      { from: 'them', text: "Of course honey 💕 Are you eating enough? You sound tired in your texts." },
      { from: 'them', text: "Your cousin Darren just got promoted to regional manager. Have you thought about where you want to be in five years?" },
      { from: 'them', text: "I read an article about budgeting apps. Have you tried one? I can send you the link." },
      { from: 'them', text: "I'll Venmo you right now. But maybe we should set up a little savings account together? I just think—" },
      { from: 'you',  text: "Mom. The Venmo." },
      { from: 'them', text: "Sent! 💚 Love you. Call me Sunday." },
    ],
    closing: "You'll pay her back Friday. She'll say \"don't worry about it\" and then worry about it.",
  },
  {
    contact: 'Mom', emoji: '👩',
    openerKey: 'mom',
    messages: [
      { from: 'them', text: "Yes!!! Of course!!! 💕💕 You never have to ask!!" },
      { from: 'them', text: "Sending now 🙏 Also have you been drinking enough water? You look tired in your profile picture." },
      { from: 'them', text: "Your aunt Linda's son just got a job at Google 🤩 Have you thought about tech? I could ask her." },
      { from: 'them', text: "Also are you coming home next month? I already told everyone you'd be there 🥺" },
      { from: 'you',  text: "Mom. The money." },
      { from: 'them', text: "Sent!! 💚 Bring laundry if you want. Love you." },
    ],
    closing: "She's going to bring this up every Thanksgiving for the next decade.",
  },
  {
    contact: 'Mom', emoji: '👩',
    openerKey: 'mom',
    messages: [
      { from: 'them', text: "Oh sweetheart. Hold on, I need to find my reading glasses." },
      { from: 'them', text: "Okay I'm in Venmo but it's asking me to update. Should I update it?" },
      { from: 'them', text: "I updated it but now it wants a new PIN. What should my PIN be? Don't tell me something obvious." },
      { from: 'them', text: "Okay I think I sent it? It said \"pending.\" Is pending good?" },
      { from: 'you',  text: "Yes Mom. Pending is good." },
      { from: 'them', text: "You got it?? 💚 I did it!! Love you so much. I'll call you later to make sure it worked." },
    ],
    closing: "She's going to call you later to make sure it worked.",
  },
  {
    contact: 'Dad', emoji: '👨',
    openerKey: 'dad',
    messages: [
      { from: 'them', text: "Okay. Give me a sec." },
      { from: 'them', text: "What happened to the emergency fund we talked about at Christmas?" },
      { from: 'them', text: "Your sister set one up. She's got three months saved. Just saying." },
      { from: 'them', text: "You know, the reason I could always help you kids out is because I never spent money on things I didn't need. Like that streaming thing. How many of those do you have?" },
      { from: 'you',  text: "Dad. Please." },
      { from: 'them', text: "Sent. Buy groceries, not DoorDash. Love you kiddo." },
    ],
    closing: "He's not wrong about the streaming thing.",
  },
  {
    contact: 'Dad', emoji: '👨',
    openerKey: 'dad',
    messages: [
      { from: 'them', text: "How much?" },
      { from: 'them', text: "Okay. Sending it now." },
      { from: 'them', text: "You know when I was your age I kept $500 cash in a coffee can under the sink. Always. Your grandfather taught me that." },
      { from: 'them', text: "Your uncle Vic does the same thing. Man has never been caught short in 40 years. Something to think about." },
      { from: 'you',  text: "I know Dad. Thank you." },
      { from: 'them', text: "Sent. Don't mention it. Well — mention it to your uncle Vic, he'll appreciate the story." },
    ],
    closing: "The coffee can thing is genuinely good advice. You're not going to do it.",
  },
  {
    contact: 'Jamie (sibling)', emoji: '🧑',
    openerKey: 'sibling',
    messages: [
      { from: 'them', text: "lmao you too?? I'm literally also broke rn" },
      { from: 'them', text: "hold on let me check my account" },
      { from: 'them', text: "ok I can do it but you're paying me back friday RIGHT" },
      { from: 'them', text: "mom would never let me hear the end of it if she found out i didn't help. so this stays between us" },
      { from: 'you',  text: "friday. i promise. you're the best." },
      { from: 'them', text: "sent. you owe me a beer too 😂 love u" },
    ],
    closing: "You owe Jamie a beer and your eternal loyalty.",
  },
  {
    contact: 'Jamie (sibling)', emoji: '🧑',
    openerKey: 'sibling',
    messages: [
      { from: 'them', text: "omg yes of course" },
      { from: 'them', text: "but also?? have you looked into getting a credit union account?? my friend did and got a line of credit for like 13%" },
      { from: 'them', text: "so much better than those cash advance apps. she saves like $400 a year apparently" },
      { from: 'them', text: "anyway sending now. but seriously look into it" },
      { from: 'you',  text: "yeah you're probably right. thank you" },
      { from: 'them', text: "sent 💸 pay me back friday and we're square. also call mom she misses you" },
    ],
    closing: "Jamie is not wrong about the credit union thing. That's literally what this game is about.",
  },
]

export default function FamilyPathScreen() {
  const navigate = useNavigate()
  const { scenario, gameCrises, currentRound, finishRound } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis

  // Pick a random conversation script once on mount
  const [convo] = useState(() => pick(CONVERSATIONS))
  const [stage, setStage] = useState('open')
  const [visible, setVisible] = useState(0)
  const [typing, setTyping] = useState(false)

  const messages = convo.messages

  function getOpenerText() {
    if (convo.openerKey === 'mom') return `Hey mom, could I borrow ${fmt(crisis.amount)} until Friday? 🙏`
    if (convo.openerKey === 'dad') return `Hey dad, could I borrow ${fmt(crisis.amount)} until Friday?`
    return `hey, any chance I could borrow ${fmt(crisis.amount)} until friday? 🙏`
  }

  function sendText() {
    setStage('texting')
    revealNext(0)
  }

  function revealNext(idx) {
    if (idx >= messages.length) { setStage('done'); return }
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setVisible(idx + 1)
    }, messages[idx].from === 'them' ? 1200 : 500)
  }

  function handleTap() {
    if (stage === 'texting' && !typing && visible < messages.length) {
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
          You text {convo.contact === 'Mom' ? 'your mom' : convo.contact === 'Dad' ? 'your dad' : 'your sibling Jamie'} asking for {fmt(crisis.amount)} until Friday.
        </p>
        <p className="text-slate-400 text-sm mt-3">
          {convo.openerKey === 'mom' ? "She's always said to ask if you need anything." :
           convo.openerKey === 'dad' ? "He always says his door is open." :
           "Family looks out for each other. Right?"}
        </p>
        <p className="text-slate-500 text-xs mt-4">This will go fine. Probably.</p>
      </div>
      <button
        onClick={sendText}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
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
            <span className="text-slate-400">{convo.openerKey === 'sibling' ? 'Beers owed' : 'Sunday phone calls owed'}</span>
            <span className="font-bold">∞</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-5 text-center leading-relaxed">{convo.closing}</p>
      </div>
      <button
        onClick={() => { finishRound(0); navigate('/round-result') }}
        className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        See how that went →
      </button>
    </div>
  )

  // texting view
  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white" onClick={handleTap}>
      <div className="px-4 pt-4 pb-2 border-b border-slate-800 text-center">
        <p className="font-bold text-sm">{convo.contact} {convo.emoji}</p>
        <p className="text-[10px] text-slate-500">tap to continue</p>
      </div>
      <div className="flex-1 px-4 pt-4 pb-4 space-y-3 overflow-hidden flex flex-col justify-end">
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm max-w-[80%]">
            {getOpenerText()}
          </div>
        </div>
        {messages.slice(0, visible).map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[82%] ${
              msg.from === 'them'
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
      {!typing && visible < messages.length && (
        <div className="px-4 pb-4">
          <div className="bg-slate-800 rounded-2xl px-4 py-3 text-center text-slate-500 text-xs">
            tap anywhere to continue
          </div>
        </div>
      )}
    </div>
  )
}
