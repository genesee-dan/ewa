import { HashRouter, Routes, Route } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import TransferScreen from './screens/TransferScreen'
import HistoryScreen from './screens/HistoryScreen'
import AccountScreen from './screens/AccountScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import RealCostScreen from './screens/RealCostScreen'
import { AppProvider, useApp } from './context/AppContext'

function Shell() {
  const { profile } = useApp()

  if (!profile) {
    return (
      <PhoneShell>
        <OnboardingScreen />
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
