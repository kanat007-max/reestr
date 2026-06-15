import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data?.message || 'Login failed';
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true });
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
