import { MatchDifficultyCondition, MatchDifficultyKey } from '@/types';

// Preset Kondisi & Tingkat Kesulitan Lawan Acak
export const DIFFICULTY_PRESETS: Record<MatchDifficultyKey, MatchDifficultyCondition> = {
  god_mode: {
    key: 'god_mode',
    name: 'GOD MODE / ULTRA INSTINCT',
    badgeColor: '#e74c3c',
    bgGradient: 'from-red-950 via-purple-950 to-black',
    icon: '🌟',
    description: 'Lawan bermain di puncak performa (200% mechanical IQ). Rotasi kilat, counter pick kejam, dan perebutan Lord yang sangat mematikan!',
    aiDraftBonus: 45,
    aiCombatMultiplier: 1.35,
    aiReactionSpeedMs: 300,
    aiRetributionAccuracy: 0.95,
    formBonusText: '+35% ATK & Retri Godlike'
  },
  prime: {
    key: 'prime',
    name: 'PRIME FORM / ON-FIRE',
    badgeColor: '#f39c12',
    bgGradient: 'from-orange-950 via-amber-950 to-black',
    icon: '🔥',
    description: 'Lawan sedang on-fire dan sangat solid. Koordinasi 5-man teamfight sangat rapi dan disiplin tinggi.',
    aiDraftBonus: 25,
    aiCombatMultiplier: 1.18,
    aiReactionSpeedMs: 450,
    aiRetributionAccuracy: 0.80,
    formBonusText: '+18% ATK & Solid War'
  },
  balanced: {
    key: 'balanced',
    name: 'BALANCED / COMPETITIVE',
    badgeColor: '#3498db',
    bgGradient: 'from-blue-950 via-slate-900 to-black',
    icon: '⚖️',
    description: 'Pertandingan kompetitif standar MPL ID. Kedua tim bermain seimbang sesuai dengan rating roster.',
    aiDraftBonus: 0,
    aiCombatMultiplier: 1.0,
    aiReactionSpeedMs: 650,
    aiRetributionAccuracy: 0.65,
    formBonusText: 'Normal Competitive Form'
  },
  slump: {
    key: 'slump',
    name: 'OFF-DAY / SLUMP',
    badgeColor: '#27ae60',
    bgGradient: 'from-emerald-950 via-slate-900 to-black',
    icon: '🌧️',
    description: 'Lawan sedang mengalami miskomunikasi dan underperform! Rotasi mereka lambat dan rentan terkena pick-off.',
    aiDraftBonus: -25,
    aiCombatMultiplier: 0.82,
    aiReactionSpeedMs: 900,
    aiRetributionAccuracy: 0.40,
    formBonusText: '-18% ATK (Peluang Menang Tinggi!)'
  },
  wildcard: {
    key: 'wildcard',
    name: 'WILD CARD / POCKET CHEESE',
    badgeColor: '#9b59b6',
    bgGradient: 'from-fuchsia-950 via-purple-950 to-black',
    icon: '🎭',
    description: 'Lawan menggunakan strategi tak terduga (Pocket Pick / Cheese Draft)! Gaya main agresif dan tidak beraturan.',
    aiDraftBonus: 30,
    aiCombatMultiplier: 1.22,
    aiReactionSpeedMs: 500,
    aiRetributionAccuracy: 0.75,
    formBonusText: 'High Volatility & Cheese Picks'
  }
};

/**
 * Mengocok tingkat kesulitan & kondisi lawan secara acak dengan bobot probabilitas
 */
export function rollRandomMatchDifficulty(): MatchDifficultyCondition {
  const rand = Math.random() * 100;

  if (rand < 15) {
    return DIFFICULTY_PRESETS.god_mode; // 15% God Mode
  } else if (rand < 45) {
    return DIFFICULTY_PRESETS.prime;    // 30% Prime Form
  } else if (rand < 75) {
    return DIFFICULTY_PRESETS.balanced; // 30% Balanced
  } else if (rand < 90) {
    return DIFFICULTY_PRESETS.slump;    // 15% Off-day
  } else {
    return DIFFICULTY_PRESETS.wildcard; // 10% Wildcard
  }
}
