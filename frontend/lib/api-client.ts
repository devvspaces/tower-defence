import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auth:logout'));
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        this.setTokens(accessToken, newRefreshToken);
        return accessToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // Auth endpoints
  async generateChallenge(walletAddress: string) {
    const response = await this.client.post('/auth/challenge', { walletAddress });
    return response.data;
  }

  async verifySignature(message: string, signature: string) {
    const response = await this.client.post('/auth/verify', { message, signature });
    const { accessToken, refreshToken, user } = response.data;
    this.setTokens(accessToken, refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.client.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokens();
  }

  async updateProfile(data: { username?: string; profilePicture?: string }) {
    const response = await this.client.patch('/auth/profile', data);
    const updatedUser = response.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return updatedUser;
  }

  // Game endpoints
  async recordGame(gameData: {
    score: number;
    wavesCompleted: number;
    gameState: any;
    startedAt: string;
    completedAt: string;
  }) {
    const response = await this.client.post('/game/record', gameData);
    return response.data;
  }

  async getLeaderboard(limit: number = 100) {
    const response = await this.client.get(`/game/leaderboard?limit=${limit}`);
    return response.data;
  }

  async getOverallLeaderboard(limit: number = 100) {
    const response = await this.client.get(`/game/leaderboard/overall?limit=${limit}`);
    return response.data;
  }

  async getGameHistory(limit: number = 10) {
    const response = await this.client.get(`/game/history?limit=${limit}`);
    return response.data;
  }

  async getGame(gameId: string) {
    const response = await this.client.get(`/game/${gameId}`);
    return response.data;
  }

  // Progression endpoints
  async getUserProgression() {
    const response = await this.client.get('/progression/profile');
    return response.data;
  }

  async getAllTowers() {
    const response = await this.client.get('/progression/towers/all');
    return response.data;
  }

  async getAvailableTowers() {
    const response = await this.client.get('/progression/towers/available');
    return response.data;
  }

  async getTowerUpgrades(towerType: string) {
    const response = await this.client.get(`/progression/towers/${towerType}/upgrades`);
    return response.data;
  }

  async upgradeTower(towerType: string) {
    const response = await this.client.post('/progression/towers/upgrade', { towerType });
    return response.data;
  }

  async getUpcomingRewards() {
    const response = await this.client.get('/progression/rewards/upcoming');
    return response.data;
  }

  // Token management
  getStoredUser() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const apiClient = new ApiClient();
