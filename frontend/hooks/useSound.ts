import { useEffect, useRef, useState } from 'react';

export type SoundType =
  | 'menuClick'
  | 'towerPlace'
  | 'basicShoot'
  | 'sniperShoot'
  | 'cannonShoot'
  | 'fireShoot'
  | 'lightningShoot'
  | 'arcaneShoot'
  | 'iceShoot'
  | 'slowShoot'
  | 'poisonShoot'
  | 'enemyHit'
  | 'enemyDeath'
  | 'nuke'
  | 'waveStart'
  | 'gameOver'
  | 'victory';

// Using Web Audio API to generate retro sound effects
class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Master volume
    }
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  play(type: SoundType) {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    const time = ctx.currentTime;

    switch (type) {
      case 'menuClick':
        this.playBeep(600, 0.1, 0.05);
        break;

      case 'towerPlace':
        this.playBeep(400, 0.15, 0.1);
        setTimeout(() => this.playBeep(600, 0.15, 0.1), 50);
        break;

      case 'basicShoot':
        this.playShoot(800, 400, 0.08);
        break;

      case 'sniperShoot':
        this.playShoot(1200, 200, 0.12);
        break;

      case 'cannonShoot':
        this.playExplosion(150, 0.2);
        break;

      case 'fireShoot':
        this.playFire();
        break;

      case 'lightningShoot':
        this.playLightning();
        break;

      case 'arcaneShoot':
        this.playArcane();
        break;

      case 'iceShoot':
        this.playIce();
        break;

      case 'slowShoot':
        this.playSlow();
        break;

      case 'poisonShoot':
        this.playPoison();
        break;

      case 'enemyHit':
        this.playBeep(200, 0.05, 0.03);
        break;

      case 'enemyDeath':
        this.playDeath();
        break;

      case 'nuke':
        this.playNuke();
        break;

      case 'waveStart':
        this.playWaveStart();
        break;

      case 'gameOver':
        this.playGameOver();
        break;

      case 'victory':
        this.playVictory();
        break;
    }
  }

  private playBeep(freq: number, volume: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.value = freq;
    osc.type = 'square';

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }

  private playShoot(startFreq: number, endFreq: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }

  private playExplosion(freq: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const noise = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(this.audioContext.currentTime);
    noise.stop(this.audioContext.currentTime + duration);
  }

  private playFire() {
    if (!this.audioContext || !this.masterGain) return;
    this.playExplosion(300, 0.15);
    setTimeout(() => this.playBeep(150, 0.1, 0.05), 30);
  }

  private playLightning() {
    if (!this.audioContext || !this.masterGain) return;
    this.playExplosion(2000, 0.08);
    this.playBeep(1500, 0.15, 0.06);
  }

  private playArcane() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(600, 0.12, 0.08);
    setTimeout(() => this.playBeep(800, 0.12, 0.08), 40);
    setTimeout(() => this.playBeep(1000, 0.12, 0.08), 80);
  }

  private playIce() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(1200, 0.1, 0.1);
    setTimeout(() => this.playBeep(900, 0.1, 0.1), 50);
  }

  private playSlow() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(400, 0.08, 0.15);
  }

  private playPoison() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(250, 0.1, 0.12);
    setTimeout(() => this.playBeep(230, 0.08, 0.1), 60);
  }

  private playDeath() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(400, 0.12, 0.05);
    setTimeout(() => this.playBeep(200, 0.12, 0.05), 50);
    setTimeout(() => this.playBeep(100, 0.12, 0.1), 100);
  }

  private playNuke() {
    if (!this.audioContext || !this.masterGain) return;
    this.playExplosion(100, 0.5);
    setTimeout(() => this.playExplosion(80, 0.6), 100);
    setTimeout(() => this.playExplosion(60, 0.7), 200);
  }

  private playWaveStart() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(300, 0.15, 0.1);
    setTimeout(() => this.playBeep(400, 0.15, 0.1), 100);
    setTimeout(() => this.playBeep(500, 0.15, 0.15), 200);
  }

  private playGameOver() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(500, 0.2, 0.2);
    setTimeout(() => this.playBeep(400, 0.2, 0.2), 200);
    setTimeout(() => this.playBeep(300, 0.2, 0.2), 400);
    setTimeout(() => this.playBeep(200, 0.2, 0.4), 600);
  }

  private playVictory() {
    if (!this.audioContext || !this.masterGain) return;
    this.playBeep(400, 0.15, 0.1);
    setTimeout(() => this.playBeep(500, 0.15, 0.1), 100);
    setTimeout(() => this.playBeep(600, 0.15, 0.1), 200);
    setTimeout(() => this.playBeep(800, 0.15, 0.3), 300);
  }
}

export function useSound(enabled: boolean = true, volume: number = 0.5) {
  const soundGenerator = useRef<SoundGenerator | null>(null);

  useEffect(() => {
    soundGenerator.current = new SoundGenerator();
  }, []);

  useEffect(() => {
    if (soundGenerator.current) {
      soundGenerator.current.setVolume(enabled ? volume : 0);
    }
  }, [volume, enabled]);

  const playSound = (type: SoundType) => {
    if (soundGenerator.current && enabled) {
      soundGenerator.current.play(type);
    }
  };

  return {
    playSound,
  };
}
