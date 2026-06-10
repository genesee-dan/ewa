import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const QUICK_AMOUNTS = [25, 50, 100, 200]

/*
 * The no-tip path is deliberately a 17-tap gauntlet, modeled on real
 * EWA app dark patterns. Accepting a tip at any point is always 1 tap.
 */
export default function TransferScreen() {
  const navigate = useNavigate()
  const { earned, profile, requestTransfer, countDodgeTap, resetDodgeTaps } = useApp()
  const bank = profile?.bank || 'Chase'

  const [amount, setAmount] = useState(0)
  const [isInstant, setIsInstant] = useState(true)
  const [tip, setTip] = useState(0)

  // amount | tip | confirm | success
  const [step, setStep] = useState('amount')
  // gauntlet sub-stages within the tip step
  const [tipStage, setTipStage] = useState('ask')
  const [surveyChoice, setSurveyChoice] = useState(null)
  const [suggestedTip, setSuggestedTip] = useState(0)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [skipDelay, setSkipDelay] = useState(3)
  // confirm-step dark patterns
  const [confirmSuggested, setConfirmSuggested] = useState(0)
  const [showLastChance, setShowLastChance] = useState(false)
  const [ackChecked, setAckChecked] = useState(false)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [tippedAlready, setTippedAlready] = useState(false)

  const fee = isInstant && amount > 0 ? 3.99 : 0
  const maxAmount = earned.available
  const total = amount + fee + tip + suggestedTip + confirmSuggested

  useEffect(() => {
    if (tipStage === 'lastchance' && skipDelay > 0) {
      const t = setTimeout(() => setSkipDelay(d => d - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [tipStage, skipDelay])

  function acceptTip(value) {
    setTip(value)
    setSuggestedTip(0)
    setTippedAlready(true)
    setStep('confirm')
  }

  function enterConfirmWithoutTip() {
    setConfirmSuggested(1) // sneak a $1 "suggested" tip onto the bill
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
        <p className="text-slate-500 text-sm text-center mb-6">
          {fmt(amount)} is on its way to your {bank} account
        </p>
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
            <span className="text-slate-500">Repaid on payday</span>
            <span className="font-bold text-slate-900">{fmt(amount + fee + finalTip)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/cost')}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform mb-3"
        >
          See what this really costs →
        </button>
        <button onClick={() => navigate('/')} className="text-sm text-slate-400 font-medium">
          Back to home
        </button>
      </div>
    )
  }

  /* ---------------- CONFIRM ---------------- */
  if (step === 'confirm') {
    const needsGauntlet = !tippedAlready
    const canConfirm = tippedAlready || confirmSuggested > 0 || ackChecked
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
              <span className="font-semibold text-slate-800">{bank} ••4821</span>
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
                      countDodgeTap() // tap 13
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

          {needsGauntlet && confirmSuggested === 0 && (
            <label className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3.5 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ackChecked}
                onChange={e => {
                  if (e.target.checked) countDodgeTap() // tap 15
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
              if (!tippedAlready && confirmSuggested === 0) {
                countDodgeTap() // tap 16
                setShowFinalModal(true)
              } else {
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

        {/* last-chance modal after removing the sneaked-in tip */}
        {showLastChance && (
          <Modal>
            <span className="text-4xl mb-3 block">🥺</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">This is your last chance to support the community</h3>
            <p className="text-sm text-slate-500 mb-5">Your $1 helps keep EarnNow free for members like you.</p>
            <button
              onClick={() => {
                setShowLastChance(false)
              }}
              className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm mb-2"
            >
              Keep my $1 tip 💚
            </button>
            <button
              onClick={() => {
                countDodgeTap() // tap 14
                setConfirmSuggested(0)
                setShowLastChance(false)
              }}
              className="text-xs text-slate-400 underline"
            >
              I'm sure, remove it
            </button>
          </Modal>
        )}

        {/* final modal before sending */}
        {showFinalModal && (
          <Modal>
            <span className="text-4xl mb-3 block">💸</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Add a tip before we send it?</h3>
            <p className="text-sm text-slate-500 mb-5">Your money is ready to go. Most members add a small thank-you.</p>
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
                countDodgeTap() // tap 17
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

  /* ---------------- TIP GAUNTLET ---------------- */
  if (step === 'tip') {
    if (tipStage === 'ask') {
      return (
        <TipShell title="Add a tip?">
          <p className="text-sm text-slate-500 text-center mb-6">
            EarnNow doesn't charge interest. Tips from members like you keep it that way. 💚
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[5, 4, 3, 2].map(v => (
              <button
                key={v}
                onClick={() => acceptTip(v)}
                className={`relative py-5 rounded-2xl border-2 font-bold text-lg transition-colors ${
                  v === 4
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                ${v}
                {v === 4 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => acceptTip(4)}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-green-200 active:scale-95 transition-transform mb-4"
          >
            Add $4 tip & continue
          </button>
          <button
            onClick={() => {
              countDodgeTap() // tap 1
              setTipStage('guilt1')
            }}
            className="text-[11px] text-slate-300 underline mx-auto block"
          >
            Continue without tipping
          </button>
        </TipShell>
      )
    }

    if (tipStage === 'guilt1') {
      return (
        <TipModalStage
          emoji="💚"
          title="Tips keep EarnNow free for everyone"
          body="Without tips, we couldn't offer 0% interest advances. Even a small tip makes a big difference."
          acceptLabel="Add $4 tip"
          onAccept={() => acceptTip(4)}
          declineLabel="No thanks"
          onDecline={() => {
            countDodgeTap() // tap 2
            setTipStage('guilt2')
          }}
        />
      )
    }

    if (tipStage === 'guilt2') {
      return (
        <TipModalStage
          emoji="🤝"
          title="9 out of 10 members tip"
          body="Join millions of members who pay it forward so everyone can access their pay early."
          acceptLabel="Tip $3 — most popular"
          onAccept={() => acceptTip(3)}
          declineLabel="I can't tip today"
          onDecline={() => {
            countDodgeTap() // tap 3
            setTipStage('guilt3')
          }}
        />
      )
    }

    if (tipStage === 'guilt3') {
      return (
        <TipModalStage
          emoji="✨"
          title="Even $1 makes a difference"
          body="That's less than a pack of gum. Your $1 helps another member get paid early today."
          acceptLabel="Tip $1"
          onAccept={() => acceptTip(1)}
          declineLabel="Continue without tipping"
          onDecline={() => {
            countDodgeTap() // tap 4
            setTipStage('tipstreak')
          }}
        />
      )
    }

    if (tipStage === 'tipstreak') {
      return (
        <TipModalStage
          emoji="🔥"
          title="Start a TipStreak™"
          body="Automatically add a $2 tip to every transfer and earn exclusive badges. You can cancel anytime*."
          acceptLabel="Enable TipStreak™"
          onAccept={() => acceptTip(2)}
          declineLabel="Not now"
          onDecline={() => {
            countDodgeTap() // tap 5
            setTipStage('survey')
          }}
          footnote="*Cancellation requires contacting support during business hours."
        />
      )
    }

    if (tipStage === 'survey') {
      const options = [
        "I can't afford it right now",
        "I don't believe in tipping an app",
        'I tip sometimes, just not today',
        'Other',
      ]
      return (
        <TipShell title="Quick question">
          <p className="text-sm text-slate-500 text-center mb-5">
            Help us understand — why aren't you tipping today? <span className="text-red-400">(required)</span>
          </p>
          <div className="space-y-2 mb-6">
            {options.map(o => (
              <button
                key={o}
                onClick={() => {
                  if (surveyChoice !== o) countDodgeTap() // tap 6 (first selection)
                  setSurveyChoice(o)
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  surveyChoice === o
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!surveyChoice) return
              countDodgeTap() // tap 7
              setTipStage('roundup')
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

    if (tipStage === 'roundup') {
      const roundUp = Math.ceil(amount + fee) - (amount + fee)
      const roundUpAmt = roundUp === 0 ? 1 : Math.round(roundUp * 100) / 100
      return (
        <TipModalStage
          emoji="🪙"
          title="Thanks for the feedback!"
          body={`One last idea — round up your transfer as a micro-tip? It's only ${fmt(roundUpAmt)}. You won't even notice it.`}
          acceptLabel={`Round up (+${fmt(roundUpAmt)})`}
          onAccept={() => acceptTip(roundUpAmt)}
          declineLabel="No round-up"
          onDecline={() => {
            countDodgeTap() // tap 8
            setSuggestedTip(2)
            setTipStage('resuggest')
          }}
        />
      )
    }

    if (tipStage === 'resuggest') {
      return (
        <TipShell title="Almost there!">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-center">
            <p className="text-sm text-green-700">
              💚 We've applied a <strong>suggested $2 tip</strong> for you — the amount most members choose.
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
                      countDodgeTap() // tap 9
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
                countDodgeTap() // tap 11
                setSkipDelay(3)
                setTipStage('lastchance')
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
              <p className="text-sm text-slate-500 mb-5">Most members keep it. It's how we keep advances interest-free.</p>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl text-sm mb-2"
              >
                Keep the $2 tip 💚
              </button>
              <button
                onClick={() => {
                  countDodgeTap() // tap 10
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

    if (tipStage === 'lastchance') {
      return (
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 text-center text-white"
          style={{ background: 'linear-gradient(160deg, #15803d 0%, #14532d 100%)' }}
        >
          <span className="text-5xl mb-4">😢</span>
          <h2 className="text-2xl font-extrabold mb-2">Before you go…</h2>
          <p className="text-green-200 text-sm mb-8">
            EarnNow runs on tips. Without them, features like instant transfers may not stay available for everyone.
          </p>
          <div className="w-full space-y-2.5 mb-8">
            <button onClick={() => acceptTip(4)} className="w-full bg-white text-green-700 font-bold py-3.5 rounded-2xl">
              Tip $4 💚
            </button>
            <button onClick={() => acceptTip(2)} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl border border-green-400">
              Tip $2
            </button>
            <button onClick={() => acceptTip(1)} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-2xl border border-green-400">
              Tip $1
            </button>
          </div>
          {skipDelay > 0 ? (
            <p className="text-green-400 text-[11px]">continue without tipping ({skipDelay})</p>
          ) : (
            <button
              onClick={() => {
                countDodgeTap() // tap 12
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
              onClick={() => setAmount(Math.min(a, maxAmount))}
              className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                amount === a
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
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
            <p className="text-sm font-bold text-green-600">$3.99</p>
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
            setTipStage('ask')
            setStep('tip')
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

function TipModalStage({ emoji, title, body, acceptLabel, onAccept, declineLabel, onDecline, footnote }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-7 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
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
