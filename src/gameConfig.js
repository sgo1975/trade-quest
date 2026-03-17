export const CLASS_TYPES = {
  tank: { 
    name: 'The Great Tank', emoji: '🛡️', color: 'text-orange-500', 
    multiplier: 1.0, defense: 0.8 
  },
  mage: { 
    name: 'Aether Mage', emoji: '🔮', color: 'text-purple-400', 
    multiplier: 1.5, defense: 1.0 
  },
  rogue: { 
    name: 'Speed Runner', emoji: '⚡', color: 'text-teal-400', 
    multiplier: 2.5, defense: 1.5 
  }
};

export const INITIAL_PARTY = [
  { id: 'bitcoin', classType: 'tank' },
  { id: 'ethereum', classType: 'mage' },
  { id: 'solana', classType: 'rogue' }
];