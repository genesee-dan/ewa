import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DARK_PATTERNS = [
  ['Preselected "most popular" tip', 'The $4 option was already highlighted before you chose anything.'],
  ['Buried opt-out', 'Declining lives in tiny gray text; accepting is a big green button.'],
  ['Social pressure', '"9 out of 10 members tip" — unverifiable, designed to make you the odd one out.'],
  ['Guilt framing', 'Refusing was worded as refusing to "help the community."'],
  ['Forced friction', 'A required survey interrogated you about why you wouldn\'t pay extra.'],
  ['Sneaked-in defaults', 'A "suggested" tip was silently re-added to your bill — twice.'],
  ['Forced waiting', 'The skip link was disabled behind a countdown timer.'],
  ['Confirmshaming', 'You had to check a box admitting you "choose not to contribute."'],
  ['Last-chance interruption', 'A final modal blocked the send button one more time.'],
  ['Subscription trap', 'A "money-saving" membership with auto-renewal and support-only cancellation.'],
  ['Manufactured urgency', 'A ticking "boosted limit expires in 2:59:14" countdown — the deadline is invented.'],
  ['Push-notification pressure', 'Alerts keep pinging that your money is "waiting to be claimed."'],
  ['Gamified borrowing', 'A 🔥 streak badge reframes borrowing every paycheck as an achievement to maintain.'],
  ['The debt loop', 'Back home, a banner is already warning your next paycheck will be short — and offering the fix.'],
]

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}


const PLUS_MONTHLY = 9.99

export default function RealCostScreen() {
  const navigate = useNavigate()
  const { lastTransfer, isPlus, scenario } = useApp()
  const DAYS_UNTIL_PAYDAY = scenario.daysToPayday
  const ADVANCES_PER_YEAR = scenario.advancesPerYear

  if (!lastTransfer) {
    return <Navigate to="/" replace />
  }

  const { amount, fee, tip, dodgeTaps } = lastTransfer
  const subThis = isPlus ? PLUS_MONTHLY / 2 : 0 // half a month's sub per bi-weekly advance
  const costThis = fee + tip + subThis
  const apr = amount > 0 ? (costThis / amount) * (365 / DAYS_UNTIL_PAYDAY) * 100 : 0
  const annualSub = isPlus ? PLUS_MONTHLY * 12 : 0
  const annualCost = (fee + tip) * ADVANCES_PER_YEAR + annualSub
  const annualBorrowed = amount * ADVANCES_PER_YEAR

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white" style={{ scrollbarWidth: 'none' }}>
      <div className="px-6 pt-8 pb-6">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">The Real Cost</p>
        <h1 className="text-2xl font-extrabold mb-1">What just happened?</h1>
        <p className="text-sm text-slate-400">
          The app called it a "fee" and a "tip." A lender would have to call it something else.
        </p>
      </div>

      {/* This advance */}
      <div className="mx-5 bg-slate-800 rounded-2xl p-5 mb-4">
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

      {/* Year projection */}
      <div className="mx-5 bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Your projected year</p>
        <p className="text-[11px] text-slate-400 mb-3">
          Most regular users don't advance once — research finds frequent users take{' '}
          <strong className="text-slate-200">24–36 advances a year</strong>, often every pay period. At{' '}
          {ADVANCES_PER_YEAR} advances like this one:
        </p>
        <div className="space-y-2">
          <Row label="Borrowed over the year" value={fmt(annualBorrowed)} />
          <Row label="Fees + tips over the year" value={fmt((fee + tip) * ADVANCES_PER_YEAR)} />
          {isPlus && <Row label='EarnNow+ "savings" membership (12 × $9.99)' value={fmt(annualSub)} />}
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
            The membership "waives" a $3.99 fee {ADVANCES_PER_YEAR} times a year ({fmt(3.99 * ADVANCES_PER_YEAR)}) — but costs{' '}
            {fmt(annualSub)} whether you use it or not, auto-renews, and requires calling support to cancel.
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-3">
          That's {fmt(annualCost)} a year to receive {fmt(amount)} of <em>your own paycheck</em> a few days
          early, every payday — money that never builds savings, credit, or anything else.
        </p>
      </div>

      {/* Dark pattern receipt */}
      <div className="mx-5 bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">The tip "choice"</p>
        {tip > 0 ? (
          <p className="text-sm text-slate-300">
            You ended up tipping <strong className="text-white">{fmt(tip)}</strong>
            {dodgeTaps > 0 && (
              <>
                {' '}
                — after holding out for <strong className="text-red-400">{dodgeTaps} taps</strong> of guilt
                screens
              </>
            )}
            . Accepting a tip always takes <strong className="text-green-400">1 tap</strong>. Declining is a
            gauntlet that reshuffles every run — but it's never 1.
          </p>
        ) : (
          <p className="text-sm text-slate-300">
            You avoided the tip — it took you <strong className="text-red-400">{dodgeTaps} taps</strong>{' '}
            through guilt screens, surveys, re-added "suggestions," and countdown timers. Accepting would have
            taken <strong className="text-green-400">1 tap</strong>. The gauntlet reshuffles every run, but
            that asymmetry is constant — it's the business model.
          </p>
        )}
      </div>

      {/* Dark pattern recap */}
      <div className="mx-5 bg-slate-800 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
          The tricks used on you
        </p>
        <p className="text-[10px] text-slate-500 mb-3">
          The mix is shuffled every run — this is the full deck.
        </p>
        <div className="space-y-2.5">
          {DARK_PATTERNS.map(([name, desc]) => (
            <div key={name} className="flex gap-2.5">
              <span className="text-green-400 text-sm leading-5">✓</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200">{name}.</strong> {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        <p className="text-[10px] text-slate-500 text-center mb-4">
          This is an educational demo. No real money moves. Figures based on published research on earned wage
          access usage patterns.
        </p>
        <button
          onClick={() => navigate('/watch')}
          className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform mb-3"
        >
          ▶ Watch: the better way (1 min)
        </button>
        <button
          onClick={() => navigate('/watch-loc')}
          className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform mb-3"
        >
          ▶ Watch: credit union line of credit (1 min)
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl text-base active:scale-95 transition-transform mb-3"
        >
          Back to the app
        </button>
        <RestartButton />
      </div>
    </div>
  )
}

function RestartButton() {
  const { resetDemo } = useApp()
  return (
    <button onClick={resetDemo} className="w-full text-slate-500 text-xs font-medium underline">
      Restart the demo from the beginning
    </button>
  )
}

function Row({ label, value, bold, accent }) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-sm">
      <span className={bold ? 'text-slate-200 font-medium' : 'text-slate-400'}>{label}</span>
      <span className={`font-bold whitespace-nowrap ${accent ? 'text-red-400 text-lg' : bold ? 'text-white' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  )
}
