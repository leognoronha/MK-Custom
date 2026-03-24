import { useCallback, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

import { useGameState } from './hooks/useGameState'
import { useAudio } from './hooks/useAudio'
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
    resetGrid
  } = useGameState()

  const { muted, setMuted, startMusic, playMoveSound, playGong } = useAudio()

  const [editMode, setEditMode] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(true)
  const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0 })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const boardRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const index = newY * cols + newX
        setSelectedIndex(index)
        playGong()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cursor, rows, cols, startMusic, playMoveSound, playGong])

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
              selectedIndex={selectedIndex}
              cols={cols}
              editMode={editMode}
              onHoverCell={() => {}}
              onClickCell={(index) => {
                setCursor({ x: index % cols, y: Math.floor(index / cols) })
                setSelectedIndex(index)
                playGong()
              }}
              triggerUpload={triggerUpload}
            />
          </div>
        </div>
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
