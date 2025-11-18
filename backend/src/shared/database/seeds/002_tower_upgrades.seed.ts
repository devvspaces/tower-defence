// Helper function to create upgrade levels for a tower
const createUpgradeLevels = (
  towerType: string,
  unlockLevels: number[],
  costs: number[]
) => {
  return [
    // Level 1 (Base)
    {
      towerType: towerType,
      upgradeLevel: 1,
      costMultiplier: 1.0,
      damageMultiplier: 1.0,
      rangeMultiplier: 1.0,
      fireRateMultiplier: 1.0,
      specialBonusType: null,
      specialBonusValue: null,
      unlockPlayerLevel: unlockLevels[0],
      upgradeCostCurrency: 'xp',
      upgradeCostAmount: costs[0],
    },
    // Level 2
    {
      towerType: towerType,
      upgradeLevel: 2,
      costMultiplier: 1.0,
      damageMultiplier: 1.3,
      rangeMultiplier: 1.08,
      fireRateMultiplier: 1.1,
      specialBonusType: null,
      specialBonusValue: null,
      unlockPlayerLevel: unlockLevels[1],
      upgradeCostCurrency: 'xp',
      upgradeCostAmount: costs[1],
    },
    // Level 3
    {
      towerType: towerType,
      upgradeLevel: 3,
      costMultiplier: 1.0,
      damageMultiplier: 1.7,
      rangeMultiplier: 1.17,
      fireRateMultiplier: 1.2,
      specialBonusType: 'pierce',
      specialBonusValue: 1,
      unlockPlayerLevel: unlockLevels[2],
      upgradeCostCurrency: 'xp',
      upgradeCostAmount: costs[2],
    },
    // Level 4
    {
      towerType: towerType,
      upgradeLevel: 4,
      costMultiplier: 1.0,
      damageMultiplier: 2.4,
      rangeMultiplier: 1.25,
      fireRateMultiplier: 1.3,
      specialBonusType: 'crit_chance',
      specialBonusValue: 0.25,
      unlockPlayerLevel: unlockLevels[3],
      upgradeCostCurrency: 'xp',
      upgradeCostAmount: costs[3],
    },
    // Level 5
    {
      towerType: towerType,
      upgradeLevel: 5,
      costMultiplier: 1.0,
      damageMultiplier: 3.5,
      rangeMultiplier: 1.42,
      fireRateMultiplier: 1.5,
      specialBonusType: 'explosive',
      specialBonusValue: 20,
      unlockPlayerLevel: unlockLevels[4],
      upgradeCostCurrency: 'xp',
      upgradeCostAmount: costs[4],
    },
  ];
};

export const towerUpgradesSeed = [
  // ========== STARTER & EARLY GAME TOWERS ==========

  // Basic Tower (Sentinel Crossbow)
  ...createUpgradeLevels('basic', [1, 5, 10, 20, 35], [0, 500, 2000, 8000, 30000]),

  // Slow Tower (Gravity Well)
  ...createUpgradeLevels('slow', [2, 6, 12, 22, 36], [0, 600, 2500, 10000, 35000]),

  // Cannon Tower (Thunder Howitzer)
  ...createUpgradeLevels('cannon', [4, 8, 14, 24, 38], [0, 700, 3000, 12000, 40000]),

  // Ice Tower (Cryo Stasis Matrix)
  ...createUpgradeLevels('ice', [6, 10, 16, 26, 40], [0, 800, 3500, 14000, 45000]),

  // Sniper Tower (Void Piercer)
  ...createUpgradeLevels('sniper', [8, 12, 18, 28, 42], [0, 1000, 4000, 16000, 50000]),

  // Generator Tower (Resource Harvester)
  ...createUpgradeLevels('generator', [10, 14, 20, 30, 44], [0, 1200, 5000, 20000, 60000]),

  // ========== MID GAME TOWERS ==========

  // Fire Tower (Inferno Conduit)
  ...createUpgradeLevels('fire', [12, 16, 22, 32, 45], [0, 1400, 6000, 24000, 70000]),

  // Poison Tower (Plague Spewer)
  ...createUpgradeLevels('poison', [14, 18, 24, 34, 46], [0, 1600, 7000, 28000, 80000]),

  // Amplifier Tower (Damage Amplifier)
  ...createUpgradeLevels('amplifier', [16, 20, 26, 36, 47], [0, 2000, 8000, 32000, 90000]),

  // Lightning Tower (Storm Caller)
  ...createUpgradeLevels('lightning', [18, 22, 28, 38, 48], [0, 2400, 10000, 40000, 100000]),

  // Laser Tower (Photon Beam Array)
  ...createUpgradeLevels('laser', [20, 24, 30, 40, 49], [0, 2800, 12000, 48000, 120000]),

  // Arcane Tower (Aether Spire)
  ...createUpgradeLevels('arcane', [22, 26, 32, 42, 50], [0, 3200, 14000, 56000, 140000]),

  // ========== LATE GAME TOWERS ==========

  // Tesla Tower (Tesla Resonator)
  ...createUpgradeLevels('tesla', [25, 28, 34, 44, 50], [0, 4000, 16000, 64000, 160000]),

  // Rocket Tower (MIRV Launcher)
  ...createUpgradeLevels('rocket', [28, 31, 36, 45, 50], [0, 5000, 20000, 80000, 200000]),

  // Black Hole Tower (Singularity Core)
  ...createUpgradeLevels('black_hole', [30, 33, 38, 46, 50], [0, 6000, 25000, 100000, 250000]),

  // Time Warp Tower (Temporal Anomaly)
  ...createUpgradeLevels('time_warp', [35, 38, 42, 48, 50], [0, 8000, 30000, 120000, 300000]),

  // Plasma Tower (Fusion Devastator)
  ...createUpgradeLevels('plasma', [40, 42, 45, 49, 50], [0, 10000, 40000, 160000, 400000]),

  // ========== PRESTIGE TOWERS ==========

  // Void Tower (Void Annihilator)
  ...createUpgradeLevels('void', [45, 46, 47, 49, 50], [0, 15000, 60000, 240000, 600000]),

  // Omega Tower (Omega Protocol)
  ...createUpgradeLevels('omega', [50, 50, 50, 50, 50], [0, 20000, 80000, 320000, 1000000]),
];
