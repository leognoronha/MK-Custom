import type { Character } from '../types'

export const DEFAULT_ROWS = 3
export const DEFAULT_COLS = 5
export const STORAGE_KEY = 'mk-select-state-v1'
export const PROFILES_STORAGE_KEY = 'mk-select-profiles-v1'
export const CELL_EXPORT_WIDTH = 300
export const CELL_EXPORT_HEIGHT = 400

export const createDefaultCharacters = (rows: number, cols: number): Character[] => {
  return Array.from({ length: rows * cols }, (_, index) => {
    const r = Math.floor(index / cols)
    const c = index % cols
    return {
      id: `${r}-${c}-${Date.now()}`,
      name: `Fighter ${index + 1}`,
      image: null,
    }
  })
}
