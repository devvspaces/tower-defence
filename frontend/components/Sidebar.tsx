'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useChat } from '@/hooks/useChat';

type SidebarTab = 'leaderboard' | 'overall' | 'chat';

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

interface OverallLeaderboardEntry {
  rank: number;
  walletAddress: string;
  username: string | null;
  totalScore: number;
  totalGames: number;
  bestScore: number;
  bestWaves: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  defaultTab = 'leaderboard',
  onClose,
  isOverlay = false
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<OverallLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const { messages, isConnected, sendMessage, sendTypingIndicator } = useChat();

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    } else if (activeTab === 'overall') {
      loadOverallLeaderboard();
    }
  }, [activeTab]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLeaderboard(10);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setLeaderboard(data);
      } else {
        console.error('Leaderboard data is not an array:', data);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOverallLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getOverallLeaderboard(10);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setOverallLeaderboard(data);
      } else {
        console.error('Overall leaderboard data is not an array:', data);
        setOverallLeaderboard([]);
      }
    } catch (error) {
      console.error('Failed to load overall leaderboard:', error);
      setOverallLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !isConnected) return;

    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    sendTypingIndicator();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${isOverlay ? 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-start' : 'h-full'}`}>
      <div className={`bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg backdrop-blur-sm ${isOverlay ? 'h-full max-w-xs w-80 m-4' : 'w-full h-full'} flex flex-col`}>
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
            title="Best Games"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setActiveTab('overall')}
            className={`flex-1 p-3 rounded-lg transition-all ${
              activeTab === 'overall'
                ? 'bg-cyan-600 text-black'
                : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
            }`}
            title="Overall Rankings"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
              <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">BEST GAMES</h3>
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

          {activeTab === 'overall' && (
            <div>
              <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">TOP DEFENDERS</h3>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : overallLeaderboard.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No games recorded yet</div>
              ) : (
                <div className="space-y-2">
                  {overallLeaderboard.map((entry) => (
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
                      <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                        <span className="text-cyan-300">Total: {entry.totalScore.toLocaleString()}</span>
                        <span className="text-purple-300">Games: {entry.totalGames}</span>
                        <span className="text-yellow-300">Best: {entry.bestScore.toLocaleString()}</span>
                        <span className="text-gray-400">Wave {entry.bestWaves}</span>
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
                  {/* Connection Status */}
                  {!isConnected && (
                    <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 text-yellow-200 px-3 py-2 rounded-lg mb-2 text-xs text-center">
                      Connecting to chat...
                    </div>
                  )}

                  {/* Chat Messages Area */}
                  <div className="flex-1 bg-gray-800 bg-opacity-40 rounded-lg p-3 mb-3 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-8">
                        No messages yet. Be the first to chat!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((msg) => {
                          const isOwnMessage = user?.walletAddress === msg.walletAddress;
                          return (
                            <div
                              key={msg.id}
                              className={`${
                                isOwnMessage ? 'bg-cyan-900 bg-opacity-30' : 'bg-gray-700 bg-opacity-30'
                              } p-2 rounded-lg`}
                            >
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-cyan-400 text-xs font-bold">
                                  {msg.username || formatAddress(msg.walletAddress)}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {formatTimestamp(msg.createdAt)}
                                </span>
                              </div>
                              <div className="text-gray-200 text-sm break-words">
                                {msg.message}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleInputChange}
                      disabled={!isConnected}
                      placeholder={isConnected ? "Type a message..." : "Connecting..."}
                      maxLength={500}
                      className="flex-1 bg-gray-800 text-cyan-100 px-3 py-2 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!isConnected || !messageInput.trim()}
                      className="bg-cyan-600 text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
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
