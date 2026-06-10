/*
 * Playful illustration block used on tip / upsell screens — a soft
 * gradient blob with a big emoji and floating mini-emojis, mimicking
 * the cute mascot art real EWA apps use to soften the ask.
 */
export default function TipArt({ main, minis = [], from = '#fef9c3', to = '#dcfce7' }) {
  const spots = [
    { top: '-6px', left: '8px', size: 'text-2xl', rot: '-15deg' },
    { top: '10px', right: '-4px', size: 'text-xl', rot: '12deg' },
    { bottom: '0px', left: '-8px', size: 'text-xl', rot: '8deg' },
    { bottom: '-8px', right: '14px', size: 'text-2xl', rot: '-10deg' },
  ]
  return (
    <div className="relative w-36 h-36 mx-auto mb-5">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${from}, ${to})`,
          boxShadow: `0 12px 32px ${to}`,
        }}
      />
      <span className="absolute top-1 left-6 text-base animate-pulse">✨</span>
      <span className="absolute bottom-3 right-2 text-sm animate-pulse" style={{ animationDelay: '0.6s' }}>
        ✨
      </span>
      <div className="absolute inset-0 flex items-center justify-center text-6xl" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))' }}>
        {main}
      </div>
      {minis.slice(0, 4).map((m, i) => (
        <span
          key={i}
          className={`absolute ${spots[i].size}`}
          style={{ ...spots[i], transform: `rotate(${spots[i].rot})` }}
        >
          {m}
        </span>
      ))}
    </div>
  )
}
