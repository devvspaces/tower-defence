'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const updatedUser = await apiClient.updateProfile({ username: username.trim() });
      updateUser(updatedUser);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-gray-900 bg-opacity-95 border-2 border-cyan-500 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">PROFILE</h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {user && (
          <div className="space-y-6">
            {/* Profile Picture Placeholder */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-cyan-500 mb-3">
                <svg className="w-12 h-12 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Profile picture coming soon</p>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-cyan-400 font-bold mb-2">Wallet Address</label>
              <div className="bg-gray-800 px-4 py-3 rounded-lg border border-gray-700 text-gray-300">
                {formatAddress(user.walletAddress)}
              </div>
            </div>

            {/* Username Form */}
            <form onSubmit={handleSubmit}>
              <label className="block text-cyan-400 font-bold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                maxLength={20}
                className="w-full bg-gray-800 text-cyan-100 px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none mb-4"
              />

              {error && (
                <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 px-4 py-2 rounded-lg mb-4">
                  Profile updated successfully!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-700 hover:bg-gray-600 text-cyan-400 font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
