// XP Calculation Formula:
// Level 1-10: Fast progression - 100 * 1.5^(level-1)
// Level 10-30: Moderate - 1000 * 1.3^(level-10)
// Level 30-50: Slower - 10000 * 1.2^(level-30)

const calculateXPForLevel = (level: number): number => {
  if (level <= 1) return 0;

  if (level <= 10) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  } else if (level <= 30) {
    return Math.floor(1000 * Math.pow(1.3, level - 10));
  } else if (level <= 50) {
    return Math.floor(10000 * Math.pow(1.2, level - 30));
  } else {
    return Math.floor(10000 * Math.pow(1.2, 20)); // Cap at level 50
  }
};

// Tower unlock rewards mapping
const towerUnlocks: Record<number, string> = {
  1: 'basic',
  2: 'slow',
  4: 'cannon',
  6: 'ice',
  8: 'sniper',
  10: 'generator',
  12: 'fire',
  14: 'poison',
  16: 'amplifier',
  18: 'lightning',
  20: 'laser',
  22: 'arcane',
  25: 'tesla',
  28: 'rocket',
  30: 'black_hole',
  35: 'time_warp',
  40: 'plasma',
  45: 'void',
  50: 'omega',
};

// Generate level requirements for levels 1-50
export const levelRequirementsSeed = Array.from({ length: 50 }, (_, index) => {
  const level = index + 1;
  const xpRequired = calculateXPForLevel(level);

  // Determine reward type and value
  let rewardType: string | null = null;
  let rewardValue: string | null = null;

  // Tower unlocks
  if (towerUnlocks[level]) {
    rewardType = 'tower_unlock';
    rewardValue = towerUnlocks[level];
  }
  // Milestone rewards (every 10 levels)
  else if (level % 10 === 0 && level > 1) {
    rewardType = 'bonus_xp';
    rewardValue = String(level * 100); // e.g., Level 10 = 1000 XP bonus
  }
  // Upgrade unlocks (every 5 levels)
  else if (level % 5 === 0 && !towerUnlocks[level]) {
    rewardType = 'upgrade_unlock';
    rewardValue = `level_${level}`;
  }

  return {
    level,
    xpRequired: xpRequired,
    rewardType: rewardType,
    rewardValue: rewardValue,
  };
});

// Add detailed XP progression table for reference
export const xpProgressionTable = [
  { level: 1, totalXP: 0, nextLevelXP: 0 },
  { level: 2, totalXP: 0, nextLevelXP: 150 },
  { level: 3, totalXP: 150, nextLevelXP: 225 },
  { level: 4, totalXP: 375, nextLevelXP: 338 },
  { level: 5, totalXP: 713, nextLevelXP: 506 },
  { level: 6, totalXP: 1219, nextLevelXP: 760 },
  { level: 7, totalXP: 1979, nextLevelXP: 1139 },
  { level: 8, totalXP: 3118, nextLevelXP: 1709 },
  { level: 9, totalXP: 4827, nextLevelXP: 2564 },
  { level: 10, totalXP: 7391, nextLevelXP: 3845 },
  { level: 11, totalXP: 11236, nextLevelXP: 1000 },
  { level: 12, totalXP: 12236, nextLevelXP: 1300 },
  { level: 13, totalXP: 13536, nextLevelXP: 1690 },
  { level: 14, totalXP: 15226, nextLevelXP: 2197 },
  { level: 15, totalXP: 17423, nextLevelXP: 2856 },
  { level: 16, totalXP: 20279, nextLevelXP: 3713 },
  { level: 17, totalXP: 23992, nextLevelXP: 4827 },
  { level: 18, totalXP: 28819, nextLevelXP: 6275 },
  { level: 19, totalXP: 35094, nextLevelXP: 8158 },
  { level: 20, totalXP: 43252, nextLevelXP: 10605 },
  { level: 21, totalXP: 53857, nextLevelXP: 13787 },
  { level: 22, totalXP: 67644, nextLevelXP: 17923 },
  { level: 23, totalXP: 85567, nextLevelXP: 23300 },
  { level: 24, totalXP: 108867, nextLevelXP: 30290 },
  { level: 25, totalXP: 139157, nextLevelXP: 39377 },
  { level: 26, totalXP: 178534, nextLevelXP: 51190 },
  { level: 27, totalXP: 229724, nextLevelXP: 66547 },
  { level: 28, totalXP: 296271, nextLevelXP: 86511 },
  { level: 29, totalXP: 382782, nextLevelXP: 112464 },
  { level: 30, totalXP: 495246, nextLevelXP: 146203 },
  { level: 31, totalXP: 641449, nextLevelXP: 10000 },
  { level: 32, totalXP: 651449, nextLevelXP: 12000 },
  { level: 33, totalXP: 663449, nextLevelXP: 14400 },
  { level: 34, totalXP: 677849, nextLevelXP: 17280 },
  { level: 35, totalXP: 695129, nextLevelXP: 20736 },
  { level: 36, totalXP: 715865, nextLevelXP: 24883 },
  { level: 37, totalXP: 740748, nextLevelXP: 29860 },
  { level: 38, totalXP: 770608, nextLevelXP: 35832 },
  { level: 39, totalXP: 806440, nextLevelXP: 42998 },
  { level: 40, totalXP: 849438, nextLevelXP: 51598 },
  { level: 41, totalXP: 901036, nextLevelXP: 61918 },
  { level: 42, totalXP: 962954, nextLevelXP: 74301 },
  { level: 43, totalXP: 1037255, nextLevelXP: 89161 },
  { level: 44, totalXP: 1126416, nextLevelXP: 106994 },
  { level: 45, totalXP: 1233410, nextLevelXP: 128392 },
  { level: 46, totalXP: 1361802, nextLevelXP: 154071 },
  { level: 47, totalXP: 1515873, nextLevelXP: 184885 },
  { level: 48, totalXP: 1700758, nextLevelXP: 221862 },
  { level: 49, totalXP: 1922620, nextLevelXP: 266234 },
  { level: 50, totalXP: 2188854, nextLevelXP: 319481 },
];
