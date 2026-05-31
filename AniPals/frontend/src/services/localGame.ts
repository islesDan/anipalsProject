import { anipals as starterAniPals, gachaHistory as starterGachaHistory, inventory as starterInventory } from './mockData';
import { cropFromName, cropFromSeed, cropRules, getAniPalBonuses, getTodayWeather, treatEffectFor } from './gameRules';
import type { AnimalProduct, AniPal, FarmPlot, GameState, GachaHistoryItem, InventoryItem, OrchardTree, Quest } from '../types/game';
import { currentPlayerKey, getSession, markSessionTutorialComplete } from './session';

type GachaStatus = {
  ssrPity: number;
  srPity: number;
  guaranteedFeatured: boolean;
  singleCost: number;
  tenPullCost: number;
  currencies: {
    coins: number;
    gems: number;
    energy: number;
    sprouts: number;
    tickets: number;
  };
  history: GachaHistoryItem[];
  gemBundles: Array<{ id: 'small' | 'medium' | 'large'; gems: number; coins: number; label: string }>;
  status: string;
};

type LocalGameState = GameState & {
  stats: {
    cropsHarvested: number;
    treatsGifted: number;
    itemsUsed: number;
    gachaPulls: number;
    xp: number;
  };
  claimedQuests: string[];
  gacha: Pick<GachaStatus, 'ssrPity' | 'srPity' | 'guaranteedFeatured' | 'history'>;
};

const storageKey = 'anipals.localGame.v1';
export const gameEvent = 'anipals:local-game';
const uidKey = 'anipals.playerUid';
const xpPerLevel = 100;
const legacyUid = 'ANI-4928';
const legacyUidPattern = /^ANI-\d{4}$/;
const singleCost = 160;
const tenPullCost = 1600;
const gemBundles: GachaStatus['gemBundles'] = [
  { id: 'small', gems: 160, coins: 1600, label: 'Starter pouch' },
  { id: 'medium', gems: 800, coins: 7600, label: 'Barn bundle' },
  { id: 'large', gems: 1600, coins: 14400, label: 'Harvest chest' },
];
const pondCooldownMs = 90_000;
const orchardCooldownMs = 120_000;
const animalCooldownMs = 150_000;
const cropCycle = ['rice-grain', 'carrots', 'wheat', 'moon-turnip', 'star-melon', 'cloud-cotton'] as const;
const orchardFruits: OrchardTree['fruit'][] = ['apples', 'peaches', 'oranges', 'pears'];
const orchardFruitRules: Record<OrchardTree['fruit'], { name: string; coins: number; xp: number; color: string }> = {
  apples: { name: 'Apples', coins: 95, xp: 10, color: 'bg-red-300' },
  peaches: { name: 'Peaches', coins: 110, xp: 12, color: 'bg-orange-200' },
  oranges: { name: 'Oranges', coins: 120, xp: 14, color: 'bg-orange-300' },
  pears: { name: 'Pears', coins: 105, xp: 11, color: 'bg-lime-300' },
};
const animalRules: Array<{ animal: AnimalProduct['animal']; product: string; coins: number; xp: number; color: string }> = [
  { animal: 'cow', product: 'Milk', coins: 80, xp: 8, color: 'bg-sky-100' },
  { animal: 'chicken', product: 'Eggs', coins: 65, xp: 6, color: 'bg-yellow-100' },
  { animal: 'sheep', product: 'Wool', coins: 90, xp: 9, color: 'bg-slate-100' },
  { animal: 'pig', product: 'Truffles', coins: 120, xp: 12, color: 'bg-stone-300' },
];

function xpUntilNextLevel(xp: number) {
  const remainder = xp % xpPerLevel;
  return remainder === 0 ? xpPerLevel : xpPerLevel - remainder;
}

function accountStorageKey() {
  return `${storageKey}.${currentPlayerKey()}`;
}

function accountUidKey() {
  return `${uidKey}.${currentPlayerKey()}`;
}

function getPlayerUid() {
  const sessionUid = getSession()?.uid;
  if (sessionUid) return sessionUid;

  const stored = localStorage.getItem(accountUidKey()) ?? localStorage.getItem(uidKey);
  if (stored && stored !== legacyUid && !legacyUidPattern.test(stored)) return stored;

  const randomSource = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const compact = randomSource.replace(/[^a-z0-9]/gi, '').toUpperCase();
  const generated = `ANI-${compact.slice(0, 4)}-${compact.slice(4, 8)}`;

  localStorage.setItem(accountUidKey(), generated);
  return generated;
}

function normalizePlayerUid(uid?: string) {
  if (!uid || uid === legacyUid || legacyUidPattern.test(uid)) return getPlayerUid();
  localStorage.setItem(accountUidKey(), uid);
  return uid;
}

function spendEnergy(state: LocalGameState, amount: number, action: string) {
  if (state.currencies.energy < amount) {
    state.status = `Not enough energy to ${action}. Restored 10 energy so you can keep playing.`;
    state.currencies.energy = Math.min(100, state.currencies.energy + 10);
    return false;
  }

  state.currencies.energy -= amount;
  return true;
}

function starterState(): LocalGameState {
  const now = Date.now();
  const weather = getTodayWeather();

  return {
    player: {
      name: localStorage.getItem('anipals.playerName') || 'Mira Sprout',
      uid: getPlayerUid(),
      level: 1,
      xp: 0,
      xpToNextLevel: xpPerLevel,
      farmName: localStorage.getItem('anipals.farmName') || 'Sunberry Acres',
      tutorialState: 'INTRO',
      tutorialCompleted: false,
    },
    currencies: {
      coins: 500,
      gems: 0,
      energy: 100,
      sprouts: 0,
      tickets: 1,
    },
    weather: {
      title: weather.title,
      detail: weather.detail,
      temperature: weather.temperature,
    },
    anipals: starterAniPals,
    inventory: starterInventory,
    quests: [],
    farmDecor: [],
    farmPlots: Array.from({ length: 12 }).map((_, plotIndex) => {
      return {
        plotIndex,
        crop: cropCycle[plotIndex % cropCycle.length],
        state: 'READY',
        plantedAt: now - 120_000,
        readyAt: now - 30_000,
      };
    }),
    orchardTrees: Array.from({ length: 8 }).map((_, treeIndex) => ({
      treeIndex,
      fruit: orchardFruits[treeIndex % orchardFruits.length],
      state: 'READY',
      readyAt: now,
      secondsUntilReady: 0,
    })),
    animalProducts: animalRules.map((animal, animalIndex) => ({
      animalIndex,
      animal: animal.animal,
      product: animal.product,
      state: 'READY',
      readyAt: now,
      secondsUntilReady: 0,
    })),
    pond: {
      state: 'READY',
      readyAt: now,
      secondsUntilReady: 0,
    },
    status: 'Farm ready.',
    stats: {
      cropsHarvested: 0,
      treatsGifted: 0,
      itemsUsed: 0,
      gachaPulls: 0,
      xp: 0,
    },
    gacha: {
      ssrPity: 0,
      srPity: 0,
      guaranteedFeatured: false,
      history: starterGachaHistory,
    },
    claimedQuests: [],
  };
}

function loadState(): LocalGameState {
  const stored = localStorage.getItem(accountStorageKey());
  if (!stored) return saveState(starterState());

  try {
    return saveState(refreshState({ ...starterState(), ...JSON.parse(stored) }));
  } catch {
    return saveState(starterState());
  }
}

function saveState(next: LocalGameState) {
  const refreshed = refreshState(next);
  localStorage.setItem(accountStorageKey(), JSON.stringify(refreshed));
  window.dispatchEvent(new CustomEvent(gameEvent, { detail: refreshed }));
  return refreshed;
}

function refreshState(state: LocalGameState): LocalGameState {
  const now = Date.now();
  const weather = getTodayWeather();
  const refreshedPlots = state.farmPlots.map((plot) => {
    const crop = plot.crop === 'sprouts' ? 'rice-grain' : plot.crop;
    if (plot.state === 'PLANTED' && (plot.readyAt ?? 0) <= now) {
      return { ...plot, crop, state: 'READY' as const };
    }
    return { ...plot, crop };
  });
  const pondReadyAt = state.pond?.readyAt ?? now;
  const pondReady = pondReadyAt <= now;
  const orchardTrees = (state.orchardTrees ?? starterState().orchardTrees).map((tree) => {
    const readyAt = tree.readyAt ?? now;
    const ready = readyAt <= now;
    return {
      ...tree,
      state: ready ? 'READY' as const : 'RESTING' as const,
      readyAt,
      secondsUntilReady: ready ? 0 : Math.ceil((readyAt - now) / 1000),
    };
  });
  const animalProducts = (state.animalProducts ?? starterState().animalProducts).map((animal) => {
    const readyAt = animal.readyAt ?? now;
    const ready = readyAt <= now;
    return {
      ...animal,
      state: ready ? 'READY' as const : 'RESTING' as const,
      readyAt,
      secondsUntilReady: ready ? 0 : Math.ceil((readyAt - now) / 1000),
    };
  });

  const stats = state.stats ?? starterState().stats;
  const level = Math.max(1, Math.floor(stats.xp / xpPerLevel) + 1);
  const xp = stats.xp;
  const xpToNextLevel = xpUntilNextLevel(xp);
  const inventory = restoreMissingStarterItems(state.inventory);
  const claimedQuests = state.claimedQuests ?? [];
  const uid = normalizePlayerUid(state.player.uid);

  return {
    ...state,
    claimedQuests,
    player: {
      ...state.player,
      uid,
      level,
      xp,
      xpToNextLevel,
    },
    weather: {
      title: weather.title,
      detail: weather.detail,
      temperature: weather.temperature,
    },
    farmPlots: refreshedPlots,
    orchardTrees,
    animalProducts,
    pond: {
      state: pondReady ? 'READY' : 'RESTING',
      readyAt: pondReadyAt,
      secondsUntilReady: pondReady ? 0 : Math.ceil((pondReadyAt - now) / 1000),
    },
    inventory,
    farmDecor: state.farmDecor ?? [],
    quests: buildQuests(stats, { ...state, inventory, claimedQuests }),
  };
}

function restoreMissingStarterItems(items: InventoryItem[]) {
  const restored = [...items];
  for (const starter of starterInventory) {
    const exists = restored.some((item) => item.name === starter.name && item.type === starter.type);
    if (!exists && (starter.type === 'Seed' || starter.type === 'Treat')) {
      restored.push({ ...starter, id: `restored-${starter.id}` });
    }
  }
  return restored;
}

function buildQuests(stats: LocalGameState['stats'], state: LocalGameState): Quest[] {
  const shards = state.inventory.find((item) => item.name === 'AniShards')?.quantity ?? 0;
  const claimed = state.claimedQuests ?? [];
  const questData = [
    { id: 'q1', title: 'Harvest 10 crops', reward: '600 coins', progressValue: Math.min(stats.cropsHarvested, 10), target: 10 },
    { id: 'q2', title: 'Gift 3 treats to AniPals', reward: '3 gacha tickets', progressValue: Math.min(stats.treatsGifted, 3), target: 3 },
    { id: 'q3', title: 'Collect 80 AniShards', reward: 'Upgrade material goal', progressValue: Math.min(shards, 80), target: 80 },
  ];

  return questData.map((quest) => ({
    id: quest.id,
    title: quest.title,
    reward: quest.reward,
    progress: `${quest.progressValue} / ${quest.target}`,
    completed: quest.progressValue >= quest.target,
    claimed: claimed.includes(quest.id),
  }));
}

function addInventory(state: LocalGameState, item: Omit<InventoryItem, 'id'>) {
  const existing = state.inventory.find((entry) => entry.name === item.name && entry.type === item.type);
  if (existing) {
    existing.quantity += item.quantity;
    return;
  }

  state.inventory.push({
    ...item,
    id: `i${Date.now()}${Math.floor(Math.random() * 1000)}`,
  });
}

function removeOneInventory(state: LocalGameState, itemId: string) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return null;
  item.quantity -= 1;
  if (item.quantity <= 0) {
    state.inventory = state.inventory.filter((entry) => entry.id !== itemId);
  }
  return item;
}

function removeInventoryQuantity(state: LocalGameState, itemId: string, quantity: number) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item || quantity <= 0) return null;
  item.quantity -= quantity;
  if (item.quantity <= 0) {
    state.inventory = state.inventory.filter((entry) => entry.id !== itemId);
  }
  return item;
}

function publicState(state: LocalGameState): GameState {
  const { stats, gacha, ...visibleState } = state;
  void stats;
  void gacha;
  return visibleState;
}

export const localGameService = {
  state: async () => publicState(loadState()),

  resetForCurrentAccount: async () => {
    localStorage.removeItem(accountStorageKey());
    localStorage.removeItem(accountUidKey());
    return publicState(saveState(starterState()));
  },

  updateProfile: async (name: string, farmName: string) => {
    const state = loadState();
    state.player.name = name.trim();
    state.player.farmName = farmName.trim();
    localStorage.setItem('anipals.playerName', state.player.name);
    localStorage.setItem('anipals.farmName', state.player.farmName);
    return publicState(saveState({ ...state, status: 'Player profile updated.' }));
  },

  completeTutorial: async () => {
    const state = loadState();
    state.player.tutorialState = 'COMPLETE';
    state.player.tutorialCompleted = true;
    state.status = 'Tutorial complete. Free play started.';
    localStorage.removeItem('anipals.tutorial.completedSteps');
    markSessionTutorialComplete();
    return publicState(saveState(state));
  },

  addMiniGameCoins: async (amount: number) => {
    const state = loadState();
    state.currencies.coins += amount;
    state.stats.xp += Math.max(1, Math.floor(amount / 50));
    return publicState(saveState({ ...state, status: `Mini-game reward: +${amount} coins.` }));
  },

  claimQuest: async (questId: string) => {
    const state = loadState();
    const quest = buildQuests(state.stats, state).find((item) => item.id === questId);
    if (!quest) return publicState(saveState({ ...state, status: 'Quest not found.' }));
    if (!quest.completed) return publicState(saveState({ ...state, status: 'Quest is not complete yet.' }));
    if (state.claimedQuests.includes(questId)) return publicState(saveState({ ...state, status: 'Quest reward already claimed.' }));

    state.claimedQuests.push(questId);
    if (questId === 'q1') {
      state.currencies.coins += 600;
      state.status = 'Claimed Harvest 10 crops: +600 coins.';
    } else if (questId === 'q2') {
      state.currencies.tickets = (state.currencies.tickets ?? 0) + 3;
      state.status = 'Claimed treat quest: +3 gacha tickets.';
    } else {
      state.currencies.gems += 160;
      removeInventoryQuantity(state, state.inventory.find((item) => item.name === 'AniShards')?.id ?? '', 80);
      state.status = 'Claimed AniShards goal: +160 gems.';
    }

    return publicState(saveState(state));
  },

  sendTrade: async (recipientName: string, itemIds: string[]) => {
    const state = loadState();
    const offered = itemIds
      .map((id) => state.inventory.find((item) => item.id === id && item.quantity > 0))
      .filter((item): item is InventoryItem => Boolean(item));
    if (offered.length === 0) return publicState(saveState({ ...state, status: 'Choose at least one available item to trade.' }));

    for (const item of offered) removeOneInventory(state, item.id);
    state.currencies.coins += offered.length * 35;
    state.stats.xp += offered.length * 4;
    return publicState(saveState({ ...state, status: `Sent ${offered.length} item trade to ${recipientName}. Friend sent back ${offered.length * 35} coins.` }));
  },

  harvest: async (plotIndex: number) => {
    const state = loadState();
    const previousLevel = state.player.level;
    const plot = state.farmPlots.find((item) => item.plotIndex === plotIndex);
    if (!plot) return publicState(saveState({ ...state, status: 'That plot does not exist.' }));
    if (plot.state === 'CLEARED') return publicState(saveState({ ...state, status: 'That plot is empty. Plant seeds first.' }));
    if (plot.state === 'PLANTED') return publicState(saveState({ ...state, status: 'That crop is still growing.' }));
    if (!spendEnergy(state, 2, 'harvest crops')) return publicState(saveState(state));

    const crop = cropFromName(plot.crop);
    const bonuses = getAniPalBonuses(state.anipals);
    const coins = Math.round(crop.harvestCoins * bonuses.harvestCoinMultiplier);

    plot.state = 'CLEARED';
    state.currencies.coins += coins;
    state.currencies.sprouts += 1;
    state.stats.cropsHarvested += 1;
    state.stats.xp += crop.xp;
    addInventory(state, {
      name: crop.name,
      type: 'Crop',
      rarity: crop.id === 'star-melon' ? 'Epic' : crop.id === 'moon-turnip' ? 'Rare' : 'Common',
      quantity: 1,
      color: crop.color,
    });

    const nextLevel = Math.max(1, Math.floor(state.stats.xp / xpPerLevel) + 1);
    const levelText = nextLevel > previousLevel ? ` Level up to ${nextLevel}!` : '';
    return publicState(saveState({ ...state, status: `Harvested ${crop.name}: +${coins} coins, +${crop.xp} XP.${levelText}` }));
  },

  plant: async (plotIndex: number, inventoryItemId?: string) => {
    const state = loadState();
    const plot = state.farmPlots.find((item) => item.plotIndex === plotIndex);
    if (!plot) return publicState(saveState({ ...state, status: 'That plot does not exist.' }));
    if (plot.state !== 'CLEARED') return publicState(saveState({ ...state, status: 'Harvest before planting here.' }));

    const defaultCrop = cropRules[cropCycle[plot.plotIndex % cropCycle.length]];
    const previousCrop = cropFromName(plot.crop);
    const preferredSeed = state.inventory.find(
      (item) => item.type === 'Seed' && item.quantity > 0 && item.name === defaultCrop.seedName,
    ) ?? state.inventory.find(
      (item) => item.type === 'Seed' && item.quantity > 0 && item.name === previousCrop.seedName,
    );
    const seed = inventoryItemId
      ? state.inventory.find((item) => item.id === inventoryItemId && item.type === 'Seed')
      : preferredSeed ?? state.inventory.find((item) => item.type === 'Seed' && item.quantity > 0);

    if (!seed) return publicState(saveState({ ...state, status: 'No seeds available.' }));
    if (!spendEnergy(state, 1, 'plant seeds')) return publicState(saveState(state));

    const crop = cropFromSeed(seed) ?? cropRules['rice-grain'];
    const bonuses = getAniPalBonuses(state.anipals);
    const weather = getTodayWeather();
    const refunded = Math.random() < bonuses.seedRefundChance;
    if (!refunded) removeOneInventory(state, seed.id);

    const now = Date.now();
    plot.crop = crop.id;
    plot.state = 'PLANTED';
    plot.plantedAt = now;
    plot.readyAt = now + crop.growSeconds * 1000 * bonuses.growMultiplier * weather.growMultiplier;

    const refundText = refunded ? ' Pip saved the seed.' : '';
    return publicState(saveState({ ...state, status: `Planted ${crop.name}. Ready in about ${Math.ceil((plot.readyAt - now) / 1000)} seconds.${refundText}` }));
  },

  harvestOrchard: async (treeIndex: number) => {
    const state = loadState();
    const tree = state.orchardTrees.find((item) => item.treeIndex === treeIndex);
    if (!tree) return publicState(saveState({ ...state, status: 'That orchard tree does not exist.' }));
    if (tree.state !== 'READY') return publicState(saveState({ ...state, status: `That tree needs ${tree.secondsUntilReady} more seconds.` }));
    if (!spendEnergy(state, 1, 'harvest orchard fruit')) return publicState(saveState(state));

    const fruit = orchardFruitRules[tree.fruit];
    tree.state = 'RESTING';
    tree.readyAt = Date.now() + orchardCooldownMs;
    tree.secondsUntilReady = Math.ceil(orchardCooldownMs / 1000);
    state.currencies.coins += fruit.coins;
    state.stats.xp += fruit.xp;
    addInventory(state, {
      name: fruit.name,
      type: 'Crop',
      rarity: 'Common',
      quantity: 1,
      color: fruit.color,
    });

    return publicState(saveState({ ...state, status: `Harvested ${fruit.name}: +${fruit.coins} coins, +${fruit.xp} XP.` }));
  },

  collectAnimalProduct: async (animalIndex: number) => {
    const state = loadState();
    const animal = state.animalProducts.find((item) => item.animalIndex === animalIndex);
    const rule = animalRules[animalIndex % animalRules.length];
    if (!animal) return publicState(saveState({ ...state, status: 'That animal is not in the pen.' }));
    if (animal.state !== 'READY') return publicState(saveState({ ...state, status: `${animal.product} will be ready in ${animal.secondsUntilReady} seconds.` }));
    if (!spendEnergy(state, 1, 'collect animal products')) return publicState(saveState(state));

    animal.state = 'RESTING';
    animal.readyAt = Date.now() + animalCooldownMs;
    animal.secondsUntilReady = Math.ceil(animalCooldownMs / 1000);
    state.currencies.coins += rule.coins;
    state.stats.xp += rule.xp;
    addInventory(state, {
      name: rule.product,
      type: 'Material',
      rarity: rule.product === 'Truffles' ? 'Rare' : 'Common',
      quantity: 1,
      color: rule.color,
    });

    return publicState(saveState({ ...state, status: `Collected ${rule.product}: +${rule.coins} coins, +${rule.xp} XP.` }));
  },

  collectPond: async () => {
    const state = loadState();
    if (state.pond.state !== 'READY') {
      return publicState(saveState({ ...state, status: `Pond is resting. Fish return in ${state.pond.secondsUntilReady} seconds.` }));
    }

    state.currencies.coins += 120;
    state.currencies.energy = Math.min(100, state.currencies.energy + 15);
    state.stats.xp += 5;
    state.pond = {
      state: 'RESTING',
      readyAt: Date.now() + pondCooldownMs,
      secondsUntilReady: Math.ceil(pondCooldownMs / 1000),
    };
    return publicState(saveState({ ...state, status: 'Collected pond fish: +120 coins, +15 energy, +5 XP.' }));
  },

  giveTreat: async (aniPalId: string, treatId?: string) => {
    const state = loadState();
    const treat = treatId
      ? state.inventory.find((item) => item.id === treatId && item.type === 'Treat' && item.quantity > 0)
      : state.inventory.find((item) => item.type === 'Treat' && item.quantity > 0);
    const pal = state.anipals.find((item) => item.id === aniPalId);
    if (!pal) return publicState(saveState({ ...state, status: 'AniPal not found.' }));
    if (!treat) return publicState(saveState({ ...state, status: 'No treats in inventory.' }));

    const effect = treatEffectFor(treat);
    removeOneInventory(state, treat.id);
    pal.mood = effect.mood;
    pal.activeBoost = effect.boost;
    state.stats.treatsGifted += 1;
    state.stats.xp += effect.xp;
    state.currencies.energy = Math.min(100, state.currencies.energy + effect.energy + getTodayWeather().treatEnergyBonus);
    return publicState(saveState({ ...state, status: `${pal.name} enjoyed ${treat.name}: ${effect.boost}, +${effect.xp} XP.` }));
  },

  useInventoryItem: async (inventoryItemId: string) => {
    const state = loadState();
    const item = state.inventory.find((entry) => entry.id === inventoryItemId);
    if (!item) return publicState(saveState({ ...state, status: 'Item not found.' }));

    if (item.type === 'Seed') {
      const cleared = state.farmPlots.find((plot) => plot.state === 'CLEARED');
      if (!cleared) return publicState(saveState({ ...state, status: 'No cleared plot is available for planting.' }));
      return localGameService.plant(cleared.plotIndex, item.id);
    }

    if (item.type === 'Crop') {
      const crop = cropFromName(item.name);
      const coins = Math.round(crop.sellValue * getTodayWeather().cropSellMultiplier);
      removeOneInventory(state, item.id);
      state.currencies.coins += coins;
      state.stats.itemsUsed += 1;
      return publicState(saveState({ ...state, status: `Sold ${item.name} for ${coins} coins.` }));
    }

    if (item.type === 'Decor') {
      if (!state.farmDecor.includes(item.name)) state.farmDecor.push(item.name);
      state.stats.itemsUsed += 1;
      state.stats.xp += 4;
      return publicState(saveState({ ...state, status: `${item.name} placed on the farm.` }));
    }

    if (item.type === 'Material') {
      const normalized = item.name.toLowerCase();
      if (normalized.includes('milk') || normalized.includes('eggs')) {
        removeOneInventory(state, item.id);
        state.currencies.energy = Math.min(100, state.currencies.energy + 12);
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: `Used ${item.name}: +12 energy.` }));
      }
      if (normalized.includes('wool')) {
        removeOneInventory(state, item.id);
        state.currencies.sprouts += 6;
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: 'Spun Wool into farm supplies: +6 sprouts.' }));
      }
      if (normalized.includes('truffle')) {
        removeOneInventory(state, item.id);
        state.currencies.coins += 180;
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: 'Sold Truffles for 180 coins.' }));
      }
      if (normalized.includes('anishards')) {
        state.currencies.gems += 20;
        removeInventoryQuantity(state, item.id, Math.min(10, item.quantity));
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: 'Refined AniShards into +20 gems.' }));
      }
    }

    if (item.type === 'Treat') {
      const pal = state.anipals[0];
      return localGameService.giveTreat(pal.id);
    }

    if (item.type === 'Tool') {
      const normalized = item.name.toLowerCase();

      if (normalized.includes('watering')) {
        const planted = state.farmPlots.filter((plot) => plot.state === 'PLANTED');
        if (planted.length === 0) return publicState(saveState({ ...state, status: 'No growing crops need watering.' }));
        if (!spendEnergy(state, 8, 'water the field')) return publicState(saveState(state));
        planted.forEach((plot) => {
          plot.readyAt = Math.max(Date.now(), (plot.readyAt ?? Date.now()) - 25_000);
        });
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: `Watered ${planted.length} crops. Growth timers reduced by 25 seconds.` }));
      }

      if (normalized.includes('compost')) {
        const planted = state.farmPlots.find((plot) => plot.state === 'PLANTED');
        if (!planted) return publicState(saveState({ ...state, status: 'No growing crop is available for compost.' }));
        if (!spendEnergy(state, 4, 'spread compost')) return publicState(saveState(state));
        planted.readyAt = Date.now();
        removeOneInventory(state, item.id);
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: 'Compost mix made one growing crop ready to harvest.' }));
      }

      if (normalized.includes('hoe')) {
        if (!spendEnergy(state, 6, 'tend the soil')) return publicState(saveState(state));
        const cleared = state.farmPlots.filter((plot) => plot.state === 'CLEARED').length;
        state.currencies.sprouts += Math.max(1, cleared);
        state.stats.itemsUsed += 1;
        return publicState(saveState({ ...state, status: `Copper Hoe tended ${cleared || 1} soil patches: +${Math.max(1, cleared)} sprouts.` }));
      }

      state.stats.itemsUsed += 1;
      state.stats.xp += 6;
      return publicState(saveState({ ...state, status: `${item.name} tuned up the farm tools: +6 XP.` }));
    }

    return publicState(saveState({ ...state, status: `${item.name} is saved for trading.` }));
  },
};

export const localGachaService = {
  status: async (): Promise<GachaStatus> => {
    const state = loadState();
    return buildGachaStatus(state, 'Choose Pull 1 or Pull 10.');
  },

  buySinglePullGems: async (): Promise<GachaStatus> => {
    return localGachaService.buyGems('small');
  },

  buyGems: async (bundleId: 'small' | 'medium' | 'large'): Promise<GachaStatus> => {
    const state = loadState();
    const bundle = gemBundles.find((item) => item.id === bundleId) ?? gemBundles[0];
    if (state.currencies.coins < bundle.coins) {
      return buildGachaStatus(state, `Not enough coins. ${bundle.label} costs ${bundle.coins.toLocaleString()} coins.`);
    }

    state.currencies.coins -= bundle.coins;
    state.currencies.gems += bundle.gems;
    const saved = saveState({ ...state, status: `Bought ${bundle.gems.toLocaleString()} gems for ${bundle.coins.toLocaleString()} coins.` });
    return buildGachaStatus(saved, `Bought ${bundle.gems.toLocaleString()} gems for ${bundle.coins.toLocaleString()} coins.`);
  },

  pull: async (count: 1 | 10): Promise<GachaStatus> => {
    const state = loadState();
    const cost = count === 10 ? tenPullCost : singleCost;
    if (state.currencies.gems < cost) {
      return buildGachaStatus(saveState({ ...state, status: 'Not enough gems.' }), 'Not enough gems.');
    }

    state.currencies.gems -= cost;
    let best = 'R';
    for (let index = 0; index < count; index += 1) {
      const result = rollGacha(state);
      best = rarityRank(result.rarity) > rarityRank(best) ? result.rarity : best;
      state.gacha.history = [result, ...state.gacha.history].slice(0, 20);
    }

    state.stats.gachaPulls += count;
    state.stats.xp += count * 3;
    const saved = saveState({ ...state, status: `Pulled ${count}. Best rarity: ${best}.` });
    return buildGachaStatus(saved, `Pulled ${count}. Best rarity: ${best}.`);
  },
};

function buildGachaStatus(state: LocalGameState, status: string): GachaStatus {
  return {
    ssrPity: state.gacha.ssrPity,
    srPity: state.gacha.srPity,
    guaranteedFeatured: state.gacha.guaranteedFeatured,
    singleCost,
    tenPullCost,
    gemBundles,
    currencies: {
      coins: state.currencies.coins,
      gems: state.currencies.gems,
      energy: state.currencies.energy,
      sprouts: state.currencies.sprouts,
      tickets: state.currencies.tickets ?? 0,
    },
    history: state.gacha.history,
    status,
  };
}

function rollGacha(state: LocalGameState): GachaHistoryItem {
  const bonuses = getAniPalBonuses(state.anipals);
  const weather = getTodayWeather();
  const roll = Math.floor(Math.random() * 100);
  const srChance = 10 + bonuses.gachaSrBonus + weather.gachaSrBonus;
  let rarity: GachaHistoryItem['rarity'] = 'R';

  if (state.gacha.ssrPity >= 99 || roll < 1) rarity = 'SSR';
  else if (state.gacha.srPity >= 9 || roll < srChance) rarity = 'SR';

  if (rarity === 'SSR') {
    state.gacha.ssrPity = 0;
    state.gacha.srPity = 0;
    const featured = state.gacha.guaranteedFeatured || Math.random() < 0.5;
    state.gacha.guaranteedFeatured = !featured;
    const result = featured ? 'Sol Harvest Helper' : ['Luna Orchard Keeper', 'Aster Pond Guardian'][Math.floor(Math.random() * 2)];
    addAniPalOrShards(state, result, 'SSR', featured);
    return historyItem(result, rarity, featured);
  }

  if (rarity === 'SR') {
    state.gacha.ssrPity += 1;
    state.gacha.srPity = 0;
    const result = ['Mochi Cat Helper', 'Honey Biscuit Specialist', 'Lucky Clover'][Math.floor(Math.random() * 3)];
    addAniPalOrShards(state, result, 'SR', false);
    return historyItem(result, rarity, false);
  }

  state.gacha.ssrPity += 1;
  state.gacha.srPity += 1;
  const reward = [
    { name: 'Carrot Seeds', type: 'Seed' as const, quantity: 8, color: 'bg-orange-300' },
    { name: 'Wheat Seeds', type: 'Seed' as const, quantity: 8, color: 'bg-amber-300' },
    { name: 'Rice Grain Seeds', type: 'Seed' as const, quantity: 10, color: 'bg-lime-300' },
    { name: 'Cloud Cotton Seeds', type: 'Seed' as const, quantity: 6, color: 'bg-slate-200' },
    { name: 'Berry Jam', type: 'Treat' as const, quantity: 3, color: 'bg-rose-400' },
    { name: 'Honey Biscuit', type: 'Treat' as const, quantity: 2, color: 'bg-amber-300' },
    { name: 'Clover Cookie', type: 'Treat' as const, quantity: 2, color: 'bg-emerald-300' },
    { name: 'AniShards', type: 'Material' as const, quantity: 5, color: 'bg-violet-300' },
  ][Math.floor(Math.random() * 8)];
  addInventory(state, { ...reward, rarity: 'Common' });
  return historyItem(`${reward.name} x${reward.quantity}`, rarity, false);
}

function addAniPalOrShards(state: LocalGameState, name: string, rarity: 'SR' | 'SSR', featured: boolean) {
  const duplicate = state.anipals.some((pal) => pal.name === name);
  if (duplicate) {
    addInventory(state, {
      name: 'AniShards',
      type: 'Material',
      rarity: 'Rare',
      quantity: rarity === 'SSR' ? 80 : 20,
      color: 'bg-violet-300',
    });
    return;
  }

  const role = name.includes('Lucky') ? 'Lucky' : featured ? 'Harvest Leader' : 'Farm Helper';
  const nextAniPal: AniPal = {
    id: `a${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name,
    species: featured ? 'Phoenix' : 'Companion',
    role,
    mood: 'New',
    level: 1,
    palette: featured ? 'bg-yellow-300' : 'bg-cyan-300',
  };
  state.anipals.push(nextAniPal);
}

function historyItem(result: string, rarity: GachaHistoryItem['rarity'], featured: boolean): GachaHistoryItem {
  return {
    id: `g${Date.now()}${Math.floor(Math.random() * 1000)}`,
    result,
    rarity,
    featured,
    time: 'Just now',
  };
}

function rarityRank(rarity: string) {
  return rarity === 'SSR' ? 3 : rarity === 'SR' ? 2 : 1;
}
