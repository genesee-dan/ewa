import { useApp } from '../context/AppContext'
import { useT } from '../i18n'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function TxIcon({ type }) {
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
      type === 'repay' ? 'bg-blue-50' : 'bg-green-50'
    }`}>
      <span className="text-lg">{type === 'repay' ? '💰' : '⚡'}</span>
    </div>
  )
}

export default function HistoryScreen() {
  const t = useT()
  const { transactions, earned, scenario } = useApp()

  const lifetimeTransferred = transactions
    .filter(t => t.type === 'transfer')
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 pb-safe-nav" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-3 pb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-4">{t('history.title')}</h1>

        {/* Summary cards */}
        <div className="flex gap-3">
          <div className="flex-1 bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-600 font-medium">{t('history.totalAccessed')}</p>
            <p className="text-lg font-bold text-green-700">{fmt(lifetimeTransferred)}</p>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">{t('history.transfers')}</p>
            <p className="text-lg font-bold text-slate-700">
              {transactions.filter(t => t.type === 'transfer').length}
            </p>
          </div>
        </div>
      </div>

      {/* Current period banner */}
      <div className="mx-4 mt-4 bg-green-500 rounded-xl p-3.5 flex justify-between items-center">
        <div>
          <p className="text-xs text-green-100 font-medium">{t('history.currentPeriod', { end: scenario.payday.split(' ')[1] })}</p>
          <p className="text-base font-bold text-white">{t('history.available', { amount: fmt(earned.available) })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-100">{t('history.transferred')}</p>
          <p className="text-base font-bold text-white">{fmt(earned.transferred)}</p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 py-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('history.allTransactions')}</p>
        <div className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-50">
          {transactions.map((tx, i) => (
            <div key={tx.id} className="flex items-center px-4 py-3.5 gap-3">
              <TxIcon type={tx.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{tx.descKind ? t(`data.tx.${tx.descKind}`, { last4: tx.last4 }) : tx.description}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-xs text-slate-400">{tx.date}</p>
                  {tx.fee > 0 && (
                    <>
                      <span className="text-slate-200">·</span>
                      <p className="text-xs text-slate-400">{t('history.fee', { amount: fmt(tx.fee) })}</p>
                    </>
                  )}
                  <span className="text-slate-200">·</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    tx.status === 'completed'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <p className={`text-sm font-bold whitespace-nowrap ${
                tx.amount < 0 ? 'text-green-600' : 'text-blue-500'
              }`}>
                {tx.amount < 0 ? '+' : ''}{fmt(Math.abs(tx.amount))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footnote */}
      <p className="text-xs text-slate-400 text-center px-6 pb-6">
        {t('history.footnote')}
      </p>
    </div>
  )
}
