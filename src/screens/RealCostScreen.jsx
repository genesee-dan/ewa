import { useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'

const DARK_PATTERNS = ['preselected', 'social', 'waiting', 'subscription', 'urgency', 'debtloop']

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const PLUS_MONTHLY = 9.99

export default function RealCostScreen() {
  const t = useT()
  const navigate = useNavigate()
  const { lastTransfer, isPlus, scenario, resetDemo, costPage: page, setCostPage: setPage } = useApp()
  const touchStartX = useRef(null)

  const DAYS_UNTIL_PAYDAY = scenario.daysToPayday
  const ADVANCES_PER_YEAR = scenario.advancesPerYear

  if (!lastTransfer) return <Navigate to="/" replace />

  const { amount, fee, tip, subCost = 0, dodgeTaps } = lastTransfer
  const subThis = subCost  // stored at transfer time, includes subscription if isPlus
  const costThis = fee + tip + subThis
  const apr = amount > 0 ? (costThis / amount) * (365 / DAYS_UNTIL_PAYDAY) * 100 : 0
  const annualSub = isPlus ? PLUS_MONTHLY * 12 : 0
  const annualCost = (fee + tip) * ADVANCES_PER_YEAR + annualSub
  const annualBorrowed = amount * ADVANCES_PER_YEAR

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -40 && page < 7) setPage(p => p + 1)
    if (dx > 40 && page > 0) setPage(p => p - 1)
    touchStartX.current = null
  }

  return (
    <div
      className="flex-1 flex flex-col bg-slate-900 text-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress dots */}
      <div className="shrink-0 flex justify-center gap-2 pt-4 pb-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`rounded-full transition-all ${i === page ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-slate-600'}`}
          />
        ))}
      </div>

      {/* Pages */}
      {page === 0 && <Page1 amount={amount} fee={fee} tip={tip} subThis={subThis} costThis={costThis} apr={apr} isPlus={isPlus} DAYS_UNTIL_PAYDAY={DAYS_UNTIL_PAYDAY} dodgeTaps={dodgeTaps} />}
      {page === 1 && <Page2 amount={amount} fee={fee} tip={tip} annualBorrowed={annualBorrowed} annualCost={annualCost} annualSub={annualSub} isPlus={isPlus} ADVANCES_PER_YEAR={ADVANCES_PER_YEAR} />}
      {page === 2 && <Page3 />}
      {page === 3 && <PageStacking annualCost={annualCost} />}
      {page === 4 && <PageVideo navigate={navigate} />}
      {page === 5 && <Page4 setPage={setPage} navigate={navigate} amount={amount} annualCost={annualCost} />}
      {page === 6 && <Page5 navigate={navigate} setPage={setPage} />}
      {page === 7 && <PageTakeAction resetDemo={resetDemo} />}

      {/* Prev / Next */}
      <div className="shrink-0 flex gap-3 px-5 pb-safe-5 pt-2">
        {page > 0 ? (
          <button
            onClick={() => setPage(p => p - 1)}
            className="flex-1 bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            {t('realcost.back')}
          </button>
        ) : <div className="flex-1" />}
        {page < 7 ? (
          <button
            onClick={() => setPage(p => p + 1)}
            className="flex-1 bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            {t('realcost.next')}
          </button>
        ) : <div className="flex-1" />}
      </div>
    </div>
  )
}

function Page1({ amount, fee, tip, subThis, costThis, apr, isPlus, DAYS_UNTIL_PAYDAY, dodgeTaps }) {
  const t = useT()
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-2" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.p1.eyebrow')}</p>
      <h1 className="text-xl font-extrabold mb-2">{t('realcost.p1.title')}</h1>

      {/* APR — lead with the gut-punch */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-3 text-center">
        <p className="text-xs text-red-300 mb-0.5">{t('realcost.p1.aprIntro')}</p>
        <p className="text-5xl font-extrabold text-red-400 leading-none">{apr.toFixed(0)}%</p>
        <p className="text-sm font-bold text-red-300 mt-0.5">{t('realcost.p1.apr')}</p>
        <p className="text-[11px] text-slate-400 mt-2">
          {t('realcost.p1.aprCompare')}
        </p>
      </div>

      {/* Fee breakdown */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('realcost.p1.howHeading')}</p>
        <div className="space-y-1.5">
          <Row label={t('realcost.p1.borrowed')} value={fmt(amount)} />
          <Row label={t('realcost.p1.instantFee')} value={isPlus ? t('realcost.p1.feeWaived', { amount: fmt(0) }) : fmt(fee)} />
          <Row label={t('realcost.p1.tipAfterNudges')} value={fmt(tip)} />
          {isPlus && <Row label={t('realcost.p1.plusShare')} value={fmt(subThis)} />}
          <Row label={t('realcost.p1.total', { days: DAYS_UNTIL_PAYDAY })} value={fmt(costThis)} bold />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('realcost.p1.tipChoice')}</p>
        {tip > 0 ? (
          <p className="text-sm text-slate-300">
            {t('realcost.p1.tippedPre')}<strong className="text-white">{fmt(tip)}</strong>
            {dodgeTaps > 0 && <>{t('realcost.p1.tippedAfter')}<strong className="text-red-400">{t('realcost.p1.guiltScreens', { n: dodgeTaps })}</strong></>}
            {t('realcost.p1.tippedEnd')}<strong className="text-green-400">{t('realcost.p1.oneTap')}</strong>{t('realcost.p1.tippedDot')}
          </p>
        ) : (
          <p className="text-sm text-slate-300">
            {t('realcost.p1.avoidedPre')}<strong className="text-red-400">{t('realcost.p1.avoidedTaps', { n: dodgeTaps })}</strong>
            {t('realcost.p1.avoidedMid')}<strong className="text-green-400">{t('realcost.p1.oneTap')}</strong>{t('realcost.p1.avoidedEnd')}
          </p>
        )}
      </div>
    </div>
  )
}

function Page2({ amount, fee, tip, annualBorrowed, annualCost, annualSub, isPlus, ADVANCES_PER_YEAR }) {
  const t = useT()
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.p2.eyebrow')}</p>
      <h1 className="text-2xl font-extrabold mb-1">{t('realcost.p2.title')}</h1>
      <p className="text-sm text-slate-400 mb-4">
        {t('realcost.p2.sub')}
      </p>

      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
          {t('realcost.p2.atAdvances', { n: ADVANCES_PER_YEAR })}
        </p>
        <div className="space-y-2">
          <Row label={t('realcost.p2.borrowedYear')} value={fmt(annualBorrowed)} />
          <Row label={t('realcost.p2.feesYear')} value={fmt((fee + tip) * ADVANCES_PER_YEAR)} />
          {isPlus && <Row label={t('realcost.p2.membershipYear')} value={fmt(annualSub)} />}
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center mt-4">
          <p className="text-xs text-red-300 mb-1">{t('realcost.p2.totalYear')}</p>
          <p className="text-4xl font-extrabold text-red-400">{fmt(annualCost)}</p>
          <p className="text-[11px] text-slate-400 mt-2">
            {t('realcost.p2.totalNote')}
          </p>
        </div>
        {isPlus && (
          <p className="text-[11px] text-amber-400/90 mt-3">
            {t('realcost.p2.membershipNote', { n: ADVANCES_PER_YEAR, waived: fmt(3.99 * ADVANCES_PER_YEAR), sub: fmt(annualSub) })}
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-3">
          {t('realcost.p2.recap', { cost: fmt(annualCost), amount: fmt(amount) })}
        </p>
      </div>

      <p className="text-[10px] text-slate-500 text-center mb-2">
        {t('realcost.p2.disclaimer')}
      </p>
    </div>
  )
}

function Page3() {
  const t = useT()
  return (
    <div className="flex-1 px-5 pt-3 pb-2 flex flex-col justify-center">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.p3.eyebrow')}</p>
      <h1 className="text-2xl font-extrabold mb-1">{t('realcost.p3.title')}</h1>
      <p className="text-[10px] text-slate-500 mb-4">{t('realcost.p3.sub')}</p>
      <div className="space-y-3">
        {DARK_PATTERNS.map(key => (
          <div key={key} className="flex gap-3 items-start">
            <span className="text-green-400 text-sm mt-0.5 shrink-0">✓</span>
            <p className="text-sm text-slate-400 leading-snug">
              <strong className="text-slate-200">{t(`realcost.pattern.${key}.name`)}.</strong> {t(`realcost.pattern.${key}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageVideo({ navigate }) {
  const t = useT()
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{t('realcost.video.eyebrow')}</p>
      <h1 className="text-2xl font-extrabold mb-2 text-center">{t('realcost.video.title')}</h1>
      <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
        {t('realcost.video.sub')}
      </p>
      <button
        onClick={() => navigate('/watch')}
        className="w-40 h-40 rounded-full bg-amber-500 flex flex-col items-center justify-center active:scale-95 transition-transform shadow-2xl shadow-amber-900/50 mb-8"
        style={{ touchAction: 'manipulation' }}
      >
        <span className="text-5xl mb-1">▶</span>
        <span className="text-white text-xs font-bold">{t('realcost.video.watchNow')}</span>
      </button>
      <p className="text-xs text-slate-500 text-center">{t('realcost.video.tapBack')}</p>
    </div>
  )
}

function Page4({ setPage, navigate, amount, annualCost }) {
  const t = useT()
  const locRate = 0.18
  const locDays = 14
  const locInterest = +(amount * locRate / 365 * locDays).toFixed(2)
  const locAnnual = +(locInterest * 26).toFixed(2)
  const annualSavings = +(annualCost - locAnnual).toFixed(2)

  return (
    <div className="flex-1 flex flex-col justify-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.alt.eyebrow')}</p>
      <h1 className="text-2xl font-extrabold mb-4">{t('realcost.alt.title')}</h1>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-2">{t('realcost.alt.locHeading')}</p>
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          {t('realcost.alt.locBody', { amount: fmt(amount) })}
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">{t('realcost.alt.costThisAdvance')}</span>
            <span className="font-bold text-blue-300">{fmt(locInterest)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t('realcost.alt.vsPaid')}</span>
            <span className="font-bold text-red-400">{fmt(annualCost / 26)}</span>
          </div>
        </div>
        {annualSavings > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mt-3 text-center">
            <p className="text-xs text-green-400 mb-0.5">{t('realcost.alt.annualSavings')}</p>
            <p className="text-2xl font-extrabold text-green-400">{fmt(annualSavings)}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => navigate('/watch-loc')}
          className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          {t('realcost.alt.watchLoc')}
        </button>
        <button
          onClick={() => setPage(6)}
          className="w-full bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          {t('realcost.alt.otherWays')}
        </button>
      </div>
    </div>
  )
}

function PageStacking() {
  const t = useT()
  return (
    <div className="flex-1 flex flex-col justify-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.stack.eyebrow')}</p>
      <h1 className="text-2xl font-extrabold mb-3">{t('realcost.stack.title')}</h1>

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-3 text-center">
        <p className="text-sm text-red-300 mb-0.5">{t('realcost.stack.freqUsers')}</p>
        <p className="text-red-400 leading-none mb-0.5">
          <span className="text-5xl font-extrabold">{t('realcost.stack.oneInThree')}</span>
        </p>
        <p className="text-sm font-bold text-red-300">{t('realcost.stack.twoPlus')}</p>
        <p className="text-[11px] text-slate-400 mt-2">
          {t('realcost.stack.eachCharges')}
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('realcost.stack.addsUp')}</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">{t('realcost.stack.cfpbAvg')}</span>
            <span className="text-slate-200 font-bold">{t('realcost.stack.cfpbAvgVal')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t('realcost.stack.freqUser')}</span>
            <span className="text-amber-400 font-bold">{t('realcost.stack.freqUserVal')}</span>
          </div>
          <div className="flex justify-between border-t border-slate-600 pt-1.5 mt-1">
            <span className="text-slate-300">{t('realcost.stack.stacker')}</span>
            <span className="text-red-400 font-extrabold">{t('realcost.stack.stackerVal')}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">{t('realcost.stack.source')}</p>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {t('realcost.stack.footerPre')}<strong className="text-slate-200">{t('realcost.stack.noCreditCheck')}</strong>{t('realcost.stack.footerEnd')}
      </p>
    </div>
  )
}

function Page5({ navigate }) {
  const t = useT()
  return (
    <div className="flex-1 flex flex-col justify-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.other.eyebrow')}</p>
      <h1 className="text-xl font-extrabold mb-4">{t('realcost.other.title')}</h1>

      <div className="space-y-2">
        <button
          onClick={() => navigate('/family-path')}
          className="w-full flex gap-3 items-start bg-slate-800 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl shrink-0">👨‍👩‍👧</span>
          <div>
            <p className="text-sm font-bold text-slate-200">{t('realcost.other.familyTitle')}</p>
            <p className="text-xs text-slate-400">{t('realcost.other.familyDesc')}</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/cut-spending')}
          className="w-full flex gap-3 items-start bg-slate-800 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl shrink-0">✂️</span>
          <div>
            <p className="text-sm font-bold text-slate-200">{t('realcost.other.cutTitle')}</p>
            <p className="text-xs text-slate-400">{t('realcost.other.cutDesc')}</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/wait-path')}
          className="w-full flex gap-3 items-start bg-slate-800 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl shrink-0">🤷</span>
          <div>
            <p className="text-sm font-bold text-slate-200">{t('realcost.other.waitTitle')}</p>
            <p className="text-xs text-slate-400">{t('realcost.other.waitDesc')}</p>
          </div>
        </button>
      </div>
    </div>
  )
}

function PageTakeAction({ resetDemo }) {
  const t = useT()
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-2 flex flex-col" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">{t('realcost.action.eyebrow')}</p>
      <h1 className="text-2xl font-extrabold mb-2">{t('realcost.action.title')}</h1>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        {t('realcost.action.bodyPre')}<strong className="text-slate-200">{t('realcost.action.stopAct')}</strong>{t('realcost.action.bodyEnd')}
      </p>

      <a
        href="https://neweconomynyc.ourpowerbase.net/civicrm/petition/sign?reset=1&sid=50"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl text-sm text-center active:scale-95 transition-transform mb-4"
        style={{ touchAction: 'manipulation' }}
      >
        {t('realcost.action.emailBtn')}
      </a>

      <div className="bg-white rounded-2xl p-4 flex flex-col items-center mb-4">
        <img src={`${import.meta.env.BASE_URL}stopact-qr.png`} alt={t('realcost.action.qrAlt')} className="w-40 h-40" />
        <p className="text-xs text-slate-500 mt-2 text-center">{t('realcost.action.qrScan')}</p>
        <p className="text-[11px] text-slate-400 mt-1 text-center font-mono">neweconomynyc.ourpowerbase.net</p>
      </div>

      <div className="flex flex-col gap-2.5 mt-auto">
        <button
          onClick={resetDemo}
          className="w-full bg-slate-700 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          {t('realcost.action.reset')}
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-700">
        <img src={`${import.meta.env.BASE_URL}genesee-icon.png`} alt="" className="w-8 h-8 rounded-lg" />
        <p className="text-xs text-slate-400 leading-snug">
          {t('realcost.action.broughtBy')}<br />
          <span className="text-slate-200 font-semibold">Genesee Co-op Federal Credit Union</span>
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-sm">
      <span className={bold ? 'text-slate-200 font-medium' : 'text-slate-400'}>{label}</span>
      <span className={`font-bold whitespace-nowrap ${bold ? 'text-white' : 'text-slate-200'}`}>{value}</span>
    </div>
  )
}
