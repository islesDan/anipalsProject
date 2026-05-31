export type PageId =
  | 'login'
  | 'register'
  | 'create-player'
  | 'tutorial'
  | 'dashboard'
  | 'inventory'
  | 'gacha'
  | 'mini-games'
  | 'trading'
  | 'friends';

export type InventoryItem = {
  id: string;
  name: string;
  type: 'Seed' | 'Crop' | 'Tool' | 'Decor' | 'Treat' | 'Material';
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
  activeBoost?: string;
};

export type Quest = {
  id: string;
  title: string;
  reward: string;
  progress: string;
  completed?: boolean;
  claimed?: boolean;
};

export type FarmPlot = {
  plotIndex: number;
  crop: string;
  state: 'PLANTED' | 'READY' | 'CLEARED';
  plantedAt?: number;
  readyAt?: number;
};

export type PondStatus = {
  state: 'READY' | 'RESTING';
  readyAt: number;
  secondsUntilReady: number;
};

export type OrchardTree = {
  treeIndex: number;
  fruit: 'apples' | 'peaches' | 'oranges' | 'pears';
  state: 'READY' | 'RESTING';
  readyAt: number;
  secondsUntilReady: number;
};

export type AnimalProduct = {
  animalIndex: number;
  animal: 'cow' | 'chicken' | 'sheep' | 'pig';
  product: string;
  state: 'READY' | 'RESTING';
  readyAt: number;
  secondsUntilReady: number;
};

export type CurrencyState = {
  coins: number;
  gems: number;
  energy: number;
  sprouts: number;
  tickets?: number;
};

export type GameState = {
  player: {
    name: string;
    uid: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    farmName: string;
    tutorialState: string;
    tutorialCompleted: boolean;
  };
  currencies: CurrencyState;
  weather: {
    title: string;
    detail: string;
    temperature: string;
  };
  anipals: AniPal[];
  inventory: InventoryItem[];
  quests: Quest[];
  farmDecor: string[];
  farmPlots: FarmPlot[];
  orchardTrees: OrchardTree[];
  animalProducts: AnimalProduct[];
  pond: PondStatus;
  status: string;
};

export type Friend = {
  uid: string;
  name: string;
  status: 'Online' | 'Away' | 'Offline';
  farm: string;
};

export type FriendRequest = {
  id: number;
  player: Friend;
  requestedAt: string;
};

export type FriendSummary = {
  maxFriends: number;
  friendCount: number;
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  blockedPlayers: Friend[];
};

export type FriendMessage = {
  id: string;
  senderKey: string;
  senderUid: string;
  senderName: string;
  recipientKey: string;
  recipientUid: string;
  message: string;
  sentAt: string;
};

export type FriendFarmPreview = {
  uid: string;
  name: string;
  farmName: string;
  status: 'Online' | 'Away' | 'Offline';
  farmPlots: FarmPlot[];
  pond: PondStatus;
};

export type PlayerSearchResult = {
  uid: string;
  name: string;
  farm: string;
  relationshipStatus: 'NONE' | 'OUTGOING_PENDING' | 'INCOMING_PENDING' | 'ACCEPTED' | 'BLOCKED';
};

export type GachaHistoryItem = {
  id: string;
  result: string;
  rarity: 'R' | 'SR' | 'SSR';
  featured?: boolean;
  time: string;
};
