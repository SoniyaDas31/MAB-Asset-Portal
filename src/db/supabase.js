import { createClient } from '@supabase/supabase-js';

// Helper functions to get current config from env or localStorage
const getCurrentUrl = () => import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('MAB_SUPABASE_URL') || '';
const getCurrentKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('MAB_SUPABASE_ANON_KEY') || '';

export let supabase = null;

// Initialize client on module load
const initializeClient = () => {
  const url = getCurrentUrl();
  const key = getCurrentKey();
  if (url && key) {
    try {
      supabase = createClient(url, key);
    } catch (e) {
      console.error('Error creating Supabase client:', e);
      supabase = null;
    }
  } else {
    supabase = null;
  }
};

initializeClient();

/**
 * Checks if Supabase client is successfully initialized.
 */
export const getSupabaseConfig = () => {
  const url = getCurrentUrl();
  const key = getCurrentKey();
  return {
    url,
    key,
    isConfigured: !!(supabase && url && key),
  };
};

/**
 * Dynamically updates credentials, persists them in localStorage, and re-initializes client.
 */
export const saveSupabaseConfig = (url, key) => {
  if (!url || !key) return false;
  try {
    const client = createClient(url, key);
    // If client is successfully created, cache details
    localStorage.setItem('MAB_SUPABASE_URL', url);
    localStorage.setItem('MAB_SUPABASE_ANON_KEY', key);
    supabase = client;
    return true;
  } catch (e) {
    console.error('Failed to initialize Supabase client with provided settings:', e);
    return false;
  }
};

/**
 * Clears cached credentials and resets the client.
 */
export const clearSupabaseConfig = () => {
  localStorage.removeItem('MAB_SUPABASE_URL');
  localStorage.removeItem('MAB_SUPABASE_ANON_KEY');
  initializeClient();
};
