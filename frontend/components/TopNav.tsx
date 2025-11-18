'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WalletConnectButton } from './Auth/WalletConnect';

interface TopNavProps {
  onOpenSettings: () => void;
  onOpenInfo: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  gameInProgress?: boolean;
  onPauseGame?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSettings,
  onOpenInfo,
  onOpenHelp,
  onOpenProfile,
  gameInProgress = false,
  onPauseGame,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    if (gameInProgress && onPauseGame) {
      onPauseGame();
    }
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    signOut();
  };

  return (
    <nav className="bg-gray-900 bg-opacity-70 border border-purple-500 rounded-lg backdrop-blur-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏰</div>
          <h1 className="text-xl font-bold text-blue-400" style={{
            textShadow: '0 0 10px rgba(96,165,250,0.5)'
          }}>
            ETERNAL CITADEL
          </h1>
        </div>

        {/* Center - Wallet Connect */}
        <div className="flex-1 flex justify-center">
          <WalletConnectButton />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-gray-800 text-blue-400 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 transition-all"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={onOpenInfo}
            className="p-2 rounded-lg bg-gray-800 text-blue-400 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 transition-all"
            title="Intel Database"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-gray-800 text-blue-400 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 transition-all"
            title="Training"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>

          {isAuthenticated && (
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-lg bg-gray-800 text-blue-400 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 transition-all"
              title="Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogoutClick}
              className="p-2 rounded-lg bg-red-900 bg-opacity-50 text-red-400 hover:bg-red-800 border border-red-700 hover:border-red-500 transition-all"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="bg-gray-900 bg-opacity-90 border-2 border-red-500 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-400">⚠️ CONFIRM LOGOUT</h2>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-red-400 hover:text-red-300 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-200">Are you sure you want to sign out?</p>

              {gameInProgress && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-200 p-3 rounded-lg">
                  <p className="font-bold mb-1">⚠️ WARNING</p>
                  <p className="text-sm">Your current game is in progress. All game progress will be lost if you log out now.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg border border-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg border border-red-500 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
