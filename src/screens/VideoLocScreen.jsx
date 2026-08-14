import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import VideoPlayer from '../components/VideoPlayer'
import { useT } from '../i18n'

export default function VideoLocScreen() {
  const navigate = useNavigate()
  const { resetDemo } = useApp()
  const t = useT()

  return (
    <VideoPlayer
      src={`${import.meta.env.BASE_URL}explainer-loc.mp4`}
      onClose={() => navigate('/cost')}
      bottomAction={
        <button
          onClick={resetDemo}
          className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          {t('video.restart')}
        </button>
      }
    />
  )
}
