import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function VideoLocScreen() {
  const navigate = useNavigate()
  const { resetDemo } = useApp()

  return (
    <div className="flex-1 relative bg-black flex flex-col">
      <video autoPlay playsInline controls className="flex-1 w-full object-contain" onEnded={e => e.target.pause()}>
        <source src={`${import.meta.env.BASE_URL}explainer-loc.mp4`} type="video/mp4" />
      </video>
      <button
        onClick={() => navigate('/cost')}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white z-10"
        aria-label="Close"
      >
        <X size={18} />
      </button>
      <div className="absolute bottom-4 left-0 right-0 px-5 flex flex-col items-center gap-2 z-10 pointer-events-none">
        <button
          onClick={resetDemo}
          className="pointer-events-auto bg-white text-slate-900 text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Restart the demo
        </button>
      </div>
    </div>
  )
}
