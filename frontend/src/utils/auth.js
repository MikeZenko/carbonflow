import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'carbon_auth_token';
const USER_KEY = 'carbon_user_data';

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}

export const authAPI = {
  async login(email, password) {
    const data = await authRequest('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async register(email, password, name) {
    const data = await authRequest('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async getProfile() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');

    return authRequest('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  async updateProfile(payload) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');

    const data = await authRequest('/api/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async getPreferences() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');

    return authRequest('/api/preferences', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updatePreferences(preferences) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');

    return authRequest('/api/preferences', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });
  },

  async getSustainabilityGoals() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');

    return authRequest('/api/sustainability-goals', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateSustainabilityGoals(goals) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No token found');

    return authRequest('/api/sustainability-goals', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals }),
    });
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export const getAuthHeaders = () => {
  const token = authAPI.getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      };
};
