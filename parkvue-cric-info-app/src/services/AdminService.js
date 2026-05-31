const BASE_URL = 'https://short-vans-like.loca.lt/api/scorer';

const fetchWrapper = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }

    // Safely handle empty response bodies (common for successful DELETE)
    const text = await response.text();
    return text ? JSON.parse(text) : true;
    
  } catch (error) {
    console.error(`AdminService Error (${url}):`, error);
    throw error;
  }
};

export const AdminService = {
  // Tournaments
  getTournaments: () => fetchWrapper('/tournaments'),
  createTournament: (data) => fetchWrapper('/tournaments', { method: 'POST', body: JSON.stringify(data) }),
  updateTournament: (id, data) => fetchWrapper(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTournament: (id) => fetchWrapper(`/tournaments/${id}`, { method: 'DELETE' }),

  // Teams
  getTeams: () => fetchWrapper('/teams'),
  createTeam: (data) => fetchWrapper('/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id, data) => fetchWrapper(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeam: (id) => fetchWrapper(`/teams/${id}`, { method: 'DELETE' }),

  // Players
  getPlayers: () => fetchWrapper('/players'),
  createPlayer: (data) => fetchWrapper('/players', { method: 'POST', body: JSON.stringify(data) }),
  updatePlayer: (id, data) => fetchWrapper(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlayer: (id) => fetchWrapper(`/players/${id}`, { method: 'DELETE' }),

  // Matches
  getMatches: () => fetchWrapper('/matches'),
  createMatch: (data) => fetchWrapper('/matches', { method: 'POST', body: JSON.stringify(data) }),
  updateMatch: (id, data) => fetchWrapper(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMatch: (id) => fetchWrapper(`/matches/${id}`, { method: 'DELETE' }),

  // Squads
  getSquad: (matchId) => fetchWrapper(`/matches/${matchId}/squad`),
  addToSquad: (data) => fetchWrapper('/squad', { method: 'POST', body: JSON.stringify(data) }),
  removeFromSquad: (id) => fetchWrapper(`/squad/${id}`, { method: 'DELETE' }),
};
