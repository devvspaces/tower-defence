'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '@/hooks/useAuth';

export function WalletConnectButton() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center gap-3">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="bg-gray-900 hover:bg-gray-800 text-cyan-400 font-bold py-3 px-8 rounded-lg border-2 border-cyan-500 text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
                      style={{
                        textShadow: '0 0 10px rgba(0,255,255,0.5)'
                      }}
                    >
                      🔌 CONNECT WALLET
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-red-900 hover:bg-red-800 text-red-200 font-bold py-3 px-8 rounded-lg border-2 border-red-500 text-lg transition-all"
                    >
                      ⚠️ Wrong Network
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-gray-900 hover:bg-gray-800 text-cyan-400 px-3 py-2 rounded-lg border border-cyan-500 transition-all flex items-center gap-2"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 20, height: 20 }}
                            />
                          )}
                        </div>
                      )}
                      <span className="text-sm font-bold">{chain.name}</span>
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gray-900 hover:bg-gray-800 text-cyan-400 font-bold px-4 py-2 rounded-lg border-2 border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {account.displayName}
                        </span>
                        {account.displayBalance && (
                          <span className="text-xs text-gray-400">
                            {account.displayBalance}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {isAuthenticated && user && (
        <div className="text-center bg-gray-900 bg-opacity-60 border border-cyan-500 rounded-lg px-6 py-3">
          <div className="text-cyan-400 font-bold mb-1" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
            ✓ AUTHENTICATED
          </div>
          <div className="text-gray-300 text-sm mb-2">
            {user.username || `Player ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
          </div>
          <button
            onClick={signOut}
            className="text-xs text-gray-400 hover:text-cyan-400 transition-colors underline"
          >
            Sign Out
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-cyan-400 text-sm animate-pulse">
          Authenticating...
        </div>
      )}
    </div>
  );
}
