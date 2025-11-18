'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  walletAddress: string;
  username: string | null;
  profilePicture: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedAutoSignIn, setHasAttemptedAutoSignIn] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = apiClient.getStoredUser();
      if (storedUser && apiClient.isAuthenticated()) {
        // Validate token by making a simple API call
        try {
          // Test if token is still valid
          await apiClient.getUserProgression();
          setUser(storedUser);
          // Dispatch login event for ProgressionContext
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:login'));
          }
        } catch (error) {
          // Token expired or invalid, clear it
          console.log('Stored token invalid, clearing...');
          apiClient.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout);
      return () => window.removeEventListener('auth:logout', handleLogout);
    }
  }, []);

  // Auto sign-out if wallet disconnects and reset auto sign-in flag
  useEffect(() => {
    if (!isConnected) {
      setHasAttemptedAutoSignIn(false); // Reset so it can try again on reconnect
      if (user) {
        signOut();
      }
    }
  }, [isConnected, user]);

  // Reset auto sign-in flag when address changes (user switches wallet)
  useEffect(() => {
    setHasAttemptedAutoSignIn(false);
  }, [address]);

  // Auto sign-in when wallet connects
  useEffect(() => {
    const attemptAutoSignIn = async () => {
      // Only attempt once per session to avoid loops
      if (hasAttemptedAutoSignIn) return;

      // Wait for initial loading to complete
      if (isLoading) return;

      // Check if wallet is connected, we have an address, but no authenticated user
      if (isConnected && address && !user) {
        console.log('Auto sign-in: Wallet connected, attempting SIWE...');
        setHasAttemptedAutoSignIn(true);
        try {
          await signIn();
        } catch (error) {
          console.error('Auto sign-in failed:', error);
          // Don't retry on this page load
        }
      }
    };

    attemptAutoSignIn();
  }, [isConnected, address, user, isLoading, hasAttemptedAutoSignIn]);

  const signIn = async () => {
    if (!address) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    try {
      // 1. Get challenge from backend
      const { message, nonce } = await apiClient.generateChallenge(address);

      // 2. Sign the message
      const signature = await signMessageAsync({ message });

      // 3. Verify signature and login
      const { user: authUser } = await apiClient.verifySignature(message, signature);

      setUser(authUser);

      // Dispatch login event for ProgressionContext
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:login'));
      }

      console.log('Sign in successful:', authUser);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      // Disconnect wallet
      disconnect();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update stored user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
