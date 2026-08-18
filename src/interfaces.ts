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
  region_unlock: number;
  name: string;
  description: string;
  image: string;
  completed_1: boolean;
  completed_2: boolean;
  completed_3: boolean;
  completed_4: boolean;
}

// Matches the Region TypedDict returned by server/main.py
export interface Region {
  number: number;
  tiles: Tile[];
}
