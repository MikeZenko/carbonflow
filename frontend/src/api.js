// frontend/src/api.js

const API_BASE_URL = 'http://127.0.0.1:5001';

export const addProducer = async (producerData) => {
  const response = await fetch(`${API_BASE_URL}/api/producers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producerData),
  });
  if (!response.ok) { throw new Error('Failed to add producer'); }
  return response.json();
};

export const addConsumer = async (consumerData) => {
  const response = await fetch(`${API_BASE_URL}/api/consumers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consumerData),
  });
  if (!response.ok) { throw new Error('Failed to add consumer'); }
  return response.json();
};

export const getProducers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/producers`);
  if (!response.ok) { throw new Error('Failed to fetch producers'); }
  return response.json();
};

export const getMatches = async (producerId) => {
  const response = await fetch(`${API_BASE_URL}/api/matches?producer_id=${producerId}`);
  if (!response.ok) { throw new Error('Failed to fetch matches'); }
  return response.json();
};

export const getAnalyzedMatches = async (producer, matches) => {
  // THIS IS THE FIX: Corrected the typo from API_BASHSE_URL to API_BASE_URL
  const response = await fetch(`${API_BASE_URL}/api/analyze-matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ producer, matches }),
  });
  if (!response.ok) { throw new Error('Failed to get AI analysis for matches'); }
  return response.json();
};

export const getImpactReport = async (producer, consumer) => {
  const response = await fetch(`${API_BASE_URL}/api/impact-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ producer, consumer }),
  });
  if (!response.ok) { throw new Error('Failed to generate impact report'); }
  return response.json();
};

export const geocodeAddress = async (address) => {
  const response = await fetch(`${API_BASE_URL}/api/geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!response.ok) {
    throw new Error('Failed to geocode address. Please check if the address is valid.');
  }
  return response.json();
};