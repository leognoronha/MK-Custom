import { useState, useMemo, useEffect, useCallback } from 'react'
import type { Character, SaveProfile } from '../types'
import { STORAGE_KEY, PROFILES_STORAGE_KEY, DEFAULT_ROWS, DEFAULT_COLS, createDefaultCharacters } from '../utils/constants'

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

  const loadedProfiles = useMemo(() => {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY)
    if (!raw) return []
    try {
      return JSON.parse(raw) as SaveProfile[]
    } catch {
      return []
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

  const [title, setTitle] = useState(loadedState?.title ?? 'SELECT YOUR FIGHTER')
  const [backgroundUrl, setBackgroundUrl] = useState(loadedState?.backgroundUrl ?? '')
  
  const [profiles, setProfiles] = useState<SaveProfile[]>(loadedProfiles)

  // Current State persistence
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ characters, title, backgroundUrl, rows, cols }),
      )
    } catch (error) {
      console.warn('Falha ao salvar gameState no localStorage.', error)
    }
  }, [characters, title, backgroundUrl, rows, cols])

  // Profiles persistence
  useEffect(() => {
    try {
      localStorage.setItem(
        PROFILES_STORAGE_KEY,
        JSON.stringify(profiles),
      )
    } catch (error) {
      console.warn('Falha ao salvar profiles no localStorage.', error)
    }
  }, [profiles])

  const updateGridSize = (newRows: number, newCols: number) => {
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

  const saveCurrentProfile = useCallback((profileName: string) => {
    if (!profileName.trim()) return
    const newProfile: SaveProfile = {
      id: Date.now().toString(),
      profileName: profileName.trim(),
      title,
      backgroundUrl,
      rows,
      cols,
      characters,
    }
    setProfiles(prev => [...prev, newProfile])
  }, [title, backgroundUrl, rows, cols, characters])

  const loadProfile = useCallback((id: string) => {
    const target = profiles.find(p => p.id === id)
    if (!target) return
    setTitle(target.title)
    setBackgroundUrl(target.backgroundUrl)
    setRows(target.rows)
    setCols(target.cols)
    setCharacters(target.characters)
  }, [profiles])

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id))
  }, [])

  const resetGrid = useCallback(() => {
    setCharacters(createDefaultCharacters(rows, cols))
    setTitle('SELECT YOUR FIGHTER')
    setBackgroundUrl('')
  }, [rows, cols])

  const updateProfile = useCallback((id: string) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          title,
          backgroundUrl,
          rows,
          cols,
          characters
        }
      }
      return p
    }))
  }, [title, backgroundUrl, rows, cols, characters])

  return {
    characters,
    title,
    backgroundUrl,
    rows,
    cols,
    profiles,
    setCharacters,
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
  }
}
