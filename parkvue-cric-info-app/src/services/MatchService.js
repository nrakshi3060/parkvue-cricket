const BASE_URL = 'https://moves-lady-sas-beautiful.trycloudflare.com/api'; // Stable Cloudflare tunnel URL

export const fetchAllMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/matches`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export const fetchLiveMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}/matches/live`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
};

export const fetchMatchDetails = async (matchId) => {
  try {
    const response = await fetch(`${BASE_URL}/matches/${matchId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
};

export const fetchMatchSummary = async (matchId) => {
  try {
    const response = await fetch(`${BASE_URL}/matches/${matchId}/summary`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching match summary:', error);
    return null;
  }
};

export const fetchInningsByMatchId = async (matchId) => {
  try {
    const response = await fetch(`${BASE_URL}/scorer/matches/${matchId}/innings`);
    if (!response.ok) throw new Error('Failed to fetch innings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching innings:', error);
    return [];
  }
};

export const createInnings = async (inningsData) => {
  try {
    const response = await fetch(`${BASE_URL}/scorer/innings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inningsData),
    });
    if (!response.ok) throw new Error('Failed to create innings');
    return await response.json();
  } catch (error) {
    console.error('Error creating innings:', error);
    throw error;
  }
};

export const submitDelivery = async (deliveryData) => {
  try {
    const response = await fetch(`${BASE_URL}/scorer/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveryData),
    });
    if (!response.ok) throw new Error('Failed to submit delivery');
    return await response.json();
  } catch (error) {
    console.error('Error submitting delivery:', error);
    throw error;
  }
};

export const undoLastBall = async (inningsId) => {
  try {
    const response = await fetch(`${BASE_URL}/scorer/innings/${inningsId}/undo`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to undo ball');
    return true;
  } catch (error) {
    console.error('Error undoing ball:', error);
    throw error;
  }
};
