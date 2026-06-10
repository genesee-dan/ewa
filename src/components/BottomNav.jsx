import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Clock, ArrowUpCircle, User } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/history', label: 'History', Icon: Clock },
  { path: '/transfer', label: 'Get Paid', Icon: ArrowUpCircle, primary: true },
  { path: '/account', label: 'Account', Icon: User },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="bg-white border-t border-slate-100 flex items-center justify-around px-2 py-2" style={{ minHeight: '64px' }}>
      {tabs.map(({ path, label, Icon, primary }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              primary
                ? 'bg-green-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-green-200 -mt-4'
                : active
                ? 'text-green-600'
                : 'text-slate-400'
            }`}
          >
            <Icon size={primary ? 22 : 20} strokeWidth={active || primary ? 2.5 : 1.8} />
            <span className={`text-xs font-medium ${primary ? 'text-white' : ''}`}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
