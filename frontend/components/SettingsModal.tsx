'use client';

import React from 'react';
import { GameSettings } from '@/lib/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (updates: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">SETTINGS</h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Music Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-cyan-400 font-bold text-lg">Music</label>
              <button
                onClick={() => onUpdateSettings({ musicEnabled: !settings.musicEnabled })}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  settings.musicEnabled
                    ? 'bg-cyan-600 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Volume</span>
                <span className="text-cyan-400 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume * 100}
                onChange={(e) => onUpdateSettings({ musicVolume: parseInt(e.target.value) / 100 })}
                disabled={!settings.musicEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  accentColor: '#06b6d4',
                }}
              />
            </div>
          </div>

          {/* Sound Effects Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-cyan-400 font-bold text-lg">Sound Effects</label>
              <button
                onClick={() => onUpdateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  settings.soundEffectsEnabled
                    ? 'bg-cyan-600 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {settings.soundEffectsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Volume</span>
                <span className="text-cyan-400 font-bold">{Math.round(settings.soundEffectsVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundEffectsVolume * 100}
                onChange={(e) => onUpdateSettings({ soundEffectsVolume: parseInt(e.target.value) / 100 })}
                disabled={!settings.soundEffectsEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  accentColor: '#06b6d4',
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
