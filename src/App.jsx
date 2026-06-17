import { HashRouter, Routes, Route } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import TransferScreen from './screens/TransferScreen'
import HistoryScreen from './screens/HistoryScreen'
import AccountScreen from './screens/AccountScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import LandingScreen from './screens/LandingScreen'
import GameSetupScreen from './screens/GameSetupScreen'
import GameResultScreen from './screens/GameResultScreen'
import RealCostScreen from './screens/RealCostScreen'
import VideoScreen from './screens/VideoScreen'
import VideoLocScreen from './screens/VideoLocScreen'
import { AppProvider, useApp } from './context/AppContext'

function Shell() {
  const { profile, landed, gameMode } = useApp()

  if (!landed) {
    return (
      <PhoneShell>
        <LandingScreen />
      </PhoneShell>
    )
  }

  if (!profile) {
    return (
      <PhoneShell>
        {gameMode ? <GameSetupScreen /> : <OnboardingScreen />}
      </PhoneShell>
    )
  }

  return (
    <HashRouter>
      <PhoneShell>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/transfer" element={<TransferScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/account" element={<AccountScreen />} />
          <Route path="/cost" element={<RealCostScreen />} />
          <Route path="/watch" element={<VideoScreen />} />
          <Route path="/watch-loc" element={<VideoLocScreen />} />
          <Route path="/game-result" element={<GameResultScreen />} />
        </Routes>
        <BottomNav />
      </PhoneShell>
    </HashRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
