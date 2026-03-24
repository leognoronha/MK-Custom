import React, { type ChangeEvent } from 'react'

interface ToolbarProps {
  toolbarOpen: boolean
  setToolbarOpen: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  setTitle: (title: string) => void
  editMode: boolean
  setEditMode: (editMode: boolean) => void
  onBackgroundUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onExport: () => void
  muted: boolean
  setMuted: React.Dispatch<React.SetStateAction<boolean>>
  rows: number
  cols: number
  updateGridSize: (r: number, c: number) => void
}

export function Toolbar({
  toolbarOpen,
  setToolbarOpen,
  title,
  setTitle,
  editMode,
  setEditMode,
  onBackgroundUpload,
  onExport,
  muted,
  setMuted,
  rows,
  cols,
  updateGridSize
}: ToolbarProps) {
  return (
    <aside className={`toolbar ${toolbarOpen ? '' : 'collapsed'}`}>
      <button className="toolbar-toggle" onClick={() => setToolbarOpen(false)}> {/* Ocultar */}
        Ocultar
      </button>
      <div className="toolbar-panel">
        <label className="field">
          <span>Título</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field checkbox">
          <input
            type="checkbox"
            checked={editMode}
            onChange={(event) => setEditMode(event.target.checked)}
          />
          <span>Modo de edição</span>
        </label>
        
        {editMode && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Linhas</span>
              <input type="number" min="1" max="10" value={rows} onChange={(e) => updateGridSize(Number(e.target.value), cols)} />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Colunas</span>
              <input type="number" min="1" max="10" value={cols} onChange={(e) => updateGridSize(rows, Number(e.target.value))} />
            </label>
          </div>
        )}

        <label className="field" style={{ marginTop: '8px' }}>
          <span>Fundo da tela</span>
          <input type="file" accept="image/*" onChange={onBackgroundUpload} />
        </label>
        <button onClick={onExport} style={{ marginTop: '8px' }}>Exportar como PNG</button>
        <button onClick={() => setMuted((prev) => !prev)}>{muted ? 'Desmutar Audio' : 'Mutar Audio'}</button>
        
        <small>Passe o mouse sobre os quadrados para navegar.</small>
      </div>
    </aside>
  )
}
