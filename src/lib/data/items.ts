// Database Lengkap Item Mobile Legends: Bang Bang (MLBB Official Equipment System)

export interface MLBBItem {
  id: string;
  name: string;
  category: 'Physical' | 'Magic' | 'Defense' | 'Movement' | 'Jungle' | 'Roam';
  cost: number;
  icon: string;
  tier: 1 | 2 | 3;
  stats: {
    atk?: number;
    magic?: number;
    hp?: number;
    armor?: number;
    magicRes?: number;
    attackSpeed?: number;
    cooldown?: number;
    movementSpeed?: number;
    lifesteal?: number;
    critRate?: number;
  };
  passive?: string;
}

export const MLBB_ITEMS: MLBBItem[] = [
  // --- MOVEMENT (BOOTS) ---
  {
    id: 'tough_boots',
    name: 'Tough Boots',
    category: 'Movement',
    cost: 700,
    icon: '👢',
    tier: 2,
    stats: { movementSpeed: 40, magicRes: 22, cooldown: 0 },
    passive: 'Fortitude: Mengurangi durasi crowd control sebesar 30%.'
  },
  {
    id: 'warrior_boots',
    name: 'Warrior Boots',
    category: 'Movement',
    cost: 720,
    icon: '🥾',
    tier: 2,
    stats: { movementSpeed: 40, armor: 22 },
    passive: 'Valor: Meningkatkan Physical Defense saat menerima Basic Attack.'
  },
  {
    id: 'magic_shoes',
    name: 'Magic Shoes',
    category: 'Movement',
    cost: 710,
    icon: '👟',
    tier: 2,
    stats: { movementSpeed: 40, cooldown: 10 },
    passive: 'Cooldown Reduction +10%'
  },
  {
    id: 'swift_boots',
    name: 'Swift Boots',
    category: 'Movement',
    cost: 710,
    icon: '🥿',
    tier: 2,
    stats: { movementSpeed: 40, attackSpeed: 15 },
    passive: 'Attack Speed +15%'
  },
  {
    id: 'arcane_boots',
    name: 'Arcane Boots',
    category: 'Movement',
    cost: 690,
    icon: '🥾',
    tier: 2,
    stats: { movementSpeed: 40, magic: 10 },
    passive: 'Magic Penetration +10'
  },

  // --- PHYSICAL ATTACK ---
  {
    id: 'blade_of_despair',
    name: 'Blade of Despair',
    category: 'Physical',
    cost: 3010,
    icon: '🗡️',
    tier: 3,
    stats: { atk: 160, movementSpeed: 5 },
    passive: 'Despair: Menyerang musuh HP <50% meningkatkan Physical Attack sebesar 25%.'
  },
  {
    id: 'demon_hunter_sword',
    name: 'Demon Hunter Sword',
    category: 'Physical',
    cost: 2180,
    icon: '⚔️',
    tier: 3,
    stats: { atk: 35, attackSpeed: 25 },
    passive: 'Devour: Memberikan damage berdasarkan 8% sisa HP target.'
  },
  {
    id: 'malefic_roar',
    name: 'Malefic Roar',
    category: 'Physical',
    cost: 2060,
    icon: '🔫',
    tier: 3,
    stats: { atk: 60 },
    passive: 'Armor Buster: Memberikan hingga 40% Physical Penetration.'
  },
  {
    id: 'endless_battle',
    name: 'Endless Battle',
    category: 'Physical',
    cost: 2470,
    icon: '🔱',
    tier: 3,
    stats: { atk: 65, hp: 250, cooldown: 10, lifesteal: 8 },
    passive: 'Divine Justice: Setelah skill, Basic Attack berikutnya menghasilkan True Damage.'
  },
  {
    id: 'corrosion_scythe',
    name: 'Corrosion Scythe',
    category: 'Physical',
    cost: 2050,
    icon: '🪓',
    tier: 3,
    stats: { atk: 30, attackSpeed: 35, movementSpeed: 5 },
    passive: 'Corrosion: Memperlambat musuh dan meningkatkan Attack Speed.'
  },
  {
    id: 'hunter_strike',
    name: 'Hunter Strike',
    category: 'Physical',
    cost: 2010,
    icon: '🔪',
    tier: 3,
    stats: { atk: 80, cooldown: 10 },
    passive: 'Retaliation: Menyerang 5 kali meningkatkan Movement Speed sebesar 50%.'
  },
  {
    id: 'war_axe',
    name: 'War Axe',
    category: 'Physical',
    cost: 2100,
    icon: '🪓',
    tier: 3,
    stats: { atk: 40, hp: 550, cooldown: 10 },
    passive: 'Fighting Spirit: Memberikan bonus Physical Attack & True Damage seiring waktu.'
  },
  {
    id: 'wind_of_nature',
    name: 'Wind of Nature',
    category: 'Physical',
    cost: 1910,
    icon: '🍃',
    tier: 3,
    stats: { atk: 30, attackSpeed: 20, lifesteal: 10 },
    passive: 'Wind Chant: Kebal terhadap semua Physical Damage selama 2 detik.'
  },
  {
    id: 'sea_halberd',
    name: 'Sea Halberd',
    category: 'Physical',
    cost: 2050,
    icon: '🔱',
    tier: 3,
    stats: { atk: 80, attackSpeed: 25 },
    passive: 'Lifebane: Mengurangi Shield & HP Regen target sebesar 50%.'
  },

  // --- MAGIC ATTACK ---
  {
    id: 'holy_crystal',
    name: 'Holy Crystal',
    category: 'Magic',
    cost: 2180,
    icon: '💎',
    tier: 3,
    stats: { magic: 100 },
    passive: 'Mystery: Meningkatkan Magic Power sebesar 21% - 35%.'
  },
  {
    id: 'lightning_truncheon',
    name: 'Lightning Truncheon',
    category: 'Magic',
    cost: 2250,
    icon: '⚡',
    tier: 3,
    stats: { magic: 75, cooldown: 10 },
    passive: 'Resonate: Setiap 6 detik, skill menghasilkan petir memantul hingga ke 3 musuh.'
  },
  {
    id: 'genius_wand',
    name: 'Genius Wand',
    category: 'Magic',
    cost: 2000,
    icon: '🪄',
    tier: 3,
    stats: { magic: 75, movementSpeed: 5 },
    passive: 'Magic Defense Reduction: Mengurangi Magic Defense musuh secara kumulatif.'
  },
  {
    id: 'glowing_wand',
    name: 'Glowing Wand',
    category: 'Magic',
    cost: 2150,
    icon: '🔥',
    tier: 3,
    stats: { magic: 75, hp: 400, movementSpeed: 5 },
    passive: 'Scorch: Membakar target selama 3 detik dan mengurangi efek regen.'
  },
  {
    id: 'divine_glaive',
    name: 'Divine Glaive',
    category: 'Magic',
    cost: 1970,
    icon: '🪡',
    tier: 3,
    stats: { magic: 65 },
    passive: 'Spellbreaker: Meningkatkan Magic Penetration hingga 38%.'
  },
  {
    id: 'blood_wings',
    name: 'Blood Wings',
    category: 'Magic',
    cost: 3000,
    icon: '🪽',
    tier: 3,
    stats: { magic: 175, hp: 500 },
    passive: 'Guard: Memberikan shield tebal berbasis Magic Power.'
  },
  {
    id: 'winter_crown',
    name: 'Winter Crown',
    category: 'Magic',
    cost: 1910,
    icon: '❄️',
    tier: 3,
    stats: { magic: 45, atk: 45, armor: 20, magicRes: 20 },
    passive: 'Frozen: Membekukan diri selama 2 detik, kebal terhadap semua serangan.'
  },

  // --- DEFENSE ---
  {
    id: 'immortality',
    name: 'Immortality',
    category: 'Defense',
    cost: 2120,
    icon: '🛡️',
    tier: 3,
    stats: { hp: 800, armor: 20 },
    passive: 'Immortal: Hidup kembali 2.5 detik setelah tereliminasi dengan 16% HP & Shield.'
  },
  {
    id: 'athenas_shield',
    name: "Athena's Shield",
    category: 'Defense',
    cost: 2150,
    icon: '🔰',
    tier: 3,
    stats: { hp: 900, magicRes: 48 },
    passive: 'Shield: Mengurangi Magic Damage yang diterima sebesar 25% selama 3 detik.'
  },
  {
    id: 'dominance_ice',
    name: 'Dominance Ice',
    category: 'Defense',
    cost: 2010,
    icon: '❄️',
    tier: 3,
    stats: { armor: 70, cooldown: 10 },
    passive: 'Arctic Cold: Mengurangi Attack Speed musuh sebesar 70% dan HP Regen 50%.'
  },
  {
    id: 'radiant_armor',
    name: 'Radiant Armor',
    category: 'Defense',
    cost: 1880,
    icon: '✨',
    tier: 3,
    stats: { hp: 950, magicRes: 40 },
    passive: 'Holy Blessing: Meningkatkan Magic Damage Reduction terus-menerus.'
  },
  {
    id: 'antique_cuirass',
    name: 'Antique Cuirass',
    category: 'Defense',
    cost: 2170,
    icon: '🦺',
    tier: 3,
    stats: { hp: 920, armor: 40 },
    passive: 'Deter: Mengurangi Physical Attack musuh saat terkena skill.'
  },
  {
    id: 'blade_armor',
    name: 'Blade Armor',
    category: 'Defense',
    cost: 1960,
    icon: '🗡️',
    tier: 3,
    stats: { armor: 90 },
    passive: 'Bladed Armor: Memantulkan 20% Physical Damage kembali ke penyerang.'
  },
  {
    id: 'queens_wings',
    name: "Queen's Wings",
    category: 'Defense',
    cost: 2250,
    icon: '🦅',
    tier: 3,
    stats: { atk: 15, hp: 900, cooldown: 10 },
    passive: 'Demonize: Mengurangi damage yang diterima saat HP rendah dan reset cooldown skill.'
  },
  {
    id: 'thunder_belt',
    name: 'Thunder Belt',
    category: 'Defense',
    cost: 2290,
    icon: '⚡',
    tier: 3,
    stats: { hp: 800, armor: 30, magicRes: 30, cooldown: 10 },
    passive: 'Thunderbolt: Basic Attack setelah skill memberikan True Damage dan slow area.'
  },
  {
    id: 'guardian_helmet',
    name: 'Guardian Helmet',
    category: 'Defense',
    cost: 2200,
    icon: '🪖',
    tier: 3,
    stats: { hp: 1550 },
    passive: 'Recovery: Memulihkan HP secara masif saat berada di luar pertarungan.'
  }
];

// Role Item Progression Templates (6 Items Build Paths)
export const ROLE_BUILD_PATHS: Record<string, string[]> = {
  Marksman: [
    'swift_boots',
    'corrosion_scythe',
    'demon_hunter_sword',
    'wind_of_nature',
    'malefic_roar',
    'immortality'
  ],
  Mage: [
    'arcane_boots',
    'lightning_truncheon',
    'genius_wand',
    'holy_crystal',
    'divine_glaive',
    'winter_crown'
  ],
  Assassin: [
    'tough_boots',
    'hunter_strike',
    'war_axe',
    'endless_battle',
    'malefic_roar',
    'blade_of_despair'
  ],
  Fighter: [
    'warrior_boots',
    'war_axe',
    'brute_force_breastplate',
    'dominance_ice',
    'queens_wings',
    'immortality'
  ],
  Tank: [
    'tough_boots',
    'dominance_ice',
    'athenas_shield',
    'antique_cuirass',
    'blade_armor',
    'immortality'
  ],
  Support: [
    'magic_shoes',
    'dominance_ice',
    'radiant_armor',
    'athenas_shield',
    'winter_crown',
    'immortality'
  ]
};

export const getItemById = (id: string): MLBBItem | undefined => {
  return MLBB_ITEMS.find(item => item.id === id);
};

export const getHeroPurchasedItems = (role: string, gold: number): MLBBItem[] => {
  const path = ROLE_BUILD_PATHS[role] || ROLE_BUILD_PATHS['Fighter'];
  // Item costs milestones:
  // Item 1 (Boots): ~700g
  // Item 2: ~2,500g
  // Item 3: ~4,600g
  // Item 4: ~6,800g
  // Item 5: ~9,000g
  // Item 6: ~11,500g
  const thresholds = [700, 2600, 4800, 7000, 9200, 11600];
  const items: MLBBItem[] = [];

  thresholds.forEach((th, idx) => {
    if (gold >= th && path[idx]) {
      const item = getItemById(path[idx]);
      if (item) items.push(item);
    }
  });

  return items;
};
