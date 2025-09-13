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

export async function getEventRecommendations() {
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
 * Fetches all groups that the current user belongs to, with admin status
 * @returns {Promise<{ data: any[] | null, error: any }>} Array of group objects with membership info
 */
export async function getUserGroups() {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      is_admin,
      role,
      groups (
        id,
        name,
        description,
        monthly_goal
      )
    `)
    .eq('user_id', userId);

  if (error) {
    return { data: null, error };
  }

  // Transform the data to include admin status and calculate member count
  const transformedData = await Promise.all(
    data.map(async (membership: any) => {
      const group = membership.groups;
      
      // Get all user IDs in this group (we need this for points calculation anyway)
      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);

      const userIds = groupMembers?.map(member => member.user_id) || [];
      const actualMemberCount = groupMembers?.length || 0;

      // Calculate current points for this group (sum of all members' points this month)
      const { data: pointsData } = await supabase
        .from('points_ledger')
        .select('delta_points')
        .in('user_id', userIds)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

      const currentPoints = pointsData?.reduce((sum: number, entry: any) => sum + (entry.delta_points || 0), 0) || 0;
      const progressPercentage = group.monthly_goal > 0 ? Math.round((currentPoints / group.monthly_goal) * 100) : 0;

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: actualMemberCount, // Use actual count from fetched data
        monthlyGoal: group.monthly_goal,
        currentPoints,
        progressPercentage,
        isAdmin: membership.is_admin,
        role: membership.role,
        isCreator: membership.role === 'creator'
      };
    })
  );

  // Sort: admins/creators first, then members
  transformedData.sort((a, b) => {
    if (a.isCreator && !b.isCreator) return -1;
    if (!a.isCreator && b.isCreator) return 1;
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return 0;
  });

  return { data: transformedData, error: null };
}

/**
 * Fetches the top member (highest points) for a specific group
 * @param groupId - The UUID of the group
 * @returns {Promise<{ data: any | null, error: any }>} Top member info or error
 */
export async function getTopGroupMember(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId);

  if (error || !data || data.length === 0) {
    return { data: null, error };
  }

  // Get points for each member this month
  const userIds = data.map(member => member.user_id);
  const { data: pointsData } = await supabase
    .from('points_ledger')
    .select('user_id, delta_points')
    .in('user_id', userIds)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

  // Calculate total points for each member
  const memberPoints = pointsData?.reduce((acc, entry) => {
    acc[entry.user_id] = (acc[entry.user_id] || 0) + (entry.delta_points || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  // Find member with highest points
  let topMember = null;
  let maxPoints = -1;

  data.forEach((member: any) => {
    const points = memberPoints[member.user_id] || 0;
    if (points > maxPoints) {
      maxPoints = points;
      topMember = {
        name: member.profiles?.display_name || 'Unknown',
        avatar: member.profiles?.avatar_url,
        points
      };
    }
  });

  return { data: topMember, error: null };
}

/**
 * Creates a new group and adds the creator as an admin member
 * @param groupData - Group creation data
 * @returns {Promise<{ data: any | null, error: any }>} Created group or error
 */
// Helper function to generate 7-character uppercase invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createGroup(groupData: {
  name: string;
  description: string;
  monthly_goal: number;
}) {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Generate a unique 7-character uppercase invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const { data: existingGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();
      
      if (!existingGroup) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }
    
    if (!isUnique) {
      return { data: null, error: { message: 'Failed to generate unique invite code' } };
    }

    // 1. Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        monthly_goal: groupData.monthly_goal,
        created_by: userId,
        invite_code: inviteCode
      })
      .select('id, name, description, monthly_goal, invite_code, created_at')
      .single();

    if (groupError) {
      return { data: null, error: groupError };
    }

    // 2. Add the creator as an admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        is_admin: true,
        role: 'creator'
      });

    if (memberError) {
      // If member creation fails, delete the group
      await supabase.from('groups').delete().eq('id', group.id);
      return { data: null, error: memberError };
    }

    return { data: group, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Joins a group using an invite code
 * @param inviteCode - The group's invite code
 * @returns {Promise<{ data: any | null, error: any }>} Group data or error
 */
export async function joinGroup(inviteCode: string) {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // 1. Find the group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('invite_code', inviteCode)
      .single();

    if (groupError || !group) {
      return { data: null, error: { message: 'Invalid invite code' } };
    }

    // 2. Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return { data: null, error: { message: 'You are already a member of this group' } };
    }

    // 3. Add user as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        is_admin: false,
        role: 'member'
      });

    if (memberError) {
      return { data: null, error: memberError };
    }

    return { data: group, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Gets detailed group information for the dashboard
 * @param groupId - The UUID of the group
 * @returns {Promise<{ data: any | null, error: any }>} Group dashboard data or error
 */
export async function getGroupDashboard(groupId: string) {
  try {
    // Get group basic info
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return { data: null, error: groupError || { message: 'Group not found' } };
    }

    // Get all group members with their profiles
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        is_admin,
        role,
        joined_at,
        profiles (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('group_id', groupId);

    if (membersError) {
      return { data: null, error: membersError };
    }

    // Get member IDs for calculations
    const memberIds = members?.filter((member: any) => member.profiles?.id)
      .map((member: any) => member.profiles.id) || [];

    // Calculate current month's points for the group
    const { data: pointsData } = await supabase
      .from('points_ledger')
      .select('user_id, delta_points, hours, reason, created_at')
      .in('user_id', memberIds)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

    // Calculate group total points
    const currentPoints = pointsData?.reduce((sum, entry) => sum + (entry.delta_points || 0), 0) || 0;
    const progressPercentage = group.monthly_goal > 0 ? Math.round((currentPoints / group.monthly_goal) * 100) : 0;

    // Get current user ID for identification
    const currentUserId = await authService.getCurrentUserId();

    // Calculate member stats (filter out members with null profiles)
    const memberStats = members?.filter((member: any) => member.profiles?.id)
      .map((member: any) => {
        const memberPoints = pointsData?.filter(p => p.user_id === member.profiles.id)
          .reduce((sum, entry) => sum + (entry.delta_points || 0), 0) || 0;
        
        const memberHours = pointsData?.filter(p => p.user_id === member.profiles.id)
          .reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;

        return {
          id: member.profiles.id,
          name: member.profiles.display_name || 'Unknown',
          avatar: member.profiles.avatar_url,
          points: memberPoints,
          hours: memberHours,
          isAdmin: member.is_admin,
          role: member.role,
          joinedAt: member.joined_at,
          isCurrentUser: member.profiles.id === currentUserId
        };
      }) || [];

    // Sort members by points for leaderboard
    const sortedMembers = memberStats.sort((a, b) => b.points - a.points);
    const rankedMembers = sortedMembers.map((member, index) => ({
      ...member,
      rank: index + 1
    }));

    // Get recent activities (last 3 activities from group members regardless of month)
    const { data: recentActivities } = await supabase
      .from('points_ledger')
      .select(`
        user_id,
        delta_points,
        hours,
        reason,
        created_at,
        profiles (
          display_name
        )
      `)
      .in('user_id', memberIds)
      .order('created_at', { ascending: false })
      .limit(3);

    const activities = recentActivities?.map((activity: any, index: number) => ({
      id: `${activity.user_id}-${activity.created_at}-${index}`,
      memberName: activity.profiles?.display_name || 'Unknown',
      action: 'completed',
      points: activity.delta_points,
      hours: activity.hours,
      eventName: activity.reason,
      timestamp: new Date(activity.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    })) || [];

    return {
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        inviteCode: group.invite_code,
        memberCount: members?.length || 0,
        monthlyGoal: group.monthly_goal,
        currentPoints,
        progressPercentage,
        members: rankedMembers,
        recentActivity: activities
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Gets recent activity feed for a specific group
 * @param groupId - The UUID of the group
 * @param limit - Number of activities to fetch (default: 20)
 * @returns {Promise<{ data: any[] | null, error: any }>} Recent activities or error
 */
export async function getGroupActivityFeed(groupId: string, limit: number = 20, currentMonthOnly: boolean = false) {
  try {
    // Get all group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (membersError || !members) {
      return { data: null, error: membersError };
    }

    const memberIds = members.map(member => member.user_id);

    // Build query for activities
    let query = supabase
      .from('points_ledger')
      .select(`
        user_id,
        delta_points,
        hours,
        reason,
        created_at,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .in('user_id', memberIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add date filter if only current month is requested
    if (currentMonthOnly) {
      query = query
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());
    }

    const { data: activities, error: activitiesError } = await query;

    if (activitiesError) {
      return { data: null, error: activitiesError };
    }

    // Transform activities for UI
    const transformedActivities = activities?.map((activity: any, index: number) => ({
      id: `${activity.user_id}-${activity.created_at}-${index}`,
      memberName: activity.profiles?.display_name || 'Unknown',
      action: 'completed',
      points: activity.delta_points || 0,
      hours: activity.hours || 0,
      eventName: activity.reason || 'Volunteer Activity',
      timestamp: formatTimeAgo(activity.created_at),
      avatar: activity.profiles?.avatar_url
    })) || [];

    return { data: transformedActivities, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Gets leaderboard data for a specific group
 * @param groupId - The UUID of the group
 * @returns {Promise<{ data: any[] | null, error: any }>} Ranked members or error
 */
export async function getGroupLeaderboard(groupId: string) {
  try {
    // Get all group members with their profiles
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        is_admin,
        role,
        profiles (
          id,
          display_name,
          avatar_url,
          total_points
        )
      `)
      .eq('group_id', groupId);

    if (membersError || !members) {
      return { data: null, error: membersError };
    }

    const memberIds = members.map(member => member.user_id);

    // Get current month's points for each member
    const { data: pointsData } = await supabase
      .from('points_ledger')
      .select('user_id, delta_points')
      .in('user_id', memberIds)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

    // Calculate current month points for each member
    const memberPoints = pointsData?.reduce((acc, entry) => {
      acc[entry.user_id] = (acc[entry.user_id] || 0) + (entry.delta_points || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    // Get current user ID for highlighting
    const currentUserId = await authService.getCurrentUserId();

    // Transform and rank members
    const rankedMembers = members
      .filter((member: any) => member.profiles?.id)
      .map((member: any) => ({
        id: member.profiles.id,
        name: member.profiles.display_name || 'Unknown',
        avatar: member.profiles.avatar_url,
        points: memberPoints[member.user_id] || 0,
        isAdmin: member.is_admin,
        role: member.role,
        isCurrentUser: member.user_id === currentUserId
      }))
      .sort((a, b) => b.points - a.points)
      .map((member, index) => ({
        ...member,
        rank: index + 1
      }));

    return { data: rankedMembers, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Gets detailed member information for a specific group
 * @param groupId - The UUID of the group
 * @returns {Promise<{ data: any[] | null, error: any }>} Group members with stats or error
 */
export async function getGroupMembers(groupId: string) {
  try {
    // Get all group members with their profiles
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        is_admin,
        role,
        joined_at,
        profiles (
          id,
          display_name,
          avatar_url,
          total_points,
          current_streak_weeks,
          longest_streak
        )
      `)
      .eq('group_id', groupId);

    if (membersError || !members) {
      return { data: null, error: membersError };
    }

    const memberIds = members.map(member => member.user_id);

    // Get current month's points and hours for each member
    const { data: pointsData } = await supabase
      .from('points_ledger')
      .select('user_id, delta_points, hours')
      .in('user_id', memberIds)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

    // Calculate current month stats for each member
    const memberStats = pointsData?.reduce((acc, entry) => {
      if (!acc[entry.user_id]) {
        acc[entry.user_id] = { points: 0, hours: 0 };
      }
      acc[entry.user_id].points += entry.delta_points || 0;
      acc[entry.user_id].hours += entry.hours || 0;
      return acc;
    }, {} as Record<string, { points: number; hours: number }>) || {};

    // Get current user ID for highlighting
    const currentUserId = await authService.getCurrentUserId();

    // Transform members data
    const transformedMembers = members
      .filter((member: any) => member.profiles?.id)
      .map((member: any) => {
        const stats = memberStats[member.user_id] || { points: 0, hours: 0 };
        return {
          id: member.profiles.id,
          name: member.profiles.display_name || 'Unknown',
          avatar: member.profiles.avatar_url,
          isCurrentUser: member.user_id === currentUserId,
          joinDate: member.joined_at,
          totalHours: Math.round(stats.hours),
          currentStreak: member.profiles.current_streak_weeks || 0,
          isAdmin: member.is_admin,
          role: member.role === 'creator' ? 'Group Creator' : 'Member'
        };
      });

    return { data: transformedMembers, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Helper function to format timestamp as "time ago"
 */
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

/**
 * Updates an existing group's details
 * @param groupId - The ID of the group to update
 * @param groupData - Updated group data
 * @returns {Promise<{ data: any | null, error: any }>} Updated group or error
 */
export async function updateGroup(groupId: string, groupData: {
  name: string;
  description: string;
  monthly_goal: number;
}) {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Check if user is admin of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership?.is_admin) {
      return { data: null, error: { message: 'You do not have permission to update this group' } };
    }

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .update({
        name: groupData.name,
        description: groupData.description,
        monthly_goal: groupData.monthly_goal,
      })
      .eq('id', groupId)
      .select('id, name, description, monthly_goal, invite_code, created_at')
      .single();

    if (groupError) {
      return { data: null, error: groupError };
    }

    return { data: group, error: null };
  } catch (error) {
    console.error('Error updating group:', error);
    return { data: null, error };
  }
}


/**
 * Removes a member from a group
 * @param groupId - The ID of the group
 * @param memberId - The ID of the member to remove
 * @returns {Promise<{ data: any | null, error: any }>} Success or error
 */
export async function removeGroupMember(groupId: string, memberId: string) {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Check if user is admin of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership?.is_admin) {
      return { data: null, error: { message: 'You do not have permission to remove members' } };
    }

    // Remove the member from the group
    const { error: removeError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', memberId);

    if (removeError) {
      return { data: null, error: removeError };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error removing group member:', error);
    return { data: null, error };
  }
}

/**
 * Disbands a group (removes all members and deletes the group)
 * @param groupId - The ID of the group to disband
 * @returns {Promise<{ data: any | null, error: any }>} Success or error
 */
export async function disbandGroup(groupId: string) {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Check if user is admin of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership?.is_admin) {
      return { data: null, error: { message: 'You do not have permission to disband this group' } };
    }

    // Remove all members from the group
    const { error: removeMembersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);

    if (removeMembersError) {
      return { data: null, error: removeMembersError };
    }

    // Delete the group
    const { error: deleteGroupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (deleteGroupError) {
      return { data: null, error: deleteGroupError };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error disbanding group:', error);
    return { data: null, error };
  }
}

/**
 * Leaves a group (removes current user from the group)
 * @param groupId - The ID of the group to leave
 * @returns {Promise<{ data: any | null, error: any }>} Success or error
 */
export async function leaveGroup(groupId: string) {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Remove the current user from the group
    const { error: removeError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (removeError) {
      return { data: null, error: removeError };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error leaving group:', error);
    return { data: null, error };
  }
}

/**
 * Calculates total points for the current user from points_ledger
 * @returns {Promise<{ data: number | null, error: any }>} Total points or error
 */
export async function calculateUserTotalPoints() {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    const { data, error } = await supabase
      .from('points_ledger')
      .select('delta_points')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    const totalPoints = data?.reduce((sum, entry) => sum + (entry.delta_points || 0), 0) || 0;
    return { data: totalPoints, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Calculates current weekly streak for the current user from points_ledger
 * A week is considered active if there's at least one points_ledger entry in that week
 * @returns {Promise<{ data: number | null, error: any }>} Current weekly streak or error
 */
export async function calculateUserWeeklyStreak() {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Get all points_ledger entries for the user, ordered by date
    const { data, error } = await supabase
      .from('points_ledger')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: 0, error: null };
    }

    // Group entries by week (Monday to Sunday)
    const weeklyEntries = new Map<string, Date[]>();
    
    data.forEach(entry => {
      const date = new Date(entry.created_at);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyEntries.has(weekKey)) {
        weeklyEntries.set(weekKey, []);
      }
      weeklyEntries.get(weekKey)!.push(date);
    });

    // Convert to array and sort by week start date (most recent first)
    const weeks = Array.from(weeklyEntries.entries())
      .map(([weekKey, dates]) => ({
        weekStart: new Date(weekKey),
        dates: dates.sort((a, b) => b.getTime() - a.getTime())
      }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

    // Calculate consecutive weeks from the most recent week
    let streak = 0;
    const now = new Date();
    const currentWeekStart = getWeekStart(now);
    
    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];
      const expectedWeekStart = new Date(currentWeekStart);
      expectedWeekStart.setDate(expectedWeekStart.getDate() - (i * 7));
      
      // Check if this week matches the expected week for the streak
      if (isSameWeek(week.weekStart, expectedWeekStart)) {
        streak++;
      } else {
        // If there's a gap, break the streak
        break;
      }
    }

    return { data: streak, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Helper function to get the start of the week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Helper function to check if two dates are in the same week
 */
function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = getWeekStart(date1);
  const week2Start = getWeekStart(date2);
  return week1Start.getTime() === week2Start.getTime();
}

/**
 * Gets all activity for the current user from their entire history
 * @returns {Promise<{ data: any[] | null, error: any }>} All activity data or error
 */
export async function getAllUserActivity() {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    console.log('Looking for all activity for user:', userId);
    
    const { data, error } = await supabase
      .from('points_ledger')
      .select(`
        id,
        delta_points,
        hours,
        reason,
        created_at,
        joins (
          events (
            title,
            organizations (
              name
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all user activity:', error);
      return { data: null, error };
    }

    console.log('All user activity raw data:', data);
    console.log('Number of entries found:', data?.length || 0);

    // If no data with joins, try without joins as fallback
    if (!data || data.length === 0) {
      console.log('No data with joins, trying without joins...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('points_ledger')
        .select(`
          id,
          delta_points,
          hours,
          reason,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        return { data: [], error: null }; // Return empty array instead of null
      }

      console.log('Fallback data:', fallbackData);
      
      const fallbackActivities = fallbackData?.map((entry: any) => ({
        id: entry.id,
        event: entry.reason || 'Activity',
        organization: '',
        points: entry.delta_points || 0,
        hours: entry.hours || 0,
        date: formatTimeAgo(entry.created_at),
        created_at: entry.created_at
      })) || [];

      console.log('Fallback activities:', fallbackActivities);
      return { data: fallbackActivities, error: null };
    }

    // Transform the data to match the expected format
    const activities = data?.map((entry: any, index) => {
      console.log('Processing entry:', entry);
      return {
        id: entry.id,
        event: entry.joins?.events?.title || entry.reason || 'Activity',
        organization: entry.joins?.events?.organizations?.name || '',
        points: entry.delta_points || 0,
        hours: entry.hours || 0,
        date: formatTimeAgo(entry.created_at),
        created_at: entry.created_at
      };
    }) || [];

    console.log('Transformed activities:', activities);

    return { data: activities, error: null };
  } catch (error) {
    console.error('Error getting all user activity:', error);
    return { data: null, error };
  }
}

/**
 * Gets recent activity for the current user from the last month
 * @returns {Promise<{ data: any[] | null, error: any }>} Recent activity data or error
 */
export async function getRecentActivity() {
  const userId = await authService.getCurrentUserId();
  if (!userId) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  try {
    // Get the start of the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    console.log('Looking for activity since:', startOfMonth.toISOString());
    console.log('Current user ID:', userId);
    
    // First, let's check if there are any points_ledger entries for this user at all
    const { data: allEntries } = await supabase
      .from('points_ledger')
      .select('id, delta_points, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('All points_ledger entries for user:', allEntries);
    
    const { data, error } = await supabase
      .from('points_ledger')
      .select(`
        id,
        delta_points,
        hours,
        reason,
        created_at,
        joins (
          events (
            title,
            organizations (
              name
            )
          )
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return { data: null, error };
    }

    console.log('Recent activity raw data:', data);
    console.log('Number of entries found:', data?.length || 0);

    // If no data with joins, try without joins as fallback
    if (!data || data.length === 0) {
      console.log('No data with joins, trying without joins...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('points_ledger')
        .select(`
          id,
          delta_points,
          hours,
          reason,
          created_at
        `)
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        return { data: [], error: null }; // Return empty array instead of null
      }

      console.log('Fallback data:', fallbackData);
      
      const fallbackActivities = fallbackData?.map((entry: any) => ({
        id: entry.id,
        event: entry.reason || 'Activity',
        organization: '',
        points: entry.delta_points || 0,
        hours: entry.hours || 0,
        date: formatTimeAgo(entry.created_at),
        created_at: entry.created_at
      })) || [];

      console.log('Fallback activities:', fallbackActivities);
      return { data: fallbackActivities, error: null };
    }

    // Transform the data to match the expected format
    const activities = data?.map((entry: any, index) => {
      console.log('Processing entry:', entry);
      return {
        id: entry.id,
        event: entry.joins?.events?.title || entry.reason || 'Activity',
        organization: entry.joins?.events?.organizations?.name || 'System',
        points: entry.delta_points || 0,
        hours: entry.hours || 0,
        date: formatTimeAgo(entry.created_at),
        created_at: entry.created_at
      };
    }) || [];

    console.log('Transformed activities:', activities);

    return { data: activities, error: null };
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return { data: null, error };
  }
}

export async function joinEvent(eventId: string) {
  const { data, error } = await supabase
    .from('joins')
    .insert({ event_id: eventId })
    .select()
    .single();
  return { data, error };
}

export async function checkInToEvent(eventId: string) {
  const userId = await authService.getCurrentUserId();
  const { data: join, error: joinError } = await supabase
    .from('joins')
    .select('id, check_in_at, events(title)')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (joinError) return { data: null, error: joinError };
  if (join?.check_in_at) {
    return { data: null, error: { message: 'Already checked in' } };
  }

  const { data, error } = await supabase
    .from('joins')
    .update({ check_in_at: new Date().toISOString() })
    .eq('id', join.id)
    .select('id, check_in_at, events(title)')
    .single();
  return { data, error };
}

export async function checkOutFromEvent(eventId: string) {
  const userId = await authService.getCurrentUserId();
  const { data: join, error: joinError } = await supabase
    .from('joins')
    .select('id, check_in_at, events(starts_at, ends_at, title)')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (joinError) return { data: null, error: joinError };

  const checkOutTime = new Date().toISOString();
  const { data, error } = await supabase
    .from('joins')
    .update({ check_out_at: checkOutTime })
    .eq('id', join.id)
    .select('id, check_in_at, check_out_at, events(starts_at, ends_at, title)')
    .single();

  if (error || !data) return { data: null, error };

  // Calculate attendance duration in minutes
  const checkIn = data.check_in_at ? new Date(data.check_in_at) : null;
  const checkOut = data.check_out_at ? new Date(data.check_out_at) : null;
  const minutes =
    checkIn && checkOut ? Math.max(0, Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000)) : 0;

  const eventData: any = Array.isArray((data as any).events)
    ? (data as any).events[0]
    : (data as any).events;
  const eventStart = eventData?.starts_at ? new Date(eventData.starts_at) : null;
  const eventEnd = eventData?.ends_at ? new Date(eventData.ends_at) : null;
  const totalMinutes =
    eventStart && eventEnd ? Math.max(0, Math.floor((eventEnd.getTime() - eventStart.getTime()) / 60000)) : 0;

  const ratio = totalMinutes > 0 ? Math.min(minutes / totalMinutes, 1) : 0;
  const points = Math.ceil((ratio * 100) / 5) * 5;

  // Update join record with minutes and points awarded
  await supabase
    .from('joins')
    .update({ minutes, points_awarded: points })
    .eq('id', data.id);

  // Insert into points ledger
  await supabase.from('points_ledger').insert({
    user_id: userId,
    join_id: data.id,
    delta_points: points,
    reason: eventData?.title || 'Event participation',
    hours: Math.round(minutes / 60),
  });

  // Update user total points
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', userId)
    .single();
  if (profile) {
    await supabase
      .from('profiles')
      .update({ total_points: (profile.total_points || 0) + points })
      .eq('id', userId);
  }

  return { data, error: null };
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
      `event_id, check_in_at, check_out_at, events (*, organizations (name))`
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

/**
 * Creates a new event associated with the current organizer's organization
 * @param event - Event fields excluding org_id and created_by
 * @returns Newly created event record or error
 */
export async function createEvent(event: {
  title: string;
  description?: string;
  cause: string;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  image_url?: string;
  location_name?: string;
  address?: string;
  location_notes?: string;
}) {
  const userId = await authService.getCurrentUserId();

  // Lookup organization membership for the current user
  const { data: membership, error: membershipError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
    .single();

  if (membershipError) {
    return { data: null, error: membershipError };
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      org_id: membership.org_id,
      created_by: userId,
      ...event,
    })
    .select()
    .single();

  return { data, error };
}
