'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Tower, Enemy, Projectile, Position } from '@/types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  STARTING_MONEY,
  STARTING_LIVES,
  ENEMY_PATH,
  TOWER_TYPES,
  ENEMY_TYPES,
  GRID_SIZE
} from '@/lib/gameConfig';
import {
  createEnemy,
  createTower,
  createProjectile,
  moveEnemyAlongPath,
  updateTower,
  canTowerFire,
  moveProjectile,
  getDistance,
  getWaveEnemies,
  damageEnemy,
  isEnemyDead,
  hasEnemyReachedEnd
} from '@/lib/gameEngine';

const TowerDefenseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    money: STARTING_MONEY,
    lives: STARTING_LIVES,
    wave: 0,
    score: 0,
    enemies: [],
    towers: [],
    projectiles: [],
    path: ENEMY_PATH,
    gameStatus: 'playing',
    selectedTowerType: null
  });

  const [waveInProgress, setWaveInProgress] = useState(false);
  const [enemiesSpawnedInWave, setEnemiesSpawnedInWave] = useState(0);
  const lastTimeRef = useRef<number>(Date.now());
  const enemyCounterRef = useRef<number>(0);
  const towerCounterRef = useRef<number>(0);
  const projectileCounterRef = useRef<number>(0);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      setGameState(prevState => {
        if (prevState.gameStatus !== 'playing') return prevState;

        let newState = { ...prevState };

        // Move enemies
        newState.enemies = newState.enemies.map(enemy =>
          moveEnemyAlongPath(enemy, deltaTime, newState.path)
        );

        // Check for enemies that reached the end
        const enemiesThatReached = newState.enemies.filter(enemy =>
          hasEnemyReachedEnd(enemy, newState.path)
        );

        newState.lives -= enemiesThatReached.length;
        newState.enemies = newState.enemies.filter(
          enemy => !hasEnemyReachedEnd(enemy, newState.path)
        );

        // Update towers (find targets)
        newState.towers = newState.towers.map(tower =>
          updateTower(tower, newState.enemies, currentTime)
        );

        // Towers fire at enemies
        const newProjectiles: Projectile[] = [];
        newState.towers = newState.towers.map(tower => {
          if (tower.target && canTowerFire(tower, currentTime)) {
            const targetEnemy = newState.enemies.find(e => e.id === tower.target);
            if (targetEnemy) {
              const projectile = createProjectile(
                tower,
                targetEnemy,
                `projectile-${projectileCounterRef.current++}`
              );
              newProjectiles.push(projectile);
              return { ...tower, lastFireTime: currentTime };
            }
          }
          return tower;
        });

        newState.projectiles = [...newState.projectiles, ...newProjectiles];

        // Move projectiles
        newState.projectiles = newState.projectiles.map(projectile => {
          const targetEnemy = newState.enemies.find(e => e.id === projectile.targetId);
          if (targetEnemy) {
            return moveProjectile(projectile, targetEnemy.position, deltaTime);
          }
          return projectile;
        });

        // Check for projectile hits
        const projectilesToRemove: string[] = [];
        const enemiesToDamage: { [key: string]: number } = {};

        newState.projectiles.forEach(projectile => {
          const targetEnemy = newState.enemies.find(e => e.id === projectile.targetId);
          if (!targetEnemy) {
            projectilesToRemove.push(projectile.id);
            return;
          }

          const distance = getDistance(projectile.position, targetEnemy.position);
          if (distance < 10) {
            // Hit!
            projectilesToRemove.push(projectile.id);
            enemiesToDamage[targetEnemy.id] = (enemiesToDamage[targetEnemy.id] || 0) + projectile.damage;
          }
        });

        newState.projectiles = newState.projectiles.filter(
          p => !projectilesToRemove.includes(p.id)
        );

        // Apply damage to enemies
        let moneyGained = 0;
        let scoreGained = 0;
        newState.enemies = newState.enemies.map(enemy => {
          if (enemiesToDamage[enemy.id]) {
            const damaged = damageEnemy(enemy, enemiesToDamage[enemy.id]);
            if (isEnemyDead(damaged)) {
              moneyGained += enemy.value;
              scoreGained += enemy.value * 10;
            }
            return damaged;
          }
          return enemy;
        });

        // Remove dead enemies
        newState.enemies = newState.enemies.filter(enemy => !isEnemyDead(enemy));

        newState.money += moneyGained;
        newState.score += scoreGained;

        // Check game over
        if (newState.lives <= 0) {
          newState.gameStatus = 'gameOver';
        }

        return newState;
      });
    };

    const intervalId = setInterval(gameLoop, 1000 / 60); // 60 FPS

    return () => clearInterval(intervalId);
  }, [gameState.gameStatus]);

  // Wave spawning
  useEffect(() => {
    if (!waveInProgress || gameState.gameStatus !== 'playing') return;

    const waveConfig = getWaveEnemies(gameState.wave);
    if (!waveConfig || enemiesSpawnedInWave >= waveConfig.count) {
      // Check if all enemies are cleared
      if (gameState.enemies.length === 0) {
        setWaveInProgress(false);
        setEnemiesSpawnedInWave(0);
      }
      return;
    }

    const spawnInterval = setInterval(() => {
      if (enemiesSpawnedInWave < waveConfig.count) {
        const newEnemy = createEnemy(
          waveConfig.type,
          `enemy-${enemyCounterRef.current++}`
        );
        setGameState(prev => ({
          ...prev,
          enemies: [...prev.enemies, newEnemy]
        }));
        setEnemiesSpawnedInWave(prev => prev + 1);
      }
    }, waveConfig.interval);

    return () => clearInterval(spawnInterval);
  }, [waveInProgress, gameState.wave, enemiesSpawnedInWave, gameState.enemies.length, gameState.gameStatus]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }

    // Draw path
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    gameState.path.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw towers
    gameState.towers.forEach(tower => {
      // Draw range (if selected)
      if (gameState.selectedTowerType) {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.range, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw tower
      const colors = {
        basic: '#3b82f6',
        sniper: '#8b5cf6',
        cannon: '#f59e0b'
      };
      ctx.fillStyle = colors[tower.type];
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw tower border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      const color = ENEMY_TYPES[enemy.type].color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(enemy.position.x, enemy.position.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Draw health bar
      const healthBarWidth = 24;
      const healthBarHeight = 4;
      const healthPercentage = enemy.health / enemy.maxHealth;

      ctx.fillStyle = '#333';
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 20,
        healthBarWidth,
        healthBarHeight
      );

      ctx.fillStyle = '#22c55e';
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 20,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    });

    // Draw projectiles
    ctx.fillStyle = '#fbbf24';
    gameState.projectiles.forEach(projectile => {
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [gameState]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.selectedTowerType || gameState.gameStatus !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find the tower type config
    const towerTypeConfig = TOWER_TYPES.find(t => t.type === gameState.selectedTowerType);
    if (!towerTypeConfig) return;

    // Check if player has enough money
    if (gameState.money < towerTypeConfig.cost) {
      alert('Not enough money!');
      return;
    }

    // Check if clicking on path (simple collision check)
    const onPath = gameState.path.some((point, index) => {
      if (index === 0) return false;
      const prevPoint = gameState.path[index - 1];
      const dist = distanceToLineSegment({ x, y }, prevPoint, point);
      return dist < 25; // Path width / 2
    });

    if (onPath) {
      alert('Cannot place tower on the path!');
      return;
    }

    // Check if too close to another tower
    const tooClose = gameState.towers.some(tower => {
      const dist = getDistance({ x, y }, tower.position);
      return dist < 40;
    });

    if (tooClose) {
      alert('Too close to another tower!');
      return;
    }

    // Place the tower
    const newTower = createTower(
      gameState.selectedTowerType,
      { x, y },
      `tower-${towerCounterRef.current++}`,
      towerTypeConfig.cost
    );

    setGameState(prev => ({
      ...prev,
      towers: [...prev.towers, newTower],
      money: prev.money - towerTypeConfig.cost,
      selectedTowerType: null
    }));
  }, [gameState.selectedTowerType, gameState.money, gameState.towers, gameState.path, gameState.gameStatus]);

  const startNextWave = () => {
    if (waveInProgress) return;

    const nextWave = gameState.wave + 1;
    const waveConfig = getWaveEnemies(nextWave);

    if (!waveConfig) {
      setGameState(prev => ({ ...prev, gameStatus: 'won' }));
      return;
    }

    setGameState(prev => ({ ...prev, wave: nextWave }));
    setWaveInProgress(true);
    setEnemiesSpawnedInWave(0);
  };

  const selectTower = (type: Tower['type']) => {
    setGameState(prev => ({
      ...prev,
      selectedTowerType: prev.selectedTowerType === type ? null : type
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4 flex gap-4 items-center">
        <div className="text-white bg-gray-800 px-4 py-2 rounded">
          Money: ${gameState.money}
        </div>
        <div className="text-white bg-gray-800 px-4 py-2 rounded">
          Lives: {gameState.lives}
        </div>
        <div className="text-white bg-gray-800 px-4 py-2 rounded">
          Wave: {gameState.wave}
        </div>
        <div className="text-white bg-gray-800 px-4 py-2 rounded">
          Score: {gameState.score}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="border-4 border-gray-700 cursor-crosshair"
        onClick={handleCanvasClick}
      />

      <div className="mt-4 flex gap-2">
        {TOWER_TYPES.map(tower => (
          <button
            key={tower.type}
            onClick={() => selectTower(tower.type)}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              gameState.selectedTowerType === tower.type
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            } ${gameState.money < tower.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={gameState.money < tower.cost}
          >
            {tower.name} (${tower.cost})
          </button>
        ))}
        <button
          onClick={startNextWave}
          disabled={waveInProgress || gameState.gameStatus !== 'playing'}
          className={`px-6 py-2 rounded font-semibold ${
            waveInProgress || gameState.gameStatus !== 'playing'
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {waveInProgress ? 'Wave In Progress...' : 'Start Next Wave'}
        </button>
      </div>

      {gameState.selectedTowerType && (
        <div className="mt-2 text-white bg-gray-800 px-4 py-2 rounded">
          {TOWER_TYPES.find(t => t.type === gameState.selectedTowerType)?.description}
        </div>
      )}

      {gameState.gameStatus === 'gameOver' && (
        <div className="mt-4 text-red-500 text-2xl font-bold bg-gray-800 px-6 py-3 rounded">
          Game Over! Final Score: {gameState.score}
        </div>
      )}

      {gameState.gameStatus === 'won' && (
        <div className="mt-4 text-green-500 text-2xl font-bold bg-gray-800 px-6 py-3 rounded">
          You Won! Final Score: {gameState.score}
        </div>
      )}
    </div>
  );
};

// Helper function to calculate distance from point to line segment
function distanceToLineSegment(point: Position, lineStart: Position, lineEnd: Position): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

export default TowerDefenseGame;
