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

/**
 * Gets the current user's profile information
 * @returns {Promise<{ data: any | null, error: any }>} User profile object or error
 */
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'No authenticated user' } };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { data, error };
}

/**
 * Updates the current user's profile information
 * @param {Object} profileData - Object containing profile fields to update
 * @returns {Promise<{ data: any | null, error: any }>} Updated profile object or error
 */
export async function updateUserProfile(profileData: {
  display_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  birth_date?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: { message: 'No authenticated user' } };
  }

  // Filter out undefined values and convert empty strings to null
  const cleanedData = Object.entries(profileData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value === '' ? null : value;
    }
    return acc;
  }, {} as any);

  const { data, error } = await supabase
    .from('profiles')
    .update(cleanedData)
    .eq('id', user.id)
    .select()
    .single();
  
  return { data, error };
}

/**
 * Gets the user's email from auth.users (since it's not in profiles table)
 * @returns {Promise<{ data: string | null, error: any }>} User email or error
 */
export async function getCurrentUserEmail() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    return { data: null, error };
  }
  
  return { data: user?.email || null, error: null };
}

/**
 * Updates the user's email (requires re-authentication)
 * @param {string} email - New email address
 * @returns {Promise<{ data: any | null, error: any }>} Update result or error
 */
export async function updateUserEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: email
  });
  
  return { data, error };
}
