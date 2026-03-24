import type { Character } from '../../types'

interface PreviewPanelProps {
  character?: Character
  editMode: boolean
  updateCellName: (name: string) => void
  triggerUpload: () => void
}

export function PreviewPanel({ character, editMode, updateCellName, triggerUpload }: PreviewPanelProps) {
  return (
    <section className="preview-panel">
      <h2>Preview</h2>
      <div 
        className={`preview-image-container ${editMode ? 'editable' : ''}`} 
        onClick={() => editMode && triggerUpload()}
      >
        {character?.image ? (
          <img src={character.image} alt={character.name} />
        ) : (
          <div className="preview-placeholder">Sem imagem</div>
        )}
        {editMode && <div className="upload-overlay">MUDAR FOTO</div>}
      </div>
      
      {editMode ? (
        <input 
          className="preview-name-input" 
          value={character?.name ?? ''} 
          onChange={(e) => updateCellName(e.target.value)} 
          placeholder="Nome"
          maxLength={15}
        />
      ) : (
        <p className="preview-name">{character?.name}</p>
      )}
      <p className="hint">
        {editMode ? "Dica: Mude as linhas ou colunas no menu!" : "Clique em um quadrado para confirmar seleção."}
      </p>
    </section>
  )
}
