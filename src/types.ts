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
