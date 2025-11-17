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
  LEADERBOARD_DATA,
  getRandomMapPath
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
import { useAuth } from '@/hooks/useAuth';
import { useGameRecording } from '@/hooks/useGameRecording';
import { WalletConnectButton } from './Auth/WalletConnect';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';

type GameScreen = 'menu' | 'playing';
type SidebarTab = 'leaderboard' | 'chat';

const TowerDefenseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [showHelp, setShowHelp] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('leaderboard');
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
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
    waveStartTime: Date.now() + 5000,
    gameStartTime: null
  });

  const [waveInProgress, setWaveInProgress] = useState(false);
  const [enemiesSpawnedInWave, setEnemiesSpawnedInWave] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'magic' | 'support' | 'utility' | 'economic' | 'hybrid'>('all');
  const lastTimeRef = useRef<number>(Date.now());
  const enemyCounterRef = useRef<number>(0);
  const towerCounterRef = useRef<number>(0);
  const projectileCounterRef = useRef<number>(0);
  const lastSoundTime = useRef<{ [key: string]: number }>({});

  const { playSound, muted, setMuted } = useSound();
  const { isAuthenticated, user } = useAuth();
  const { startGame: startRecording, endGame: endRecording, isRecording } = useGameRecording();

  // Loading screen effect
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 500);
        clearInterval(interval);
      } else {
        setLoadingProgress(progress);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

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
    const newPath = getRandomMapPath();
    setScreen('playing');
    setGameState(prev => ({
      ...prev,
      path: newPath,
      enemies: [],
      towers: [],
      projectiles: [],
      money: STARTING_MONEY,
      lives: STARTING_LIVES,
      wave: 0,
      score: 0,
      nukeCharges: STARTING_NUKES,
      gameStatus: 'waiting',
      waveStartTime: Date.now() + 5000
    }));

    // Start recording if authenticated
    if (isAuthenticated) {
      startRecording();
    }
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

        // Apply scaled damage and gold theft
        enemiesThatReached.forEach(enemy => {
          newState.lives -= enemy.damage; // Scaled damage based on enemy type
          if (enemy.stealsGold && enemy.stealsGold > 0) {
            newState.money = Math.max(0, newState.money - enemy.stealsGold);
          }
        });

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

              // Play tower sound (skip non-attacking towers)
              if (tower.damage > 0) {
                const soundMap: { [key: string]: any } = {
                  basic: 'basicShoot',
                  sniper: 'sniperShoot',
                  cannon: 'cannonShoot',
                  fireMage: 'fireShoot',
                  lightning: 'lightningShoot',
                  arcane: 'arcaneShoot',
                  iceTower: 'iceShoot',
                  slow: 'slowShoot',
                  poison: 'poisonShoot',
                  hybrid: 'arcaneShoot'
                };
                if (throttleSound(tower.type, 150)) {
                  playSound(soundMap[tower.type] || 'basicShoot');
                }
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
        const chainLightningHits: { enemyId: string; damage: number; damageType: 'physical' | 'magic' | 'hybrid' }[] = [];

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

            // Determine damage type based on tower category
            const damageType = projectile.towerCategory === 'hybrid' ? 'hybrid'
              : projectile.towerCategory === 'physical' ? 'physical'
              : 'magic';

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
                  damageType,
                  statusEffect
                );
              } else if (effect.type === 'chain') {
                const hits = applyChainLightning(
                  newState.enemies,
                  targetEnemy,
                  effect.value + 1,
                  projectile.damage,
                  100,
                  damageType
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
                    damageEnemy(newState.enemies[enemyIndex], projectile.damage, damageType),
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
                    damageEnemy(newState.enemies[enemyIndex], projectile.damage, damageType),
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
                    damageEnemy(newState.enemies[enemyIndex], projectile.damage, damageType),
                    poisonEffect
                  );
                }
              }
            } else {
              const enemyIndex = newState.enemies.findIndex(e => e.id === targetEnemy.id);
              if (enemyIndex >= 0) {
                newState.enemies[enemyIndex] = damageEnemy(
                  newState.enemies[enemyIndex],
                  projectile.damage,
                  damageType
                );
              }
            }
          }
        });

        // Apply chain lightning damage with damage type
        chainLightningHits.forEach(hit => {
          const enemyIndex = newState.enemies.findIndex(e => e.id === hit.enemyId);
          if (enemyIndex >= 0) {
            newState.enemies[enemyIndex] = damageEnemy(
              newState.enemies[enemyIndex],
              hit.damage,
              hit.damageType
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

        // Passive income from economic towers
        newState.towers.forEach(tower => {
          if (tower.specialAbility?.type === 'income') {
            moneyGained += tower.specialAbility.value * deltaTime;
          }
        });

        newState.enemies = newState.enemies.filter(enemy => !isEnemyDead(enemy));
        newState.money = Math.round((newState.money + moneyGained) * 100) / 100;
        newState.score += Math.round(scoreGained);

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

  // Record game on game over
  useEffect(() => {
    if (gameState.gameStatus === 'gameOver' && isAuthenticated && !isRecording) {
      endRecording(gameState);
    }
  }, [gameState.gameStatus, isAuthenticated, isRecording]);

  // Wave spawning
  useEffect(() => {
    if (!waveInProgress || gameState.gameStatus !== 'playing' || screen !== 'playing') return;

    const waveConfig = getWaveEnemies(gameState.wave);
    if (!waveConfig || enemiesSpawnedInWave >= waveConfig.count) {
      if (gameState.enemies.length === 0 && enemiesSpawnedInWave >= (waveConfig?.count || 0)) {
        setWaveInProgress(false);
        setEnemiesSpawnedInWave(0);

        const nextWave = gameState.wave + 1;
        // Waves are endless, always schedule next wave
        setGameState(prev => ({
          ...prev,
          waveStartTime: Date.now() + WAVE_DELAY
        }));
      }
      return;
    }

    const spawnInterval = setInterval(() => {
      if (enemiesSpawnedInWave < waveConfig.count) {
        setGameState(prev => {
          const newEnemy = createEnemy(
            waveConfig.type,
            `enemy-${enemyCounterRef.current++}`,
            prev.path
          );
          return {
            ...prev,
            enemies: [...prev.enemies, newEnemy]
          };
        });
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

    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw subtle grid
    ctx.strokeStyle = '#0a0a0a';
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
    ctx.strokeStyle = '#1a1a1a';
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
      // Show range if tower is selected
      if (selectedTower?.id === tower.id) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Get tower config for icon
      const towerConfig = TOWER_TYPES.find(t => t.type === tower.type);
      const icon = towerConfig?.icon || '🏰';

      // Draw tower icon/emoji
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, tower.position.x, tower.position.y);

      // Draw border around tower
      ctx.strokeStyle = selectedTower?.id === tower.id ? '#00ffff' : '#888';
      ctx.lineWidth = selectedTower?.id === tower.id ? 3 : 2;
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Draw health bar for towers with health
      if (tower.health !== undefined && tower.maxHealth !== undefined) {
        const healthBarWidth = 32;
        const healthBarHeight = 4;
        const healthPercentage = tower.health / tower.maxHealth;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(
          tower.position.x - healthBarWidth / 2,
          tower.position.y + 24,
          healthBarWidth,
          healthBarHeight
        );

        ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(
          tower.position.x - healthBarWidth / 2,
          tower.position.y + 24,
          healthBarWidth * healthPercentage,
          healthBarHeight
        );
      }
    });

    // Draw enemies with effects
    gameState.enemies.forEach(enemy => {
      const color = ENEMY_TYPES[enemy.type].color;
      const icon = ENEMY_TYPES[enemy.type].icon;

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

      // Draw enemy icon/emoji
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, enemy.position.x, enemy.position.y);

      const healthBarWidth = 28;
      const healthBarHeight = 4;
      const healthPercentage = enemy.health / enemy.maxHealth;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 22,
        healthBarWidth,
        healthBarHeight
      );

      ctx.fillStyle = healthPercentage > 0.5 ? '#22c55e' : healthPercentage > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 22,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    });

    // Draw projectiles
    gameState.projectiles.forEach(projectile => {
      const projectileColors: Record<string, string> = {
        basic: '#00ffff',
        sniper: '#00ffff',
        cannon: '#00ffff',
        fireMage: '#ff00ff',
        lightning: '#00ffff',
        arcane: '#ff00ff',
        iceTower: '#00ffff',
        slow: '#00ffff',
        poison: '#00ff00',
        hybrid: '#00ffff'
      };

      ctx.fillStyle = projectileColors[projectile.towerType] || '#00ffff';
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect for all projectiles
      ctx.shadowColor = projectileColors[projectile.towerType] || '#00ffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [gameState, screen]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on an existing tower to select it
    const clickedTower = gameState.towers.find(tower => {
      const dist = getDistance({ x, y }, tower.position);
      return dist < 20;
    });

    if (clickedTower) {
      setSelectedTower(clickedTower);
      return;
    }

    // Deselect tower if clicking elsewhere
    setSelectedTower(null);

    // Place tower if one is selected for placement
    if (!gameState.selectedTowerType || gameState.gameStatus !== 'playing') return;

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
      // This should never happen now since waves are endless
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

  // LOADING SCREEN
  if (loading) {
    const loadingTexts = [
      'Initializing Defense Systems...',
      'Loading Tower Configurations...',
      'Scanning Enemy Databases...',
      'Calibrating Weapons Arrays...',
      'Establishing Perimeter...',
      'Loading Citadel Systems...',
      'Syncing Temporal Shields...',
      'Preparing Battle Grid...',
      'Charging Energy Cores...',
      'Activating Guardian Protocol...'
    ];

    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        {/* Scrolling background text */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="loading-text-scroll text-cyan-500 font-mono text-xs leading-relaxed whitespace-pre">
            {Array(50).fill(loadingTexts).flat().map((text, i) => (
              <div key={i}>{text}</div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-bold mb-8 text-cyan-400" style={{
            textShadow: '0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4)'
          }}>
            CHRONICLES OF THE
            <br />
            ETERNAL CITADEL
          </h1>

          {/* Progress bar */}
          <div className="w-96 h-4 bg-gray-800 border-2 border-cyan-500 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="mt-4 text-cyan-400 font-mono">
            Loading... {Math.floor(loadingProgress)}%
          </div>
        </div>
      </div>
    );
  }

  // MENU SCREEN
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 space-bg">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold mb-4 text-cyan-400" style={{
            textShadow: '0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.4)'
          }}>
            {GAME_LORE.title}
          </h1>

          {/* Wallet Connect Section */}
          <div className="mb-6">
            <WalletConnectButton />
          </div>

          <div className="bg-black bg-opacity-70 border border-cyan-500 rounded-lg p-8 mb-8">
            <p className="text-cyan-100 text-lg mb-4 leading-relaxed">
              {GAME_LORE.intro}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {GAME_LORE.story}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={startGame}
              className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105"
            >
              START MISSION
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowInfo(true);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105"
            >
              INTEL DATABASE
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setSidebarTab('leaderboard');
                setShowSidebar(true);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105"
            >
              LEADERBOARD
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setSidebarTab('chat');
                setShowSidebar(true);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105"
            >
              GLOBAL CHAT
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                if (isAuthenticated) {
                  setShowProfile(true);
                }
              }}
              disabled={!isAuthenticated}
              className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PROFILE
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowHelp(true);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105"
            >
              TRAINING
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setMuted(!muted);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-bold py-4 px-8 rounded-lg border border-cyan-400 text-2xl transition-all hover:scale-105"
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
        {showSidebar && (
          <Sidebar
            defaultTab={sidebarTab}
            onClose={() => setShowSidebar(false)}
            isOverlay={true}
          />
        )}
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="min-h-screen bg-black p-4 space-bg">
      <div className="flex gap-4 max-w-[1600px] mx-auto">
        {/* LEFT PANEL - SIDEBAR */}
        <Sidebar defaultTab="leaderboard" isOverlay={false} />

        {/* CENTER - GAME */}
        <div className="flex-grow flex flex-col items-center">
          {/* Fixed height action bar */}
          <div className="mb-3 min-h-[60px] flex gap-2 items-center flex-wrap justify-center">
            <div className="bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold">
              ${Math.floor(gameState.money)}
            </div>
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold border border-cyan-500">
              ❤️ {gameState.lives}
            </div>
            <div className="bg-gray-800 text-cyan-400 px-4 py-2 rounded-lg font-bold border border-cyan-500">
              Wave {gameState.wave}
            </div>
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold border border-cyan-500">
              {gameState.score}
            </div>
            <button
              onClick={useNuke}
              disabled={gameState.nukeCharges <= 0 || gameState.enemies.length === 0 || gameState.gameStatus !== 'playing'}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                gameState.nukeCharges > 0 && gameState.enemies.length > 0 && gameState.gameStatus === 'playing'
                  ? 'bg-cyan-600 text-black hover:bg-cyan-500 border border-cyan-400'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border border-gray-600'
              }`}
            >
              💣 NUKE ({gameState.nukeCharges})
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowHelp(true);
              }}
              className="px-4 py-2 rounded-lg font-bold bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-cyan-500"
            >
              ?
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                setShowInfo(true);
              }}
              className="px-4 py-2 rounded-lg font-bold bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-cyan-500"
            >
              INFO
            </button>
            <button
              onClick={() => {
                playSound('menuClick');
                if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                  setScreen('menu');
                }
              }}
              className="px-4 py-2 rounded-lg font-bold bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-cyan-500"
            >
              QUIT
            </button>
          </div>

          {timeUntilWave !== null && timeUntilWave > 0 && !waveInProgress && gameState.gameStatus !== 'gameOver' && (
            <div className="mb-3 flex gap-3 items-center min-h-[48px]">
              <div className="text-xl font-bold text-cyan-400 bg-gray-900 px-6 py-2 rounded-lg border border-cyan-500">
                Next wave in {timeUntilWave}s
              </div>
              <button
                onClick={() => {
                  playSound('waveStart');
                  setGameState(prev => ({ ...prev, waveStartTime: null }));
                  startNextWave();
                }}
                className="px-6 py-2 rounded-lg font-bold bg-cyan-600 text-black hover:bg-cyan-500 border border-cyan-400 animate-pulse"
              >
                START WAVE NOW
              </button>
            </div>
          )}
          {(!timeUntilWave || timeUntilWave <= 0 || waveInProgress || gameState.gameStatus === 'gameOver') && (
            <div className="mb-3 min-h-[48px]"></div>
          )}

          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="border-2 border-cyan-500 shadow-2xl"
            onClick={handleCanvasClick}
          />

          {gameState.gameStatus === 'gameOver' && (
            <div className="mt-4 text-3xl font-bold bg-gray-900 px-8 py-4 rounded-lg border border-cyan-500 animate-pulse">
              <div className="text-cyan-400">CITADEL BREACHED</div>
              <div className="text-gray-400 text-xl mt-2">Final Score: {gameState.score} | Waves Survived: {gameState.wave}</div>
              <button
                onClick={() => {
                  playSound('menuClick');
                  setScreen('menu');
                }}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded-lg text-lg font-bold"
              >
                Return to Menu
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - TOWERS */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-gray-900 bg-opacity-80 border border-cyan-500 rounded-lg p-4 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">DEFENSE SYSTEMS</h2>

            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'physical', 'magic', 'support', 'utility', 'economic', 'hybrid'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playSound('menuClick');
                    setSelectedCategory(cat as any);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-black border border-cyan-400'
                      : 'bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {cat === 'all' ? 'ALL'
                    : cat === 'physical' ? '⚔️ PHY'
                    : cat === 'magic' ? '✨ MAG'
                    : cat === 'support' ? '🛡️ SUP'
                    : cat === 'utility' ? '📡 UTL'
                    : cat === 'economic' ? '💰 ECO'
                    : '🌟 HYB'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredTowers.map(tower => (
                <button
                  key={tower.type}
                  onClick={() => selectTower(tower.type)}
                  disabled={gameState.money < tower.cost || gameState.gameStatus !== 'playing'}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    gameState.selectedTowerType === tower.type
                      ? 'bg-cyan-600 text-black border border-cyan-400'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  } ${gameState.money < tower.cost || gameState.gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tower.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{tower.name}</div>
                      <div className="text-xs text-cyan-400 font-bold">${tower.cost}</div>
                    </div>
                  </div>
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
