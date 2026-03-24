import type { Character } from '../../types'

interface GridCellProps {
  character: Character
  isCursor: boolean
  isSelected: boolean
  onMouseEnter: () => void
  onClick: () => void
  onDoubleClick: () => void
}

export function GridCell({
  character,
  isCursor,
  isSelected,
  onMouseEnter,
  onClick,
  onDoubleClick,
}: GridCellProps) {
  return (
    <button
      className={`cell ${isCursor ? 'cursor' : ''} ${isSelected ? 'selected' : ''}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {character.image ? (
        <img src={character.image} alt={character.name} />
      ) : (
        <span>{character.name}</span>
      )}
    </button>
  )
}
