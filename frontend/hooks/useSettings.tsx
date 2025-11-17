'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameSettings, loadSettings, saveSettings } from '@/lib/settings';

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleMusic = useCallback(() => {
    setSettings(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  }, []);

  const toggleSoundEffects = useCallback(() => {
    setSettings(prev => ({ ...prev, soundEffectsEnabled: !prev.soundEffectsEnabled }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, musicVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const setSoundEffectsVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, soundEffectsVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  return {
    settings,
    updateSettings,
    toggleMusic,
    toggleSoundEffects,
    setMusicVolume,
    setSoundEffectsVolume,
  };
}
