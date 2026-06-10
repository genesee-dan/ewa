import { createContext, useContext, useState, useRef } from 'react'
import { earned as initialEarned, transactions as initialTransactions } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null) // { name, bank }
  const [isPlus, setIsPlus] = useState(false) // EarnNow+ subscription
  const [earned, setEarned] = useState(initialEarned)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [lastTransfer, setLastTransfer] = useState(null)
  const tipDodgeTaps = useRef(0)

  function countDodgeTap() {
    tipDodgeTaps.current += 1
  }

  function resetDodgeTaps() {
    tipDodgeTaps.current = 0
  }

  function resetDemo() {
    window.location.hash = '#/'
    setProfile(null)
    setIsPlus(false)
    setEarned(initialEarned)
    setTransactions(initialTransactions)
    setLastTransfer(null)
    tipDodgeTaps.current = 0
  }

  function requestTransfer(amount, fee, tip, isInstant) {
    const bank = profile?.bank || 'Chase'
    const tx = {
      id: Date.now(),
      type: 'transfer',
      amount: -amount,
      date: 'Today',
      description: `${isInstant ? 'Instant' : 'Standard'} transfer to ${bank} ••4821`,
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
        isPlus,
        setIsPlus,
        earned,
        transactions,
        lastTransfer,
        requestTransfer,
        countDodgeTap,
        resetDodgeTaps,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
