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
  GAME_LORE,
  LEADERBOARD_DATA
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
import { useSound } from '@/hooks/useSound';
import { HelpModal, InfoModal } from './Modal';

type GameScreen = 'menu' | 'playing';

const TowerDefenseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [showHelp, setShowHelp] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
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
    waveStartTime: Date.now() + 15000,
    gameStartTime: null
  });

  const [waveInProgress, setWaveInProgress] = useState(false);
  const [enemiesSpawnedInWave, setEnemiesSpawnedInWave] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'magic' | 'support'>('all');
  const lastTimeRef = useRef<number>(Date.now());
  const enemyCounterRef = useRef<number>(0);
  const towerCounterRef = useRef<number>(0);
  const projectileCounterRef = useRef<number>(0);
  const lastSoundTime = useRef<{ [key: string]: number }>({});

  const { playSound, muted, setMuted } = useSound();

  const throttleSound = (soundType: string, minInterval: number = 100) => {
    const now = Date.now();
    const lastTime = lastSoundTime.current[soundType] || 0;
    if (now - lastTime > minInterval) {
      lastSoundTime.current[soundType] = now;
      return true;
    }
    return false;
  };

  const startGame = () => {
    playSound('menuClick');
    setScreen('playing');
    setGameState(prev => ({
      ...prev,
      gameStatus: 'waiting',
      waveStartTime: Date.now() + 15000
    }));
  };

  // Auto-start waves
  useEffect(() => {
    if (screen !== 'playing') return;

    if (gameState.gameStatus === 'waiting' && gameState.waveStartTime && !waveInProgress) {
      const checkInterval = setInterval(() => {
        if (Date.now() >= gameState.waveStartTime!) {
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
  }, [gameState.gameStatus, gameState.waveStartTime, waveInProgress, screen]);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || screen !== 'playing') return;

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

              // Play tower sound
              const soundMap: { [key: string]: any } = {
                basic: 'basicShoot',
                sniper: 'sniperShoot',
                cannon: 'cannonShoot',
                fireMage: 'fireShoot',
                lightning: 'lightningShoot',
                arcane: 'arcaneShoot',
                iceTower: 'iceShoot',
                slow: 'slowShoot',
                poison: 'poisonShoot'
              };
              if (throttleSound(tower.type, 150)) {
                playSound(soundMap[tower.type] || 'basicShoot');
              }

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

            if (throttleSound('enemyHit', 50)) {
              playSound('enemyHit');
            }

            // Handle special effects
            if (projectile.specialEffect) {
              const effect = projectile.specialEffect;

              if (effect.type === 'aoe') {
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
        if (deadEnemies.length > 0 && throttleSound('enemyDeath', 100)) {
          playSound('enemyDeath');
        }
        deadEnemies.forEach(enemy => {
          moneyGained += enemy.value;
          scoreGained += enemy.value * 10;
        });

        newState.enemies = newState.enemies.filter(enemy => !isEnemyDead(enemy));
        newState.money += moneyGained;
        newState.score += scoreGained;

        // Check game over
        if (newState.lives <= 0 && prevState.lives > 0) {
          newState.gameStatus = 'gameOver';
          playSound('gameOver');
        }

        return newState;
      });
    };

    const intervalId = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(intervalId);
  }, [gameState.gameStatus, screen]);

  // Wave spawning
  useEffect(() => {
    if (!waveInProgress || gameState.gameStatus !== 'playing' || screen !== 'playing') return;

    const waveConfig = getWaveEnemies(gameState.wave);
    if (!waveConfig || enemiesSpawnedInWave >= waveConfig.count) {
      if (gameState.enemies.length === 0 && enemiesSpawnedInWave >= (waveConfig?.count || 0)) {
        setWaveInProgress(false);
        setEnemiesSpawnedInWave(0);

        const nextWave = gameState.wave + 1;
        if (getWaveEnemies(nextWave)) {
          setGameState(prev => ({
            ...prev,
            waveStartTime: Date.now() + WAVE_DELAY
          }));
        } else {
          setGameState(prev => ({ ...prev, gameStatus: 'won' }));
          playSound('victory');
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
  }, [waveInProgress, gameState.wave, enemiesSpawnedInWave, gameState.enemies.length, gameState.gameStatus, screen]);

  // Render game
  useEffect(() => {
    if (screen !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#1a1a2e';
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
    ctx.strokeStyle = '#2a2a4e';
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

    // Draw projectiles
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

      if (['fireMage', 'lightning', 'arcane'].includes(projectile.towerType)) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
  }, [gameState, screen]);

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

    const onPath = gameState.path.some((point, index) => {
      if (index === 0) return false;
      const prevPoint = gameState.path[index - 1];
      const dist = distanceToLineSegment({ x, y }, prevPoint, point);
      return dist < 25;
    });

    if (onPath) return;

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

    playSound('towerPlace');
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
      playSound('victory');
      return;
    }

    playSound('waveStart');
    setGameState(prev => ({ ...prev, wave: nextWave, waveStartTime: null }));
    setWaveInProgress(true);
    setEnemiesSpawnedInWave(0);
  };

  const useNuke = () => {
    if (gameState.nukeCharges <= 0 || gameState.enemies.length === 0 || gameState.gameStatus !== 'playing') return;

    playSound('nuke');
    setGameState(prev => ({
      ...prev,
      enemies: [],
      nukeCharges: prev.nukeCharges - 1,
      score: prev.score + prev.enemies.length * 5
    }));
  };

  const selectTower = (type: TowerTypeId) => {
    playSound('menuClick');
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

  const timeUntilWave = getTimeUntilWave();

  // MENU SCREEN
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 retro-bg">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold mb-4 retro-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
            {GAME_LORE.title}
          </h1>
          <div className="bg-slate-900 bg-opacity-80 border-4 border-cyan-500 rounded-lg p-8 mb-8 retro-box">
            <p className="text-cyan-100 text-lg mb-4 leading-relaxed">
              {GAME_LORE.intro}
            </p>
            <p className="text-cyan-200 text-sm leading-relaxed">
              {GAME_LORE.story}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={startGame}
              className="retro-button bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-lg border-4 border-cyan-400 text-2xl transition-all hover:scale-105"
            >
              START MISSION
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowInfo(true);
              }}
              className="retro-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-lg border-4 border-purple-400 text-2xl transition-all hover:scale-105"
            >
              INTEL DATABASE
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowHelp(true);
              }}
              className="retro-button bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-lg border-4 border-green-400 text-2xl transition-all hover:scale-105"
            >
              TRAINING
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setMuted(!muted);
              }}
              className="retro-button bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-lg border-4 border-orange-400 text-2xl transition-all hover:scale-105"
            >
              SOUND: {muted ? 'OFF' : 'ON'}
            </button>
          </div>

          <div className="text-cyan-400 text-sm animate-pulse">
            Press START MISSION to defend the Eternal Citadel
          </div>
        </div>

        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-4 retro-bg">
      <div className="flex gap-4 max-w-[1600px] mx-auto">
        {/* LEFT PANEL - LEADERBOARD */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-slate-900 bg-opacity-90 border-4 border-yellow-500 rounded-lg p-4 retro-box">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center retro-text">TOP DEFENDERS</h2>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {LEADERBOARD_DATA.map((entry) => (
                <div
                  key={entry.rank}
                  className={`p-2 rounded ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-900 to-orange-900 border-2 border-yellow-500' : 'bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold">#{entry.rank}</span>
                    <span className="text-xs text-cyan-400">W{entry.wave}</span>
                  </div>
                  <div className="text-white text-sm font-semibold truncate">{entry.name}</div>
                  <div className="text-green-400 text-xs">{entry.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER - GAME */}
        <div className="flex-grow flex flex-col items-center">
          <div className="mb-3 flex gap-2 items-center flex-wrap justify-center">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-4 py-2 rounded-lg font-bold retro-box">
              ${gameState.money}
            </div>
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg font-bold retro-box">
              ❤️ {gameState.lives}
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg font-bold retro-box">
              Wave {gameState.wave}
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg font-bold retro-box">
              {gameState.score}
            </div>
            <button
              onClick={useNuke}
              disabled={gameState.nukeCharges <= 0 || gameState.enemies.length === 0 || gameState.gameStatus !== 'playing'}
              className={`px-4 py-2 rounded-lg font-bold retro-button transition-all ${
                gameState.nukeCharges > 0 && gameState.enemies.length > 0 && gameState.gameStatus === 'playing'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:scale-105 border-2 border-orange-400'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              💣 NUKE ({gameState.nukeCharges})
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowHelp(true);
              }}
              className="px-4 py-2 rounded-lg font-bold retro-button bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105 border-2 border-green-400"
            >
              ?
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowInfo(true);
              }}
              className="px-4 py-2 rounded-lg font-bold retro-button bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 border-2 border-purple-400"
            >
              INFO
            </button>
          </div>

          {timeUntilWave && !waveInProgress && gameState.gameStatus !== 'gameOver' && (
            <div className="mb-3 text-xl font-bold text-cyan-400 bg-slate-900 px-6 py-2 rounded-lg border-2 border-cyan-500 retro-box animate-pulse">
              Next wave in {timeUntilWave}s
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="border-4 border-cyan-500 retro-box shadow-2xl"
            onClick={handleCanvasClick}
          />

          {gameState.gameStatus === 'gameOver' && (
            <div className="mt-4 text-3xl font-bold bg-slate-900 px-8 py-4 rounded-lg border-4 border-red-500 retro-box animate-pulse">
              <div className="text-red-400">CITADEL BREACHED</div>
              <div className="text-cyan-400 text-xl mt-2">Final Score: {gameState.score}</div>
              <button
                onClick={() => {
                  playSound('menuClick');
                  setScreen('menu');
                }}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-lg retro-button"
              >
                Return to Menu
              </button>
            </div>
          )}

          {gameState.gameStatus === 'won' && (
            <div className="mt-4 text-3xl font-bold bg-slate-900 px-8 py-4 rounded-lg border-4 border-green-500 retro-box animate-pulse">
              <div className="text-green-400">CITADEL SECURED!</div>
              <div className="text-cyan-400 text-xl mt-2">Final Score: {gameState.score}</div>
              <button
                onClick={() => {
                  playSound('menuClick');
                  setScreen('menu');
                }}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-lg retro-button"
              >
                Return to Menu
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - TOWERS */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-slate-900 bg-opacity-90 border-4 border-cyan-500 rounded-lg p-4 retro-box max-h-[800px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center retro-text">DEFENSE SYSTEMS</h2>

            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'physical', 'magic', 'support'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('menuClick');
                    setSelectedCategory(cat as any);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs retro-button transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white border-2 border-cyan-400'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {cat === 'all' ? 'ALL' : cat === 'physical' ? '⚔️ PHY' : cat === 'magic' ? '✨ MAG' : '🛡️ SUP'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredTowers.map(tower => (
                <button
                  key={tower.type}
                  onClick={() => selectTower(tower.type)}
                  disabled={gameState.money < tower.cost || gameState.gameStatus !== 'playing'}
                  className={`w-full p-3 rounded-lg text-left transition-all retro-button ${
                    gameState.selectedTowerType === tower.type
                      ? 'bg-cyan-600 text-white border-2 border-cyan-400 scale-105'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  } ${gameState.money < tower.cost || gameState.gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-bold text-sm">{tower.name}</div>
                  <div className="text-xs text-yellow-300 font-bold">${tower.cost}</div>
                  <div className="text-xs text-gray-300 mt-1">{tower.description}</div>
                  {tower.specialAbility && (
                    <div className="text-xs text-cyan-300 mt-1">⚡ {tower.specialAbility.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
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
