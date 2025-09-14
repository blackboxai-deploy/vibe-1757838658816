// Core game engine for Snake game
import {
  Position,
  Direction,
  GameState,
  DIRECTION_VECTORS,
  getRandomPosition,
  isPositionEqual,
  isOutOfBounds,
  checkSelfCollision,
  calculateSpeed,
  calculateScore,
  getLevel,
  saveHighScore,
  GAME_CONFIG,
} from './gameUtils';

// Re-export GameState for other components
export { GameState } from './gameUtils';

export interface SnakeGameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  gameState: GameState;
  score: number;
  highScore: number;
  level: number;
  speed: number;
  foodCount: number;
  isPaused: boolean;
}

export class GameEngine {
  private state: SnakeGameState;
  private gameLoop: number | null = null;
  private lastUpdate = 0;
  private onStateChange?: (state: SnakeGameState) => void;
  private onGameOver?: (finalScore: number) => void;
  private onFoodEaten?: (position: Position) => void;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): SnakeGameState {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    return {
      snake: initialSnake,
      food: getRandomPosition(initialSnake),
      direction: Direction.RIGHT,
      nextDirection: Direction.RIGHT,
      gameState: GameState.MENU,
      score: 0,
      highScore: 0,
      level: 1,
      speed: GAME_CONFIG.initialSpeed,
      foodCount: 0,
      isPaused: false,
    };
  }

  public getState(): SnakeGameState {
    return { ...this.state };
  }

  public setStateChangeCallback(callback: (state: SnakeGameState) => void): void {
    this.onStateChange = callback;
  }

  public setGameOverCallback(callback: (finalScore: number) => void): void {
    this.onGameOver = callback;
  }

  public setFoodEatenCallback(callback: (position: Position) => void): void {
    this.onFoodEaten = callback;
  }

  public startGame(): void {
    this.state = this.getInitialState();
    this.state.gameState = GameState.PLAYING;
    this.state.highScore = this.loadHighScore();
    this.startGameLoop();
    this.notifyStateChange();
  }

  public pauseGame(): void {
    if (this.state.gameState === GameState.PLAYING) {
      this.state.isPaused = true;
      this.state.gameState = GameState.PAUSED;
      this.stopGameLoop();
      this.notifyStateChange();
    }
  }

  public resumeGame(): void {
    if (this.state.gameState === GameState.PAUSED) {
      this.state.isPaused = false;
      this.state.gameState = GameState.PLAYING;
      this.startGameLoop();
      this.notifyStateChange();
    }
  }

  public changeDirection(newDirection: Direction): void {
    if (this.state.gameState !== GameState.PLAYING) return;

    // Prevent immediate direction reversal
    const currentDirection = this.state.direction;
    if (
      (currentDirection === Direction.UP && newDirection === Direction.DOWN) ||
      (currentDirection === Direction.DOWN && newDirection === Direction.UP) ||
      (currentDirection === Direction.LEFT && newDirection === Direction.RIGHT) ||
      (currentDirection === Direction.RIGHT && newDirection === Direction.LEFT)
    ) {
      return;
    }

    this.state.nextDirection = newDirection;
  }

  public resetGame(): void {
    this.stopGameLoop();
    this.state = this.getInitialState();
    this.state.highScore = this.loadHighScore();
    this.notifyStateChange();
  }

  public togglePause(): void {
    if (this.state.gameState === GameState.PLAYING) {
      this.pauseGame();
    } else if (this.state.gameState === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  private startGameLoop(): void {
    this.lastUpdate = performance.now();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  private stopGameLoop(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private update(currentTime: number): void {
    if (this.state.gameState !== GameState.PLAYING) {
      return;
    }

    const deltaTime = currentTime - this.lastUpdate;

    if (deltaTime >= this.state.speed) {
      this.updateGame();
      this.lastUpdate = currentTime;
    }

    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  private updateGame(): void {
    // Update direction
    this.state.direction = this.state.nextDirection;

    // Calculate new head position
    const head = { ...this.state.snake[0] };
    const directionVector = DIRECTION_VECTORS[this.state.direction];
    head.x += directionVector.x;
    head.y += directionVector.y;

    // Check for collisions
    if (isOutOfBounds(head) || checkSelfCollision(head, this.state.snake)) {
      this.endGame();
      return;
    }

    // Add new head
    this.state.snake.unshift(head);

    // Check food collision
    if (isPositionEqual(head, this.state.food)) {
      this.eatFood();
    } else {
      // Remove tail if no food eaten
      this.state.snake.pop();
    }

    this.notifyStateChange();
  }

  private eatFood(): void {
    this.state.foodCount++;
    this.state.score = calculateScore(this.state.foodCount, this.state.level);
    
    // Update level and speed
    const newLevel = getLevel(this.state.score);
    if (newLevel > this.state.level) {
      this.state.level = newLevel;
      this.state.speed = calculateSpeed(this.state.level);
    }

    // Spawn new food
    this.state.food = getRandomPosition(this.state.snake);

    // Notify food eaten for particle effects
    if (this.onFoodEaten) {
      this.onFoodEaten(this.state.food);
    }
  }

  private endGame(): void {
    this.state.gameState = GameState.GAME_OVER;
    this.stopGameLoop();
    
    // Save high score
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      saveHighScore(this.state.score);
    }

    if (this.onGameOver) {
      this.onGameOver(this.state.score);
    }

    this.notifyStateChange();
  }

  private loadHighScore(): number {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
      }
    } catch (error) {
      console.warn('Could not load high score:', error);
    }
    return 0;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  public cleanup(): void {
    this.stopGameLoop();
    this.onStateChange = undefined;
    this.onGameOver = undefined;
    this.onFoodEaten = undefined;
  }
}