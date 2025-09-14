"use client";

import React from 'react';
import { SnakeGameState, GameState } from '@/lib/gameEngine';

interface GameHUDProps {
  gameState: SnakeGameState;
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onResetGame: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onResetGame,
}) => {
  const renderGameStats = () => (
    <div className="flex flex-wrap gap-4 justify-center mb-4">
      <div className="bg-gray-800 px-3 py-2 rounded-lg">
        <div className="text-xs text-gray-400">Score</div>
        <div className="text-xl font-bold text-green-400">{gameState.score.toLocaleString()}</div>
      </div>
      <div className="bg-gray-800 px-3 py-2 rounded-lg">
        <div className="text-xs text-gray-400">High Score</div>
        <div className="text-xl font-bold text-yellow-400">{gameState.highScore.toLocaleString()}</div>
      </div>
      <div className="bg-gray-800 px-3 py-2 rounded-lg">
        <div className="text-xs text-gray-400">Level</div>
        <div className="text-xl font-bold text-blue-400">{gameState.level}</div>
      </div>
      <div className="bg-gray-800 px-3 py-2 rounded-lg">
        <div className="text-xs text-gray-400">Length</div>
        <div className="text-xl font-bold text-purple-400">{gameState.snake.length}</div>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="text-center mb-4">
      <div className="text-sm text-gray-400 mb-2">
        <div className="hidden md:block">
          Use <span className="text-white font-bold">WASD</span> or <span className="text-white font-bold">Arrow Keys</span> to move
        </div>
        <div className="md:hidden">
          <span className="text-white font-bold">Swipe</span> to move
        </div>
        <div className="mt-1">
          Press <span className="text-white font-bold">SPACE</span> to pause/resume
        </div>
      </div>
    </div>
  );

  const renderGameMenu = () => (
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-6 text-green-400">SNAKE</h1>
      <div className="mb-6">
        <div className="text-xl mb-2">🐍 Classic Arcade Game 🐍</div>
        <div className="text-gray-400">Eat food, grow longer, avoid collisions!</div>
      </div>
      {renderControls()}
      <button
        onClick={onStartGame}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors duration-200"
      >
        Start Game
      </button>
    </div>
  );

  const renderGamePlaying = () => (
    <div className="absolute top-4 left-4 right-4">
      {renderGameStats()}
      <div className="flex justify-center">
        <button
          onClick={onPauseGame}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Pause
        </button>
      </div>
    </div>
  );

  const renderGamePaused = () => (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-6 text-yellow-400">PAUSED</h2>
        {renderGameStats()}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onResumeGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Resume
          </button>
          <button
            onClick={onResetGame}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-5xl font-bold mb-6 text-red-400">GAME OVER</h2>
        {renderGameStats()}
        
        {/* Game Statistics */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-sm mx-auto">
          <h3 className="text-lg font-bold mb-3 text-gray-200">Game Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Food Eaten:</span>
              <span className="text-white">{gameState.foodCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Final Length:</span>
              <span className="text-white">{gameState.snake.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Level Reached:</span>
              <span className="text-white">{gameState.level}</span>
            </div>
            {gameState.score > gameState.highScore && (
              <div className="text-yellow-400 font-bold text-center mt-2">
                🎉 NEW HIGH SCORE! 🎉
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onStartGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Play Again
          </button>
          <button
            onClick={onResetGame}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {gameState.gameState === GameState.MENU && renderGameMenu()}
      {gameState.gameState === GameState.PLAYING && renderGamePlaying()}
      {gameState.gameState === GameState.PAUSED && renderGamePaused()}
      {gameState.gameState === GameState.GAME_OVER && renderGameOver()}
    </div>
  );
};