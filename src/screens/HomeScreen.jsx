import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap, Shield, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { user } from '../data/mockData'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const payPeriodProgress = 0.62 // 62% through pay period

export default function HomeScreen() {
  const navigate = useNavigate()
  const { earned, transactions, profile, lastTransfer } = useApp()
  const firstName = (profile?.name || user.name).split(' ')[0]
  const recent = transactions.slice(0, 2)
  const todaysFees = transactions
    .filter(t => t.date === 'Today')
    .reduce((s, t) => s + (t.fee || 0), 0)
  const repayTotal = earned.transferred + todaysFees

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="bg-white px-5 pb-5 pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">Good morning,</p>
            <p className="text-lg font-bold text-slate-900">{firstName} 👋</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-green-200">
            {firstName[0]}
          </button>
        </div>

        {/* Main balance card */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white opacity-5" />
          <div className="absolute -right-2 -bottom-10 w-40 h-40 rounded-full bg-white opacity-5" />

          <p className="text-green-100 text-xs font-medium uppercase tracking-wider mb-1">Available to transfer</p>
          <p className="text-4xl font-bold mb-1">{fmt(earned.available)}</p>
          <p className="text-green-200 text-xs mb-4">of {fmt(earned.total)} earned this period</p>

          {/* Pay period progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-green-200 mb-1">
              <span>Jun 1</span>
              <span>Pay period {Math.round(payPeriodProgress * 100)}% complete</span>
              <span>{user.nextPayday}</span>
            </div>
            <div className="h-1.5 bg-green-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${payPeriodProgress * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => navigate('/transfer')}
            className="w-full bg-white text-green-700 font-bold py-3 rounded-xl text-sm shadow-sm active:scale-95 transition-transform"
          >
            Get Paid Now
          </button>
          <p className="text-center text-green-200 text-[11px] font-medium mt-2.5">
            It's your pay. Get it now. ⚡
          </p>
        </div>
      </div>

      {/* The re-borrow loop: the engine of the whole business model */}
      {lastTransfer && (
        <div className="px-5 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📉</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800 mb-0.5">Heads up — payday {user.nextPayday}</p>
                <p className="text-xs text-amber-700 mb-3">
                  Your paycheck will be <strong>{fmt(repayTotal)} smaller</strong> after we collect what you
                  advanced. Most members bridge the gap with another advance.
                </p>
                <button
                  onClick={() => navigate('/transfer')}
                  className="bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform"
                >
                  Get another advance →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="px-5 py-4 flex gap-3">
        <div className="flex-1 bg-white rounded-2xl p-3.5">
          <p className="text-xs text-slate-400 mb-0.5">Transferred</p>
          <p className="text-base font-bold text-slate-800">{fmt(earned.transferred)}</p>
          <p className="text-xs text-slate-400">this period</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3.5">
          <p className="text-xs text-slate-400 mb-0.5">Next payday</p>
          <p className="text-base font-bold text-slate-800">{user.nextPayday}</p>
          <p className="text-xs text-slate-400">5 days away</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3.5">
          <p className="text-xs text-slate-400 mb-0.5">Employer</p>
          <p className="text-base font-bold text-slate-800 truncate" style={{ fontSize: '11px', fontWeight: 700 }}>Riverside</p>
          <p className="text-xs text-slate-400">Medical</p>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl divide-y divide-slate-50">
          <button
            onClick={() => navigate('/transfer')}
            className="flex items-center w-full px-4 py-3.5 active:bg-slate-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mr-3">
              <Zap size={18} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-800">Instant Transfer</p>
              <p className="text-xs text-slate-400">In your bank in minutes</p>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <div className="flex items-center px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mr-3">
              <Shield size={18} className="text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-800">No credit check</p>
              <p className="text-xs text-slate-400">It's your money, access it anytime</p>
            </div>
          </div>
          <div className="flex items-center px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mr-3">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-800">Auto repay on payday</p>
              <p className="text-xs text-slate-400">Repaid automatically from paycheck</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-slate-700">Recent Activity</p>
            <button onClick={() => navigate('/history')} className="text-xs text-green-600 font-medium">
              See all
            </button>
          </div>
          <div className="bg-white rounded-2xl divide-y divide-slate-50">
            {recent.map(tx => (
              <div key={tx.id} className="flex items-center px-4 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 ${
                  tx.type === 'repay' ? 'bg-blue-50' : 'bg-green-50'
                }`}>
                  <span className="text-base">{tx.type === 'repay' ? '💰' : '⚡'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.date}</p>
                </div>
                <p className={`text-sm font-bold ${tx.amount < 0 ? 'text-green-600' : 'text-blue-500'}`}>
                  {tx.amount < 0 ? '+' : ''}{fmt(Math.abs(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
