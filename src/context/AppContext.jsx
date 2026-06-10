import { createContext, useContext, useState } from 'react'
import { earned as initialEarned, transactions as initialTransactions } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [earned, setEarned] = useState(initialEarned)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [transferSuccess, setTransferSuccess] = useState(null)

  function requestTransfer(amount, fee, isInstant) {
    const tx = {
      id: Date.now(),
      type: 'transfer',
      amount: -amount,
      date: 'Today',
      description: `${isInstant ? 'Instant' : 'Standard'} transfer to Chase ••4821`,
      status: 'completed',
      fee,
    }
    setTransactions(prev => [tx, ...prev])
    setEarned(prev => ({
      ...prev,
      available: prev.available - amount,
      transferred: prev.transferred + amount,
    }))
    setTransferSuccess({ amount, fee, isInstant })
  }

  return (
    <AppContext.Provider value={{ earned, transactions, transferSuccess, setTransferSuccess, requestTransfer }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
