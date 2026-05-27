import type { AniPal, Friend, GachaHistoryItem, InventoryItem, Quest } from '../types/game';

export const inventory: InventoryItem[] = [
  { id: 'i1', name: 'Carrot Seeds', type: 'Seed', rarity: 'Common', quantity: 24, color: 'bg-orange-300' },
  { id: 'i2', name: 'Moon Turnip', type: 'Crop', rarity: 'Rare', quantity: 7, color: 'bg-violet-300' },
  { id: 'i3', name: 'Copper Hoe', type: 'Tool', rarity: 'Uncommon', quantity: 1, color: 'bg-amber-500' },
  { id: 'i4', name: 'Berry Jam', type: 'Treat', rarity: 'Uncommon', quantity: 11, color: 'bg-rose-400' },
  { id: 'i5', name: 'Pond Lantern', type: 'Decor', rarity: 'Epic', quantity: 2, color: 'bg-cyan-300' },
  { id: 'i6', name: 'Rice Sprouts', type: 'Seed', rarity: 'Common', quantity: 38, color: 'bg-lime-300' },
  { id: 'i7', name: 'Star Melon', type: 'Crop', rarity: 'Epic', quantity: 3, color: 'bg-yellow-300' },
  { id: 'i8', name: 'Honey Biscuit', type: 'Treat', rarity: 'Rare', quantity: 5, color: 'bg-amber-300' },
  { id: 'i9', name: 'Watering Can', type: 'Tool', rarity: 'Common', quantity: 1, color: 'bg-sky-300' },
  { id: 'i10', name: 'Tulip Fence', type: 'Decor', rarity: 'Rare', quantity: 9, color: 'bg-pink-300' },
  { id: 'i11', name: 'Cloud Cotton', type: 'Crop', rarity: 'Uncommon', quantity: 14, color: 'bg-slate-200' },
  { id: 'i12', name: 'Compost Mix', type: 'Tool', rarity: 'Common', quantity: 18, color: 'bg-stone-400' },
];

export const anipals: AniPal[] = [
  { id: 'a1', name: 'Pip', species: 'Bunny', role: 'Planter', mood: 'Cheerful', level: 12, palette: 'bg-pink-300' },
  { id: 'a2', name: 'Mochi', species: 'Cat', role: 'Forager', mood: 'Curious', level: 9, palette: 'bg-yellow-300' },
  { id: 'a3', name: 'Pebble', species: 'Turtle', role: 'Watering', mood: 'Calm', level: 15, palette: 'bg-emerald-300' },
];

export const quests: Quest[] = [
  { id: 'q1', title: 'Harvest 20 carrots', reward: '800 coins', progress: '14 / 20' },
  { id: 'q2', title: 'Gift treats to AniPals', reward: '3 gacha tickets', progress: '2 / 3' },
  { id: 'q3', title: 'Visit two friend farms', reward: 'Friendship crate', progress: '1 / 2' },
];

export const friends: Friend[] = [
  { uid: 'ANI-1138', name: 'Juniper', status: 'Online', farm: 'Peach Puddle Farm' },
  { uid: 'ANI-8871', name: 'Clover', status: 'Away', farm: 'Little Lantern Ranch' },
  { uid: 'ANI-2055', name: 'Nori', status: 'Offline', farm: 'Mossbell Orchard' },
];

export const gachaHistory: GachaHistoryItem[] = [
  { id: 'g1', result: 'Mochi Cat Helper', rarity: 'Rare', time: 'Today, 10:12' },
  { id: 'g2', result: 'Honey Biscuit x5', rarity: 'Uncommon', time: 'Yesterday, 21:40' },
  { id: 'g3', result: 'Pond Lantern', rarity: 'Epic', time: 'Yesterday, 20:18' },
];
