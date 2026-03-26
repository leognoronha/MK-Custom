export type Cursor = { x: number; y: number }
export type Character = { id: string; name: string; image: string | null }

export type SaveProfile = {
  id: string;
  profileName: string;
  title: string;
  backgroundUrl: string;
  rows: number;
  cols: number;
  characters: Character[];
}

export type MultiplayerEvent = 
  | { type: 'STATE_SYNC'; payload: Partial<SaveProfile> }
  | { type: 'CURSOR_MOVE'; player: 1 | 2; cursor: Cursor }
  | { type: 'SELECT'; player: 1 | 2; index: number }
  | { type: 'RANDOM_HIGHLIGHT'; player: 1 | 2; index: number | null }
  | { type: 'RANDOM_SELECT'; player: 1 | 2; index: number }
  | { type: 'AUDIO_PLAY'; sound: 'move' | 'gong' }
  | { type: 'HEARTBEAT' }
