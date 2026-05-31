import type { GameState } from '../types/game';
import { currentPlayerKey } from './session';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/game`;

async function post(path: string, body?: object): Promise<GameState> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function get(path: string): Promise<GameState> {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.json();
}

export const gameApi = {
  state: () =>
    get(`/state?playerKey=${currentPlayerKey()}`),

  harvest: (plotIndex: number) =>
    post('/farm/harvest', { playerKey: currentPlayerKey(), plotIndex }),

  plant: (plotIndex: number, inventoryItemId?: string) =>
    post('/farm/plant', { playerKey: currentPlayerKey(), plotIndex, inventoryItemId }),

  collectPond: () =>
    post(`/farm/pond?playerKey=${currentPlayerKey()}`),

  giveTreat: (aniPalId: string, inventoryItemId?: string) =>
    post(`/anipals/${aniPalId}/treat?playerKey=${currentPlayerKey()}&inventoryItemId=${inventoryItemId ?? ''}`),

  harvestOrchard: (treeIndex: number) =>
    post('/farm/orchard/harvest', { playerKey: currentPlayerKey(), treeIndex }),

  collectAnimalProduct: (animalIndex: number) =>
    post('/farm/animals/collect', { playerKey: currentPlayerKey(), animalIndex }),

  claimQuest: (questId: string) =>
    post('/quests/claim', { playerKey: currentPlayerKey(), questId }),
};
