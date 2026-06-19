import { createContext, useContext, useState, useRef } from 'react'
import { makeScenario, pickRoundCrises, randInt } from '../data/scenario'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null) // { name, bank }
  const [landed, setLanded] = useState(false) // has seen the landing screen
  const [gameMode, setGameMode] = useState(false) // simulation game vs. plain demo
  const [chosenPath, setChosenPath] = useState(null) // 'ewa'|'loc'|'family'|'cut'|'wait'
  const [scenario, setScenario] = useState(makeScenario)
  const [isPlus, setIsPlus] = useState(false) // EarnNow+ subscription
  const [earned, setEarned] = useState(() => scenario.earned)
  const [transactions, setTransactions] = useState(() => scenario.transactions)
  const [lastTransfer, setLastTransfer] = useState(null)
  const [costPage, setCostPage] = useState(0)
  const [gameCrises, setGameCrises] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [numRounds, setNumRounds] = useState(0)
  const [roundResults, setRoundResults] = useState([])
  const tipDodgeTaps = useRef(0)
  // a completely artificial "boosted limit" deadline ~3h out
  const limitDeadline = useRef(Date.now() + (2 * 3600 + 59 * 60 + 14) * 1000)

  function countDodgeTap() {
    tipDodgeTaps.current += 1
  }

  function resetDodgeTaps() {
    tipDodgeTaps.current = 0
  }

  function finishRound(costOnce) {
    const crisis = gameCrises[currentRound]
    setRoundResults(prev => [...prev, { path: chosenPath, costOnce, crisis }])
    setCurrentRound(prev => prev + 1)
    setChosenPath(null)
    tipDodgeTaps.current = 0
  }

  function resetDemo() {
    window.location.hash = '#/'
    const next = makeScenario()
    setScenario(next)
    setProfile(null)
    setLanded(false)
    setGameMode(false)
    setChosenPath(null)
    setIsPlus(false)
    setEarned(next.earned)
    setTransactions(next.transactions)
    setLastTransfer(null)
    setCostPage(0)
    setGameCrises([])
    setCurrentRound(0)
    setNumRounds(0)
    setRoundResults([])
    tipDodgeTaps.current = 0
    limitDeadline.current = Date.now() + (2 * 3600 + 59 * 60 + 14) * 1000
  }

  // Start the simulation game with the player's chosen profession + weekly pay.
  function startGame({ name, profession, weeklyPay }) {
    const next = makeScenario({
      job: profession.job,
      rate: profession.defaultRate,
      weeklyPay,
    })
    const nRounds = 2
    const crises = pickRoundCrises(nRounds)
    setNumRounds(nRounds)
    setGameCrises(crises)
    setCurrentRound(0)
    setRoundResults([])
    setScenario(next)
    setEarned(next.earned)
    setTransactions(next.transactions)
    setLastTransfer(null)
    setIsPlus(false)
    tipDodgeTaps.current = 0
    limitDeadline.current = Date.now() + (2 * 3600 + 59 * 60 + 14) * 1000
    setChosenPath(null)
    setGameMode(true)
    setProfile({ name: name?.trim() || 'Player', bank: 'Genesee Co-op FCU', profession: profession.role, weeklyPay })
  }

  function requestTransfer(amount, fee, tip, isInstant) {
    const subCost = isPlus ? 9.99 / 2 : 0  // half a month's subscription per biweekly advance
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
    setLastTransfer({ amount, fee, tip, subCost, isInstant, dodgeTaps: tipDodgeTaps.current })
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        landed,
        setLanded,
        gameMode,
        setGameMode,
        chosenPath,
        setChosenPath,
        startGame,
        scenario,
        isPlus,
        setIsPlus,
        earned,
        transactions,
        lastTransfer,
        requestTransfer,
        costPage,
        setCostPage,
        countDodgeTap,
        resetDodgeTaps,
        resetDemo,
        limitDeadline,
        gameCrises,
        currentRound,
        numRounds,
        roundResults,
        finishRound,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
