import type { AniPal, InventoryItem } from '../types/game';

export type CropId = 'rice-grain' | 'carrots' | 'wheat' | 'moon-turnip' | 'star-melon' | 'cloud-cotton';
export type WeatherId = 'sun-shower' | 'lucky-breeze' | 'market-day' | 'cozy-clouds';

export type CropRule = {
  id: CropId;
  name: string;
  seedName: string;
  growSeconds: number;
  sellValue: number;
  harvestCoins: number;
  xp: number;
  color: string;
};

export type WeatherRule = {
  id: WeatherId;
  title: string;
  detail: string;
  temperature: string;
  color: string;
  growMultiplier: number;
  cropSellMultiplier: number;
  gachaSrBonus: number;
  treatEnergyBonus: number;
};

export type TreatEffect = {
  name: string;
  mood: string;
  boost: string;
  energy: number;
  xp: number;
  color: string;
};

export const cropRules: Record<CropId, CropRule> = {
  'rice-grain': {
    id: 'rice-grain',
    name: 'Rice Grain',
    seedName: 'Rice Grain Seeds',
    growSeconds: 20,
    sellValue: 35,
    harvestCoins: 55,
    xp: 8,
    color: 'bg-lime-300',
  },
  carrots: {
    id: 'carrots',
    name: 'Carrots',
    seedName: 'Carrot Seeds',
    growSeconds: 35,
    sellValue: 50,
    harvestCoins: 85,
    xp: 12,
    color: 'bg-orange-300',
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    seedName: 'Wheat Seeds',
    growSeconds: 50,
    sellValue: 70,
    harvestCoins: 120,
    xp: 16,
    color: 'bg-amber-300',
  },
  'moon-turnip': {
    id: 'moon-turnip',
    name: 'Moon Turnip',
    seedName: 'Moon Turnip Seeds',
    growSeconds: 70,
    sellValue: 115,
    harvestCoins: 170,
    xp: 24,
    color: 'bg-violet-300',
  },
  'star-melon': {
    id: 'star-melon',
    name: 'Star Melon',
    seedName: 'Star Melon Seeds',
    growSeconds: 90,
    sellValue: 180,
    harvestCoins: 250,
    xp: 36,
    color: 'bg-yellow-300',
  },
  'cloud-cotton': {
    id: 'cloud-cotton',
    name: 'Cloud Cotton',
    seedName: 'Cloud Cotton Seeds',
    growSeconds: 60,
    sellValue: 90,
    harvestCoins: 140,
    xp: 20,
    color: 'bg-slate-200',
  },
};

export const treatEffects: Record<string, TreatEffect> = {
  'berry-jam': {
    name: 'Berry Jam',
    mood: 'Delighted',
    boost: 'Higher yield next harvest',
    energy: 8,
    xp: 10,
    color: 'bg-rose-400',
  },
  'honey-biscuit': {
    name: 'Honey Biscuit',
    mood: 'Focused',
    boost: 'Faster production',
    energy: 12,
    xp: 14,
    color: 'bg-amber-300',
  },
  'clover-cookie': {
    name: 'Clover Cookie',
    mood: 'Lucky',
    boost: 'Increased happiness',
    energy: 10,
    xp: 12,
    color: 'bg-emerald-300',
  },
  'moon-milk': {
    name: 'Moon Milk',
    mood: 'Calm',
    boost: 'Longer boost duration',
    energy: 16,
    xp: 18,
    color: 'bg-sky-200',
  },
};

export const weatherRules: WeatherRule[] = [
  {
    id: 'sun-shower',
    title: 'Sun Shower',
    detail: 'Crops grow 20% faster today.',
    temperature: '24 C',
    color: 'from-sky-200 via-yellow-100 to-lime-200',
    growMultiplier: 0.8,
    cropSellMultiplier: 1,
    gachaSrBonus: 0,
    treatEnergyBonus: 0,
  },
  {
    id: 'lucky-breeze',
    title: 'Lucky Breeze',
    detail: 'Gacha has a small SR bonus today.',
    temperature: '22 C',
    color: 'from-cyan-200 via-white to-yellow-100',
    growMultiplier: 1,
    cropSellMultiplier: 1,
    gachaSrBonus: 5,
    treatEnergyBonus: 0,
  },
  {
    id: 'market-day',
    title: 'Market Day',
    detail: 'Crops sell for 25% more from inventory.',
    temperature: '26 C',
    color: 'from-orange-200 via-yellow-100 to-rose-100',
    growMultiplier: 1,
    cropSellMultiplier: 1.25,
    gachaSrBonus: 0,
    treatEnergyBonus: 0,
  },
  {
    id: 'cozy-clouds',
    title: 'Cozy Clouds',
    detail: 'Treats restore 6 extra energy today.',
    temperature: '20 C',
    color: 'from-slate-200 via-sky-100 to-lime-100',
    growMultiplier: 1,
    cropSellMultiplier: 1,
    gachaSrBonus: 0,
    treatEnergyBonus: 6,
  },
];

export function getTodayWeather() {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % weatherRules.length;
  return weatherRules[dayIndex];
}

export function cropFromSeed(item: InventoryItem): CropRule | null {
  const normalized = item.name.toLowerCase();
  if (normalized.includes('rice sprout')) return cropRules['rice-grain'];
  return Object.values(cropRules).find((crop) => normalized.includes(crop.seedName.toLowerCase().replace(' seeds', ''))) ?? null;
}

export function cropFromName(name: string): CropRule {
  const normalized = name.toLowerCase();
  if (normalized === 'sprouts' || normalized === 'rice sprouts') return cropRules['rice-grain'];
  return Object.values(cropRules).find((crop) => crop.id === normalized || crop.name.toLowerCase() === normalized) ?? cropRules['rice-grain'];
}

export function getAniPalBonuses(anipals: AniPal[]) {
  const hasRole = (role: string) => anipals.some((pal) => pal.role.toLowerCase().includes(role));

  return {
    growMultiplier: hasRole('watering') ? 0.85 : 1,
    harvestCoinMultiplier: hasRole('forager') ? 1.15 : 1,
    seedRefundChance: hasRole('planter') ? 0.25 : 0,
    gachaSrBonus: hasRole('lucky') ? 4 : 0,
  };
}

export function treatEffectFor(item: InventoryItem): TreatEffect {
  const key = item.name.toLowerCase().replace(/\s+/g, '-');
  return treatEffects[key] ?? treatEffects['berry-jam'];
}
