"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine, SnakeGameState } from '@/lib/gameEngine';
import { GameHUD } from '@/components/GameHUD';
import { 
  Direction, 
  GameState, 
  Position,
  getTouchDirection,
  createFoodParticles,
  updateParticles,
  Particle,
  GAME_CONFIG
} from '@/lib/gameUtils';

interface AudioContextType {
  context: AudioContext | null;
  oscillator: OscillatorNode | null;
}

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<AudioContextType>({ context: null, oscillator: null });
  const touchStartRef = useRef<Position | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  const [gameState, setGameState] = useState<SnakeGameState | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

  // Initialize game engine
  useEffect(() => {
    const gameEngine = new GameEngine();
    gameEngineRef.current = gameEngine;

    gameEngine.setStateChangeCallback((state) => {
      setGameState(state);
    });

    gameEngine.setFoodEatenCallback((position) => {
      playEatSound();
      const cellSize = canvasSize.width / GAME_CONFIG.gridSize;
      setParticles(prev => [...prev, ...createFoodParticles(position, cellSize)]);
    });

    gameEngine.setGameOverCallback(() => {
      playGameOverSound();
    });

    // Initialize state
    setGameState(gameEngine.getState());

    return () => {
      gameEngine.cleanup();
    };
  }, [canvasSize.width]);

  // Handle canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = document.getElementById('game-container');
      if (container) {
        const maxSize = Math.min(
          window.innerWidth - 40,
          window.innerHeight - 200,
          600
        );
        setCanvasSize({ width: maxSize, height: maxSize });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Audio setup
  const initializeAudio = useCallback(() => {
    if (!audioRef.current.context && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioRef.current.context = new AudioContextClass();
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }
  }, []);

  const playEatSound = useCallback(() => {
    const { context } = audioRef.current;
    if (context) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    }
  }, []);

  const playGameOverSound = useCallback(() => {
    const { context } = audioRef.current;
    if (context) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(200, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    }
  }, []);

  // Keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameEngineRef.current) return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          event.preventDefault();
          gameEngineRef.current.changeDirection(Direction.UP);
          break;
        case 'KeyS':
        case 'ArrowDown':
          event.preventDefault();
          gameEngineRef.current.changeDirection(Direction.DOWN);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          event.preventDefault();
          gameEngineRef.current.changeDirection(Direction.LEFT);
          break;
        case 'KeyD':
        case 'ArrowRight':
          event.preventDefault();
          gameEngineRef.current.changeDirection(Direction.RIGHT);
          break;
        case 'Space':
          event.preventDefault();
          gameEngineRef.current.togglePause();
          break;
        case 'KeyR':
          event.preventDefault();
          if (gameState?.gameState === GameState.GAME_OVER) {
            gameEngineRef.current.startGame();
            initializeAudio();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, initializeAudio]);

  // Touch input
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    if (!touchStartRef.current || !gameEngineRef.current) return;

    const touch = event.changedTouches[0];
    const touchEnd = { x: touch.clientX, y: touch.clientY };
    const direction = getTouchDirection(touchStartRef.current, touchEnd);
    
    if (direction) {
      gameEngineRef.current.changeDirection(direction);
    }

    touchStartRef.current = null;
  }, []);

  // Rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !gameState) return;

    const cellSize = canvasSize.width / GAME_CONFIG.gridSize;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GAME_CONFIG.gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    const foodX = gameState.food.x * cellSize;
    const foodY = gameState.food.y * cellSize;
    const time = Date.now() * 0.005;
    const pulse = Math.sin(time) * 0.1 + 0.9;
    
    ctx.fillStyle = `rgba(255, 50, 50, ${pulse})`;
    ctx.fillRect(foodX + 2, foodY + 2, cellSize - 4, cellSize - 4);
    
    // Food glow effect
    const gradient = ctx.createRadialGradient(
      foodX + cellSize/2, foodY + cellSize/2, 0,
      foodX + cellSize/2, foodY + cellSize/2, cellSize
    );
    gradient.addColorStop(0, 'rgba(255, 50, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(foodX, foodY, cellSize, cellSize);

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      
      if (index === 0) {
        // Snake head
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        
        // Head glow
        const headGradient = ctx.createRadialGradient(
          x + cellSize/2, y + cellSize/2, 0,
          x + cellSize/2, y + cellSize/2, cellSize/2
        );
        headGradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
        headGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctx.fillStyle = headGradient;
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        // Snake body
        const intensity = Math.max(0.3, 1 - (index / gameState.snake.length) * 0.7);
        ctx.fillStyle = `rgba(0, 255, 136, ${intensity})`;
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      }
    });

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color.replace('60%)', `${alpha * 60}%)`);
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    });

    // Update particles for next frame
    setParticles(prevParticles => updateParticles(prevParticles));

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(render);
  }, [gameState, particles, canvasSize]);

  // Start rendering loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Game control handlers
  const handleStartGame = useCallback(() => {
    gameEngineRef.current?.startGame();
    initializeAudio();
  }, [initializeAudio]);

  const handlePauseGame = useCallback(() => {
    gameEngineRef.current?.pauseGame();
  }, []);

  const handleResumeGame = useCallback(() => {
    gameEngineRef.current?.resumeGame();
  }, []);

  const handleResetGame = useCallback(() => {
    gameEngineRef.current?.resetGame();
    setParticles([]);
  }, []);

  if (!gameState) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div id="game-container" className="relative flex flex-col items-center justify-center min-h-screen">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border border-gray-600 bg-black rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />
      <GameHUD
        gameState={gameState}
        onStartGame={handleStartGame}
        onPauseGame={handlePauseGame}
        onResumeGame={handleResumeGame}
        onResetGame={handleResetGame}
      />
    </div>
  );
};