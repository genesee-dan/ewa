import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const ITEMS = [
  { id: 'coffee', emoji: '☕', amount: 11.00 },
  { id: 'lunch', emoji: '🍕', amount: 14.00 },
  { id: 'streaming', emoji: '📺', amount: 15.99 },
  { id: 'drinks', emoji: '🍺', amount: 22.00 },
  { id: 'delivery', emoji: '🛵', amount: 18.50 },
  { id: 'parking', emoji: '🅿️', amount: 9.00 },
]

export const ITEMS_MAX = ITEMS.reduce((s, i) => s + i.amount, 0)

export default function CutSpendingScreen() {
  const navigate = useNavigate()
  const t = useT()
  const { scenario, gameCrises, currentRound, finishRound, gameMode } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const [selected, setSelected] = useState(new Set())
  const [done, setDone] = useState(false)

  // If this crisis is too large to cut your way out of, show a dead end
  if (ITEMS_MAX < crisis.amount) return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-safe-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('cut.eyebrow')}</p>
        <div className="text-5xl mb-5">😬</div>
        <h1 className="text-2xl font-extrabold mb-3">{t('cut.notEnough')}</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {t('cut.notEnoughBody', { max: fmt(ITEMS_MAX), amount: fmt(crisis.amount) })}
        </p>
        <div className="bg-slate-800 rounded-2xl px-5 py-4 text-center">
          <p className="text-slate-400 text-sm">{t('cut.maxFreeUp')}</p>
          <p className="text-2xl font-extrabold text-red-400 mt-1">{fmt(ITEMS_MAX)}</p>
          <p className="text-slate-500 text-xs mt-1">{t('cut.vsNeeded', { amount: fmt(crisis.amount) })}</p>
        </div>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        {t('cut.goBack')}
      </button>
    </div>
  )

  const total = [...selected].reduce((sum, id) => {
    const item = ITEMS.find(i => i.id === id)
    return sum + (item?.amount || 0)
  }, 0)

  const covered = total >= crisis.amount

  function toggle(id) {
    if (done) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (done) return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-safe-8 bg-slate-900 text-white">
      <div>
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">{t('cut.foundIt')}</p>
        <div className="text-5xl mb-5">💡</div>
        <h1 className="text-2xl font-extrabold mb-3">{t('cut.moneyWasYours')}</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {t('cut.moneyWasYoursBody')}
        </p>
        <div className="space-y-2">
          {[...selected].map(id => {
            const item = ITEMS.find(i => i.id === id)
            return (
              <div key={id} className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3 text-sm">
                <span className="text-slate-300">{item.emoji} {t(`cut.item.${item.id}.label`)}</span>
                <span className="text-green-400 font-bold">{fmt(item.amount)}</span>
              </div>
            )
          })}
          <div className="flex justify-between items-center bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-sm mt-1">
            <span className="text-green-300 font-bold">{t('cut.youKept')}</span>
            <span className="text-green-400 font-extrabold text-base">{fmt(total)}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          if (gameMode) { flushSync(() => { finishRound(0) }); navigate('/round-result') }
          else navigate('/cost')
        }}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        {gameMode ? t('cut.seeHowYouDid') : t('cut.back')}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-safe-5 bg-slate-900 text-white">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('cut.eyebrowThisWeek')}</p>
      <h1 className="text-lg font-extrabold mb-1">{t('cut.findSomewhere', { amount: fmt(crisis.amount) })}</h1>
      <p className="text-slate-400 text-xs mb-4">{t('cut.tapToSkip')}</p>

      <div className="space-y-2 mb-4">
        {ITEMS.map(item => {
          const on = selected.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                on ? 'border-green-500 bg-green-900/20' : 'border-slate-700 bg-slate-800'
              }`}
            >
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight ${on ? 'line-through text-slate-400' : 'text-white'}`}>
                  {t(`cut.item.${item.id}.label`)}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">{t(`cut.item.${item.id}.desc`)}</p>
              </div>
              <span className={`font-extrabold text-sm shrink-0 ${on ? 'text-green-400' : 'text-slate-400'}`}>
                {fmt(item.amount)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Running total */}
      <div className={`rounded-2xl px-5 py-3 flex justify-between items-center mb-3 transition-colors ${
        covered ? 'bg-green-900/30 border border-green-500/30' : 'bg-slate-800'
      }`}>
        <span className={`text-sm font-bold ${covered ? 'text-green-300' : 'text-slate-400'}`}>
          {covered ? t('cut.foundEnough') : t('cut.foundSoFar')}
        </span>
        <span className={`font-extrabold text-lg ${covered ? 'text-green-400' : 'text-slate-200'}`}>
          {fmt(total)}
        </span>
      </div>

      <button
        onClick={() => setDone(true)}
        disabled={!covered}
        className={`w-full font-extrabold py-3.5 rounded-2xl text-base active:scale-95 transition-all ${
          covered ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-500'
        }`}
      >
        {covered ? t('cut.thatllDoIt') : t('cut.needMore', { amount: fmt(crisis.amount - total) })}
      </button>
    </div>
  )
}
