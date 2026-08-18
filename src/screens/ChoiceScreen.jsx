import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n'
import { ITEMS_MAX } from './CutSpendingScreen'

const PATHS = [
  {
    id: 'ewa',
    emoji: '🤳',
    bg: 'linear-gradient(135deg,#16a34a,#14532d)',
    border: '#16a34a',
  },
  {
    id: 'loc',
    emoji: '🏦',
    bg: 'linear-gradient(135deg,#1e40af,#1e3a8a)',
    border: '#3b82f6',
  },
  {
    id: 'family',
    emoji: '👨‍👩‍👧',
    bg: 'linear-gradient(135deg,#92400e,#78350f)',
    border: '#f59e0b',
  },
  {
    id: 'cut',
    emoji: '✂️',
    bg: 'linear-gradient(135deg,#374151,#1f2937)',
    border: '#6b7280',
  },
  {
    id: 'wait',
    emoji: '🤷',
    bg: 'linear-gradient(135deg,#4c1d95,#3b0764)',
    border: '#8b5cf6',
  },
]

export default function ChoiceScreen() {
  const navigate = useNavigate()
  const t = useT()
  const { setChosenPath, gameCrises, currentRound, scenario } = useApp()
  const crisis = gameCrises[currentRound] ?? scenario.crisis
  const { daysToPayday } = scenario

  function choose(id) {
    setChosenPath(id)
    if (id === 'ewa') navigate('/transfer')
    else if (id === 'loc') navigate('/loc-path')
    else if (id === 'family') navigate('/family-path')
    else if (id === 'cut') navigate('/cut-spending')
    else navigate('/wait-path')
  }

  return (
    <div className="flex-1 flex flex-col px-5 pt-5 pb-safe-5 bg-slate-900 text-white">
      <h1 className="text-xl font-extrabold mb-0.5">{t('choice.title')}</h1>
      <p className="text-slate-400 text-xs mb-3">
        {t('choice.needPre')}<span className="text-red-400 font-bold">${crisis.amount}</span>{t('choice.needPost')}
      </p>
      <div className="flex flex-col gap-2 flex-1 justify-center">
        {PATHS.map(p => {
          const tagline = p.id === 'wait'
            ? t(daysToPayday !== 1 ? 'choice.waitTaglineOther' : 'choice.waitTaglineOne', { n: daysToPayday })
            : t(`choice.path.${p.id}.tagline`)
          const disabled = p.id === 'cut' && crisis.amount > ITEMS_MAX
          return (
            <button
              key={p.id}
              onClick={() => !disabled && choose(p.id)}
              disabled={disabled}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-transform border ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
              style={{ background: p.bg, borderColor: p.border + '66', touchAction: 'manipulation' }}
            >
              <span className="text-3xl shrink-0">{p.emoji}</span>
              <div>
                <p className="font-extrabold text-white text-sm leading-tight">{t(`choice.path.${p.id}.title`)}</p>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {disabled ? t('choice.disabled') : tagline}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
