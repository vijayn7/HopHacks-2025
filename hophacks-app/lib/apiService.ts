import { supabase } from '../lib/supabase';

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
