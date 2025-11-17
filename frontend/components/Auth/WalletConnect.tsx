'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';

export function WalletConnectButton() {
  const { isConnected } = useAccount();
  const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton />

      {isConnected && !isAuthenticated && (
        <button
          onClick={signIn}
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg border border-cyan-400 text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In with Ethereum'}
        </button>
      )}

      {isAuthenticated && user && (
        <div className="text-center">
          <div className="text-cyan-400 font-bold">
            {user.username || `Player ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
          </div>
          <button
            onClick={signOut}
            className="mt-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
