import { supabase } from '../lib/supabase';
import { authService } from '../lib/authService';

/**
 * Fetches up to 100 event postings from the 'events' table.
 * @returns {Promise<{ data: any[] | null, error: any }>} Array of event objects or error
 */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .limit(100);
  return { data, error };
}

export async function getUserInfoById() {
  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', await authService.getCurrentUserId())
    .single();
  
  return { data, error };
}

export async function getCurrentUserProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', await authService.getCurrentUserId())
    .single();
  return { data, error };
}

export async function updateUserProfile(profile: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', await authService.getCurrentUserId())
    .single();
  console.log('updateUserProfile data:', data);
  console.log('updateUserProfile error:', error);
  return { data, error };
}

export async function updateUserEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({ email });
  return { data, error };
}
