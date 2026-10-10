import { useEffect, useRef, useState } from 'react'

let apiPromise
const loadApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT) }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.onerror = () => { apiPromise = undefined; reject(new Error('Video unavailable')) }
    document.head.appendChild(script)
  })
  return apiPromise
}

export default function HeroVideo({ reduceMotion }) {
  const host = useRef(null)
  const player = useRef(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (reduceMotion) return
    let disposed = false
    setVisible(false); setFailed(false)
    loadApi().then(YT => {
      if (disposed) return
      const target = document.createElement('div')
      host.current.appendChild(target)
      player.current = new YT.Player(target, {
        videoId: 'YAFUyPp_238',
        playerVars: { autoplay: 1, controls: 0, loop: 1, playlist: 'YAFUyPp_238', playsinline: 1, disablekb: 1, fs: 0, origin: window.location.origin },
        events: {
          onReady: event => {
            if (disposed) return
            const iframe = event.target.getIframe()
            iframe.setAttribute('tabindex', '-1')
            iframe.setAttribute('title', 'Zudo Cars background video')
            event.target.mute(); event.target.playVideo()
          },
          onStateChange: event => {
            if (disposed) return
            if (event.data === YT.PlayerState.PLAYING) setVisible(true)
          },
          onError: () => { if (!disposed) { setFailed(true); setVisible(false) } },
        },
      })
    }).catch(() => { if (!disposed) setFailed(true) })
    return () => { disposed = true; player.current?.destroy(); player.current = null }
  }, [reduceMotion])
  if (reduceMotion) return null
  return <div ref={host} className={`rental-hero-video${visible && !failed ? ' is-playing' : ''}`} aria-hidden="true" />
}
