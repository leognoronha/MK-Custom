import { useState, useRef, useCallback, useEffect } from 'react'

import clickSoundFile from '../../sounds/mk3_character_select.mp3'
import gongSoundFile from '../../sounds/mk2_gong.mp3'
import menuSoundFile from '../../sounds/mk1_soundmenu.mp3'

export function useAudio() {
  const [muted, setMuted] = useState(false)
  
  const musicRef = useRef(new Audio(menuSoundFile))
  const moveRef = useRef(new Audio(clickSoundFile))
  const gongRef = useRef(new Audio(gongSoundFile))
  const hasStartedMusicRef = useRef(false)

  const startMusic = useCallback(() => {
    if (hasStartedMusicRef.current || muted) return
    const music = musicRef.current
    music.loop = true
    music.volume = 0.3
    music.play().catch(() => undefined)
    hasStartedMusicRef.current = true
  }, [muted])

  const playMoveSound = useCallback(() => {
    if (muted) return
    const move = moveRef.current
    move.currentTime = 0
    move.volume = 0.85
    move.play().catch(() => undefined)
  }, [muted])

  const playGong = useCallback(() => {
    if (muted) return
    const gong = gongRef.current
    gong.currentTime = 0
    gong.volume = 0.9
    gong.play().catch(() => undefined)
  }, [muted])

  useEffect(() => {
    const music = musicRef.current
    music.muted = muted
    if (muted) {
      music.pause()
    } else if (hasStartedMusicRef.current) {
      music.play().catch(() => undefined)
    }
  }, [muted])

  return {
    muted,
    setMuted,
    startMusic,
    playMoveSound,
    playGong,
  }
}
