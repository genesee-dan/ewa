import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap, Clock, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const QUICK_AMOUNTS = [25, 50, 100, 200]
const TIPS = [0, 1, 2, 3]

export default function TransferScreen() {
  const navigate = useNavigate()
  const { earned, requestTransfer } = useApp()
  const [amount, setAmount] = useState(0)
  const [isInstant, setIsInstant] = useState(true)
  const [tip, setTip] = useState(0)
  const [step, setStep] = useState('amount') // amount | confirm | success

  const fee = isInstant ? (amount > 0 ? 3.99 : 0) : 0
  const total = amount + fee + tip
  const maxAmount = earned.available

  function handleSubmit() {
    if (step === 'amount') {
      if (amount <= 0 || amount > maxAmount) return
      setStep('confirm')
    } else if (step === 'confirm') {
      requestTransfer(amount, fee, isInstant)
      setStep('success')
    }
  }

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-bounce">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Transfer Sent!</h2>
        <p className="text-slate-500 text-sm text-center mb-1">
          {fmt(amount)} is on its way to your Chase account ending in 4821
        </p>
        <p className="text-slate-400 text-xs text-center mb-8">
          {isInstant ? 'Arrives in 1–5 minutes' : 'Arrives by next business day'}
        </p>
        <div className="bg-slate-50 rounded-2xl w-full p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Amount transferred</span>
            <span className="font-semibold text-slate-800">{fmt(amount)}</span>
          </div>
          {fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Instant fee</span>
              <span className="font-semibold text-slate-800">{fmt(fee)}</span>
            </div>
          )}
          {tip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tip</span>
              <span className="font-semibold text-slate-800">{fmt(tip)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
            <span className="text-slate-500">Total charged</span>
            <span className="font-bold text-slate-900">{fmt(total)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        >
          Back to Home
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center px-5 py-4">
          <button onClick={() => setStep('amount')} className="mr-3">
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Confirm Transfer</h1>
        </div>

        <div className="flex-1 px-5">
          {/* Amount display */}
          <div className="bg-green-50 rounded-2xl p-5 mb-5 text-center">
            <p className="text-sm text-green-700 font-medium mb-1">You'll receive</p>
            <p className="text-4xl font-bold text-green-700">{fmt(amount)}</p>
          </div>

          {/* Details */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Transfer to</span>
              <span className="font-semibold text-slate-800">Chase ••4821</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Delivery</span>
              <span className={`font-semibold ${isInstant ? 'text-green-600' : 'text-slate-800'}`}>
                {isInstant ? '⚡ Instant (1–5 min)' : '🕐 Standard (1–3 days)'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{isInstant ? 'Instant fee' : 'Transfer fee'}</span>
              <span className="font-semibold text-slate-800">{fee > 0 ? fmt(fee) : 'Free'}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tip</span>
                <span className="font-semibold text-slate-800">{fmt(tip)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 flex justify-between text-sm">
              <span className="text-slate-700 font-medium">Total from earnings</span>
              <span className="font-bold text-slate-900">{fmt(total)}</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 mb-5">
            <span className="text-base mt-0.5">ℹ️</span>
            <p className="text-xs text-amber-700">
              This amount will be repaid automatically from your next paycheck on <strong>{`Jun 15`}</strong>. No action needed.
            </p>
          </div>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform shadow-lg shadow-green-200"
          >
            Confirm & Transfer {fmt(amount)}
          </button>
        </div>
      </div>
    )
  }

  // Amount selection step
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center px-5 py-4">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ChevronLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Get Paid Now</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5" style={{ scrollbarWidth: 'none' }}>
        {/* Available balance */}
        <div className="text-center mb-5 py-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Available to transfer</p>
          <p className="text-3xl font-bold text-slate-900">{fmt(maxAmount)}</p>
        </div>

        {/* Amount input */}
        <div className="relative mb-4">
          <div className="flex items-center border-2 border-green-500 rounded-2xl px-4 py-4">
            <span className="text-2xl font-bold text-slate-400 mr-1">$</span>
            <input
              type="number"
              min={0}
              max={maxAmount}
              step={1}
              value={amount || ''}
              onChange={e => setAmount(Math.min(Number(e.target.value), maxAmount))}
              placeholder="0"
              className="flex-1 text-2xl font-bold text-slate-900 outline-none bg-transparent"
              style={{ minWidth: 0 }}
            />
            {amount > 0 && (
              <button
                onClick={() => setAmount(0)}
                className="text-slate-300 text-lg font-bold"
              >✕</button>
            )}
          </div>
          {amount > maxAmount && (
            <p className="text-red-500 text-xs mt-1 px-1">Max available is {fmt(maxAmount)}</p>
          )}
        </div>

        {/* Quick select */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {QUICK_AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => setAmount(Math.min(a, maxAmount))}
              className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                amount === a
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 active:bg-slate-100'
              }`}
            >
              ${a}
            </button>
          ))}
        </div>

        {/* Max button */}
        <button
          onClick={() => setAmount(maxAmount)}
          className="w-full border border-green-200 text-green-600 font-semibold py-2.5 rounded-xl text-sm mb-5 bg-green-50 active:bg-green-100"
        >
          Transfer max ({fmt(maxAmount)})
        </button>

        {/* Delivery speed */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Delivery Speed</p>
        <div className="space-y-2 mb-5">
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
            <p className={`text-sm font-bold ${isInstant ? 'text-green-600' : 'text-slate-400'}`}>$3.99</p>
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
            <p className={`text-sm font-bold ${!isInstant ? 'text-green-600' : 'text-slate-400'}`}>Free</p>
          </button>
        </div>

        {/* Tip */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Leave a tip (optional)</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {TIPS.map(t => (
            <button
              key={t}
              onClick={() => setTip(t)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                tip === t
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 active:bg-slate-100'
              }`}
            >
              {t === 0 ? 'None' : `$${t}`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-white">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-slate-500">Total from earnings</span>
          <span className="font-bold text-slate-800">{fmt(total)}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={amount <= 0 || amount > maxAmount}
          className={`w-full font-bold py-4 rounded-2xl text-base transition-all ${
            amount > 0 && amount <= maxAmount
              ? 'bg-green-500 text-white active:scale-95 shadow-lg shadow-green-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {amount > 0 ? `Get ${fmt(amount)} Now` : 'Enter an amount'}
        </button>
      </div>
    </div>
  )
}
