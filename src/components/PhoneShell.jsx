export default function PhoneShell({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200 p-4">
      {/* Desktop hint */}
      <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 text-slate-400 text-xs tracking-wide">
        EarnNow · Demo App
      </div>

      {/* Phone frame */}
      <div
        className="relative bg-white overflow-hidden flex flex-col"
        style={{
          width: '390px',
          height: '844px',
          borderRadius: '44px',
          boxShadow: '0 0 0 10px #1c1c1e, 0 30px 80px rgba(0,0,0,0.4)',
          maxHeight: '100dvh',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-3 pb-1 bg-white z-10">
          <span className="text-xs font-semibold text-slate-900">9:41</span>
          <div
            className="bg-black rounded-full"
            style={{ width: '120px', height: '30px', borderRadius: '20px' }}
          />
          <div className="flex items-center gap-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="4" width="3" height="8" rx="1" fill="#1c1c1e" />
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="#1c1c1e" />
              <rect x="9" y="1" width="3" height="11" rx="1" fill="#1c1c1e" />
              <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#1c1c1e" />
            </svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
              <path d="M7.5 2.5C9.7 2.5 11.7 3.4 13.1 4.9L14.5 3.5C12.7 1.6 10.2 0.5 7.5 0.5C4.8 0.5 2.3 1.6 0.5 3.5L1.9 4.9C3.3 3.4 5.3 2.5 7.5 2.5Z" fill="#1c1c1e" />
              <path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7.1L12.7 5.7C11.3 4.4 9.5 3.5 7.5 3.5C5.5 3.5 3.7 4.4 2.3 5.7L3.7 7.1C4.7 6.1 6 5.5 7.5 5.5Z" fill="#1c1c1e" />
              <circle cx="7.5" cy="10" r="1.5" fill="#1c1c1e" />
            </svg>
            <div className="flex items-center gap-0.5">
              <div className="w-6 h-3 rounded-sm border border-slate-800 flex items-center p-0.5">
                <div className="h-full bg-slate-800 rounded-sm" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#f8f9fa' }}>
          {children}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1 bg-white">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  )
}
