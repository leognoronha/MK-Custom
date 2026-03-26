import { useCallback, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

import { useGameState } from './hooks/useGameState'
import { useAudio } from './hooks/useAudio'
import { useMultiplayer } from './hooks/useMultiplayer'
import type { Cursor } from './types'
import { normalizeImage } from './utils/imageUtils'

import { Toolbar } from './components/Toolbar/Toolbar'
import { PreviewPanel } from './components/PreviewPanel/PreviewPanel'
import { CharacterGrid } from './components/CharacterGrid/CharacterGrid'

import './index.css'

function App() {
  const { 
    characters, 
    title, 
    backgroundUrl, 
    rows, 
    cols, 
    profiles,
    setTitle, 
    setBackgroundUrl, 
    updateGridSize, 
    updateCellImage, 
    updateCellName,
    saveCurrentProfile,
    loadProfile,
    updateProfile,
    deleteProfile,
    resetGrid,
    forceStateSync
  } = useGameState()

  const { muted, setMuted, startMusic, playMoveSound, playGong } = useAudio()

  const [editMode, setEditMode] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(true)
  const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0 })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Estado de aleatório local (apenas para ESTE player)
  const [localRandomHighlight, setLocalRandomHighlight] = useState<number | null>(null)
  const [isLocalRandomizing, setIsLocalRandomizing] = useState(false)
  const randomAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const boardRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // MULTIPLAYER INTEGRATION
  const {
    peerId,
    isConnected,
    isHost,
    remoteCursor,
    remoteSelectedIndex,
    remoteRandomHighlight,
    sendEvent
  } = useMultiplayer({
    onStateSync: (payload) => forceStateSync(payload),
    onCursorMove: () => {
      // handled inside hook
    },
    onSelect: () => {
      // handled inside hook
    },
    onRandomSelect: () => {
      // handled inside hook — remoteSelectedIndex is updated there
    },
    onAudioPlay: (sound) => {
      startMusic()
      if (sound === 'move') playMoveSound()
      if (sound === 'gong') playGong()
    },
    onGuestJoined: () => {
      sendEvent({
        type: 'STATE_SYNC',
        payload: { title, backgroundUrl, rows, cols, characters }
      })
    }
  })

  // Whenever Host changes massive states visually, push the update over network.
  useEffect(() => {
    if (isHost && isConnected) {
      sendEvent({
        type: 'STATE_SYNC',
        payload: { title, backgroundUrl, rows, cols, characters }
      })
    }
  }, [isHost, isConnected, title, backgroundUrl, rows, cols, characters, sendEvent])


  const focusedIndex = cursor.y * cols + cursor.x
  const previewIndex = focusedIndex

  const handleFileUpload = useCallback(
    async (file: File, targetIndex = selectedIndex ?? focusedIndex) => {
      try {
        const normalized = await normalizeImage(file)
        updateCellImage(targetIndex, normalized)
      } catch (error) {
        console.warn('Falha ao processar imagem.', error)
      }
    },
    [focusedIndex, updateCellImage, selectedIndex],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return

      let newX = cursor.x
      let newY = cursor.y
      let moved = false

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (newY > 0) newY--
        moved = true
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (newY < rows - 1) newY++
        moved = true
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (newX > 0) newX--
        moved = true
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (newX < cols - 1) newX++
        moved = true
      }

      if (moved) {
        e.preventDefault()
        setCursor({ x: newX, y: newY })
        startMusic()
        playMoveSound()
        sendEvent({ type: 'CURSOR_MOVE', player: isHost ? 1 : 2, cursor: { x: newX, y: newY } })
        sendEvent({ type: 'AUDIO_PLAY', sound: 'move' })
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const index = newY * cols + newX
        setSelectedIndex(index)
        playGong()
        sendEvent({ type: 'SELECT', player: isHost ? 1 : 2, index })
        sendEvent({ type: 'AUDIO_PLAY', sound: 'gong' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cursor, rows, cols, startMusic, playMoveSound, playGong, isHost, sendEvent])

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!editMode) return
      const pastedImage = Array.from(event.clipboardData?.items ?? []).find((item) =>
        item.type.startsWith('image/'),
      )
      if (!pastedImage) return
      const file = pastedImage.getAsFile()
      if (!file) return
      event.preventDefault()
      handleFileUpload(file)
    },
    [editMode, handleFileUpload],
  )

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const onBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBackgroundUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleExport = useCallback(async () => {
    if (!boardRef.current) return
    const canvas = await html2canvas(boardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'mk-select-screen.png'
    link.href = dataUrl
    link.click()
  }, [])

  const triggerUpload = () => fileInputRef.current?.click()

  /**
   * handleRandom — executa a animação de aleatório para ESTE player (P1 ou P2).
   *
   * P1 (host): usa setCursor + setSelectedIndex locais.
   * P2 (guest): NÃO mexe no cursor local (que pertence ao P1 na sua tela);
   *   manda RANDOM_HIGHLIGHT a cada passo para o outro lado ver,
   *   e RANDOM_SELECT no final.
   */
  const handleRandom = useCallback(() => {
    if (isLocalRandomizing) return
    const total = characters.length
    if (total === 0) return

    setIsLocalRandomizing(true)
    startMusic()

    const player: 1 | 2 = isHost ? 1 : 2
    const TOTAL_STEPS = 30
    let step = 0
    let lastIndex = -1

    const runStep = () => {
      step++
      let nextIndex: number
      do {
        nextIndex = Math.floor(Math.random() * total)
      } while (nextIndex === lastIndex && total > 1)
      lastIndex = nextIndex

      // Destaque local (sempre, pra quem clicou ver)
      setLocalRandomHighlight(nextIndex)
      // Sincroniza destaque remoto (o outro player vê a animação acontecendo)
      sendEvent({ type: 'RANDOM_HIGHLIGHT', player, index: nextIndex })
      playMoveSound()

      if (step < TOTAL_STEPS) {
        const progress = step / TOTAL_STEPS
        const delay = progress < 0.6
          ? 80 - progress * 60
          : 44 + (progress - 0.6) * 350
        randomAnimRef.current = setTimeout(runStep, delay)
      } else {
        // Seleção final
        const finalIndex = lastIndex
        setTimeout(() => {
          setLocalRandomHighlight(null)
          sendEvent({ type: 'RANDOM_HIGHLIGHT', player, index: null })

          const newCursor = { x: finalIndex % cols, y: Math.floor(finalIndex / cols) }

          if (isHost) {
            // P1: atualiza o próprio selectedIndex e cursor localmente
            setSelectedIndex(finalIndex)
            setCursor(newCursor)
            // Avisa P2 da seleção E do novo cursor
            sendEvent({ type: 'RANDOM_SELECT', player: 1, index: finalIndex })
            sendEvent({ type: 'CURSOR_MOVE', player: 1, cursor: newCursor })
          } else {
            // P2: atualiza localmente
            setSelectedIndex(finalIndex)
            setCursor(newCursor)
            // Avisa P1 da seleção E do novo cursor
            sendEvent({ type: 'RANDOM_SELECT', player: 2, index: finalIndex })
            sendEvent({ type: 'CURSOR_MOVE', player: 2, cursor: newCursor })
          }

          playGong()
          sendEvent({ type: 'AUDIO_PLAY', sound: 'gong' })
          setIsLocalRandomizing(false)
        }, 400)
      }
    }

    randomAnimRef.current = setTimeout(runStep, 50)
  }, [isLocalRandomizing, characters, cols, isHost, startMusic, playMoveSound, playGong, sendEvent])

  // O destaque do aleatório do outro player vem de remoteRandomHighlight
  // p1RandomHighlight = destaque local quando sou P1, ou destaque remoto quando sou P2
  // p2RandomHighlight = destaque remoto quando sou P1, ou destaque local quando sou P2
  const p1RandomHighlight = isHost ? localRandomHighlight : remoteRandomHighlight
  const p2RandomHighlight = isHost ? remoteRandomHighlight : localRandomHighlight

  return (
    <div className="app-shell">
      <div className="crt-overlay"></div>
      
      {!toolbarOpen && (
        <button className="floating-toggle" onClick={() => setToolbarOpen(true)}>
          Menu
        </button>
      )}

      <Toolbar
        toolbarOpen={toolbarOpen}
        setToolbarOpen={setToolbarOpen}
        title={title}
        setTitle={setTitle}
        editMode={editMode}
        setEditMode={setEditMode}
        onBackgroundUpload={onBackgroundUpload}
        onExport={handleExport}
        muted={muted}
        setMuted={setMuted}
        rows={rows}
        cols={cols}
        updateGridSize={updateGridSize}
        profiles={profiles}
        saveCurrentProfile={saveCurrentProfile}
        loadProfile={loadProfile}
        updateProfile={updateProfile}
        deleteProfile={deleteProfile}
        resetGrid={resetGrid}
        peerId={peerId}
        isConnected={isConnected}
        isHost={isHost}
      />

      <main
        className="screen"
        style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}
      >
        <div className="capture-area" ref={boardRef}>
          <h1>{title}</h1>
          <div className="content-layout">
            <PreviewPanel 
              character={characters[previewIndex]} 
              editMode={editMode}
              updateCellName={(name) => updateCellName(previewIndex, name)}
              triggerUpload={triggerUpload}
            />

            <CharacterGrid
              characters={characters}
              cursor={cursor}
              p2Cursor={isConnected ? remoteCursor : null}
              selectedIndex={selectedIndex}
              p2SelectedIndex={isConnected ? remoteSelectedIndex : null}
              p1RandomHighlight={p1RandomHighlight}
              p2RandomHighlight={isConnected ? p2RandomHighlight : null}
              cols={cols}
              editMode={editMode}
              onHoverCell={() => {}}
              onClickCell={(index) => {
                if (isLocalRandomizing) return
                setCursor({ x: index % cols, y: Math.floor(index / cols) })
                setSelectedIndex(index)
                playGong()
                sendEvent({ type: 'SELECT', player: isHost ? 1 : 2, index })
                sendEvent({ type: 'AUDIO_PLAY', sound: 'gong' })
              }}
              triggerUpload={triggerUpload}
            />
          </div>
        </div>

        <button
          className={`random-btn${isLocalRandomizing ? ' randomizing' : ''}`}
          onClick={handleRandom}
          disabled={isLocalRandomizing}
        >
          {isLocalRandomizing ? '...' : '🎲 ALEATÓRIO'}
        </button>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          handleFileUpload(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}

export default App
