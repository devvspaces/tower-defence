'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = apiClient.getStoredUser();
    if (storedUser && apiClient.isAuthenticated()) {
      setUser(storedUser);
    }
    setIsLoading(false);
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

  // Auto sign-out if wallet disconnects
  useEffect(() => {
    if (!isConnected && user) {
      signOut();
    }
  }, [isConnected, user]);

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
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
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
