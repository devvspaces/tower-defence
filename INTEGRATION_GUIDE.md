# 🔌 Progression System Integration Guide

This guide shows how to integrate the progression system with your game.

## ✅ Completed Setup

1. ✅ API client methods added (`/lib/api-client.ts`)
2. ✅ Progression context created (`/contexts/ProgressionContext.tsx`)
3. ✅ Context provider added to app (`/components/Providers.tsx`)

## 🎮 Step-by-Step Integration

### 1. Update Game Recording Hook

The backend now returns progression data when recording a game. Update `/hooks/useGameRecording.ts`:

```typescript
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { GameState } from '@/types/game';

export interface ProgressionResult {
  xpAwarded: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newUnlocks: Array<{
    type: 'tower_unlock' | 'upgrade_unlock' | 'bonus_xp';
    value: string;
    level: number;
  }>;
  breakdown: Array<{
    source: string;
    amount: number;
    description: string;
  }>;
}

export interface GameRecordResult {
  game: any;
  progression: ProgressionResult;
}

export function useGameRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  const startGame = () => {
    setGameStartTime(new Date());
  };

  const endGame = async (finalGameState: GameState): Promise<GameRecordResult | null> => {
    if (!gameStartTime) {
      console.error('Game was not properly started');
      return null;
    }

    setIsRecording(true);
    try {
      const endTime = new Date();

      const gameStateRecord = {
        mapId: 0,
        seed: Math.random().toString(36).substring(7),
        waves: Array.from({ length: finalGameState.wave }, (_, i) => ({
          waveNumber: i + 1,
          enemiesSpawned: [{ type: 'basic', count: 5 }],
          timestamp: Date.now(),
        })),
        towers: finalGameState.towers.map((tower) => ({
          type: tower.type,
          position: tower.position,
          timestamp: Date.now(),
        })),
        actions: [],
        finalStats: {
          money: finalGameState.money,
          lives: finalGameState.lives,
          nukesUsed: 3 - finalGameState.nukeCharges,
        },
      };

      // Backend now returns { game, progression }
      const result = await apiClient.recordGame({
        score: finalGameState.score,
        wavesCompleted: finalGameState.wave,
        gameState: gameStateRecord,
        startedAt: gameStartTime.toISOString(),
        completedAt: endTime.toISOString(),
      });

      console.log('Game recorded with progression:', result);
      return result;
    } catch (error) {
      console.error('Failed to record game:', error);
      return null;
    } finally {
      setIsRecording(false);
      setGameStartTime(null);
    }
  };

  return {
    startGame,
    endGame,
    isRecording,
    gameStartTime,
  };
}
```

### 2. Integrate XP Reward Screen in Game Component

Update `/components/TowerDefenseGame.tsx` to show the XP screen after game over:

```typescript
'use client';

import { useState } from 'react';
import { useGameRecording, GameRecordResult } from '@/hooks/useGameRecording';
import { useProgression } from '@/contexts/ProgressionContext';
import { XPRewardScreen } from './XPRewardScreen';
// ... other imports

export function TowerDefenseGame() {
  const { endGame } = useGameRecording();
  const { refreshProgression } = useProgression();
  const [showXPScreen, setShowXPScreen] = useState(false);
  const [gameRecordResult, setGameRecordResult] = useState<GameRecordResult | null>(null);

  // ... existing game logic

  const handleGameOver = async (finalGameState: GameState) => {
    // Record game and get progression data
    const result = await endGame(finalGameState);

    if (result) {
      setGameRecordResult(result);
      setShowXPScreen(true);

      // Refresh progression context
      await refreshProgression();
    }
  };

  const handleCloseXPScreen = () => {
    setShowXPScreen(false);
    setGameRecordResult(null);
    // Return to menu or restart
  };

  // Transform backend data to XPRewardScreen format
  const getXPScreenProps = () => {
    if (!gameRecordResult) return null;

    const { progression } = gameRecordResult;

    // Map breakdown
    const breakdownMap: any = {
      wavesClearedXP: 0,
      scoreXP: 0,
      milestoneXP: 0,
      perfectDefenseXP: 0,
      firstWinBonusXP: 0,
      difficultyMultiplier: 1,
    };

    progression.breakdown.forEach(item => {
      if (item.source === 'waves') breakdownMap.wavesClearedXP = item.amount;
      if (item.source === 'score') breakdownMap.scoreXP = item.amount;
      if (item.source === 'milestone') breakdownMap.milestoneXP = item.amount;
      if (item.source === 'perfect_defense') breakdownMap.perfectDefenseXP = item.amount;
      if (item.source === 'first_win') breakdownMap.firstWinBonusXP = item.amount;
      if (item.source === 'difficulty_multiplier') breakdownMap.difficultyMultiplier = 1 + (item.amount / progression.xpAwarded);
    });

    // Find tower unlock reward
    const towerUnlock = progression.newUnlocks.find(u => u.type === 'tower_unlock');

    return {
      gameResult: {
        wavesCompleted: finalGameState.wave,
        score: finalGameState.score,
        enemiesKilled: 0, // Calculate from game state
        livesRemaining: finalGameState.lives,
        maxLives: 20,
        difficulty: 'Normal',
      },
      xpBreakdown: breakdownMap,
      totalXPEarned: progression.xpAwarded,
      levelInfo: {
        currentLevel: progression.newLevel,
        currentXP: 0, // Get from progression context
        xpForNextLevel: 1000, // Get from progression context
        xpGainedThisGame: progression.xpAwarded,
      },
      levelUpInfo: progression.leveledUp ? {
        leveledUp: true,
        oldLevel: progression.oldLevel,
        newLevel: progression.newLevel,
        reward: towerUnlock ? {
          type: 'tower' as const,
          name: towerUnlock.value,
          description: `Unlocked at level ${towerUnlock.level}`,
        } : undefined,
      } : undefined,
    };
  };

  return (
    <>
      {/* Existing game canvas */}

      {/* XP Reward Screen */}
      {showXPScreen && gameRecordResult && (
        <XPRewardScreen
          isOpen={showXPScreen}
          onClose={handleCloseXPScreen}
          {...getXPScreenProps()!}
        />
      )}
    </>
  );
}
```

### 3. Use Progression Data in Components

Access progression data anywhere in your app:

```typescript
import { useProgression } from '@/contexts/ProgressionContext';

function MyComponent() {
  const { progression, towers, loading } = useProgression();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Level: {progression?.level}</p>
      <p>XP: {progression?.xp} / {progression?.xpForNextLevel}</p>
      <p>Unlocked Towers: {towers.filter(t => t.unlocked).length}</p>
    </div>
  );
}
```

### 4. Add XP Bar to Game UI

Show current XP progress during gameplay:

```typescript
import { useProgression } from '@/contexts/ProgressionContext';
import { ProgressBar } from './ProgressBar';

function GameHUD() {
  const { progression } = useProgression();

  return (
    <div className="absolute top-4 right-4">
      <div className="flex items-center gap-2">
        <span className="text-white">Lvl {progression?.level}</span>
        <ProgressBar
          current={progression?.xp || 0}
          max={progression?.xpForNextLevel || 1}
          showPercentage={false}
          height="sm"
        />
      </div>
    </div>
  );
}
```

### 5. Filter Tower Selection by Unlocks

Update tower selection to only show unlocked towers:

```typescript
import { useProgression } from '@/contexts/ProgressionContext';

function TowerSelection() {
  const { towers } = useProgression();

  const availableTowers = towers.filter(tower => tower.unlocked);

  return (
    <div>
      {availableTowers.map(tower => (
        <TowerCard
          key={tower.id}
          tower={tower}
          onClick={() => selectTower(tower)}
        />
      ))}
    </div>
  );
}
```

### 6. Add Profile Button to Navigation

```typescript
import { ProfileScreen } from './ProfileScreen';
import { useState } from 'react';

function Navigation() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <button onClick={() => setShowProfile(true)}>
        👤 Profile
      </button>

      <ProfileScreen
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}
```

## 🎨 UI Components Available

All these components are already built and ready to use:

1. **ProgressBar** - Animated XP progress bar
2. **XPRewardScreen** - Post-game XP breakdown with animations
3. **LevelUpNotification** - Celebratory level-up popup
4. **ProfileScreen** - Complete profile with stats and rewards
5. **TowerLibrary** - Grid view of all towers
6. **TowerCard** - Individual tower display
7. **TowerUpgradeModal** - Tower upgrade interface
8. **UpcomingRewards** - Shows next unlock rewards

## 🔥 Quick Test

1. Start the backend: `cd backend && npm run start:dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Login with wallet
4. Play a game
5. Complete the game
6. See XP rewards! 🎉

## 📊 Data Flow

```
Game Completion
    ↓
useGameRecording.endGame()
    ↓
Backend: /api/game/record
    ↓
ProgressionService.awardXP()
    ↓
Returns: { game, progression }
    ↓
Show XPRewardScreen
    ↓
refreshProgression()
    ↓
Update UI with new level/unlocks
```

## 🐛 Debugging

```typescript
// Check progression context
const { progression, towers, error } = useProgression();
console.log('Current progression:', progression);
console.log('Available towers:', towers.filter(t => t.unlocked));

// Check API responses
const result = await apiClient.getUserProgression();
console.log('API progression:', result);
```

## 🚀 Next Steps

1. Test game completion flow
2. Verify XP calculation is correct
3. Test tower unlocking at level thresholds
4. Test tower upgrading with XP costs
5. Add profile button to main menu
6. Add level-up notification overlays

---

**Need Help?** All backend endpoints are working and tested. The frontend components are built. You just need to wire them together using this guide!
