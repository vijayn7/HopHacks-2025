import { supabase } from '../lib/supabase';

/**
 * Fetches up to 100 event postings from the 'events' table with organization data.
 * @returns {Promise<{ data: any[] | null, error: any }>} Array of event objects with organization details or error
 */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizations (
        id,
        name,
        email,
        phone,
        verified
      )
    `)
    .limit(100);
  return { data, error };
}

/**
 * Fetches a specific event by ID with organization details
 * @param eventId - The UUID of the event to fetch
 * @returns {Promise<{ data: any | null, error: any }>} Event object with organization details or error
 */
export async function getEventById(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizations (
        id,
        name,
        email,
        phone,
        verified
      )
    `)
    .eq('id', eventId)
    .single();
  return { data, error };
}
