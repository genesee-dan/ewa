import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
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
import SituationScreen from './screens/SituationScreen'
import ChoiceScreen from './screens/ChoiceScreen'
import LocPathScreen from './screens/LocPathScreen'
import FamilyPathScreen from './screens/FamilyPathScreen'
import CutSpendingScreen from './screens/CutSpendingScreen'
import WaitPathScreen from './screens/WaitPathScreen'
import RealCostScreen from './screens/RealCostScreen'
import VideoScreen from './screens/VideoScreen'
import VideoLocScreen from './screens/VideoLocScreen'
import { AppProvider, useApp } from './context/AppContext'

// Routes where the bottom nav should be hidden
const NO_NAV_PATHS = ['/situation', '/choice', '/loc-path', '/family-path', '/cut-spending', '/wait-path', '/game-result', '/cost', '/watch', '/watch-loc']

function Shell() {
  const { profile, landed, gameMode } = useApp()

  // Landing screen — shown before anything else, outside the router
  if (!landed) {
    return (
      <PhoneShell>
        <LandingScreen />
      </PhoneShell>
    )
  }

  // Setup screens — shown before profile is set
  if (!profile) {
    return (
      // Need HashRouter here so GameSetupScreen can useNavigate to /situation
      <HashRouter>
        <PhoneShell>
          <Routes>
            <Route path="*" element={gameMode ? <GameSetupScreen /> : <OnboardingScreen />} />
          </Routes>
        </PhoneShell>
      </HashRouter>
    )
  }

  // Main app
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
          <Route path="/situation" element={<SituationScreen />} />
          <Route path="/choice" element={<ChoiceScreen />} />
          <Route path="/loc-path" element={<LocPathScreen />} />
          <Route path="/family-path" element={<FamilyPathScreen />} />
          <Route path="/cut-spending" element={<CutSpendingScreen />} />
          <Route path="/wait-path" element={<WaitPathScreen />} />
          <Route path="/game-result" element={<GameResultScreen />} />
        </Routes>
        <NavGate />
      </PhoneShell>
    </HashRouter>
  )
}

function NavGate() {
  const { pathname } = useLocation()
  if (NO_NAV_PATHS.some(p => pathname.startsWith(p))) return null
  return <BottomNav />
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
