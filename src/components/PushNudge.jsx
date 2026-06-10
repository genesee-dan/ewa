import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

/*
 * Fake iOS-style push notifications that drop in while you sit on the
 * home screen — the manufactured-urgency channel real EWA apps lean on.
 */
export default function PushNudge() {
  const navigate = useNavigate()
  const { earned, scenario } = useApp()
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const timers = useRef([])

  const nudges = [
    {
      title: 'Money is waiting 💰',
      body: `You have ${fmt(earned.available)} ready to claim. Why leave it sitting there?`,
    },
    {
      title: 'Your boosted limit is expiring ⏰',
      body: `Don't miss out — claim your full ${fmt(earned.available)} before it drops.`,
    },
    {
      title: 'Your streak is at risk 🔥',
      body: `Keep your ${scenario.streak}-week streak — members who do get priority transfers.`,
    },
    {
      title: `Payday is ${scenario.daysToPayday} days away 😬`,
      body: 'Running low? Bridge the gap in under 5 minutes.',
    },
  ]

  useEffect(() => {
    let i = 0
    const ts = timers.current
    function schedule(delay) {
      ts.push(
        setTimeout(() => {
          setIndex(i % nudges.length)
          setVisible(true)
          ts.push(
            setTimeout(() => {
              setVisible(false)
              i += 1
              schedule(12000)
            }, 5500)
          )
        }, delay)
      )
    }
    schedule(5000)
    return () => ts.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nudge = nudges[index]
  return (
    <div
      className="absolute left-3 right-3 z-30 transition-transform duration-500 ease-out"
      style={{ top: '8px', transform: visible ? 'translateY(0)' : 'translateY(-130%)' }}
    >
      <button
        onClick={() => {
          setVisible(false)
          navigate('/transfer')
        }}
        className="w-full text-left bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-200 px-3.5 py-3 flex items-start gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-white text-lg shrink-0">
          ⚡
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">EarnNow</p>
            <p className="text-[10px] text-slate-300">now</p>
          </div>
          <p className="text-xs font-bold text-slate-900">{nudge.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{nudge.body}</p>
        </div>
      </button>
    </div>
  )
}
