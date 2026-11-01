/**
 * Resolves the backend base URL dynamically:
 * - Serverless / Node.js functions: Uses Vercel service binding process.env.BACKEND_URL
 * - Client browser (Vite): Uses relative '/api' (matching Vercel service rewrite) or VITE_API_BASE_URL
 */
export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.BACKEND_URL) {
    const raw = process.env.BACKEND_URL.replace(/\/+$/, '');
    return `${raw}/api`;
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('synapse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const data = await response.json();
      errorDetail = data.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
