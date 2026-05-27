const DEFAULT_API_URL = import.meta.env.PROD
  ? 'https://carbonflow-production.up.railway.app'
  : 'http://127.0.0.1:5001';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
