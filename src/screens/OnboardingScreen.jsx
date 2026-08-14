import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'

const BANKS = [
  { name: 'Genesee Co-op FCU', logo: `${import.meta.env.BASE_URL}genesee-icon.png` },
  { name: 'Chase', emoji: '🏦' },
  { name: 'Bank of America', emoji: '🏛️' },
  { name: 'Wells Fargo', emoji: '🐎' },
  { name: 'Citi', emoji: '🌆' },
  { name: 'US Bank', emoji: '🇺🇸' },
  { name: 'Capital One', emoji: '💳' },
  { name: 'Other', emoji: '🏧' },
]

export default function OnboardingScreen() {
  const { setProfile } = useApp()
  const t = useT()
  const [step, setStep] = useState('welcome') // welcome | name | bank | connecting
  const [name, setName] = useState('')
  const [bank, setBank] = useState(null)

  useEffect(() => {
    if (step === 'connecting') {
      const t = setTimeout(() => {
        window.location.hash = '#/' // clear any stale route from a previous run
        setProfile({ name: name.trim(), bank })
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [step, name, bank, setProfile])

  if (step === 'welcome') {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-7 text-center text-white"
        style={{ background: 'linear-gradient(160deg, #16a34a 0%, #14532d 100%)' }}
      >
        <div className="text-6xl mb-5">⚡</div>
        <h1 className="text-3xl font-extrabold mb-2">EarnNow</h1>
        <p className="text-2xl font-extrabold text-white leading-snug mb-3">
          {t('onboarding.taglineA')}
          <br />
          {t('onboarding.taglineB')}<sup className="text-xs font-bold align-super">™</sup>
        </p>
        <p className="text-green-100 text-sm font-semibold mb-1">
          {t('onboarding.upToPrefix')}<span className="text-white font-extrabold">{t('onboarding.upToAmount')}</span>{t('onboarding.upToSuffix')}
        </p>
        <p className="text-green-200 text-sm mb-10">{t('onboarding.noCredit')}</p>
        <button
          onClick={() => setStep('name')}
          className="w-full bg-white text-green-700 font-bold py-4 rounded-2xl text-base shadow-xl active:scale-95 transition-transform"
        >
          {t('onboarding.getMyMoney')}
        </button>
        <p className="text-green-300 text-xs mt-4">{t('onboarding.joinMembers')}</p>
      </div>
    )
  }

  if (step === 'name') {
    return (
      <div className="flex-1 flex flex-col px-6 pt-10 bg-white">
        <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">{t('onboarding.step1')}</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{t('onboarding.whatsName')}</h1>
        <p className="text-sm text-slate-400 mb-4">{t('onboarding.sayHi')}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>{t('onboarding.nameWarningBold')}</strong>{t('onboarding.nameWarningRest')}
          </p>
        </div>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('onboarding.namePlaceholder')}
          className="border-2 border-green-500 rounded-2xl px-4 py-4 text-lg font-semibold text-slate-900 outline-none mb-6"
        />
        <button
          onClick={() => name.trim() && setStep('bank')}
          disabled={!name.trim()}
          className={`w-full font-bold py-4 rounded-2xl text-base transition-all ${
            name.trim()
              ? 'bg-green-500 text-white shadow-lg shadow-green-200 active:scale-95'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          {t('onboarding.continue')}
        </button>
      </div>
    )
  }

  if (step === 'bank') {
    return (
      <div className="flex-1 min-h-0 flex flex-col px-6 pt-10 pb-safe-2 bg-white overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Step 2 of 2</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Link your bank</h1>
        <p className="text-sm text-slate-400 mb-3">
          So we know where to send your money. <span className="text-slate-300">(Demo — nothing is really linked.)</span>
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Real apps connect through services like Plaid,</strong> giving them read access to your full transaction history, balance, and direct deposit records.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {BANKS.map(b => (
            <button
              key={b.name}
              onClick={() => setBank(b.name)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-colors ${
                bank === b.name ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'
              }`}
            >
              {b.logo ? (
                <img src={b.logo} alt="" className="w-8 h-8 rounded-lg" />
              ) : (
                <span className="text-2xl">{b.emoji}</span>
              )}
              <span className={`text-xs font-bold ${bank === b.name ? 'text-green-700' : 'text-slate-600'}`}>
                {b.name}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => bank && setStep('connecting')}
          disabled={!bank}
          className={`w-full font-bold py-4 rounded-2xl text-base mb-8 transition-all ${
            bank
              ? 'bg-green-500 text-white shadow-lg shadow-green-200 active:scale-95'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          Securely Connect
        </button>
      </div>
    )
  }

  // connecting
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-white text-center">
      <div className="w-14 h-14 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mb-6" />
      <p className="text-lg font-bold text-slate-800 mb-1">Connecting to {bank}…</p>
      <p className="text-sm text-slate-400">Verifying your paycheck deposits</p>
    </div>
  )
}
