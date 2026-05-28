// frontend/src/api.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://carbonflow-production.up.railway.app';

const REQUEST_TIMEOUT_MS = 12000;

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const handleResponse = async (response, label) => {
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.message || body?.error || '';
    } catch {
      // Response body was not JSON; ignore.
    }
    throw new Error(
      detail
        ? `${label}: ${detail}`
        : `${label}: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

export const addProducer = async (producerData) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/producers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producerData),
  });
  return handleResponse(response, 'Failed to add producer');
};

export const addConsumer = async (consumerData) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/consumers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consumerData),
  });
  return handleResponse(response, 'Failed to add consumer');
};

export const getProducers = async () => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/producers`);
  return handleResponse(response, 'Failed to fetch producers');
};

export const getConsumers = async () => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/consumers`);
  return handleResponse(response, 'Failed to fetch consumers');
};

export const getMatches = async (producerId) => {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/matches?producer_id=${encodeURIComponent(producerId)}`
  );
  return handleResponse(response, 'Failed to fetch matches');
};

export const getImpactReport = async (producer, consumer) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/impact-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ producer, consumer }),
  });
  return handleResponse(response, 'Failed to generate impact report');
};

export const geocodeAddress = async (address) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  return handleResponse(response, 'Failed to geocode address');
};
