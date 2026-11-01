import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { API_BASE_URL } from './client';

// LocalStorage Keys
const STORAGE_URL_KEY = 'synapse_supabase_url';
const STORAGE_KEY_KEY = 'synapse_supabase_key';

let cachedClient: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  key: string;
  source: 'localStorage' | 'env' | 'none';
}

export interface SupabaseBackendStatus {
  configured: boolean;
  connected: boolean;
  mode: 'supabase_cloud' | 'sqlite_fallback';
  database_engine: string;
  supabase_url: string | null;
  latency_ms: number | null;
  error?: string | null;
  message: string;
}

/**
 * Returns current configured Supabase credentials from localStorage or .env
 */
export function getStoredSupabaseConfig(): SupabaseConfig {
  const localUrl = localStorage.getItem(STORAGE_URL_KEY);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, source: 'localStorage' };
  }

  const envUrl = 
    (import.meta as any).env?.VITE_SUPABASE_URL || 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
    'https://gawaupyzdclgbhqxcedi.supabase.co';
  const envKey = 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    'sb_publishable_iX9F2WSVD6xAzpHKlQXPVQ_SbjWjgTW';

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  return { url: '', key: '', source: 'none' };
}

/**
 * Returns an initialized Supabase Client if configured, or null
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getStoredSupabaseConfig();
  if (!config.url || !config.key) return null;

  try {
    cachedClient = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

/**
 * Saves Supabase credentials to localStorage and resets cached client
 */
export function saveStoredSupabaseConfig(url: string, key: string): void {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = key.trim();
  localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
  localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
  cachedClient = null;
  // Trigger custom event so components can update immediately
  window.dispatchEvent(new Event('supabase_config_updated'));
}

/**
 * Clears stored credentials and resets client to local fallback
 */
export function clearStoredSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
  window.dispatchEvent(new Event('supabase_config_updated'));
}

/**
 * Tests connection directly from client to Supabase
 */
export async function testSupabaseClientDirect(url: string, key: string): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  error?: string;
}> {
  const startTime = performance.now();
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = key.trim();

  try {
    const testClient = createClient(cleanUrl, cleanKey);
    // Ping public courses or auth health
    const { error } = await testClient.from('courses').select('id').limit(1);
    const latency = Math.round(performance.now() - startTime);

    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "courses" does not exist')) {
      // If error is invalid api key or authentication error
      if (error.message.includes('JWT') || error.message.includes('apikey')) {
        return {
          success: false,
          latencyMs: latency,
          message: 'Authentication failed. Please verify your Supabase anon/public key.',
          error: error.message,
        };
      }
    }

    return {
      success: true,
      latencyMs: latency,
      message: `Connected successfully to Supabase (${latency}ms)!`,
    };
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs: latency,
      message: 'Failed to connect to Supabase.',
      error: err.message || String(err),
    };
  }
}

/**
 * Fetch backend Supabase status from FastAPI
 */
export async function fetchBackendSupabaseStatus(): Promise<SupabaseBackendStatus> {
  const res = await fetch(`${API_BASE_URL}/supabase/status`);
  if (!res.ok) {
    throw new Error(`Failed to fetch backend Supabase status: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Update backend Supabase configuration via FastAPI
 */
export async function updateBackendSupabaseConfig(
  supabaseUrl: string,
  supabaseKey: string,
  databaseUrl?: string
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/supabase/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey,
      database_url: databaseUrl || null,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update backend Supabase credentials: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetches the complete Supabase SQL Migration Script from backend
 */
export async function fetchSupabaseSchemaSql(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/supabase/schema`);
  if (!res.ok) {
    throw new Error('Failed to load Supabase schema script.');
  }
  const data = await res.json();
  return data.sql;
}

/**
 * Tests direct PostgreSQL database connection via backend
 */
export async function testDatabaseConnection(databaseUrl: string): Promise<{
  success: boolean;
  latency_ms?: number;
  version?: string;
  message?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE_URL}/supabase/test-db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ database_url: databaseUrl }),
  });
  if (!res.ok) {
    throw new Error(`Database test request failed: ${res.statusText}`);
  }
  return res.json();
}
