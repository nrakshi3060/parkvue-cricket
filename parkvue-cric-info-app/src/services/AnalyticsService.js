const BASE_URL = 'https://moves-lady-sas-beautiful.trycloudflare.com/api/analytics';

export const AnalyticsService = {
  getPlayers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/players`);
      if (!response.ok) throw new Error('Failed to fetch players');
      return await response.json();
    } catch (error) {
      console.error('AnalyticsService Error (getPlayers):', error);
      return [];
    }
  },

  getPlayerStats: async (playerId) => {
    try {
      const response = await fetch(`${BASE_URL}/players/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player stats');
      return await response.json();
    } catch (error) {
      console.error('AnalyticsService Error (getPlayerStats):', error);
      return null;
    }
  },
};
