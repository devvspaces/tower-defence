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

      //Build game state for replay
      const gameStateRecord = {
        mapId: 0, // Will implement map selection later
        seed: Math.random().toString(36).substring(7),
        waves: Array.from({ length: finalGameState.wave }, (_, i) => ({
          waveNumber: i + 1,
          enemiesSpawned: [{ type: 'basic', count: 5 }], // Simplified for now
          timestamp: Date.now(),
        })),
        towers: finalGameState.towers.map((tower) => ({
          type: tower.type,
          position: tower.position,
          timestamp: Date.now(),
        })),
        actions: [], // Can be populated with game actions later
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
