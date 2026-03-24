import type { Character } from '../../types'

interface GridCellProps {
  character: Character
  isP1Cursor: boolean
  isP2Cursor: boolean
  isP1Selected: boolean
  isP2Selected: boolean
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
  onClick,
  onMouseEnter,
  onDoubleClick,
}: GridCellProps) {
  let cellClass = 'cell'
  if (isP1Selected) cellClass += ' selected-p1'
  if (isP2Selected) cellClass += ' selected-p2'
  if (isP1Cursor) cellClass += ' cursor-p1'
  if (isP2Cursor) cellClass += ' cursor-p2'

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
