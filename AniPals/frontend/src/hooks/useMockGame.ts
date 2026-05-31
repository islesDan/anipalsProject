import { anipals, friends, gachaHistory, inventory, quests } from '../services/mockData';
import { getCurrencies } from '../services/currency';
import { getSession } from '../services/session';

const uidKey = 'anipals.playerUid';
const xpPerLevel = 100;
const legacyUid = 'ANI-4928';
const legacyUidPattern = /^ANI-\d{4}$/;

function xpUntilNextLevel(xp: number) {
  const remainder = xp % xpPerLevel;
  return remainder === 0 ? xpPerLevel : xpPerLevel - remainder;
}

function getPlayerUid() {
  const sessionUid = getSession()?.uid;
  if (sessionUid) return sessionUid;

  const stored = localStorage.getItem(uidKey);
  if (stored && stored !== legacyUid && !legacyUidPattern.test(stored)) return stored;

  const randomSource = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const compact = randomSource.replace(/[^a-z0-9]/gi, '').toUpperCase();
  const generated = `ANI-${compact.slice(0, 4)}-${compact.slice(4, 8)}`;
  localStorage.setItem(uidKey, generated);
  return generated;
}

export function useMockGame() {
  const storedPlayerName = localStorage.getItem('anipals.playerName');
  const storedFarmName = localStorage.getItem('anipals.farmName');
  const storedGame = localStorage.getItem('anipals.localGame.v1');
  let storedLevel = 1;
  let storedXp = 0;

  if (storedGame) {
    try {
      const game = JSON.parse(storedGame);
      storedLevel = Number(game.player?.level ?? 1);
      storedXp = Number(game.stats?.xp ?? game.player?.xp ?? 0);
    } catch {
      storedLevel = 1;
      storedXp = 0;
    }
  }

  return {
    player: {
      name: storedPlayerName || 'Mira Sprout',
      uid: getPlayerUid(),
      level: isNaN(storedLevel) ? 1 : storedLevel,
      xp: isNaN(storedXp) ? 0 : storedXp,
      xpToNextLevel: xpUntilNextLevel(isNaN(storedXp) ? 0 : storedXp),
      farmName: storedFarmName || 'Sunberry Acres',
    },
    currencies: getCurrencies(),
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
