import { useState, useMemo, useEffect } from 'react'
import type { Character } from '../types'
import { STORAGE_KEY, DEFAULT_ROWS, DEFAULT_COLS, createDefaultCharacters } from '../utils/constants'

type GameState = {
  characters: Character[]
  title: string
  backgroundUrl: string
  rows: number
  cols: number
}

export function useGameState() {
  const loadedState = useMemo(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as GameState
      if (!parsed.rows) parsed.rows = DEFAULT_ROWS
      if (!parsed.cols) parsed.cols = DEFAULT_COLS
      return parsed
    } catch {
      return null
    }
  }, [])

  const [rows, setRows] = useState(loadedState?.rows ?? DEFAULT_ROWS)
  const [cols, setCols] = useState(loadedState?.cols ?? DEFAULT_COLS)

  const [characters, setCharacters] = useState<Character[]>(() => {
    if (loadedState?.characters?.length === (loadedState?.rows ?? DEFAULT_ROWS) * (loadedState?.cols ?? DEFAULT_COLS)) {
      return loadedState.characters
    }
    return createDefaultCharacters(loadedState?.rows ?? DEFAULT_ROWS, loadedState?.cols ?? DEFAULT_COLS)
  })

  const updateGridSize = (newRows: number, newCols: number) => {
    // Limits avoiding broken layouts
    if (newRows < 1 || newRows > 10) newRows = rows
    if (newCols < 1 || newCols > 10) newCols = cols
    
    setRows(newRows)
    setCols(newCols)
    setCharacters((prev) => {
      const newGridSize = newRows * newCols
      if (prev.length === newGridSize) return prev
      if (prev.length > newGridSize) return prev.slice(0, newGridSize)
      
      const addedCount = newGridSize - prev.length
      const newFighters = Array.from({ length: addedCount }, (_, i) => {
        const index = prev.length + i
        const r = Math.floor(index / newCols)
        const c = index % newCols
        return {
          id: `${r}-${c}-${Date.now()}`,
          name: `Fighter ${index + 1}`,
          image: null,
        }
      })
      return [...prev, ...newFighters]
    })
  }

  const [title, setTitle] = useState(loadedState?.title ?? 'SELECT YOUR FIGHTER')
  const [backgroundUrl, setBackgroundUrl] = useState(loadedState?.backgroundUrl ?? '')

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ characters, title, backgroundUrl, rows, cols }),
      )
    } catch (error) {
      console.warn('Falha ao salvar no localStorage.', error)
    }
  }, [characters, title, backgroundUrl, rows, cols])

  const updateCellImage = (index: number, image: string) => {
    setCharacters((prev) =>
      prev.map((character, currentIndex) =>
        currentIndex === index ? { ...character, image } : character,
      ),
    )
  }

  const updateCellName = (index: number, name: string) => {
    setCharacters((prev) =>
      prev.map((character, currentIndex) =>
        currentIndex === index ? { ...character, name } : character,
      ),
    )
  }

  return {
    characters,
    title,
    backgroundUrl,
    rows,
    cols,
    setCharacters,
    setTitle,
    setBackgroundUrl,
    updateGridSize,
    updateCellImage,
    updateCellName,
  }
}
