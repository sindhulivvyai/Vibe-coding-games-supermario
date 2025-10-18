
export enum GameState {
  StartScreen,
  Playing,
  WinScreen,
  GameOverScreen,
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: number;
  position: Vector2D;
  size: Vector2D;
  type: 'player' | 'goomba' | 'brick' | 'question' | 'coin' | 'pipe' | 'ground' | 'flagpole' | 'castle';
}

export interface Player extends GameObject {
  type: 'player';
  velocity: Vector2D;
  isGrounded: boolean;
  isDead: boolean;
}

export interface Goomba extends GameObject {
  type: 'goomba';
  velocity: Vector2D;
  direction: -1 | 1;
}

export interface Block extends GameObject {
  type: 'brick' | 'question' | 'ground';
  isHit?: boolean;
  hasCoin?: boolean;
}

export interface Coin extends GameObject {
    type: 'coin';
    initialY: number;
    velocity: Vector2D;
}

export type GameElement = Player | Goomba | Block | Coin | GameObject;

export interface KeyboardState {
  [key: string]: boolean;
}
