export interface Player {
  username: string;
}

export interface Team {
  name: string;
  colour: string;
  logoUrl: string;
}

// Matches the Tile TypedDict returned by server/main.py
export interface Tile {
  number: number;
  region: number;
  region_unlock: number;
  name: string;
  description: string;
  image: string;
  completed: boolean;
  bonus_requirements: Array<number> | null;
}

export interface BonusDataItem {
  bonus_unlocked: boolean;
  bonus_required: number;
  bonus_visibility: number;
  bonus_progress: number;
  tile: Tile | null;
}

// Matches the Region TypedDict returned by server/main.py
export interface Region {
  number: number;
  tiles: Tile[];
}
