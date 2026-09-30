import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lnsgcroyrxlwdeyeommn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2djcm95cnhsd2RleWVvbW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzEzNzgsImV4cCI6MjEwNTEwNzM3OH0.dPI7TPVmwAvpzimyTwzWnI1kz6nos-r5rTtjV76_O-o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  projectId: SUPABASE_URL.replace('https://', '').replace('.supabase.co', ''),
};

/**
 * Checks connection health to the Supabase endpoint
 */
export async function checkSupabaseConnection() {
  const startTime = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const latency = Date.now() - startTime;
    if (res.ok) {
      return {
        connected: true,
        latencyMs: latency,
        statusText: 'Connected & Active',
        url: SUPABASE_URL,
      };
    } else {
      return {
        connected: false,
        latencyMs: latency,
        statusText: `HTTP Error ${res.status}`,
        url: SUPABASE_URL,
      };
    }
  } catch (err) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      statusText: err.message || 'Connection Failed',
      url: SUPABASE_URL,
    };
  }
}

/**
 * Supabase Data Sync Service
 * Allows syncing alarms and logs to Supabase tables when available
 */
export const supabaseDB = {
  // Alarms
  async fetchAlarms(userId) {
    try {
      const { data, error } = await supabase
        .from('alarms')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase fetchAlarms:', err.message);
      return null;
    }
  },

  async saveAlarm(alarm) {
    try {
      const { data, error } = await supabase
        .from('alarms')
        .upsert(alarm);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase saveAlarm:', err.message);
      return null;
    }
  },

  async deleteAlarm(alarmId) {
    try {
      const { error } = await supabase
        .from('alarms')
        .delete()
        .eq('id', alarmId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase deleteAlarm:', err.message);
      return false;
    }
  },

  // History & Wake Logs
  async logWakeEvent(log) {
    try {
      const { data, error } = await supabase
        .from('alarm_sessions')
        .insert(log);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase logWakeEvent:', err.message);
      return null;
    }
  },

  async fetchHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('alarm_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase fetchHistory:', err.message);
      return null;
    }
  },

  // Streaks
  async fetchStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase fetchStreak:', err.message);
      return null;
    }
  },

  // Recommendations & Notifications
  async fetchNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase fetchNotifications:', err.message);
      return [];
    }
  },

  // Record Any Website Activity into Supabase
  async recordActivity(userId, activityType, title, message) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: `[${activityType.toUpperCase()}] ${title}`,
          message: message,
          is_read: false
        });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase recordActivity:', err.message);
      return null;
    }
  }
};


