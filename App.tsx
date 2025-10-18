
import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import { GameState } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.StartScreen);

  const handleGameEnd = useCallback((win: boolean) => {
    audioService.stop('background');
    if (win) {
      setGameState(GameState.WinScreen);
      audioService.play('stageClear');
    } else {
      setGameState(GameState.GameOverScreen);
      audioService.play('gameOver');
    }
  }, []);

  const startGame = () => {
    setGameState(GameState.Playing);
    audioService.play('background', true);
  };

  const restartGame = () => {
    setGameState(GameState.StartScreen);
  };
  
  useEffect(() => {
    return () => {
      // Cleanup audio on component unmount
      audioService.stopAll();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#5c94fc] text-white p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.2)' }}>
          React Super Mario
        </h1>
        <p className="mb-4 text-sm md:text-base">Built by a world-class React Engineer</p>
      </div>

      <div className="relative w-full max-w-4xl aspect-[16/9] bg-black rounded-lg shadow-2xl overflow-hidden border-8 border-gray-800">
        {gameState === GameState.StartScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10 p-4">
            <h2 className="text-3xl md:text-5xl mb-8 animate-pulse">Level 1</h2>
            <button
              onClick={startGame}
              className="px-8 py-4 text-xl md:text-2xl bg-green-500 hover:bg-green-600 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              Start Game
            </button>
             <div className="mt-8 text-center text-sm">
                <p><span className="font-bold">Controls:</span></p>
                <p>Arrow Keys to Move</p>
                <p>Spacebar to Jump</p>
            </div>
          </div>
        )}

        {(gameState === GameState.WinScreen || gameState === GameState.GameOverScreen) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10 p-4">
            <h2 className="text-4xl md:text-6xl mb-8">
              {gameState === GameState.WinScreen ? 'You Win!' : 'Game Over'}
            </h2>
            <button
              onClick={restartGame}
              className="px-8 py-4 text-xl md:text-2xl bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              Play Again
            </button>
          </div>
        )}

        {(gameState === GameState.Playing || gameState === GameState.WinScreen || gameState === GameState.GameOverScreen) && (
            <Game onGameEnd={handleGameEnd} isPlaying={gameState === GameState.Playing} />
        )}
         {gameState === GameState.StartScreen && (
            <div className="w-full h-full bg-[#5c94fc]"></div>
        )}
      </div>
    </div>
  );
};

export default App;
