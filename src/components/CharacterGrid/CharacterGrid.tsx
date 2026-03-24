import type { Character, Cursor } from '../../types'
import { GridCell } from './GridCell'

interface CharacterGridProps {
  characters: Character[]
  cursor: Cursor
  selectedIndex: number | null
  cols: number
  editMode: boolean
  onHoverCell: (index: number) => void
  onClickCell: (index: number) => void
  triggerUpload: () => void
}

export function CharacterGrid({
  characters,
  cursor,
  selectedIndex,
  cols,
  editMode,
  onHoverCell,
  onClickCell,
  triggerUpload,
}: CharacterGridProps) {
  const cursorIndex = cursor.y * cols + cursor.x

  return (
    <section className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {characters.map((character, index) => {
        const isCursor = index === cursorIndex
        const isSelected = index === selectedIndex

        return (
          <GridCell
            key={character.id}
            character={character}
            isCursor={isCursor}
            isSelected={isSelected}
            onMouseEnter={() => onHoverCell(index)}
            onClick={() => onClickCell(index)}
            onDoubleClick={() => editMode && triggerUpload()}
          />
        )
      })}
    </section>
  )
}
