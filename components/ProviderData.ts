export interface Provider {
  id: number;
  name: string;
  category: 'cricket' | 'slot' | '3d-game' | 'live-casino' | 'fishing' | 'esports' | 'sports';
  icon: string;
}

export const providersData: Provider[] = [
  // Cricket
  {
    id: 1,
    name: 'BetConstruct',
    category: 'cricket',
    icon: '🏏'
  },
  {
    id: 2,
    name: 'Betfair Exchange',
    category: 'cricket',
    icon: '🏏'
  },
  {
    id: 3,
    name: 'Dafabet Sportsbook',
    category: 'cricket',
    icon: '🏏'
  },
  {
    id: 4,
    name: 'Parimatch',
    category: 'cricket',
    icon: '🏏'
  },
  {
    id: 5,
    name: '1xBet',
    category: 'cricket',
    icon: '🏏'
  },
  // Slot Providers
  {
    id: 6,
    name: 'Pragmatic Play',
    category: 'slot',
    icon: '🎰'
  },
  {
    id: 7,
    name: 'PG Soft (Pocket Games Soft)',
    category: 'slot',
    icon: '🎰'
  },
  {
    id: 8,
    name: 'NetEnt',
    category: 'slot',
    icon: '🎰'
  },
  {
    id: 9,
    name: 'Microgaming',
    category: 'slot',
    icon: '🎰'
  },
  {
    id: 10,
    name: "Play'n GO",
    category: 'slot',
    icon: '🎰'
  },
  // 3D Game Providers
  {
    id: 11,
    name: 'Spadegaming',
    category: '3d-game',
    icon: '🎮'
  },
  {
    id: 12,
    name: 'Evoplay Entertainment',
    category: '3d-game',
    icon: '🎮'
  },
  {
    id: 13,
    name: 'Betsoft Gaming',
    category: '3d-game',
    icon: '🎮'
  },
  {
    id: 14,
    name: 'KA Gaming',
    category: '3d-game',
    icon: '🎮'
  },
  {
    id: 15,
    name: 'JILI Games',
    category: '3d-game',
    icon: '🎮'
  },
  // Live Casino
  {
    id: 16,
    name: 'Evolution Gaming',
    category: 'live-casino',
    icon: '🎲'
  },
  {
    id: 17,
    name: 'Pragmatic Play Live',
    category: 'live-casino',
    icon: '🎲'
  },
  {
    id: 18,
    name: 'Ezugi',
    category: 'live-casino',
    icon: '🎲'
  },
  {
    id: 19,
    name: 'SA Gaming',
    category: 'live-casino',
    icon: '🎲'
  },
  {
    id: 20,
    name: 'Vivo Gaming',
    category: 'live-casino',
    icon: '🎲'
  },
  // Fishing Games
  {
    id: 21,
    name: 'JILI (Fishing Game series)',
    category: 'fishing',
    icon: '🎣'
  },
  {
    id: 22,
    name: 'Spadegaming (Fishing War)',
    category: 'fishing',
    icon: '🎣'
  },
  {
    id: 23,
    name: "Playtech (Fishin' Frenzy series)",
    category: 'fishing',
    icon: '🎣'
  },
  {
    id: 24,
    name: 'GG Fishing',
    category: 'fishing',
    icon: '🎣'
  },
  {
    id: 25,
    name: 'KA Gaming Fishing Series',
    category: 'fishing',
    icon: '🎣'
  },
  // Esports Providers
  {
    id: 26,
    name: 'BetConstruct Esports',
    category: 'esports',
    icon: '🎮'
  },
  {
    id: 27,
    name: 'UltraPlay',
    category: 'esports',
    icon: '🎮'
  },
  {
    id: 28,
    name: 'Pinnacle Esports',
    category: 'esports',
    icon: '🎮'
  },
  {
    id: 29,
    name: 'GG.BET',
    category: 'esports',
    icon: '🎮'
  },
  {
    id: 30,
    name: 'ESportsBull',
    category: 'esports',
    icon: '🎮'
  },
  // Sports Providers
  {
    id: 31,
    name: 'Betradar (Sportradar)',
    category: 'sports',
    icon: '⚽'
  },
  {
    id: 32,
    name: 'BetConstruct Sportsbook',
    category: 'sports',
    icon: '⚽'
  },
  {
    id: 33,
    name: 'SBTech',
    category: 'sports',
    icon: '⚽'
  },
  {
    id: 34,
    name: 'IBC/Maxbet',
    category: 'sports',
    icon: '⚽'
  },
  {
    id: 35,
    name: 'Oddin.gg',
    category: 'sports',
    icon: '⚽'
  }
];

export const categoryLabels: Record<string, string> = {
  'cricket': '🏏 Cricket',
  'slot': '🎰 Slot',
  '3d-game': '🎮 3D Game',
  'live-casino': '🎲 Live Casino',
  'fishing': '🎣 Fishing',
  'esports': '🎮 Esports',
  'sports': '⚽ Sports'
};
