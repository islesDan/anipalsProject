import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  timeout: 10000,
});

export const authService = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  register: async (email: string, password: string) => {
    return api.post('/auth/register', { email, password });
  },
};

export const playerService = {
  updateName: async (name: string) => {
    return api.patch('/player/name', { name });
  },
  searchFriend: async (uid: string) => {
    return api.get(`/friends/${uid}`);
  },
};
