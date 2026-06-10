import { HashRouter, Routes, Route } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import TransferScreen from './screens/TransferScreen'
import HistoryScreen from './screens/HistoryScreen'
import AccountScreen from './screens/AccountScreen'
import { AppProvider } from './context/AppContext'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <PhoneShell>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/transfer" element={<TransferScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/account" element={<AccountScreen />} />
          </Routes>
          <BottomNav />
        </PhoneShell>
      </HashRouter>
    </AppProvider>
  )
}
