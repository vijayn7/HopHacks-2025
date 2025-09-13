import { supabase } from '../lib/supabase';
import { authService } from '../lib/authService';

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

/**
 * Creates a join record for the current user on the specified event
 * @param eventId - The UUID of the event to join
 * @returns Result of the join insert operation
 */
export async function joinEvent(eventId: string) {
  const { data, error } = await supabase
    .from('joins')
    .insert({ event_id: eventId })
    .select()
    .single();
  return { data, error };
}

/**
 * Retrieves events that the current user has joined
 * @returns Joined events with event and organization details
 */
export async function getJoinedEvents() {
  const userId = await authService.getCurrentUserId();
  const { data, error } = await supabase
    .from('joins')
    .select(
      `event_id, events (*, organizations (name))`
    )
    .eq('user_id', userId)
    .eq('status', 'joined');
  return { data, error };
}

/**
 * Retrieves events the current user has not yet joined
 * @returns Events with organization details that the user hasn't joined
 */
export async function getUnjoinedEvents() {
  const userId = await authService.getCurrentUserId();

  const { data: joined, error: joinError } = await supabase
    .from('joins')
    .select('event_id')
    .eq('user_id', userId);

  if (joinError) return { data: null, error: joinError };

  const joinedIds = joined?.map((j: any) => j.event_id) || [];

  const query = supabase
    .from('events')
    .select(
      `*,
      organizations (
        id,
        name,
        email,
        phone,
        verified
      )`
    )
    .limit(100);

  if (joinedIds.length > 0) {
    const idList = `(${joinedIds.join(',')})`;
    query.not('id', 'in', idList);
  }

  const { data, error } = await query;
  return { data, error };
}
