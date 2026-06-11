import { useState, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DARK_PATTERNS = [
  ['Preselected tip', 'The $4 option was already highlighted before you chose anything.'],
  ['Buried opt-out', 'Declining lives in tiny gray text; accepting is a big green button.'],
  ['Social pressure', '"9 out of 10 members tip" — unverifiable, designed to make you the odd one out.'],
  ['Guilt framing', 'Refusing was worded as refusing to "help the community."'],
  ['Forced waiting', 'The skip link was disabled behind a countdown timer.'],
  ['Subscription trap', 'A "money-saving" membership with auto-renewal and support-only cancellation.'],
  ['Manufactured urgency', 'A "boosted limit expires in 2:59:14" countdown — the deadline is invented.'],
  ['Gamified borrowing', 'A 🔥 streak badge reframes borrowing every paycheck as an achievement to maintain.'],
  ['The debt loop', 'Back home, a banner warns your next paycheck will be short — and offers the fix.'],
]

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const PLUS_MONTHLY = 9.99

export default function RealCostScreen() {
  const navigate = useNavigate()
  const { lastTransfer, isPlus, scenario, resetDemo } = useApp()
  const [page, setPage] = useState(0)
  const touchStartX = useRef(null)

  const DAYS_UNTIL_PAYDAY = scenario.daysToPayday
  const ADVANCES_PER_YEAR = scenario.advancesPerYear

  if (!lastTransfer) return <Navigate to="/" replace />

  const { amount, fee, tip, dodgeTaps } = lastTransfer
  const subThis = isPlus ? PLUS_MONTHLY / 2 : 0
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
    if (dx < -40 && page < 3) setPage(p => p + 1)
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
      <div className="flex justify-center gap-2 pt-4 pb-1">
        {[0, 1, 2, 3].map(i => (
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
      {page === 3 && <Page4 navigate={navigate} resetDemo={resetDemo} />}

      {/* Prev / Next */}
      <div className="flex gap-3 px-5 pb-5 pt-2">
        {page > 0 ? (
          <button
            onClick={() => setPage(p => p - 1)}
            className="flex-1 bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            ← Back
          </button>
        ) : <div className="flex-1" />}
        {page < 3 ? (
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
    <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 1 of 4 · This Advance</p>
      <h1 className="text-2xl font-extrabold mb-1">What just happened?</h1>
      <p className="text-sm text-slate-400 mb-4">
        The app called it a "fee" and a "tip." A lender would have to call it something else.
      </p>

      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">This advance</p>
        <div className="space-y-2 mb-4">
          <Row label="You borrowed" value={fmt(amount)} />
          <Row label="Instant fee" value={isPlus ? `${fmt(0)} ("waived")` : fmt(fee)} />
          <Row label="Tip (after the nudges)" value={fmt(tip)} />
          {isPlus && <Row label="EarnNow+ share (½ month of $9.99)" value={fmt(subThis)} />}
          <Row label={`Cost to access your own pay ${DAYS_UNTIL_PAYDAY} days early`} value={fmt(costThis)} bold />
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-xs text-red-300 mb-1">Expressed as an annual percentage rate</p>
          <p className="text-4xl font-extrabold text-red-400">{apr.toFixed(0)}% APR</p>
          <p className="text-[11px] text-slate-400 mt-2">
            A typical credit card is ~24% APR. A payday loan is ~400%.
          </p>
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
    <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 2 of 4 · Your Year</p>
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
    <div className="flex-1 px-5 pt-3 pb-2 flex flex-col">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Page 3 of 4 · The Tricks</p>
      <h1 className="text-2xl font-extrabold mb-3">Dark patterns used on you</h1>
      <div className="bg-slate-800 rounded-2xl p-4 flex-1">
        <p className="text-[10px] text-slate-500 mb-3">The mix is shuffled every run — this is the full deck.</p>
        <div className="space-y-2">
          {DARK_PATTERNS.map(([name, desc]) => (
            <div key={name} className="flex gap-2">
              <span className="text-green-400 text-xs leading-5 mt-0.5">✓</span>
              <p className="text-xs text-slate-400 leading-snug">
                <strong className="text-slate-200">{name}.</strong> {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Page4({ navigate, resetDemo }) {
  return (
    <div className="flex-1 px-5 pt-3 pb-2 flex flex-col justify-center gap-4">
      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest text-center">Page 4 of 4 · Learn More</p>
      <h1 className="text-2xl font-extrabold text-center mb-2">What can you do instead?</h1>
      <button
        onClick={() => navigate('/watch')}
        className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        ▶ Why these apps cost you money
      </button>
      <button
        onClick={() => navigate('/watch-loc')}
        className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform leading-tight px-4"
      >
        ▶ Learn how to save using a credit union line of credit instead
      </button>
      <button
        onClick={() => navigate('/')}
        className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        Back to the app
      </button>
      <button onClick={resetDemo} className="w-full text-slate-500 text-xs font-medium underline py-1">
        Restart the demo from the beginning
      </button>
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
