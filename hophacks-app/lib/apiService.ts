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
    // 1. Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        monthly_goal: groupData.monthly_goal,
        created_by: userId
      })
      .select()
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
          joinedAt: member.joined_at
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
