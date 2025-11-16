import { GameState, Enemy, Tower, Projectile, Position } from '@/types/game';
import { ENEMY_PATH, ENEMY_TYPES, WAVE_CONFIG } from './gameConfig';

export function createEnemy(type: 'basic' | 'fast' | 'tank', id: string): Enemy {
  const enemyConfig = ENEMY_TYPES[type];
  return {
    id,
    position: { ...ENEMY_PATH[0] },
    health: enemyConfig.health,
    maxHealth: enemyConfig.health,
    speed: enemyConfig.speed,
    pathIndex: 0,
    value: enemyConfig.value,
    type
  };
}

export function createTower(type: Tower['type'], position: Position, id: string, cost: number): Tower {
  const configs = {
    basic: { range: 120, damage: 10, fireRate: 1 },
    sniper: { range: 200, damage: 30, fireRate: 0.5 },
    cannon: { range: 100, damage: 20, fireRate: 1.5 }
  };

  const config = configs[type];

  return {
    id,
    position,
    range: config.range,
    damage: config.damage,
    fireRate: config.fireRate,
    lastFireTime: 0,
    cost,
    type,
    target: null
  };
}

export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function moveEnemyAlongPath(enemy: Enemy, deltaTime: number, path: Position[]): Enemy {
  if (enemy.pathIndex >= path.length - 1) {
    return enemy; // Reached the end
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
    speed: 300 // pixels per second
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

export function isEnemyDead(enemy: Enemy): boolean {
  return enemy.health <= 0;
}

export function hasEnemyReachedEnd(enemy: Enemy, path: Position[]): boolean {
  return enemy.pathIndex >= path.length - 1;
}
