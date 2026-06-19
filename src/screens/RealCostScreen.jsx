import { useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DARK_PATTERNS = [
  ['Preselected tip', 'The $4 option was already highlighted before you chose anything.'],
  ['Social pressure', '"9 out of 10 members tip" — unverifiable, designed to shame you.'],
  ['Forced waiting', 'The skip button was hidden behind a countdown timer.'],
  ['Subscription trap', 'A "money-saving" membership that auto-renews and requires calling to cancel.'],
  ['Manufactured urgency', '"Boosted limit expires in 2:59:14" — the deadline is invented.'],
  ['The debt loop', 'Repaying on payday leaves your check short — so the app offers to advance again immediately.'],
]

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const PLUS_MONTHLY = 9.99

export default function RealCostScreen() {
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
    if (dx < -40 && page < 5) setPage(p => p + 1)
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
        {[0, 1, 2, 3, 4, 5].map(i => (
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
      {page === 4 && <Page4 setPage={setPage} navigate={navigate} amount={amount} annualCost={annualCost} />}
      {page === 5 && <Page5 navigate={navigate} resetDemo={resetDemo} />}

      {/* Prev / Next */}
      <div className="shrink-0 flex gap-3 px-5 pb-5 pt-2">
        {page > 0 ? (
          <button
            onClick={() => setPage(p => p - 1)}
            className="flex-1 bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            ← Back
          </button>
        ) : <div className="flex-1" />}
        {page < 5 ? (
          <button
            onClick={() => setPage(p => p + 1)}
            className="flex-1 bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Next →
          </button>
        ) : <div className="flex-1" />}
      </div>
    </div>
  )
}

function Page1({ amount, fee, tip, subThis, costThis, apr, isPlus, DAYS_UNTIL_PAYDAY, dodgeTaps }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 1 of 6 · This Advance</p>
      <h1 className="text-2xl font-extrabold mb-3">What just happened?</h1>

      {/* APR — lead with the gut-punch */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-4 text-center">
        <p className="text-sm text-red-300 mb-1">You just paid the equivalent of</p>
        <p className="text-6xl font-extrabold text-red-400 leading-none">{apr.toFixed(0)}%</p>
        <p className="text-sm font-bold text-red-300 mt-1">APR</p>
        <p className="text-[11px] text-slate-400 mt-3">
          A typical credit card is ~24% APR. A payday loan is ~400%.{'\n'}The app called it a "fee" and a "tip." A lender would have to call it something else.
        </p>
      </div>

      {/* Fee breakdown */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">How we got there</p>
        <div className="space-y-2">
          <Row label="You borrowed" value={fmt(amount)} />
          <Row label="Instant fee" value={isPlus ? `${fmt(0)} ("waived")` : fmt(fee)} />
          <Row label="Tip (after the nudges)" value={fmt(tip)} />
          {isPlus && <Row label="EarnNow+ share (½ month of $9.99)" value={fmt(subThis)} />}
          <Row label={`Total to access your pay ${DAYS_UNTIL_PAYDAY} days early`} value={fmt(costThis)} bold />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">The tip "choice"</p>
        {tip > 0 ? (
          <p className="text-sm text-slate-300">
            You ended up tipping <strong className="text-white">{fmt(tip)}</strong>
            {dodgeTaps > 0 && <> — after <strong className="text-red-400">{dodgeTaps} taps</strong> of guilt screens</>}.
            Accepting always takes <strong className="text-green-400">1 tap</strong>.
          </p>
        ) : (
          <p className="text-sm text-slate-300">
            You avoided the tip — it took <strong className="text-red-400">{dodgeTaps} taps</strong> through
            guilt screens, surveys, and timers. Accepting would have taken <strong className="text-green-400">1 tap</strong>.
          </p>
        )}
      </div>
    </div>
  )
}

function Page2({ amount, fee, tip, annualBorrowed, annualCost, annualSub, isPlus, ADVANCES_PER_YEAR }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 2 of 6 · Your Year</p>
      <h1 className="text-2xl font-extrabold mb-1">Over a full year</h1>
      <p className="text-sm text-slate-400 mb-4">
        Research finds frequent users take 24–36 advances a year — often every pay period.
      </p>

      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
          At {ADVANCES_PER_YEAR} advances like this one
        </p>
        <div className="space-y-2">
          <Row label="Borrowed over the year" value={fmt(annualBorrowed)} />
          <Row label="Fees + tips over the year" value={fmt((fee + tip) * ADVANCES_PER_YEAR)} />
          {isPlus && <Row label='EarnNow+ membership (12 × $9.99)' value={fmt(annualSub)} />}
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center mt-4">
          <p className="text-xs text-red-300 mb-1">Total cost over the year</p>
          <p className="text-4xl font-extrabold text-red-400">{fmt(annualCost)}</p>
          <p className="text-[11px] text-slate-400 mt-2">
            paid just to receive your own paycheck a few days early
          </p>
        </div>
        {isPlus && (
          <p className="text-[11px] text-amber-400/90 mt-3">
            The membership "waives" a $3.99 fee {ADVANCES_PER_YEAR} times ({fmt(3.99 * ADVANCES_PER_YEAR)}) —
            but costs {fmt(annualSub)} whether you use it or not, auto-renews, and requires calling support to cancel.
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-3">
          That's {fmt(annualCost)} a year to receive {fmt(amount)} of <em>your own paycheck</em> a few days
          early — money that never builds savings, credit, or anything else.
        </p>
      </div>

      <p className="text-[10px] text-slate-500 text-center mb-2">
        This is an educational demo. No real money moves. Figures based on published research.
      </p>
    </div>
  )
}

function Page3() {
  return (
    <div className="flex-1 px-5 pt-3 pb-2 flex flex-col justify-center">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 3 of 6 · The Tricks</p>
      <h1 className="text-2xl font-extrabold mb-1">Dark patterns used on you</h1>
      <p className="text-[10px] text-slate-500 mb-4">Shuffled every run — each demo is different.</p>
      <div className="space-y-3">
        {DARK_PATTERNS.map(([name, desc]) => (
          <div key={name} className="flex gap-3 items-start">
            <span className="text-green-400 text-sm mt-0.5 shrink-0">✓</span>
            <p className="text-sm text-slate-400 leading-snug">
              <strong className="text-slate-200">{name}.</strong> {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Page4({ setPage, navigate, amount, annualCost }) {
  const locRate = 0.18
  const locDays = 14
  const locInterest = +(amount * locRate / 365 * locDays).toFixed(2)
  const locAnnual = +(locInterest * 26).toFixed(2)
  const annualSavings = +(annualCost - locAnnual).toFixed(2)

  return (
    <div className="flex-1 flex flex-col justify-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 5 of 6 · The Alternative</p>
      <h1 className="text-2xl font-extrabold mb-4">There's a better way.</h1>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-2">🏦 Credit union line of credit</p>
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          A personal LOC at 18% APR — the federal credit union cap — gives you the same {fmt(amount)} with no app, no tips, no guilt screens.
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Cost for this advance (14 days)</span>
            <span className="font-bold text-blue-300">{fmt(locInterest)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">vs. what you just paid</span>
            <span className="font-bold text-red-400">{fmt(annualCost / 26)}</span>
          </div>
        </div>
        {annualSavings > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mt-3 text-center">
            <p className="text-xs text-green-400 mb-0.5">Annual savings switching to a LOC</p>
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
          ▶ Watch: how a credit union LOC works
        </button>
        <button
          onClick={() => setPage(4)}
          className="w-full bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          Other ways people handle this →
        </button>
      </div>
    </div>
  )
}

function PageStacking() {
  return (
    <div className="flex-1 flex flex-col justify-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 4 of 6 · Stacking</p>
      <h1 className="text-2xl font-extrabold mb-3">Most users have more than one app.</h1>

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-3 text-center">
        <p className="text-sm text-red-300 mb-0.5">Frequent EWA users who use</p>
        <p className="text-red-400 leading-none mb-0.5">
          <span className="text-5xl font-extrabold">1 in 3</span>
        </p>
        <p className="text-sm font-bold text-red-300">2+ apps simultaneously</p>
        <p className="text-[11px] text-slate-400 mt-2">
          Each app charges its own fee or tip against the same upcoming paycheck.
          No app can see what the others have already advanced.
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">What it adds up to</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">CFPB avg: 27 advances/year</span>
            <span className="text-slate-200 font-bold">~$70/yr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Frequent user: 36 advances/year</span>
            <span className="text-amber-400 font-bold">~$140/yr</span>
          </div>
          <div className="flex justify-between border-t border-slate-600 pt-1.5 mt-1">
            <span className="text-slate-300">Stacker (3 apps, 36×/yr each)</span>
            <span className="text-red-400 font-extrabold">~$420/yr</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Source: CFPB Data Spotlight, July 2024. Assumes ~$3.90 avg fee+tip per advance.</p>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        EWA apps do <strong className="text-slate-200">no credit check</strong> and share no data with each other. For the apps, stacking users are their best customers.
      </p>
    </div>
  )
}

function Page5({ navigate, resetDemo }) {
  return (
    <div className="flex-1 flex flex-col justify-center px-5 pt-3 pb-2">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 6 of 6 · Other Options</p>
      <h1 className="text-xl font-extrabold mb-4">Other ways people handle situations like this</h1>

      <div className="space-y-2 mb-5">
        <button
          onClick={() => navigate('/family-path')}
          className="w-full flex gap-3 items-start bg-slate-800 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl shrink-0">👨‍👩‍👧</span>
          <div>
            <p className="text-sm font-bold text-slate-200">Ask family →</p>
            <p className="text-xs text-slate-400">Financial cost: $0. Emotional cost: one awkward conversation.</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/cut-spending')}
          className="w-full flex gap-3 items-start bg-slate-800 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl shrink-0">✂️</span>
          <div>
            <p className="text-sm font-bold text-slate-200">Cut one week of spending →</p>
            <p className="text-xs text-slate-400">Skip delivery, coffee runs, happy hour — often enough to cover a small shortfall.</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/wait-path')}
          className="w-full flex gap-3 items-start bg-slate-800 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl shrink-0">🤷</span>
          <div>
            <p className="text-sm font-bold text-slate-200">Wait it out →</p>
            <p className="text-xs text-slate-400">Most "urgent" expenses aren't. Payday is closer than it feels at 2am.</p>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => navigate('/watch-loc')}
          className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          ▶ How a credit union LOC works
        </button>
        <button
          onClick={() => navigate('/watch')}
          className="w-full bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          ▶ Why these apps cost you money
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          Back to the app
        </button>
        <button onClick={resetDemo} className="w-full text-slate-500 text-xs font-medium underline py-1">
          Restart the demo from the beginning
        </button>
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
