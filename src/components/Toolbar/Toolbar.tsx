import React, { useState, type ChangeEvent } from 'react'
import type { SaveProfile } from '../../types'

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
  profiles: SaveProfile[]
  saveCurrentProfile: (name: string) => void
  loadProfile: (id: string) => void
  updateProfile: (id: string) => void
  deleteProfile: (id: string) => void
  resetGrid: () => void
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
  updateGridSize,
  profiles,
  saveCurrentProfile,
  loadProfile,
  updateProfile,
  deleteProfile,
  resetGrid
}: ToolbarProps) {
  const [newProfileName, setNewProfileName] = useState('')

  const handleSave = () => {
    if (newProfileName.trim()) {
      saveCurrentProfile(newProfileName)
      setNewProfileName('')
    }
  }

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

        {/* SECTION FOR SAVES */}
        <div className="profiles-section">
          <span className="profiles-header">Meus Saves</span>
          <div className="profile-input-group">
            <button onClick={resetGrid} className="btn-new">Novo</button>
            <input 
              value={newProfileName} 
              onChange={e => setNewProfileName(e.target.value)} 
              placeholder="Ex: MK 3"
            />
            <button onClick={handleSave} disabled={!newProfileName.trim()}>Salvar</button>
          </div>
          
          {profiles.length > 0 && (
            <div className="profiles-list">
              {profiles.map(p => (
                <div key={p.id} className="profile-item">
                  <span className="profile-name">{p.profileName}</span>
                  <div className="profile-actions">
                    <button className="btn-load" title="Carregar" onClick={() => loadProfile(p.id)}>Ler</button>
                    <button className="btn-update" title="Salvar Alterações" onClick={() => updateProfile(p.id)}>Gravar</button>
                    <button className="btn-delete" title="Excluir" onClick={() => deleteProfile(p.id)}>X</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onExport} style={{ marginTop: '8px' }}>Exportar como PNG</button>
        <button onClick={() => setMuted((prev) => !prev)}>{muted ? 'Desmutar Audio' : 'Mutar Audio'}</button>
        
        <small>Mova usando SETAS ou WASD. Selecione com SPACE.</small>
      </div>
    </aside>
  )
}
