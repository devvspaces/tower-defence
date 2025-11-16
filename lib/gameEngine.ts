import { GameState, Enemy, Tower, Projectile, Position, StatusEffect, TowerTypeId } from '@/types/game';
import { ENEMY_PATH, ENEMY_TYPES, WAVE_CONFIG, TOWER_TYPES } from './gameConfig';

export function createEnemy(type: 'basic' | 'fast' | 'tank', id: string): Enemy {
  const enemyConfig = ENEMY_TYPES[type];
  return {
    id,
    position: { ...ENEMY_PATH[0] },
    health: enemyConfig.health,
    maxHealth: enemyConfig.health,
    speed: enemyConfig.speed,
    baseSpeed: enemyConfig.speed,
    pathIndex: 0,
    value: enemyConfig.value,
    type,
    statusEffects: []
  };
}

export function createTower(type: TowerTypeId, position: Position, id: string): Tower {
  const config = TOWER_TYPES.find(t => t.type === type);
  if (!config) throw new Error(`Tower type ${type} not found`);

  return {
    id,
    position,
    range: config.range,
    damage: config.damage,
    fireRate: config.fireRate,
    lastFireTime: 0,
    cost: config.cost,
    type: config.type,
    category: config.category,
    target: null,
    specialAbility: config.specialAbility
  };
}

export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function updateEnemyStatusEffects(enemy: Enemy, currentTime: number, deltaTime: number): Enemy {
  // Remove expired effects
  const activeEffects = enemy.statusEffects.filter(effect => {
    const elapsed = (currentTime - effect.appliedAt) / 1000;
    return elapsed < effect.duration;
  });

  // Calculate current speed based on effects
  let speedMultiplier = 1;
  let isFrozen = false;

  for (const effect of activeEffects) {
    if (effect.type === 'freeze') {
      isFrozen = true;
      speedMultiplier = 0;
      break;
    } else if (effect.type === 'slow') {
      speedMultiplier = Math.min(speedMultiplier, effect.strength);
    }
  }

  // Apply poison damage
  let healthLoss = 0;
  for (const effect of activeEffects) {
    if (effect.type === 'poison') {
      healthLoss += effect.strength * deltaTime;
    }
  }

  return {
    ...enemy,
    statusEffects: activeEffects,
    speed: enemy.baseSpeed * speedMultiplier,
    health: Math.max(0, enemy.health - healthLoss)
  };
}

export function moveEnemyAlongPath(enemy: Enemy, deltaTime: number, path: Position[]): Enemy {
  if (enemy.pathIndex >= path.length - 1 || enemy.speed === 0) {
    return enemy; // Reached the end or frozen
  }

  const currentTarget = path[enemy.pathIndex + 1];
  const dx = currentTarget.x - enemy.position.x;
  const dy = currentTarget.y - enemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const moveDistance = enemy.speed * deltaTime * 60; // 60 pixels per second at speed 1

  if (distance <= moveDistance) {
    // Reached the waypoint
    return {
      ...enemy,
      position: { ...currentTarget },
      pathIndex: enemy.pathIndex + 1
    };
  } else {
    // Move towards the waypoint
    const ratio = moveDistance / distance;
    return {
      ...enemy,
      position: {
        x: enemy.position.x + dx * ratio,
        y: enemy.position.y + dy * ratio
      }
    };
  }
}

export function findTargetForTower(tower: Tower, enemies: Enemy[]): string | null {
  // Find the enemy furthest along the path within range
  let bestTarget: Enemy | null = null;
  let bestProgress = -1;

  for (const enemy of enemies) {
    const distance = getDistance(tower.position, enemy.position);
    if (distance <= tower.range && enemy.pathIndex > bestProgress) {
      bestTarget = enemy;
      bestProgress = enemy.pathIndex;
    }
  }

  return bestTarget ? bestTarget.id : null;
}

export function updateTower(tower: Tower, enemies: Enemy[], currentTime: number): Tower {
  const target = findTargetForTower(tower, enemies);
  return {
    ...tower,
    target
  };
}

export function canTowerFire(tower: Tower, currentTime: number): boolean {
  const timeSinceLastFire = currentTime - tower.lastFireTime;
  const fireInterval = 1000 / tower.fireRate; // Convert fire rate to milliseconds
  return timeSinceLastFire >= fireInterval;
}

export function createProjectile(
  tower: Tower,
  targetEnemy: Enemy,
  id: string
): Projectile {
  return {
    id,
    position: { ...tower.position },
    targetId: targetEnemy.id,
    damage: tower.damage,
    speed: 300, // pixels per second
    towerType: tower.type,
    specialEffect: tower.specialAbility
  };
}

export function moveProjectile(
  projectile: Projectile,
  targetPosition: Position,
  deltaTime: number
): Projectile {
  const dx = targetPosition.x - projectile.position.x;
  const dy = targetPosition.y - projectile.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const moveDistance = projectile.speed * deltaTime;

  if (distance <= moveDistance) {
    // Projectile reached target
    return {
      ...projectile,
      position: { ...targetPosition }
    };
  }

  const ratio = moveDistance / distance;
  return {
    ...projectile,
    position: {
      x: projectile.position.x + dx * ratio,
      y: projectile.position.y + dy * ratio
    }
  };
}

export function getWaveEnemies(wave: number): { type: 'basic' | 'fast' | 'tank'; count: number; interval: number } | null {
  if (wave < 1 || wave > WAVE_CONFIG.length) {
    return null;
  }
  return WAVE_CONFIG[wave - 1];
}

export function damageEnemy(enemy: Enemy, damage: number): Enemy {
  return {
    ...enemy,
    health: Math.max(0, enemy.health - damage)
  };
}

export function applyStatusEffect(enemy: Enemy, effect: StatusEffect): Enemy {
  // Check if effect already exists, if so, refresh it
  const existingEffectIndex = enemy.statusEffects.findIndex(e => e.type === effect.type);

  if (existingEffectIndex >= 0) {
    const newEffects = [...enemy.statusEffects];
    newEffects[existingEffectIndex] = effect; // Refresh the effect
    return {
      ...enemy,
      statusEffects: newEffects
    };
  } else {
    return {
      ...enemy,
      statusEffects: [...enemy.statusEffects, effect]
    };
  }
}

export function applyAOEDamage(
  enemies: Enemy[],
  centerPosition: Position,
  radius: number,
  damage: number,
  effect?: StatusEffect
): Enemy[] {
  return enemies.map(enemy => {
    const distance = getDistance(enemy.position, centerPosition);
    if (distance <= radius) {
      let updatedEnemy = damageEnemy(enemy, damage);
      if (effect) {
        updatedEnemy = applyStatusEffect(updatedEnemy, effect);
      }
      return updatedEnemy;
    }
    return enemy;
  });
}

export function applyChainLightning(
  enemies: Enemy[],
  initialTarget: Enemy,
  maxChains: number,
  damage: number,
  maxRange: number
): { enemyId: string; damage: number }[] {
  const hits: { enemyId: string; damage: number }[] = [];
  const hitEnemies = new Set<string>();

  let currentTarget: Enemy | null = initialTarget;
  let currentDamage = damage;

  for (let i = 0; i < maxChains && currentTarget; i++) {
    hits.push({ enemyId: currentTarget.id, damage: currentDamage });
    hitEnemies.add(currentTarget.id);

    // Find next closest enemy
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      if (!hitEnemies.has(enemy.id)) {
        const distance = getDistance(currentTarget.position, enemy.position);
        if (distance < closestDistance && distance <= maxRange) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }
    }

    currentTarget = closestEnemy;
    currentDamage *= 0.7; // Each chain does 70% of previous damage
  }

  return hits;
}

export function isEnemyDead(enemy: Enemy): boolean {
  return enemy.health <= 0;
}

export function hasEnemyReachedEnd(enemy: Enemy, path: Position[]): boolean {
  return enemy.pathIndex >= path.length - 1;
}
