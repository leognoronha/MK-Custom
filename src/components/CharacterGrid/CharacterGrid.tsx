import type { Character, Cursor } from '../../types'
import { GridCell } from './GridCell'

interface CharacterGridProps {
  characters: Character[]
  cursor: Cursor
  p2Cursor: Cursor | null
  selectedIndex: number | null
  p2SelectedIndex: number | null
  p1RandomHighlight: number | null
  p2RandomHighlight: number | null
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
  p1RandomHighlight,
  p2RandomHighlight,
  cols,
  editMode,
  onHoverCell,
  onClickCell,
  triggerUpload,
}: CharacterGridProps) {
  const p1CursorIndex = cursor.y * cols + cursor.x
  const p2CursorIndex = p2Cursor ? p2Cursor.y * cols + p2Cursor.x : -1

  return (
    <section className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {characters.map((character, index) => {
        const isP1Cursor = index === p1CursorIndex
        const isP2Cursor = index === p2CursorIndex
        const isP1Selected = index === selectedIndex
        const isP2Selected = index === p2SelectedIndex
        const isP1RandomHighlight = index === p1RandomHighlight
        const isP2RandomHighlight = index === p2RandomHighlight

        return (
          <GridCell
            key={character.id}
            character={character}
            isP1Cursor={isP1Cursor}
            isP2Cursor={isP2Cursor}
            isP1Selected={isP1Selected}
            isP2Selected={isP2Selected}
            isP1RandomHighlight={isP1RandomHighlight}
            isP2RandomHighlight={isP2RandomHighlight}
            onMouseEnter={() => onHoverCell(index)}
            onClick={() => onClickCell(index)}
            onDoubleClick={() => editMode && triggerUpload()}
          />
        )
      })}
    </section>
  )
}
