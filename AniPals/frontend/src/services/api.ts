import axios from 'axios';
import type { FriendFarmPreview, FriendMessage, FriendSummary, PlayerSearchResult } from '../types/game';
import { currentPlayerKey } from './session';

export type AuthResponse = {
  message: string;
  email: string;
  playerKey: string;
  uid: string;
  tutorialCompleted: boolean;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  timeout: 10000,
});

export const authService = {
  login: async (email: string, password: string) => {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },
  register: async (email: string, password: string) => {
    return api.post<AuthResponse>('/auth/register', { email, password });
  },
};

export const playerService = {
  updateName: async (name: string, farmName?: string, playerKey = currentPlayerKey()) => {
    return api.patch('/player/name', { playerKey, name, farmName });
  },
  searchFriend: async (uid: string) => {
    return api.get(`/friends/${uid}`);
  },
  previewFriendFarm: async (uid: string) => {
    return api.get<FriendFarmPreview>(`/friends/${uid}/farm`);
  },
  friendMessages: async (uid: string, playerKey = currentPlayerKey()) => {
    return api.get<FriendMessage[]>(`/friends/${uid}/messages`, { params: { playerKey } });
  },
  sendFriendMessage: async (recipientUid: string, message: string, senderKey = 'demo-player') => {
    return api.post<FriendMessage>('/friends/messages', { senderKey, recipientUid, message });
  },
  friendSummary: async (playerKey = currentPlayerKey()) => {
    return api.get<FriendSummary>('/friends', { params: { playerKey } });
  },
  searchPlayers: async (query: string, playerKey = currentPlayerKey()) => {
    return api.get<PlayerSearchResult[]>('/friends/search', { params: { playerKey, query } });
  },
  sendFriendRequest: async (targetUid: string, playerKey = currentPlayerKey()) => {
    return api.post('/friends/requests', { playerKey, targetUid });
  },
  acceptFriendRequest: async (requestId: number, playerKey = currentPlayerKey()) => {
    return api.post(`/friends/requests/${requestId}/accept`, null, { params: { playerKey } });
  },
  declineFriendRequest: async (requestId: number, playerKey = currentPlayerKey()) => {
    return api.post(`/friends/requests/${requestId}/decline`, null, { params: { playerKey } });
  },
  cancelFriendRequest: async (requestId: number, playerKey = currentPlayerKey()) => {
    return api.delete(`/friends/requests/${requestId}`, { params: { playerKey } });
  },
  removeFriend: async (uid: string, playerKey = currentPlayerKey()) => {
    return api.delete(`/friends/${uid}`, { params: { playerKey } });
  },
  blockPlayer: async (uid: string, playerKey = currentPlayerKey()) => {
    return api.post(`/friends/${uid}/block`, null, { params: { playerKey } });
  },
};

export const gameService = {
  state: async () => {
    return api.get('/game/state');
  },
  harvest: async (plotIndex: number) => {
    return api.post('/game/farm/harvest', { plotIndex });
  },
  plant: async (plotIndex: number, inventoryItemId?: string) => {
    return api.post('/game/farm/plant', { plotIndex, inventoryItemId });
  },
  collectPond: async () => {
    return api.post('/game/farm/pond');
  },
  giveTreat: async (aniPalId: string, inventoryItemId?: string) => {
    return api.post(`/game/anipals/${aniPalId}/treat`, null, { params: { inventoryItemId } });
  },
  useInventoryItem: async (inventoryItemId: string) => {
    return api.post('/inventory/use', { inventoryItemId });
  },
  completeTutorial: async (playerKey = currentPlayerKey()) => {
    return api.post('/game/tutorial', { playerKey, state: 'COMPLETE' });
  },
};

export const gachaService = {
  status: async () => {
    return api.get('/gacha/status');
  },
  pull: async (count: 1 | 10) => {
    return api.post('/gacha/pull', { count });
  },
  buyGems: async (bundleId: 'small' | 'medium' | 'large') => {
    return api.post('/gacha/gems', { bundleId });
  },
};
