export enum GameStatus {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED'
}

export interface GameEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'player' | 'enemy' | 'collectible';
  emoji: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}