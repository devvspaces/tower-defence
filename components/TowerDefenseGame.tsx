'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Tower, Enemy, Projectile, Position, TowerTypeId, StatusEffect } from '@/types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  STARTING_MONEY,
  STARTING_LIVES,
  STARTING_NUKES,
  ENEMY_PATH,
  TOWER_TYPES,
  ENEMY_TYPES,
  GRID_SIZE,
  WAVE_DELAY,
  INITIAL_GAME_START_DELAY
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
  hasEnemyReachedEnd,
  applyAOEDamage,
  applyChainLightning,
  applyStatusEffect,
  updateEnemyStatusEffects
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
    gameStatus: 'waiting',
    selectedTowerType: null,
    nukeCharges: STARTING_NUKES,
    waveStartTime: null,
    gameStartTime: Date.now() + INITIAL_GAME_START_DELAY
  });

  const [waveInProgress, setWaveInProgress] = useState(false);
  const [enemiesSpawnedInWave, setEnemiesSpawnedInWave] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'magic' | 'support'>('all');
  const lastTimeRef = useRef<number>(Date.now());
  const enemyCounterRef = useRef<number>(0);
  const towerCounterRef = useRef<number>(0);
  const projectileCounterRef = useRef<number>(0);

  // Auto-start game and waves
  useEffect(() => {
    if (gameState.gameStatus === 'waiting' && gameState.gameStartTime) {
      const checkInterval = setInterval(() => {
        if (Date.now() >= gameState.gameStartTime!) {
          setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
          startNextWave();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    if (gameState.gameStatus === 'playing' && !waveInProgress && gameState.waveStartTime) {
      const checkInterval = setInterval(() => {
        if (Date.now() >= gameState.waveStartTime!) {
          startNextWave();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, [gameState.gameStatus, gameState.gameStartTime, gameState.waveStartTime, waveInProgress]);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      setGameState(prevState => {
        if (prevState.gameStatus !== 'playing') return prevState;

        let newState = { ...prevState };

        // Update enemy status effects
        newState.enemies = newState.enemies.map(enemy =>
          updateEnemyStatusEffects(enemy, currentTime, deltaTime)
        );

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

        // Update towers
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
        const chainLightningHits: { enemyId: string; damage: number }[] = [];

        newState.projectiles.forEach(projectile => {
          const targetEnemy = newState.enemies.find(e => e.id === projectile.targetId);
          if (!targetEnemy) {
            projectilesToRemove.push(projectile.id);
            return;
          }

          const distance = getDistance(projectile.position, targetEnemy.position);
          if (distance < 10) {
            projectilesToRemove.push(projectile.id);

            // Handle special effects
            if (projectile.specialEffect) {
              const effect = projectile.specialEffect;

              if (effect.type === 'aoe') {
                // Apply AOE damage
                let statusEffect: StatusEffect | undefined;
                if (projectile.towerType === 'iceTower') {
                  statusEffect = {
                    type: 'freeze',
                    duration: 2,
                    strength: 0,
                    appliedAt: currentTime
                  };
                }
                newState.enemies = applyAOEDamage(
                  newState.enemies,
                  targetEnemy.position,
                  effect.value,
                  projectile.damage,
                  statusEffect
                );
              } else if (effect.type === 'chain') {
                // Chain lightning
                const hits = applyChainLightning(
                  newState.enemies,
                  targetEnemy,
                  effect.value + 1,
                  projectile.damage,
                  100
                );
                chainLightningHits.push(...hits);
              } else if (effect.type === 'freeze') {
                const freezeEffect: StatusEffect = {
                  type: 'freeze',
                  duration: effect.value,
                  strength: 0,
                  appliedAt: currentTime
                };
                const enemyIndex = newState.enemies.findIndex(e => e.id === targetEnemy.id);
                if (enemyIndex >= 0) {
                  newState.enemies[enemyIndex] = applyStatusEffect(
                    damageEnemy(newState.enemies[enemyIndex], projectile.damage),
                    freezeEffect
                  );
                }
              } else if (effect.type === 'slow') {
                const slowEffect: StatusEffect = {
                  type: 'slow',
                  duration: 3,
                  strength: effect.value,
                  appliedAt: currentTime
                };
                const enemyIndex = newState.enemies.findIndex(e => e.id === targetEnemy.id);
                if (enemyIndex >= 0) {
                  newState.enemies[enemyIndex] = applyStatusEffect(
                    damageEnemy(newState.enemies[enemyIndex], projectile.damage),
                    slowEffect
                  );
                }
              } else if (effect.type === 'poison') {
                const poisonEffect: StatusEffect = {
                  type: 'poison',
                  duration: 4,
                  strength: effect.value,
                  appliedAt: currentTime
                };
                const enemyIndex = newState.enemies.findIndex(e => e.id === targetEnemy.id);
                if (enemyIndex >= 0) {
                  newState.enemies[enemyIndex] = applyStatusEffect(
                    damageEnemy(newState.enemies[enemyIndex], projectile.damage),
                    poisonEffect
                  );
                }
              }
            } else {
              // Normal damage
              const enemyIndex = newState.enemies.findIndex(e => e.id === targetEnemy.id);
              if (enemyIndex >= 0) {
                newState.enemies[enemyIndex] = damageEnemy(
                  newState.enemies[enemyIndex],
                  projectile.damage
                );
              }
            }
          }
        });

        // Apply chain lightning damage
        chainLightningHits.forEach(hit => {
          const enemyIndex = newState.enemies.findIndex(e => e.id === hit.enemyId);
          if (enemyIndex >= 0) {
            newState.enemies[enemyIndex] = damageEnemy(
              newState.enemies[enemyIndex],
              hit.damage
            );
          }
        });

        newState.projectiles = newState.projectiles.filter(
          p => !projectilesToRemove.includes(p.id)
        );

        // Calculate rewards and remove dead enemies
        let moneyGained = 0;
        let scoreGained = 0;
        const deadEnemies = newState.enemies.filter(isEnemyDead);
        deadEnemies.forEach(enemy => {
          moneyGained += enemy.value;
          scoreGained += enemy.value * 10;
        });

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

    const intervalId = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(intervalId);
  }, [gameState.gameStatus]);

  // Wave spawning
  useEffect(() => {
    if (!waveInProgress || gameState.gameStatus !== 'playing') return;

    const waveConfig = getWaveEnemies(gameState.wave);
    if (!waveConfig || enemiesSpawnedInWave >= waveConfig.count) {
      if (gameState.enemies.length === 0 && enemiesSpawnedInWave >= (waveConfig?.count || 0)) {
        setWaveInProgress(false);
        setEnemiesSpawnedInWave(0);

        // Schedule next wave
        const nextWave = gameState.wave + 1;
        if (getWaveEnemies(nextWave)) {
          setGameState(prev => ({
            ...prev,
            waveStartTime: Date.now() + WAVE_DELAY
          }));
        } else {
          setGameState(prev => ({ ...prev, gameStatus: 'won' }));
        }
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
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
    ctx.strokeStyle = '#334155';
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

    // Draw towers with range
    gameState.towers.forEach(tower => {
      if (gameState.selectedTowerType) {
        ctx.fillStyle = tower.category === 'physical'
          ? 'rgba(239, 68, 68, 0.1)'
          : tower.category === 'magic'
          ? 'rgba(147, 51, 234, 0.1)'
          : 'rgba(59, 130, 246, 0.1)';
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.range, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tower colors by type
      const colors: Record<string, string> = {
        basic: '#ef4444',
        sniper: '#dc2626',
        cannon: '#f97316',
        fireMage: '#8b5cf6',
        lightning: '#a78bfa',
        arcane: '#6366f1',
        iceTower: '#0ea5e9',
        slow: '#06b6d4',
        poison: '#10b981'
      };

      ctx.fillStyle = colors[tower.type] || '#3b82f6';
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw enemies with effects
    gameState.enemies.forEach(enemy => {
      const color = ENEMY_TYPES[enemy.type].color;

      // Draw glow for status effects
      if (enemy.statusEffects.length > 0) {
        const mainEffect = enemy.statusEffects[0];
        const effectColors = {
          freeze: '#0ea5e9',
          slow: '#06b6d4',
          poison: '#10b981'
        };
        ctx.fillStyle = effectColors[mainEffect.type] || color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(enemy.position.x, enemy.position.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(enemy.position.x, enemy.position.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Health bar
      const healthBarWidth = 24;
      const healthBarHeight = 4;
      const healthPercentage = enemy.health / enemy.maxHealth;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 20,
        healthBarWidth,
        healthBarHeight
      );

      ctx.fillStyle = healthPercentage > 0.5 ? '#22c55e' : healthPercentage > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 20,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    });

    // Draw projectiles with colors
    gameState.projectiles.forEach(projectile => {
      const projectileColors: Record<string, string> = {
        basic: '#fbbf24',
        sniper: '#fcd34d',
        cannon: '#fb923c',
        fireMage: '#c084fc',
        lightning: '#a78bfa',
        arcane: '#818cf8',
        iceTower: '#38bdf8',
        slow: '#22d3ee',
        poison: '#34d399'
      };

      ctx.fillStyle = projectileColors[projectile.towerType] || '#fbbf24';
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect for magic projectiles
      if (['fireMage', 'lightning', 'arcane'].includes(projectile.towerType)) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
  }, [gameState]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.selectedTowerType || gameState.gameStatus !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const towerTypeConfig = TOWER_TYPES.find(t => t.type === gameState.selectedTowerType);
    if (!towerTypeConfig) return;

    if (gameState.money < towerTypeConfig.cost) {
      return;
    }

    // Check path collision
    const onPath = gameState.path.some((point, index) => {
      if (index === 0) return false;
      const prevPoint = gameState.path[index - 1];
      const dist = distanceToLineSegment({ x, y }, prevPoint, point);
      return dist < 25;
    });

    if (onPath) return;

    // Check tower collision
    const tooClose = gameState.towers.some(tower => {
      const dist = getDistance({ x, y }, tower.position);
      return dist < 35;
    });

    if (tooClose) return;

    const newTower = createTower(
      gameState.selectedTowerType,
      { x, y },
      `tower-${towerCounterRef.current++}`
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

    setGameState(prev => ({ ...prev, wave: nextWave, waveStartTime: null }));
    setWaveInProgress(true);
    setEnemiesSpawnedInWave(0);
  };

  const useNuke = () => {
    if (gameState.nukeCharges <= 0 || gameState.enemies.length === 0) return;

    setGameState(prev => ({
      ...prev,
      enemies: [],
      nukeCharges: prev.nukeCharges - 1,
      score: prev.score + prev.enemies.length * 5
    }));
  };

  const selectTower = (type: TowerTypeId) => {
    setGameState(prev => ({
      ...prev,
      selectedTowerType: prev.selectedTowerType === type ? null : type
    }));
  };

  const filteredTowers = selectedCategory === 'all'
    ? TOWER_TYPES
    : TOWER_TYPES.filter(t => t.category === selectedCategory);

  const getTimeUntilWave = () => {
    if (!gameState.waveStartTime) return null;
    const seconds = Math.ceil((gameState.waveStartTime - Date.now()) / 1000);
    return seconds > 0 ? seconds : null;
  };

  const getTimeUntilStart = () => {
    if (!gameState.gameStartTime || gameState.gameStatus !== 'waiting') return null;
    const seconds = Math.ceil((gameState.gameStartTime - Date.now()) / 1000);
    return seconds > 0 ? seconds : null;
  };

  const timeUntilWave = getTimeUntilWave();
  const timeUntilStart = getTimeUntilStart();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
      {/* Header Stats */}
      <div className="mb-4 flex gap-3 items-center flex-wrap justify-center">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          💰 ${gameState.money}
        </div>
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          ❤️ {gameState.lives}
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          🌊 Wave {gameState.wave}
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          ⭐ {gameState.score}
        </div>
        <button
          onClick={useNuke}
          disabled={gameState.nukeCharges <= 0 || gameState.enemies.length === 0}
          className={`px-4 py-2 rounded-lg font-bold shadow-lg transition-all ${
            gameState.nukeCharges > 0 && gameState.enemies.length > 0
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:scale-105'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          💣 Nuke ({gameState.nukeCharges})
        </button>
      </div>

      {/* Timer Display */}
      {timeUntilStart && (
        <div className="mb-4 text-2xl font-bold text-green-400 bg-slate-800 px-6 py-3 rounded-lg">
          Game starts in {timeUntilStart}s
        </div>
      )}
      {timeUntilWave && !waveInProgress && gameState.gameStatus === 'playing' && (
        <div className="mb-4 text-xl font-bold text-blue-400 bg-slate-800 px-6 py-3 rounded-lg">
          Next wave in {timeUntilWave}s
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="border-4 border-slate-700 cursor-crosshair shadow-2xl"
        onClick={handleCanvasClick}
      />

      {/* Tower Categories */}
      <div className="mt-4 flex gap-2">
        {['all', 'physical', 'magic', 'support'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {cat === 'all' ? '🎯 All' : cat === 'physical' ? '⚔️ Physical' : cat === 'magic' ? '✨ Magic' : '🛡️ Support'}
          </button>
        ))}
      </div>

      {/* Tower Selection */}
      <div className="mt-3 grid grid-cols-3 gap-2 max-w-4xl">
        {filteredTowers.map(tower => (
          <button
            key={tower.type}
            onClick={() => selectTower(tower.type)}
            className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
              gameState.selectedTowerType === tower.type
                ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            } ${gameState.money < tower.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={gameState.money < tower.cost}
            title={tower.description + (tower.specialAbility ? ` - ${tower.specialAbility.description}` : '')}
          >
            <div className="font-bold">{tower.name}</div>
            <div className="text-xs text-yellow-300">${tower.cost}</div>
          </button>
        ))}
      </div>

      {gameState.selectedTowerType && (
        <div className="mt-3 text-white bg-slate-800 px-4 py-2 rounded-lg max-w-xl text-center">
          {TOWER_TYPES.find(t => t.type === gameState.selectedTowerType)?.description}
          {TOWER_TYPES.find(t => t.type === gameState.selectedTowerType)?.specialAbility && (
            <span className="text-blue-300"> - {TOWER_TYPES.find(t => t.type === gameState.selectedTowerType)?.specialAbility?.description}</span>
          )}
        </div>
      )}

      {gameState.gameStatus === 'gameOver' && (
        <div className="mt-4 text-red-400 text-2xl font-bold bg-slate-800 px-6 py-3 rounded-lg shadow-xl">
          💀 Game Over! Final Score: {gameState.score}
        </div>
      )}

      {gameState.gameStatus === 'won' && (
        <div className="mt-4 text-green-400 text-2xl font-bold bg-slate-800 px-6 py-3 rounded-lg shadow-xl">
          🏆 Victory! Final Score: {gameState.score}
        </div>
      )}
    </div>
  );
};

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
