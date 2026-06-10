import { createContext, useContext, useState, useRef } from 'react'
import { makeScenario } from '../data/scenario'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null) // { name, bank }
  const [scenario, setScenario] = useState(makeScenario)
  const [isPlus, setIsPlus] = useState(false) // EarnNow+ subscription
  const [earned, setEarned] = useState(() => scenario.earned)
  const [transactions, setTransactions] = useState(() => scenario.transactions)
  const [lastTransfer, setLastTransfer] = useState(null)
  const tipDodgeTaps = useRef(0)
  // a completely artificial "boosted limit" deadline ~3h out
  const limitDeadline = useRef(Date.now() + (2 * 3600 + 59 * 60 + 14) * 1000)

  function countDodgeTap() {
    tipDodgeTaps.current += 1
  }

  function resetDodgeTaps() {
    tipDodgeTaps.current = 0
  }

  function resetDemo() {
    window.location.hash = '#/'
    const next = makeScenario()
    setScenario(next)
    setProfile(null)
    setIsPlus(false)
    setEarned(next.earned)
    setTransactions(next.transactions)
    setLastTransfer(null)
    tipDodgeTaps.current = 0
    limitDeadline.current = Date.now() + (2 * 3600 + 59 * 60 + 14) * 1000
  }

  function requestTransfer(amount, fee, tip, isInstant) {
    const tx = {
      id: Date.now(),
      type: 'transfer',
      amount: -amount,
      date: 'Today',
      description: `${isInstant ? 'Instant' : 'Standard'} transfer to ••${scenario.last4}`,
      status: 'completed',
      fee: fee + tip,
    }
    setTransactions(prev => [tx, ...prev])
    setEarned(prev => ({
      ...prev,
      available: prev.available - amount,
      transferred: prev.transferred + amount,
    }))
    setLastTransfer({ amount, fee, tip, isInstant, dodgeTaps: tipDodgeTaps.current })
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        scenario,
        isPlus,
        setIsPlus,
        earned,
        transactions,
        lastTransfer,
        requestTransfer,
        countDodgeTap,
        resetDodgeTaps,
        resetDemo,
        limitDeadline,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
