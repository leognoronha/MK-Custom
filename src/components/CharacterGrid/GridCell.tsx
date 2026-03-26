import type { Character } from '../../types'

interface GridCellProps {
  character: Character
  isP1Cursor: boolean
  isP2Cursor: boolean
  isP1Selected: boolean
  isP2Selected: boolean
  isP1RandomHighlight: boolean
  isP2RandomHighlight: boolean
  onClick: () => void
  onMouseEnter: () => void
  onDoubleClick: () => void
}

export function GridCell({
  character,
  isP1Cursor,
  isP2Cursor,
  isP1Selected,
  isP2Selected,
  isP1RandomHighlight,
  isP2RandomHighlight,
  onClick,
  onMouseEnter,
  onDoubleClick,
}: GridCellProps) {
  let cellClass = 'cell'
  if (isP1Selected) cellClass += ' selected-p1'
  if (isP2Selected) cellClass += ' selected-p2'
  if (isP1Cursor) cellClass += ' cursor-p1'
  if (isP2Cursor) cellClass += ' cursor-p2'
  if (isP1RandomHighlight) cellClass += ' random-highlight-p1'
  if (isP2RandomHighlight) cellClass += ' random-highlight-p2'

  return (
    <div
      className={cellClass}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onDoubleClick={onDoubleClick}
      title={character.name}
    >
      {character.image ? (
        <img src={character.image} alt={character.name} />
      ) : (
        <span>{character.name}</span>
      )}
    </div>
  )
}
