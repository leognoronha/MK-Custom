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
  onShareSave: () => void
  peerId: string | null
  isConnected: boolean
  isHost: boolean
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
  resetGrid,
  onShareSave,
  peerId,
  isConnected,
  isHost
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
          <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={!isHost} title={!isHost ? "Apenas o dono da sala pode mudar isso." : ""} />
        </label>
        <label className="field checkbox">
          <input
            type="checkbox"
            checked={editMode}
            onChange={(event) => setEditMode(event.target.checked)}
            disabled={!isHost}
            title={!isHost ? 'Apenas o dono da sala pode editar.' : ''}
          />
          <span style={!isHost ? { opacity: 0.45 } : undefined}>Modo de edição</span>
        </label>

        {editMode && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Linhas</span>
              <input type="number" min="1" max="10" value={rows} onChange={(e) => updateGridSize(Number(e.target.value), cols)} disabled={!isHost} />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Colunas</span>
              <input type="number" min="1" max="10" value={cols} onChange={(e) => updateGridSize(rows, Number(e.target.value))} disabled={!isHost} />
            </label>
          </div>
        )}

        <label className="field" style={{ marginTop: '8px' }}>
          <span>Fundo da tela</span>
          <input type="file" accept="image/*" onChange={onBackgroundUpload} disabled={!isHost} title={!isHost ? 'Espera, você é convidado, não pode mudar fotos gerais!' : ''} />
        </label>

        {/* SECTION FOR SAVES */}
        {isHost && (
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
            <button
              onClick={onShareSave}
              style={{ marginTop: '8px', width: '100%', background: '#6a1b9a', borderColor: '#4a148c' }}
              title="Gera um link com o estado atual e copia para a área de transferência"
            >
              📤 Compartilhar Save
            </button>

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
        )}

        {/* SECTION FOR MULTIPLAYER */}
        <div className="profiles-section" style={{ borderColor: '#2196f3', marginTop: '16px' }}>
          <span className="profiles-header" style={{ color: '#64b5f6' }}>Multiplayer</span>
          {isHost ? (
            <div style={{ fontSize: '8px', color: '#fff', lineHeight: 1.5 }}>
              {isConnected ? (
                <div style={{ color: '#00e676', textAlign: 'center' }}>★ Player 2 na partida! ★</div>
              ) : peerId ? (
                <>
                  <div style={{ marginBottom: '8px', color: '#bbb' }}>Mande este link pro seu Player 2:</div>
                  <input
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?room=${peerId}`}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    title="Clique para copiar"
                    style={{ borderColor: '#1976d2', cursor: 'grab' }}
                  />
                  <div style={{ marginTop: '8px', color: '#ff9800', textAlign: 'center' }}>Aguardando conexão...</div>
                </>
              ) : (
                <div style={{ color: '#ff9800', textAlign: 'center' }}>Conectando ao terminal...</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '8px', color: isConnected ? '#00e676' : '#ff9800', textAlign: 'center' }}>
                {isConnected ? '★ Conectado na sala do P1! ★' : 'Sincronizando...'}
              </div>
              <button
                onClick={() => window.location.href = window.location.pathname}
                style={{ background: '#d32f2f', borderColor: '#b71c1c', width: '100%', fontSize: '9px', marginTop: '4px' }}
                title="Sair da sala e voltar ao modo solo"
              >
                Sair da Sala
              </button>
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
