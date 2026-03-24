import type { Character, Cursor } from '../../types'
import { GridCell } from './GridCell'

interface CharacterGridProps {
  characters: Character[]
  cursor: Cursor
  p2Cursor: Cursor | null
  selectedIndex: number | null
  p2SelectedIndex: number | null
  cols: number
  editMode: boolean
  onHoverCell: (index: number) => void
  onClickCell: (index: number) => void
  triggerUpload: () => void
}

export function CharacterGrid({
  characters,
  cursor,
  p2Cursor,
  selectedIndex,
  p2SelectedIndex,
  cols,
  editMode,
  onHoverCell,
  onClickCell,
  triggerUpload,
}: CharacterGridProps) {
  // P1 local cursor
  const p1CursorIndex = cursor.y * cols + cursor.x
  // P2 remote cursor
  const p2CursorIndex = p2Cursor ? p2Cursor.y * cols + p2Cursor.x : -1

  return (
    <section className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {characters.map((character, index) => {
        const isP1Cursor = index === p1CursorIndex
        const isP2Cursor = index === p2CursorIndex
        const isP1Selected = index === selectedIndex
        const isP2Selected = index === p2SelectedIndex

        return (
          <GridCell
            key={character.id}
            character={character}
            isP1Cursor={isP1Cursor}
            isP2Cursor={isP2Cursor}
            isP1Selected={isP1Selected}
            isP2Selected={isP2Selected}
            onMouseEnter={() => onHoverCell(index)}
            onClick={() => onClickCell(index)}
            onDoubleClick={() => editMode && triggerUpload()}
          />
        )
      })}
    </section>
  )
}
