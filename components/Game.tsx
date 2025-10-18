
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { Player, Goomba, GameElement, Block, Vector2D, Coin } from '../types';
import { TILE_SIZE, GRAVITY, PLAYER_SPEED, JUMP_VELOCITY, GOOMBA_SPEED, LEVEL_LAYOUT, CHAR_MAP, LEVEL_WIDTH, LEVEL_HEIGHT, COIN_BOUNCE_VELOCITY } from '../constants';
import { audioService } from '../services/audioService';

interface GameProps {
  onGameEnd: (win: boolean) => void;
  isPlaying: boolean;
}

// Simple collision detection
const checkCollision = (a: GameElement, b: GameElement) => {
  return (
    a.position.x < b.position.x + b.size.x &&
    a.position.x + a.size.x > b.position.x &&
    a.position.y < b.position.y + b.size.y &&
    a.position.y + a.size.y > b.position.y
  );
};

// Memoized components for performance
const PlayerComponent: React.FC<{ player: Player }> = memo(({ player }) => (
  <div
    className={`absolute ${player.isDead ? 'bg-red-700' : 'bg-red-500'} border-2 border-black transition-transform duration-100`}
    style={{
      left: player.position.x,
      top: player.position.y,
      width: player.size.x,
      height: player.size.y,
      transform: player.isDead ? 'rotate(180deg)' : 'none'
    }}
  />
));

const GoombaComponent: React.FC<{ goomba: Goomba }> = memo(({ goomba }) => (
    <div
    className="absolute bg-[#995400] border-2 border-black rounded-t-full"
    style={{
      left: goomba.position.x,
      top: goomba.position.y,
      width: goomba.size.x,
      height: goomba.size.y
    }}
  >
    <div className="absolute top-1/4 w-full flex justify-around">
        <div className="w-1/4 h-1/4 bg-white border border-black rounded-full"></div>
        <div className="w-1/4 h-1/4 bg-white border border-black rounded-full"></div>
    </div>
  </div>
));

const BlockComponent: React.FC<{ block: Block }> = memo(({ block }) => {
    const baseStyle = 'absolute border-2 border-black';
    let typeStyle = 'bg-yellow-500';
    if(block.type === 'brick') typeStyle = 'bg-orange-700';
    if(block.type === 'ground') typeStyle = 'bg-orange-900';
    const hitStyle = block.isHit ? 'transform -translate-y-1' : '';
    
    return (
    <div
        className={`${baseStyle} ${typeStyle} ${hitStyle} transition-transform duration-75`}
        style={{
        left: block.position.x,
        top: block.position.y,
        width: block.size.x,
        height: block.size.y,
        }}
    >
        {block.type === 'question' && !block.isHit && (
             <div className="w-full h-full flex items-center justify-center text-black font-bold text-2xl">?</div>
        )}
    </div>
)});

const CoinComponent: React.FC<{ coin: Coin }> = memo(({ coin }) => (
    <div
      className="absolute bg-yellow-400 border-2 border-black rounded-full"
      style={{
        left: coin.position.x,
        top: coin.position.y,
        width: coin.size.x,
        height: coin.size.y,
      }}
    />
));

const SceneryComponent: React.FC<{ element: GameElement }> = memo(({ element }) => {
    let style = '';
    if(element.type === 'pipe') style = 'bg-green-600 border-2 border-black';
    if(element.type === 'flagpole') style = 'bg-gray-400';
    if(element.type === 'castle') style = 'bg-gray-300 border-2 border-black';

    return <div
        className={`absolute ${style}`}
        style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.x,
        height: element.size.y,
        }}
    />
});

const Game: React.FC<GameProps> = ({ onGameEnd, isPlaying }) => {
    const keyboard = useKeyboard();
    const gameFrameRef = useRef<HTMLDivElement>(null);
    const cameraX = useRef(0);
    const gameLoopRef = useRef<number>();

    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);

    const [player, setPlayer] = useState<Player>({
        id: Date.now(),
        type: 'player',
        position: { x: TILE_SIZE * 3, y: TILE_SIZE * 10 },
        size: { x: TILE_SIZE, y: TILE_SIZE },
        velocity: { x: 0, y: 0 },
        isGrounded: false,
        isDead: false
    });

    const [gameObjects, setGameObjects] = useState<GameElement[]>(() => {
        const elements: GameElement[] = [];
        let objectId = 0;
        LEVEL_LAYOUT.forEach((row, y) => {
            row.split('').forEach((char, x) => {
                const type = CHAR_MAP[char as keyof typeof CHAR_MAP];
                if (!type) return;

                const position = { x: x * TILE_SIZE, y: y * TILE_SIZE };
                let element: GameElement;

                if (type === 'goomba') {
                    element = {
                        id: objectId++,
                        type: 'goomba',
                        position,
                        size: { x: TILE_SIZE, y: TILE_SIZE },
                        velocity: { x: -GOOMBA_SPEED, y: 0 },
                        direction: -1
                    } as Goomba;
                } else if (type === 'question') {
                    element = {
                        id: objectId++,
                        type: 'question',
                        position,
                        size: { x: TILE_SIZE, y: TILE_SIZE },
                        hasCoin: true
                    } as Block;
                } else if(type === 'pipe') {
                     element = {
                        id: objectId++,
                        type: 'pipe',
                        position,
                        size: {x: TILE_SIZE * 2, y: TILE_SIZE * 2}
                    }
                } else if(type === 'flagpole') {
                     element = {
                        id: objectId++,
                        type: 'flagpole',
                        position: {x: position.x + TILE_SIZE/2 - 2, y: position.y - TILE_SIZE * 3},
                        size: {x: 4, y: TILE_SIZE * 4}
                    }
                } else if(type === 'castle') {
                     element = {
                        id: objectId++,
                        type: 'castle',
                        position: {x: position.x, y: position.y - TILE_SIZE * 4},
                        size: {x: TILE_SIZE * 5, y: TILE_SIZE * 5}
                    }
                } else {
                     element = {
                        id: objectId++,
                        type,
                        position,
                        size: { x: TILE_SIZE, y: TILE_SIZE },
                    } as GameElement;
                }
                elements.push(element);
            });
        });
        return elements;
    });

    const gameLogic = useCallback(() => {
        if (!isPlaying) return;

        setPlayer(p => {
            if (p.isDead) return p;

            let newVel = { ...p.velocity };
            let newPos = { ...p.position };

            // Horizontal movement
            newVel.x = 0;
            if (keyboard.ArrowLeft) newVel.x = -PLAYER_SPEED;
            if (keyboard.ArrowRight) newVel.x = PLAYER_SPEED;
            
            // Jumping
            if (keyboard.Space && p.isGrounded) {
                newVel.y = JUMP_VELOCITY;
                audioService.play('jump');
            }

            // Apply gravity
            newVel.y += GRAVITY;
            
            newPos.x += newVel.x;
            newPos.y += newVel.y;
            
            let isGrounded = false;
            
            // Collision detection with other objects
            const staticObjects = gameObjects.filter(obj => ['ground', 'brick', 'question', 'pipe'].includes(obj.type));
            for (const obj of staticObjects) {
                if (checkCollision({ ...p, position: newPos }, obj)) {
                     // Check vertical collision
                    if (p.position.y + p.size.y <= obj.position.y && newPos.y + p.size.y >= obj.position.y) {
                        newPos.y = obj.position.y - p.size.y;
                        newVel.y = 0;
                        isGrounded = true;
                    }
                    // Check ceiling collision
                    else if (p.position.y >= obj.position.y + obj.size.y && newPos.y <= obj.position.y + obj.size.y) {
                        newPos.y = obj.position.y + obj.size.y;
                        newVel.y = 0;

                        if(obj.type === 'question' || obj.type === 'brick') {
                           setGameObjects(prev => prev.map(o => {
                               if(o.id === obj.id) {
                                  const block = o as Block;
                                  if(!block.isHit) {
                                      if(block.type === 'question' && block.hasCoin) {
                                          audioService.play('coin');
                                          setCoins(c => c + 1);
                                          setScore(s => s + 200);
                                          // Spawn a coin
                                          const newCoin: Coin = {
                                              id: Date.now(),
                                              type: 'coin',
                                              position: { x: block.position.x, y: block.position.y },
                                              size: { x: TILE_SIZE * 0.8, y: TILE_SIZE * 0.8 },
                                              initialY: block.position.y,
                                              velocity: { x: 0, y: COIN_BOUNCE_VELOCITY }
                                          };
                                          return [...prev, newCoin];
                                      } else {
                                           audioService.play('stomp');
                                      }
                                      return { ...block, isHit: true, hasCoin: false };
                                  }
                               }
                               return o;
                           }))
                        }
                    }
                     // Check horizontal collision
                    else if(newPos.x + p.size.x > obj.position.x && p.position.x + p.size.x <= obj.position.x) {
                       newPos.x = obj.position.x - p.size.x;
                       newVel.x = 0;
                    } else if(newPos.x < obj.position.x + obj.size.x && p.position.x >= obj.position.x + obj.size.x) {
                        newPos.x = obj.position.x + obj.size.x;
                        newVel.x = 0;
                    }
                }
            }
             // Fall off screen
            if (newPos.y > LEVEL_HEIGHT) {
                onGameEnd(false);
                return { ...p, isDead: true };
            }

            return { ...p, position: newPos, velocity: newVel, isGrounded };
        });

        setGameObjects(prev => {
           let updatedObjects = [...prev];
           const goombas = updatedObjects.filter(obj => obj.type === 'goomba') as Goomba[];
           const coins = updatedObjects.filter(obj => obj.type === 'coin') as Coin[];
           
           // Update Goombas
           goombas.forEach(goomba => {
              let newGoombaPos = {...goomba.position};
              let newGoombaVel = {...goomba.velocity};
              newGoombaVel.y += GRAVITY;
              newGoombaPos.x += newGoombaVel.x;
              newGoombaPos.y += newGoombaVel.y;
              
              const staticObjects = prev.filter(obj => ['ground', 'brick', 'question', 'pipe'].includes(obj.type));

              for (const obj of staticObjects) {
                if (checkCollision({ ...goomba, position: newGoombaPos }, obj)) {
                     // Vertical collision (landing on ground)
                    if (goomba.position.y + goomba.size.y <= obj.position.y && newGoombaPos.y + goomba.size.y >= obj.position.y) {
                        newGoombaPos.y = obj.position.y - goomba.size.y;
                        newGoombaVel.y = 0;
                    }
                     // Horizontal collision (turn around)
                     else if (newGoombaPos.x + goomba.size.x > obj.position.x && goomba.position.x + goomba.size.x <= obj.position.x) {
                        newGoombaPos.x = obj.position.x - goomba.size.x;
                        newGoombaVel.x *= -1;
                    } else if (newGoombaPos.x < obj.position.x + obj.size.x && goomba.position.x >= obj.position.x + obj.size.x) {
                        newGoombaPos.x = obj.position.x + obj.size.x;
                        newGoombaVel.x *= -1;
                    }
                }
              }
              
              updatedObjects = updatedObjects.map(obj => obj.id === goomba.id ? {...goomba, position: newGoombaPos, velocity: newGoombaVel } : obj);
           });

           // Player vs Goomba
           const activeGoombas = updatedObjects.filter(g => g.type === 'goomba') as Goomba[];
           for(const goomba of activeGoombas) {
               if(checkCollision(player, goomba)) {
                   // Stomp
                   if(player.velocity.y > 0 && player.position.y + player.size.y < goomba.position.y + goomba.size.y / 2) {
                       audioService.play('stomp');
                       setScore(s => s + 100);
                       updatedObjects = updatedObjects.filter(obj => obj.id !== goomba.id);
                       // Bounce player
                       setPlayer(p => ({...p, velocity: {...p.velocity, y: JUMP_VELOCITY / 2}}));
                   } else {
                       // Player dies
                       if(!player.isDead) {
                          onGameEnd(false);
                          setPlayer(p => ({ ...p, isDead: true }));
                       }
                   }
               }
           }
           
           // Player reaches flagpole
           const flagpole = updatedObjects.find(o => o.type === 'flagpole');
           if (flagpole && checkCollision(player, flagpole)) {
               onGameEnd(true);
           }
           
           // Update coins
           coins.forEach(coin => {
                let newCoinPos = {...coin.position};
                let newCoinVel = {...coin.velocity};
                newCoinVel.y += GRAVITY;
                newCoinPos.y += newCoinVel.y;
                
                if (newCoinPos.y > coin.initialY) {
                    updatedObjects = updatedObjects.filter(obj => obj.id !== coin.id);
                } else {
                    updatedObjects = updatedObjects.map(obj => obj.id === coin.id ? {...coin, position: newCoinPos, velocity: newCoinVel } : obj);
                }
           });

           return updatedObjects;
        });

        // Update camera
        if (gameFrameRef.current) {
            const frameWidth = gameFrameRef.current.offsetWidth;
            const targetCameraX = player.position.x - frameWidth / 3;
            const newCameraX = Math.max(0, Math.min(LEVEL_WIDTH - frameWidth, targetCameraX));
            
            if (Math.abs(newCameraX - cameraX.current) > 1) {
                cameraX.current = newCameraX;
            }
        }

        gameLoopRef.current = requestAnimationFrame(gameLogic);
    }, [isPlaying, keyboard, player, gameObjects, onGameEnd]);

    useEffect(() => {
        if (isPlaying) {
            gameLoopRef.current = requestAnimationFrame(gameLogic);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [isPlaying, gameLogic]);

    return (
        <div ref={gameFrameRef} className="w-full h-full bg-[#5c94fc] overflow-hidden relative">
            <div
                className="relative transition-transform duration-100 ease-linear"
                style={{
                    width: `${LEVEL_WIDTH}px`,
                    height: `${LEVEL_HEIGHT}px`,
                    transform: `translateX(-${cameraX.current}px)`
                }}
            >
                {/* Background scenery - Clouds */}
                <div className="absolute top-12 w-24 h-16 bg-white rounded-full" style={{left: '200px'}} />
                <div className="absolute top-20 w-32 h-20 bg-white rounded-full" style={{left: '220px'}} />
                <div className="absolute top-12 w-24 h-16 bg-white rounded-full" style={{left: '800px'}} />
                <div className="absolute top-20 w-32 h-20 bg-white rounded-full" style={{left: '820px'}} />
                 <div className="absolute top-12 w-24 h-16 bg-white rounded-full" style={{left: '1600px'}} />
                <div className="absolute top-20 w-32 h-20 bg-white rounded-full" style={{left: '1620px'}} />

                {gameObjects.map(obj => {
                    if(obj.type === 'goomba') return <GoombaComponent key={obj.id} goomba={obj as Goomba}/>
                    if(['brick', 'question', 'ground'].includes(obj.type)) return <BlockComponent key={obj.id} block={obj as Block}/>
                    if(obj.type === 'coin') return <CoinComponent key={obj.id} coin={obj as Coin} />
                    if(['pipe', 'flagpole', 'castle'].includes(obj.type)) return <SceneryComponent key={obj.id} element={obj}/>
                    return null;
                })}
                <PlayerComponent player={player} />
            </div>
            <div className="absolute top-2 left-4 text-white text-2xl" style={{textShadow: '2px 2px 2px #000'}}>
                MARIO
            </div>
             <div className="absolute top-8 left-4 text-white text-2xl" style={{textShadow: '2px 2px 2px #000'}}>
                {String(score).padStart(6, '0')}
            </div>
             <div className="absolute top-2 right-4 text-white text-2xl" style={{textShadow: '2px 2px 2px #000'}}>
                COINS: {coins}
            </div>
        </div>
    );
};

export default Game;
