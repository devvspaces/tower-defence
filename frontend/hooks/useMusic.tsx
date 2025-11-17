'use client';

import { useEffect, useRef, useState } from 'react';

export type MusicTrack = 'main' | 'game-session';

export function useMusic(enabled: boolean, volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create audio element
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Try to play on first user interaction
    const handleInteraction = () => {
      setIsReady(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle enable/disable
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (enabled && isReady) {
      audioRef.current.play().catch(error => {
        console.log('Music autoplay prevented:', error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [enabled, isReady, currentTrack]);

  const playTrack = (track: MusicTrack) => {
    if (!audioRef.current) return;

    // Don't reload if same track
    if (currentTrack === track) {
      if (enabled && isReady) {
        audioRef.current.play().catch(error => {
          console.log('Music autoplay prevented:', error);
        });
      }
      return;
    }

    audioRef.current.src = `/sounds/${track}.mp3`;
    audioRef.current.load();
    setCurrentTrack(track);

    if (enabled && isReady) {
      audioRef.current.play().catch(error => {
        console.log('Music autoplay prevented:', error);
      });
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTrack(null);
  };

  return {
    playTrack,
    stopMusic,
    currentTrack,
    isReady,
  };
}
