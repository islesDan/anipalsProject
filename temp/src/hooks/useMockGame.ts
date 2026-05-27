import { anipals, friends, gachaHistory, inventory, quests } from '../services/mockData';

export function useMockGame() {
  return {
    player: {
      name: 'Mira Sprout',
      uid: 'ANI-4928',
      level: 18,
      farmName: 'Sunberry Acres',
    },
    currencies: {
      coins: 12840,
      gems: 420,
      energy: 78,
      sprouts: 36,
    },
    weather: {
      title: 'Sun Shower',
      detail: 'Crops grow 15% faster and pond fish appear more often today.',
      temperature: '24 C',
    },
    anipals,
    inventory,
    quests,
    friends,
    gachaHistory,
  };
}
