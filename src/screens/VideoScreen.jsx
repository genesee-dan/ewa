import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import VideoPlayer from '../components/VideoPlayer'
import { useT } from '../i18n'

export default function VideoScreen() {
  const navigate = useNavigate()
  const { setCostPage } = useApp()
  const t = useT()

  return (
    <VideoPlayer
      sources={[
        { src: `${import.meta.env.BASE_URL}explainer.mp4`, type: 'video/mp4' },
        { src: `${import.meta.env.BASE_URL}explainer.webm`, type: 'video/webm' },
      ]}
      onClose={() => navigate('/cost')}
      bottomAction={
        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate('/cost')}
            className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform"
            style={{ touchAction: 'manipulation' }}
          >
            {t('video.back')}
          </button>
          <button
            onClick={() => { setCostPage(5); navigate('/cost') }}
            className="flex-1 bg-amber-500 text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform"
            style={{ touchAction: 'manipulation' }}
          >
            {t('video.next')}
          </button>
        </div>
      }
    />
  )
}
