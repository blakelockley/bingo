export interface Player {
  username: string;
}

export interface Team {
  name: string;
  colour: string;
  logoUrl: string;
}

export interface Tile {
  number: number;
  title: string;
  description: string;
  image: string;

  teamACompletedBy: string;
  teamBCompletedBy: string;
  teamCCompletedBy: string;
}
