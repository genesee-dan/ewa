import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Play, Pause } from 'lucide-react'

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function VideoPlayer({ src, sources, onClose, bottomAction }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrentTime(v.currentTime)
    const onMeta = () => setDuration(v.duration)
    const onEnded = () => { setPlaying(false) }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('ended', onEnded)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  function handleSeek(e) {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    v.currentTime = ratio * duration
    setCurrentTime(v.currentTime)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex-1 relative bg-black flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="flex-1 w-full object-contain"
        onClick={togglePlay}
        style={{ cursor: 'pointer' }}
      >
        {sources
          ? sources.map(s => <source key={s.src} src={s.src} type={s.type} />)
          : <source src={src} type="video/mp4" />
        }
      </video>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white z-10"
        aria-label="Close"
        style={{ touchAction: 'manipulation' }}
      >
        <X size={18} />
      </button>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4 z-10">
        {/* Progress bar */}
        <div
          className="w-full h-8 flex items-center cursor-pointer mb-2"
          onMouseDown={handleSeek}
          onTouchStart={handleSeek}
          onMouseMove={e => { if (e.buttons === 1) handleSeek(e) }}
          onTouchMove={handleSeek}
          style={{ touchAction: 'none' }}
        >
          <div className="w-full h-1.5 bg-white/30 rounded-full relative">
            <div
              className="h-full bg-amber-400 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>

        {/* Play/pause + time */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center text-white"
            style={{ touchAction: 'manipulation' }}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <span className="text-white text-xs font-mono">
            {fmt(currentTime)} / {fmt(duration)}
          </span>
          <div className="flex-1" />
          {bottomAction}
        </div>
      </div>
    </div>
  )
}
