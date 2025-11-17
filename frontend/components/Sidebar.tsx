'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

type SidebarTab = 'leaderboard' | 'chat';

interface SidebarProps {
  defaultTab?: SidebarTab;
  onClose?: () => void;
  isOverlay?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username: string | null;
  score: number;
  wavesCompleted: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  defaultTab = 'leaderboard',
  onClose,
  isOverlay = false
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`${isOverlay ? 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-start' : ''}`}>
      <div className={`bg-gray-900 bg-opacity-95 border border-cyan-500 rounded-lg ${isOverlay ? 'h-full max-w-xs w-80 m-4' : 'w-64 h-full'} flex flex-col`}>
        {/* Header with Close Button */}
        {isOverlay && (
          <div className="flex justify-between items-center p-4 border-b border-cyan-500">
            <h2 className="text-xl font-bold text-cyan-400">COMMAND CENTER</h2>
            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Selector - Icons */}
        <div className="flex gap-2 p-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 p-3 rounded-lg transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-cyan-600 text-black'
                : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
            }`}
            title="Leaderboard"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 p-3 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-600 text-black'
                : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
            }`}
            title="Global Chat"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'leaderboard' && (
            <div>
              <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">TOP DEFENDERS</h3>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No games recorded yet</div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="bg-gray-800 bg-opacity-60 p-3 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 font-bold text-lg">#{entry.rank}</span>
                        <span className="text-gray-300 text-sm flex-1 truncate">
                          {entry.username || formatAddress(entry.walletAddress)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-cyan-300">Score: {entry.score.toLocaleString()}</span>
                        <span className="text-gray-400">Wave {entry.wavesCompleted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">GLOBAL CHAT</h3>

              {!isAuthenticated ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="mb-2">🔒 Authentication Required</p>
                    <p className="text-sm">Connect wallet to join chat</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Chat Messages Area */}
                  <div className="flex-1 bg-gray-800 bg-opacity-40 rounded-lg p-3 mb-3 overflow-y-auto">
                    <div className="text-center text-gray-500 text-sm py-8">
                      Chat coming in Phase 3...
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled
                      placeholder="Message (coming soon)..."
                      className="flex-1 bg-gray-800 text-cyan-100 px-3 py-2 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      disabled
                      className="bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay Background Closer */}
      {isOverlay && (
        <div className="flex-1" onClick={onClose}></div>
      )}
    </div>
  );
};
