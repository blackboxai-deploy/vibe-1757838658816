// Game utility functions for Snake game

export interface Position {
  x: number;
  y: number;
}

export interface GameConfig {
  gridSize: number;
  initialSpeed: number;
  maxSpeed: number;
  speedIncrement: number;
  scorePerFood: number;
}

export const GAME_CONFIG: GameConfig = {
  gridSize: 20,
  initialSpeed: 150,
  maxSpeed: 50,
  speedIncrement: 10,
  scorePerFood: 10,
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

// Direction vectors for movement
export const DIRECTION_VECTORS: Record<Direction, Position> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};

// Opposite directions for preventing instant death
export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};

export const getRandomPosition = (excludePositions: Position[] = []): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GAME_CONFIG.gridSize),
      y: Math.floor(Math.random() * GAME_CONFIG.gridSize),
    };
  } while (excludePositions.some(pos => pos.x === position.x && pos.y === position.y));
  
  return position;
};

export const isPositionEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

export const isValidDirection = (currentDirection: Direction, newDirection: Direction): boolean => {
  return OPPOSITE_DIRECTIONS[currentDirection] !== newDirection;
};

export const calculateSpeed = (level: number): number => {
  const speed = GAME_CONFIG.initialSpeed - (level * GAME_CONFIG.speedIncrement);
  return Math.max(speed, GAME_CONFIG.maxSpeed);
};

export const calculateScore = (foodCount: number, level: number): number => {
  return foodCount * GAME_CONFIG.scorePerFood * Math.max(1, Math.floor(level / 2));
};

export const getLevel = (score: number): number => {
  return Math.floor(score / (GAME_CONFIG.scorePerFood * 5)) + 1;
};

export const isOutOfBounds = (position: Position): boolean => {
  return position.x < 0 || position.x >= GAME_CONFIG.gridSize || 
         position.y < 0 || position.y >= GAME_CONFIG.gridSize;
};

export const checkSelfCollision = (head: Position, body: Position[]): boolean => {
  return body.some(segment => isPositionEqual(head, segment));
};

// Touch gesture detection
export const getTouchDirection = (startTouch: Position, endTouch: Position): Direction | null => {
  const deltaX = endTouch.x - startTouch.x;
  const deltaY = endTouch.y - startTouch.y;
  const threshold = 30; // Minimum swipe distance
  
  if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
    return null;
  }
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? Direction.RIGHT : Direction.LEFT;
  } else {
    return deltaY > 0 ? Direction.DOWN : Direction.UP;
  }
};

// High score management
export const getHighScore = (): number => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
};

export const saveHighScore = (score: number): void => {
  if (typeof window !== 'undefined') {
    const currentHigh = getHighScore();
    if (score > currentHigh) {
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }
};

// Particle system for visual effects
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const createFoodParticles = (position: Position, cellSize: number): Particle[] => {
  const particles: Particle[] = [];
  const centerX = position.x * cellSize + cellSize / 2;
  const centerY = position.y * cellSize + cellSize / 2;
  
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const speed = 2 + Math.random() * 2;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60,
      maxLife: 60,
      color: `hsl(${Math.random() * 60 + 15}, 100%, 60%)`, // Red to yellow particles
    });
  }
  
  return particles;
};

export const updateParticles = (particles: Particle[]): Particle[] => {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 1,
      vy: particle.vy + 0.1, // Gravity effect
    }))
    .filter(particle => particle.life > 0);
};