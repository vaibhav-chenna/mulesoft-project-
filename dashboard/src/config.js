const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8086/api/v1/support';

  const { hostname, origin, port, protocol } = window.location;
  if (port === '3000') {
    return `${protocol}//${hostname}:8086/api/v1/support`;
  }

  return `${origin}/api/v1/support`;
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || getDefaultApiBaseUrl();

export const API_PORT_LABEL = process.env.REACT_APP_API_URL ? 'Custom API' : 'Local API: 8086';

export const authHeaders = {
  client_id: process.env.REACT_APP_CLIENT_ID || 'local-dashboard',
  client_secret: process.env.REACT_APP_CLIENT_SECRET || 'local-secret',
};
