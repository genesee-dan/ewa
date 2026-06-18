import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, Clock, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import TipArt from '../components/TipArt'
import { makeGauntlet } from '../data/scenario'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/*
 * The no-tip path is a randomized gauntlet rebuilt on every transfer —
 * a different mix of guilt screens, surveys, and traps each run.
 * Accepting a tip at any point is always exactly 1 tap.
 */
export default function TransferScreen() {
  const navigate = useNavigate()
  const { earned, profile, scenario, isPlus, setIsPlus, requestTransfer, countDodgeTap, resetDodgeTaps, gameMode, finishRound } = useApp()
  const bank = profile?.bank || 'your bank'
  const bankLabel = `${profile?.bank || 'Bank'} ••${scenario.last4}`

  const [amount, setAmount] = useState(0)
  const [isInstant, setIsInstant] = useState(true)
  const [tip, setTip] = useState(0)

  // amount | plus | ask | queue | resuggest | lastchance | confirm | success
  const [step, setStep] = useState('amount')
  const [gauntlet, setGauntlet] = useState(null)
  const [qi, setQi] = useState(0)
  const [surveyChoice, setSurveyChoice] = useState(null)
  const [suggestedTip, setSuggestedTip] = useState(0)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [skipDelay, setSkipDelay] = useState(3)
  const [confirmSuggested, setConfirmSuggested] = useState(0)
  const [showLastChance, setShowLastChance] = useState(false)
  const [ackChecked, setAckChecked] = useState(false)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [tippedAlready, setTippedAlready] = useState(false)

  const fee = isInstant && amount > 0 ? (isPlus ? 0 : 3.99) : 0
  const maxAmount = earned.available
  const total = amount + fee + tip + suggestedTip + confirmSuggested
  const QUICK_AMOUNTS = [25, 50, 100, 200].filter(a => a <= maxAmount).slice(0, 4)

  useEffect(() => {
    if (step === 'lastchance' && skipDelay > 0) {
      const t = setTimeout(() => setSkipDelay(d => d - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [step, skipDelay])

  function tipValueOf(v) {
    return v === 'pct10' ? Math.round(amount * 10) / 100 : v
  }

  function acceptTip(value) {
    setTip(tipValueOf(value))
    setSuggestedTip(0)
    setTippedAlready(true)
    setStep('confirm')
  }

  function advanceQueue() {
    if (qi + 1 < gauntlet.seq.length) {
      setQi(qi + 1)
    } else if (gauntlet.resuggest > 0) {
      setSuggestedTip(gauntlet.resuggest)
      setStep('resuggest')
    } else if (gauntlet.lastChance) {
      setSkipDelay(gauntlet.lastChanceDelay)
      setStep('lastchance')
    } else {
      enterConfirmWithoutTip()
    }
  }

  function afterResuggest() {
    if (gauntlet.lastChance) {
      setSkipDelay(gauntlet.lastChanceDelay)
      setStep('lastchance')
    } else {
      enterConfirmWithoutTip()
    }
  }

  function enterConfirmWithoutTip() {
    setConfirmSuggested(gauntlet.confirmSneak)
    setStep('confirm')
  }

  function sendTransfer(extraTip = 0) {
    requestTransfer(amount, fee, tip + suggestedTip + confirmSuggested + extraTip, isInstant)
    setStep('success')
  }

  /* ---------------- SUCCESS ---------------- */
  if (step === 'success') {
    const finalTip = tip + suggestedTip + confirmSuggested
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Transfer Sent!</h2>
        <p className="text-slate-500 text-sm text-center mb-3">
          {fmt(amount)} is on its way to your {bank} account
        </p>
        <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3.5 py-1.5 mb-5">
          <span className="text-sm">🔥</span>
          <p className="text-xs font-bold text-orange-600">
            Streak extended — {scenario.streak + 1} weeks in a row!
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl w-full p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Amount</span>
            <span className="font-semibold text-slate-800">{fmt(amount)}</span>
          </div>
          {fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Instant fee</span>
              <span className="font-semibold text-slate-800">{fmt(fee)}</span>
            </div>
          )}
          {finalTip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tip</span>
              <span className="font-semibold text-slate-800">{fmt(finalTip)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
            <span className="text-slate-500">Repaid on payday ({scenario.payday})</span>
            <span className="font-bold text-slate-900">{fmt(amount + fee + finalTip)}</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (gameMode) { finishRound(fee + finalTip); navigate('/round-result') }
            else navigate('/cost')
          }}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform mb-3"
        >
          {gameMode ? 'See how that went →' : 'See what this really costs →'}
        </button>
        <button onClick={() => navigate('/')} className="text-sm text-slate-400 font-medium">
          Back to home
        </button>
      </div>
    )
  }

  /* ---------------- CONFIRM ---------------- */
  if (step === 'confirm') {
    const needsCheckbox = !tippedAlready && gauntlet?.checkbox && confirmSuggested === 0
    const canConfirm = tippedAlready || confirmSuggested > 0 || !needsCheckbox || ackChecked
    return (
      <div className="flex-1 flex flex-col bg-white relative">
        <div className="flex items-center px-5 py-4">
          <button onClick={() => setStep('amount')} className="mr-3">
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Confirm Transfer</h1>
        </div>

        <div className="flex-1 px-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="bg-green-50 rounded-2xl p-5 mb-5 text-center">
            <p className="text-sm text-green-700 font-medium mb-1">You'll receive</p>
            <p className="text-4xl font-bold text-green-700">{fmt(amount)}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Transfer to</span>
              <span className="font-semibold text-slate-800">{bankLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Delivery</span>
              <span className="font-semibold text-slate-800">
                {isInstant ? '⚡ Instant (1–5 min)' : '🕐 Standard (1–3 days)'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{isInstant ? 'Instant fee' : 'Transfer fee'}</span>
              <span className="font-semibold text-slate-800">{fee > 0 ? fmt(fee) : 'Free'}</span>
            </div>
            {tip + suggestedTip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Your tip 💚</span>
                <span className="font-semibold text-slate-800">{fmt(tip + suggestedTip)}</span>
              </div>
            )}
            {confirmSuggested > 0 && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">
                  Community tip <span className="text-slate-300">(suggested)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{fmt(confirmSuggested)}</span>
                  <button
                    onClick={() => {
                      countDodgeTap()
                      setShowLastChance(true)
                    }}
                    className="text-xs text-slate-300 underline"
                  >
                    remove
                  </button>
                </span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between text-sm">
              <span className="text-slate-700 font-medium">Total repaid on payday</span>
              <span className="font-bold text-slate-900">{fmt(total)}</span>
            </div>
          </div>

          {needsCheckbox && (
            <label className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3.5 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ackChecked}
                onChange={e => {
                  if (e.target.checked) countDodgeTap()
                  setAckChecked(e.target.checked)
                }}
                className="mt-0.5 accent-green-600"
              />
              <span className="text-xs text-amber-700">
                I understand EarnNow relies on tips to stay free, and I choose not to contribute today.
              </span>
            </label>
          )}
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={() => {
              if (!canConfirm) return
              if (!tippedAlready && confirmSuggested === 0 && gauntlet?.finalModal) {
                countDodgeTap()
                setShowFinalModal(true)
              } else {
                if (!tippedAlready && confirmSuggested === 0) countDodgeTap()
                sendTransfer()
              }
            }}
            disabled={!canConfirm}
            className={`w-full font-bold py-4 rounded-2xl text-base transition-all ${
              canConfirm
                ? 'bg-green-500 text-white active:scale-95 shadow-lg shadow-green-200'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            Confirm & Transfer {fmt(amount)}
          </button>
        </div>

        {showLastChance && (
          <Modal>
            <span className="text-4xl mb-3 block">🥺</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              This is your last chance to support the community
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Your {fmt(confirmSuggested)} helps keep EarnNow free for members like you.
            </p>
            <button
              onClick={() => setShowLastChance(false)}
              className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm mb-2"
            >
              Keep my {fmt(confirmSuggested)} tip 💚
            </button>
            <button
              onClick={() => {
                countDodgeTap()
                setConfirmSuggested(0)
                setShowLastChance(false)
              }}
              className="text-xs text-slate-400 underline"
            >
              I'm sure, remove it
            </button>
          </Modal>
        )}

        {showFinalModal && (
          <Modal>
            <span className="text-4xl mb-3 block">💸</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Add a tip before we send it?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Your money is ready to go. Most members add a small thank-you.
            </p>
            <button
              onClick={() => {
                setShowFinalModal(false)
                sendTransfer(2)
              }}
              className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm mb-2"
            >
              Add $2 & Send ⚡
            </button>
            <button
              onClick={() => {
                countDodgeTap()
                setShowFinalModal(false)
                sendTransfer()
              }}
              className="text-xs text-slate-400 underline"
            >
              Send without tip
            </button>
          </Modal>
        )}
      </div>
    )
  }

  /* ---------------- EARNNOW+ UPSELL ---------------- */
  if (step === 'plus') {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center bg-white px-7 text-center overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <TipArt main="🚀" minis={['⭐', '💎', '⚡', '💸']} from="#fef3c7" to="#fde68a" />
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Wait — don't pay that {fmt(3.99)} fee!</h2>
        <p className="text-sm text-slate-500 mb-5">
          EarnNow<span className="text-amber-500 font-bold">+</span> members get{' '}
          <strong className="text-slate-700">$0 instant fees</strong>, higher limits, and priority transfers.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full mb-5">
          <p className="text-3xl font-extrabold text-amber-600 mb-1">FREE</p>
          <p className="text-xs font-bold text-slate-700">for 7 days, then just $9.99/mo</p>
          <p className="text-[10px] text-slate-400 mt-1.5">That's less than one instant fee a week!</p>
        </div>
        <button
          onClick={() => {
            setIsPlus(true)
            setStep('ask')
          }}
          className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-amber-200 active:scale-95 transition-transform mb-4"
        >
          Start free trial — save {fmt(3.99)} now ⚡
        </button>
        <button onClick={() => setStep('ask')} className="text-[11px] text-slate-300 underline mb-4">
          No thanks, I'll pay the $3.99 fee
        </button>
        <p className="text-[9px] text-slate-300 leading-relaxed">
          Trial auto-renews at $9.99/mo unless cancelled at least 3 business days before renewal. Cancellation
          available by contacting support during business hours.
        </p>
      </div>
    )
  }

  /* ---------------- TIP ASK ---------------- */
  if (step === 'ask') {
    return (
      <TipShell title="Add a tip?">
        <TipArt main="🐷" minis={['💚', '🪙', '✨', '😊']} from="#fce7f3" to="#dcfce7" />
        <p className="text-sm text-slate-500 text-center mb-6">
          EarnNow doesn't charge interest. Tips from members like you keep it that way. 💚
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {gauntlet.tipMenu.map(v => (
            <button
              key={v}
              onClick={() => acceptTip(v)}
              className={`relative py-5 rounded-2xl border-2 font-bold text-lg transition-colors ${
                v === gauntlet.popularTip
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              ${v}
              {v === gauntlet.popularTip && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => acceptTip(gauntlet.popularTip)}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-green-200 active:scale-95 transition-transform mb-4"
        >
          Add ${gauntlet.popularTip} tip & continue
        </button>
        <button
          onClick={() => {
            countDodgeTap()
            setQi(0)
            setStep('queue')
          }}
          className="text-[11px] text-slate-300 underline mx-auto block"
        >
          Continue without tipping
        </button>
      </TipShell>
    )
  }

  /* ---------------- RANDOMIZED GAUNTLET QUEUE ---------------- */
  if (step === 'queue') {
    const stage = gauntlet.seq[qi]

    if (stage.kind === 'guilt') {
      return (
        <TipModalStage
          art={stage.art}
          title={stage.title}
          body={stage.body}
          acceptLabel={stage.tipValue === 'pct10' ? `Tip 10% (${fmt(tipValueOf('pct10'))})` : stage.acceptLabel}
          onAccept={() => acceptTip(stage.tipValue)}
          declineLabel={stage.declineLabel}
          onDecline={() => {
            countDodgeTap()
            advanceQueue()
          }}
        />
      )
    }

    if (stage.kind === 'tipstreak') {
      return (
        <TipModalStage
          art={{ main: '🔥', minis: ['🏅', '⚡', '🏆', '🎖️'], from: '#ffedd5', to: '#fed7aa' }}
          title="Start a TipStreak™"
          body="Automatically add a $2 tip to every transfer and earn exclusive badges. You can cancel anytime*."
          acceptLabel="Enable TipStreak™"
          onAccept={() => acceptTip(2)}
          declineLabel="Not now"
          onDecline={() => {
            countDodgeTap()
            advanceQueue()
          }}
          footnote="*Cancellation requires contacting support during business hours."
        />
      )
    }

    if (stage.kind === 'survey') {
      return (
        <TipShell title="Quick question">
          <TipArt main="🤔" minis={['📋', '✏️', '💭', '❓']} from="#f1f5f9" to="#e2e8f0" />
          <p className="text-sm text-slate-500 text-center mb-5">
            {stage.question} <span className="text-red-400">(required)</span>
          </p>
          <div className="space-y-2 mb-6">
            {stage.options.map(o => (
              <button
                key={o}
                onClick={() => {
                  if (surveyChoice !== o) countDodgeTap()
                  setSurveyChoice(o)
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  surveyChoice === o ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!surveyChoice) return
              countDodgeTap()
              setSurveyChoice(null)
              advanceQueue()
            }}
            disabled={!surveyChoice}
            className={`w-full font-bold py-4 rounded-2xl text-base transition-all ${
              surveyChoice ? 'bg-green-500 text-white active:scale-95' : 'bg-slate-200 text-slate-400'
            }`}
          >
            Submit
          </button>
        </TipShell>
      )
    }

    // roundup
    const roundUp = Math.ceil(amount + fee) - (amount + fee)
    const roundUpAmt = roundUp === 0 ? 1 : Math.round(roundUp * 100) / 100
    return (
      <TipModalStage
        art={{ main: '🪙', minis: ['➕', '😊', '✨', '💰'], from: '#fef9c3', to: '#fde68a' }}
        title="One last idea!"
        body={`Round up your transfer as a micro-tip? It's only ${fmt(roundUpAmt)}. You won't even notice it.`}
        acceptLabel={`Round up (+${fmt(roundUpAmt)})`}
        onAccept={() => acceptTip(roundUpAmt)}
        declineLabel="No round-up"
        onDecline={() => {
          countDodgeTap()
          advanceQueue()
        }}
      />
    )
  }

  /* ---------------- RESUGGEST ---------------- */
  if (step === 'resuggest') {
    return (
      <TipShell title="Almost there!">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-center">
          <p className="text-sm text-green-700">
            💚 We've applied a <strong>suggested {fmt(gauntlet.resuggest)} tip</strong> for you — the amount most
            members choose.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Transfer</span>
            <span className="font-semibold text-slate-800">{fmt(amount)}</span>
          </div>
          {fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Instant fee</span>
              <span className="font-semibold text-slate-800">{fmt(fee)}</span>
            </div>
          )}
          {suggestedTip > 0 && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500">Suggested tip</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{fmt(suggestedTip)}</span>
                <button
                  onClick={() => {
                    countDodgeTap()
                    setShowRemoveModal(true)
                  }}
                  className="text-[11px] text-slate-300 underline"
                >
                  remove
                </button>
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (suggestedTip > 0) {
              setTippedAlready(true)
              setStep('confirm')
            } else {
              countDodgeTap()
              afterResuggest()
            }
          }}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-green-200 active:scale-95 transition-transform"
        >
          Continue
        </button>

        {showRemoveModal && (
          <Modal>
            <span className="text-4xl mb-3 block">😟</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Remove the suggested tip?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Most members keep it. It's how we keep advances interest-free.
            </p>
            <button
              onClick={() => setShowRemoveModal(false)}
              className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm mb-2"
            >
              Keep the {fmt(gauntlet.resuggest)} tip 💚
            </button>
            <button
              onClick={() => {
                countDodgeTap()
                setSuggestedTip(0)
                setShowRemoveModal(false)
              }}
              className="text-xs text-slate-400 underline"
            >
              Yes, remove it
            </button>
          </Modal>
        )}
      </TipShell>
    )
  }

  /* ---------------- LAST CHANCE ---------------- */
  if (step === 'lastchance') {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 text-center text-white"
        style={{ background: 'linear-gradient(160deg, #15803d 0%, #14532d 100%)' }}
      >
        <TipArt main="🐶" minis={['💧', '😢', '🥺', '💔']} from="#475569" to="#1e293b" />
        <h2 className="text-2xl font-extrabold mb-2">Before you go…</h2>
        <p className="text-green-200 text-sm mb-8">
          EarnNow runs on tips. Without them, features like instant transfers may not stay available for everyone.
        </p>
        <div className="w-full space-y-2.5 mb-8">
          <button onClick={() => acceptTip(4)} className="w-full bg-white text-green-700 font-bold py-3.5 rounded-2xl">
            Tip $4 💚
          </button>
          <button
            onClick={() => acceptTip(2)}
            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl border border-green-400"
          >
            Tip $2
          </button>
          <button
            onClick={() => acceptTip(1)}
            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl border border-green-400"
          >
            Tip $1
          </button>
        </div>
        {skipDelay > 0 ? (
          <p className="text-green-400 text-[11px]">continue without tipping ({skipDelay})</p>
        ) : (
          <button
            onClick={() => {
              countDodgeTap()
              enterConfirmWithoutTip()
            }}
            className="text-green-300 text-[11px] underline"
          >
            continue without tipping
          </button>
        )}
      </div>
    )
  }

  /* ---------------- AMOUNT ---------------- */
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center px-5 py-4">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ChevronLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Get Paid Now</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5" style={{ scrollbarWidth: 'none' }}>
        <div className="text-center mb-5 py-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Available to transfer</p>
          <p className="text-3xl font-bold text-slate-900">{fmt(maxAmount)}</p>
        </div>

        <div className="relative mb-4">
          <div className="flex items-center border-2 border-green-500 rounded-2xl px-4 py-4">
            <span className="text-2xl font-bold text-slate-400 mr-1">$</span>
            <input
              type="number"
              min={0}
              max={maxAmount}
              value={amount || ''}
              onChange={e => setAmount(Math.min(Number(e.target.value), maxAmount))}
              placeholder="0"
              className="flex-1 text-2xl font-bold text-slate-900 outline-none bg-transparent"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {QUICK_AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                amount === a ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              ${a}
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Delivery Speed</p>
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setIsInstant(true)}
            className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors ${
              isInstant ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${isInstant ? 'bg-green-500' : 'bg-slate-100'}`}>
              <Zap size={16} className={isInstant ? 'text-white' : 'text-slate-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-bold ${isInstant ? 'text-green-700' : 'text-slate-700'}`}>Instant Transfer</p>
              <p className="text-xs text-slate-400">Arrives in 1–5 minutes</p>
            </div>
            {isPlus ? (
              <p className="text-sm font-bold text-amber-500">
                <span className="line-through text-slate-300 mr-1">$3.99</span>$0
              </p>
            ) : (
              <p className="text-sm font-bold text-green-600">$3.99</p>
            )}
          </button>
          <button
            onClick={() => setIsInstant(false)}
            className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors ${
              !isInstant ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${!isInstant ? 'bg-green-500' : 'bg-slate-100'}`}>
              <Clock size={16} className={!isInstant ? 'text-white' : 'text-slate-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-bold ${!isInstant ? 'text-green-700' : 'text-slate-700'}`}>Standard Transfer</p>
              <p className="text-xs text-slate-400">Arrives 1–3 business days</p>
            </div>
            <p className="text-sm font-bold text-slate-400">Free</p>
          </button>
        </div>

        {isPlus ? (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
            <Star size={18} className="text-amber-500 fill-amber-400" />
            <p className="text-xs font-bold text-amber-700">
              EarnNow+ member — instant fees waived 🎉
              <span className="block font-normal text-amber-500">$9.99/mo after free trial</span>
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
            <Star size={18} className="text-amber-500" />
            <p className="text-xs text-amber-700">
              <strong>EarnNow+</strong> members pay <strong>$0 instant fees</strong> — free 7-day trial, then $9.99/mo
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-white">
        <button
          onClick={() => {
            if (amount <= 0 || amount > maxAmount) return
            resetDodgeTaps()
            setTip(0)
            setSuggestedTip(0)
            setConfirmSuggested(0)
            setAckChecked(false)
            setTippedAlready(false)
            setSurveyChoice(null)
            setGauntlet(makeGauntlet())
            setQi(0)
            setStep(isInstant && !isPlus ? 'plus' : 'ask')
          }}
          disabled={amount <= 0 || amount > maxAmount}
          className={`w-full font-bold py-4 rounded-2xl text-base transition-all ${
            amount > 0 && amount <= maxAmount
              ? 'bg-green-500 text-white active:scale-95 shadow-lg shadow-green-200'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          {amount > 0 ? `Get ${fmt(amount)} Now` : 'Enter an amount'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function TipShell({ title, children }) {
  return (
    <div className="flex-1 flex flex-col bg-white px-6 pt-10 relative overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-3">{title}</h1>
      {children}
    </div>
  )
}

function TipModalStage({ art, title, body, acceptLabel, onAccept, declineLabel, onDecline, footnote }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-7 text-center">
      <TipArt {...art} />
      <h2 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 mb-8">{body}</p>
      <button
        onClick={onAccept}
        className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-green-200 active:scale-95 transition-transform mb-4"
      >
        {acceptLabel}
      </button>
      <button onClick={onDecline} className="text-[11px] text-slate-300 underline">
        {declineLabel}
      </button>
      {footnote && <p className="text-[9px] text-slate-300 mt-6">{footnote}</p>}
    </div>
  )
}

function Modal({ children }) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-6 z-20">
      <div className="bg-white rounded-3xl p-6 w-full text-center">{children}</div>
    </div>
  )
}
