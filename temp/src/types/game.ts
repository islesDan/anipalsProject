export type PageId =
  | 'login'
  | 'register'
  | 'create-player'
  | 'tutorial'
  | 'dashboard'
  | 'inventory'
  | 'gacha'
  | 'trading'
  | 'friends';

export type InventoryItem = {
  id: string;
  name: string;
  type: 'Seed' | 'Crop' | 'Tool' | 'Decor' | 'Treat';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
  quantity: number;
  color: string;
};

export type AniPal = {
  id: string;
  name: string;
  species: string;
  role: string;
  mood: string;
  level: number;
  palette: string;
};

export type Quest = {
  id: string;
  title: string;
  reward: string;
  progress: string;
};

export type Friend = {
  uid: string;
  name: string;
  status: 'Online' | 'Away' | 'Offline';
  farm: string;
};

export type GachaHistoryItem = {
  id: string;
  result: string;
  rarity: InventoryItem['rarity'];
  time: string;
};
