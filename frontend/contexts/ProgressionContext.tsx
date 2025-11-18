'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';

interface UserProgression {
  userId: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  progressPercentage: number;
  unlockedTowers: string[];
  towerUpgrades: Record<string, number>;
  totalGamesPlayed: number;
  totalEnemiesKilled: number;
  highestWaveReached: number;
}

interface TowerDefinition {
  id: number;
  towerType: string;
  baseName: string;
  category: string;
  unlockLevel: number;
  baseCost: number;
  baseDamage: number;
  baseRange: number;
  baseFireRate: number;
  description: string;
  lore: string;
  icon: string;
  rarity: string;
  unlocked: boolean;
  canUnlock: boolean;
  currentUpgradeLevel: number;
}

interface ProgressionContextType {
  progression: UserProgression | null;
  towers: TowerDefinition[];
  loading: boolean;
  error: string | null;
  refreshProgression: () => Promise<void>;
  refreshTowers: () => Promise<void>;
  upgradeTower: (towerType: string) => Promise<boolean>;
}

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const [progression, setProgression] = useState<UserProgression | null>(null);
  const [towers, setTowers] = useState<TowerDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProgression = async () => {
    try {
      const data = await apiClient.getUserProgression();
      setProgression(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch progression:', err);
      setError(err.message || 'Failed to load progression data');
    }
  };

  const refreshTowers = async () => {
    try {
      const data = await apiClient.getAllTowers();
      setTowers(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch towers:', err);
      setError(err.message || 'Failed to load towers');
    }
  };

  const upgradeTower = async (towerType: string): Promise<boolean> => {
    try {
      const result = await apiClient.upgradeTower(towerType);
      if (result.success) {
        // Refresh both progression and towers to get updated data
        await Promise.all([refreshProgression(), refreshTowers()]);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to upgrade tower:', err);
      setError(err.message || 'Failed to upgrade tower');
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      if (!apiClient.isAuthenticated()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([refreshProgression(), refreshTowers()]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (apiClient.isAuthenticated()) {
        refreshProgression();
        refreshTowers();
      } else {
        setProgression(null);
        setTowers([]);
      }
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  return (
    <ProgressionContext.Provider
      value={{
        progression,
        towers,
        loading,
        error,
        refreshProgression,
        refreshTowers,
        upgradeTower,
      }}
    >
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (context === undefined) {
    throw new Error('useProgression must be used within a ProgressionProvider');
  }
  return context;
}
