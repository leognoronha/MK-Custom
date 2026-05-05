import LZString from 'lz-string'
import type { SaveProfile } from '../types'

/** Serializa e comprime o estado para um parâmetro seguro de URL */
export function exportStateToURLParam(gameState: Partial<SaveProfile>): string {
  const json = JSON.stringify(gameState)
  return LZString.compressToEncodedURIComponent(json)
}

/** Descomprime e parseia o parâmetro de URL de volta para o estado */
export function importStateFromURLParam(param: string): Partial<SaveProfile> | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(param)
    if (!json) return null
    return JSON.parse(json) as Partial<SaveProfile>
  } catch {
    return null
  }
}
