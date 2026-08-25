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

// Matches the RawTile TypedDict returned by server/main.py's admin view —
// every team's completion status, instead of a single collapsed boolean.
export interface AdminTile {
  number: number;
  region: number;
  region_unlock: number | null;
  name: string;
  description: string;
  image: string;
  bonus_requirements: Array<number> | null;
  completed_1: boolean;
  completed_2: boolean;
  completed_3: boolean;
  completed_4: boolean;
  completed?: boolean;
}
export interface TeamData {
  number: number;
  name: string;
  score: number;
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

// Matches the AdminRegion TypedDict returned by server/main.py
export interface AdminRegion {
  number: number;
  tiles: AdminTile[];
}
