'use client';

import React, { useEffect, useState } from 'react';

interface LevelUpNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  reward?: {
    type: 'tower' | 'upgrade' | 'currency' | 'bonus';
    name: string;
    description?: string;
    icon?: string;
  };
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  reward
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-yellow-500 rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${
          show ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 40px rgba(234, 179, 8, 0.5), 0 0 80px rgba(234, 179, 8, 0.3)'
        }}
      >
        {/* Animated Stars */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
                fontSize: `${8 + Math.random() * 12}px`,
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative text-center">
          <h2
            className="text-6xl font-bold text-yellow-400 mb-4 animate-pulse"
            style={{
              textShadow: '0 0 20px rgba(234, 179, 8, 0.8), 0 0 40px rgba(234, 179, 8, 0.4)'
            }}
          >
            🌟 LEVEL UP! 🌟
          </h2>

          <div className="text-5xl font-bold text-white mb-6">
            Level {oldLevel} → {newLevel}
          </div>

          <div className="flex justify-center items-center gap-2 mb-6">
            {[...Array(newLevel)].map((_, i) => (
              <span
                key={i}
                className="text-yellow-400 text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ⭐
              </span>
            ))}
          </div>

          {reward && (
            <>
              <div className="bg-gray-800 bg-opacity-50 border-2 border-yellow-500 rounded-lg p-6 mb-6">
                <p className="text-yellow-400 font-bold text-xl mb-3">
                  🎁 NEW REWARD UNLOCKED!
                </p>

                <div className="bg-gray-900 rounded-lg p-4 border border-yellow-600">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {reward.icon && <span className="text-4xl">{reward.icon}</span>}
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">
                        {reward.type === 'tower' && '🏰 Tower: '}
                        {reward.type === 'upgrade' && '⬆️ Upgrade: '}
                        {reward.type === 'currency' && '💰 Bonus: '}
                        {reward.type === 'bonus' && '🎁 Reward: '}
                        {reward.name}
                      </p>
                      {reward.description && (
                        <p className="text-gray-400 text-sm mt-1">{reward.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleClose}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg text-xl transition-all transform hover:scale-105 border-2 border-yellow-400"
            style={{
              boxShadow: '0 0 20px rgba(234, 179, 8, 0.5)'
            }}
          >
            AWESOME!
          </button>
        </div>
      </div>
    </div>
  );
};
