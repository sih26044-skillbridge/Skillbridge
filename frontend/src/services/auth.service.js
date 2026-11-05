import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout/');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
};
