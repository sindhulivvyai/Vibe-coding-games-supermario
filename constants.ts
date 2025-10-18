
export const TILE_SIZE = 32; // pixels

// Physics constants
export const GRAVITY = 0.8;
export const PLAYER_SPEED = 4;
export const JUMP_VELOCITY = -15;
export const GOOMBA_SPEED = 0.5;
export const COIN_BOUNCE_VELOCITY = -8;

export const LEVEL_WIDTH = 200 * TILE_SIZE;
export const LEVEL_HEIGHT = 15 * TILE_SIZE;

export const LEVEL_LAYOUT = [
  '                                                                                                                                                                                                  ',
  '                                                                                                                                                                                                  ',
  '                                                                                                                                                                                                  ',
  '                                  BB?B                                                                                                                                                            ',
  '                                                                                                                                                                                                  ',
  '                                        PP                                                                                                                                                      ',
  '                              BBBB                                                                                                                                                              ',
  '                                                                                                                                                                                                  ',
  '                  ?   B?B                                                                 BB?B                                                                                                  ',
  '                                                                                                                                                                                                  ',
  '                                                                     PP                                                                                                                       C ',
  '                         E                E            E   E         PP                                                                                                                     F GGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

// Character to object type mapping
export const CHAR_MAP = {
  'G': 'ground',
  'B': 'brick',
  '?': 'question',
  'E': 'goomba',
  'P': 'pipe',
  'F': 'flagpole',
  'C': 'castle'
};
