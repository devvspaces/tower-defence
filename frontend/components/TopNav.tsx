'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WalletConnectButton } from './Auth/WalletConnect';

interface TopNavProps {
  onOpenSettings: () => void;
  onOpenInfo: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSettings,
  onOpenInfo,
  onOpenHelp,
  onOpenProfile,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <nav className="bg-gray-900 bg-opacity-80 border border-cyan-500 rounded-lg">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏰</div>
          <h1 className="text-xl font-bold text-cyan-400" style={{
            textShadow: '0 0 10px rgba(0,255,255,0.5)'
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
            className="p-2 rounded-lg bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 transition-all"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={onOpenInfo}
            className="p-2 rounded-lg bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 transition-all"
            title="Intel Database"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 transition-all"
            title="Training"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>

          {isAuthenticated && (
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-lg bg-gray-800 text-cyan-400 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500 transition-all"
              title="Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
