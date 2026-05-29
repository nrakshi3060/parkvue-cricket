const BASE_URL = 'http://localhost:8080/api'; // Use your machine IP if testing on real device

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
