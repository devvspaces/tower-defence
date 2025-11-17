'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="bg-gray-900 bg-opacity-90 rounded-lg border-4 border-cyan-500 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex justify-between items-center border-b-4 border-cyan-400">
          <h2 className="text-2xl font-bold text-white retro-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Defend the Citadel">
      <div className="text-white space-y-4">
        <section>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">🎮 Game Controls</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><span className="text-yellow-400">Select a Tower:</span> Click on any tower button on the right panel</li>
            <li><span className="text-yellow-400">Place Tower:</span> Click on the game field (not on the path!)</li>
            <li><span className="text-yellow-400">Use Nuke:</span> Click the nuke button to destroy all enemies (limited charges)</li>
            <li><span className="text-yellow-400">Filter Towers:</span> Use category buttons to show specific tower types</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">⚔️ Combat System</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Towers automatically target and attack enemies within range</li>
            <li>Towers prioritize enemies furthest along the path</li>
            <li>Different towers have different attack patterns and effects</li>
            <li>Combine tower types for maximum effectiveness</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">🌊 Wave System</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Waves start automatically after 15 seconds</li>
            <li>Clear all enemies to progress to the next wave</li>
            <li>15 second break between waves to build defenses</li>
            <li>10 waves total - survive them all to win!</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">💰 Economy</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Start with $600 to build your initial defenses</li>
            <li>Earn money by defeating enemies</li>
            <li>Stronger enemies give more money</li>
            <li>Plan your spending wisely!</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">🎯 Strategy Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><span className="text-red-400">Physical towers</span> are cost-effective for consistent damage</li>
            <li><span className="text-purple-400">Magic towers</span> have special effects and AOE damage</li>
            <li><span className="text-blue-400">Support towers</span> slow and control enemy movement</li>
            <li>Combine Cryo Stasis with damage towers for devastating results</li>
            <li>Use Gravity Wells at path corners to maximize slow time</li>
            <li>Save nukes for overwhelming waves or emergencies</li>
          </ul>
        </section>
      </div>
    </Modal>
  );
};

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enemy & Tower Intel">
      <div className="text-white space-y-6">
        <section>
          <h3 className="text-2xl font-bold text-red-400 mb-3">👾 Enemy Types</h3>

          <h4 className="text-lg font-bold text-orange-300 mt-3 mb-2">Basic Enemies</h4>
          <div className="space-y-2 grid grid-cols-2 gap-2">
            <div className="bg-slate-800 p-2 rounded border-l-4 border-red-500">
              <h4 className="font-bold text-red-300 text-sm">👾 Void Walker</h4>
              <p className="text-xs text-gray-300">HP: 50 | Spd: 1x | Dmg: 1 | $25</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-orange-500">
              <h4 className="font-bold text-orange-300 text-sm">⚡ Phase Shifter</h4>
              <p className="text-xs text-gray-300">HP: 30 | Spd: 2x | Dmg: 1 | $30</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-purple-500">
              <h4 className="font-bold text-purple-300 text-sm">🛡️ Void Titan</h4>
              <p className="text-xs text-gray-300">HP: 150 | Spd: 0.5x | Dmg: 2 | $50</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-green-500">
              <h4 className="font-bold text-green-300 text-sm">🦟 Swarm Drone</h4>
              <p className="text-xs text-gray-300">HP: 20 | Spd: 1.5x | Dmg: 1 | $15</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-pink-500">
              <h4 className="font-bold text-pink-300 text-sm">👹 Void Champion</h4>
              <p className="text-xs text-gray-300">HP: 200 | Spd: 0.8x | Dmg: 3 | $75</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-red-700">
              <h4 className="font-bold text-red-400 text-sm">💀 Corruption Lord</h4>
              <p className="text-xs text-gray-300">HP: 500 | Spd: 0.3x | Dmg: 5 | $150</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-teal-500">
              <h4 className="font-bold text-teal-300 text-sm">🔮 Void Mender</h4>
              <p className="text-xs text-gray-300">HP: 80 | Spd: 0.7x | Dmg: 1 | $60</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-purple-400">
              <h4 className="font-bold text-purple-400 text-sm">🦇 Sky Terror</h4>
              <p className="text-xs text-gray-300">HP: 40 | Spd: 2.5x | Dmg: 1 | $40</p>
            </div>
          </div>

          <h4 className="text-lg font-bold text-yellow-300 mt-4 mb-2">Resistant Enemies</h4>
          <div className="space-y-2 grid grid-cols-2 gap-2">
            <div className="bg-slate-800 p-2 rounded border-l-4 border-gray-500">
              <h4 className="font-bold text-gray-300 text-sm">🛡️ Armored Knight</h4>
              <p className="text-xs text-gray-300">HP: 180 | Dmg: 2 | $80</p>
              <p className="text-xs text-yellow-400">75% Physical Resist</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-purple-300">
              <h4 className="font-bold text-purple-300 text-sm">👻 Ethereal Wraith</h4>
              <p className="text-xs text-gray-300">HP: 120 | Dmg: 2 | $90</p>
              <p className="text-xs text-yellow-400">100% Magic Immune</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-cyan-400">
              <h4 className="font-bold text-cyan-300 text-sm">💎 Crystal Golem</h4>
              <p className="text-xs text-gray-300">HP: 300 | Dmg: 3 | $120</p>
              <p className="text-xs text-yellow-400">50% All Resist</p>
            </div>
          </div>

          <h4 className="text-lg font-bold text-red-300 mt-4 mb-2">Special Enemies</h4>
          <div className="space-y-2 grid grid-cols-2 gap-2">
            <div className="bg-slate-800 p-2 rounded border-l-4 border-orange-600">
              <h4 className="font-bold text-orange-300 text-sm">🔨 Demolisher</h4>
              <p className="text-xs text-gray-300">HP: 250 | Dmg: 4 | $100</p>
              <p className="text-xs text-red-400">Attacks Towers!</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-green-400">
              <h4 className="font-bold text-green-300 text-sm">🩸 Regenerator</h4>
              <p className="text-xs text-gray-300">HP: 150 | Dmg: 2 | $85</p>
              <p className="text-xs text-green-400">Heals 3% HP/sec</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-pink-400">
              <h4 className="font-bold text-pink-300 text-sm">🌪️ Speed Demon</h4>
              <p className="text-xs text-gray-300">HP: 100 | Dmg: 2 | $70</p>
              <p className="text-xs text-pink-400">Speeds up as HP drops</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-yellow-400">
              <h4 className="font-bold text-yellow-300 text-sm">💰 Gold Thief</h4>
              <p className="text-xs text-gray-300">HP: 60 | Dmg: 1 | $0</p>
              <p className="text-xs text-yellow-400">Steals $100 if reaches end!</p>
            </div>
            <div className="bg-slate-800 p-2 rounded border-l-4 border-red-900">
              <h4 className="font-bold text-red-300 text-sm">🐉 Void Juggernaut</h4>
              <p className="text-xs text-gray-300">HP: 800 | Dmg: 8 | $200</p>
              <p className="text-xs text-red-400">40% All Resist, Devastating</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-cyan-400 mb-3">🏰 Defense Systems</h3>

          <h4 className="text-lg font-bold text-red-300 mt-4 mb-2">⚔️ Physical Attack</h4>
          <div className="space-y-2">
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-red-200">🏹 Sentinel Crossbow</span> - $100 | Dmg: 10 | Range: 120 | Rate: 1/s
              <p className="text-xs text-gray-400">Ancient automated defense, precise and reliable</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-red-200">🎯 Void Piercer</span> - $200 | Dmg: 35 | Range: 220 | Rate: 0.5/s
              <p className="text-xs text-gray-400">Experimental railgun that tears through dimensional fabric</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-orange-200">💥 Thunder Howitzer</span> - $180 | Dmg: 25 | Range: 100 | Rate: 1.5/s
              <p className="text-xs text-gray-400">Explosive artillery creating shockwaves of destruction (AOE 50px)</p>
            </div>
          </div>

          <h4 className="text-lg font-bold text-purple-300 mt-4 mb-2">✨ Magic Attack</h4>
          <div className="space-y-2">
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-purple-200">🔥 Inferno Conduit</span> - $250 | Dmg: 20 | Range: 140 | Rate: 0.8/s
              <p className="text-xs text-gray-400">Channels pure flame from the elemental plane (AOE 60px)</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-purple-200">⚡ Storm Caller</span> - $300 | Dmg: 15 | Range: 160 | Rate: 1.2/s
              <p className="text-xs text-gray-400">Summons chain lightning from the tempest realm (chains to 3 enemies)</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-indigo-200">✨ Aether Spire</span> - $350 | Dmg: 40 | Range: 150 | Rate: 0.6/s
              <p className="text-xs text-gray-400">Harnesses raw reality-bending energy</p>
            </div>
          </div>

          <h4 className="text-lg font-bold text-blue-300 mt-4 mb-2">🛡️ Support/Magic Defense</h4>
          <div className="space-y-2">
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-cyan-200">❄️ Cryo Stasis Matrix</span> - $200 | Dmg: 5 | Range: 130 | Rate: 1/s
              <p className="text-xs text-gray-400">Freezes enemies in temporal suspension (2s freeze)</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-cyan-200">🌀 Gravity Well</span> - $150 | Dmg: 3 | Range: 150 | Rate: 1.5/s
              <p className="text-xs text-gray-400">Warps spacetime to slow enemy movement (50% slow for 3s)</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-green-200">☠️ Plague Spewer</span> - $180 | Dmg: 8 | Range: 120 | Rate: 0.7/s
              <p className="text-xs text-gray-400">Spreads bio-engineered corruption toxin (5 dmg/s for 4s)</p>
            </div>
          </div>

          <h4 className="text-lg font-bold text-yellow-300 mt-4 mb-2">💡 Utility & Special</h4>
          <div className="space-y-2">
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-blue-200">📡 Damage Amplifier</span> - $250 | Range: 150
              <p className="text-xs text-gray-400">Increases damage of nearby towers by 40%</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-yellow-200">💰 Resource Collector</span> - $300
              <p className="text-xs text-gray-400">Generates $8 per second passively</p>
            </div>
            <div className="bg-slate-800 p-2 rounded text-sm">
              <span className="font-bold text-purple-200">🌟 Dual Element Core</span> - $400 | Dmg: 25 | Range: 140 | Rate: 1/s
              <p className="text-xs text-gray-400">Hybrid damage bypasses all resistances</p>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};
