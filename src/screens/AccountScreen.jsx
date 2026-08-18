import { ChevronRight, Bell, Shield, CreditCard, HelpCircle, LogOut, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'

const menuItems = (t, bankLabel) => [
  {
    group: t('account.group.payment'),
    items: [
      { icon: CreditCard, label: t('account.bankAccount'), sub: bankLabel, color: 'bg-blue-50 text-blue-500' },
      { icon: Star, label: t('account.tipSettings'), sub: t('account.tipSettingsSub'), color: 'bg-amber-50 text-amber-500' },
    ],
  },
  {
    group: t('account.group.app'),
    items: [
      { icon: Bell, label: t('account.notifications'), sub: t('account.notificationsSub'), color: 'bg-green-50 text-green-500' },
      { icon: Shield, label: t('account.privacy'), sub: t('account.privacySub'), color: 'bg-purple-50 text-purple-500' },
    ],
  },
  {
    group: t('account.group.support'),
    items: [
      { icon: HelpCircle, label: t('account.help'), sub: t('account.helpSub'), color: 'bg-slate-100 text-slate-500' },
    ],
  },
]

export default function AccountScreen() {
  const t = useT()
  const { profile, resetDemo, scenario } = useApp()
  const name = profile?.name || 'Demo User'
  const bank = profile?.bank || 'Bank'
  const groups = menuItems(t, `${bank} ••${scenario.last4}`)
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 pb-safe-nav" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-3 pb-5">
        <h1 className="text-xl font-bold text-slate-900 mb-4">{t('account.title')}</h1>

        {/* Profile card */}
        <div className="flex items-center gap-4 bg-green-50 rounded-2xl p-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-green-200">
            {name[0]}
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{name}</p>
            <p className="text-sm text-slate-500">{scenario.job.employer}</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">{t('account.activeEmployee')}</p>
          </div>
        </div>
      </div>

      {/* Employment details */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{t('account.employment')}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">{t('account.employer')}</span>
              <span className="text-sm font-semibold text-slate-800">{scenario.job.employer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">{t('account.hourlyRate')}</span>
              <span className="text-sm font-semibold text-slate-800">{t('account.hourlyValue', { rate: scenario.rate })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">{t('account.hoursThisPeriod')}</span>
              <span className="text-sm font-semibold text-slate-800">{t('account.hoursValue', { hours: scenario.hours })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">{t('account.paySchedule')}</span>
              <span className="text-sm font-semibold text-slate-800">{t('account.biweekly')}</span>
            </div>
          </div>
        </div>

        {/* Menu groups */}
        {groups.map(group => (
          <div key={group.group} className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">{group.group}</p>
            <div className="bg-white rounded-2xl divide-y divide-slate-50 overflow-hidden">
              {group.items.map(item => (
                <button key={item.label} className="flex items-center w-full px-4 py-3.5 active:bg-slate-50">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    {item.sub && <p className="text-xs text-slate-400">{item.sub}</p>}
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out / demo reset */}
        <button
          onClick={resetDemo}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 font-semibold py-3.5 rounded-2xl text-sm active:bg-red-100 mb-4"
        >
          <LogOut size={16} />
          {t('account.signOut')}
        </button>

        <p className="text-xs text-slate-300 text-center pb-4">{t('account.version')}</p>
      </div>
    </div>
  )
}
