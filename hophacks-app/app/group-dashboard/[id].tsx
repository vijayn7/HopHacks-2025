import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { getGroupDashboard } from '../../lib/apiService';

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  hours: number;
  rank: number;
  isAdmin: boolean;
  role: string;
  joinedAt: string;
}

interface GroupActivity {
  id: string;
  memberName: string;
  action: string;
  points: number;
  hours: number;
  eventName: string;
  timestamp: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  monthlyGoal: number;
  currentPoints: number;
  progressPercentage: number;
  members: GroupMember[];
  recentActivity: GroupActivity[];
}

const GroupDashboardScreen = () => {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Load group data from database
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);
        const { data: groupData, error } = await getGroupDashboard(id as string);
        
        if (error) {
          console.error('Error loading group data:', error);
          Alert.alert('Error', 'Failed to load group data. Please try again.');
          return;
        }

        if (groupData) {
          setGroup(groupData);
        }
      } catch (error) {
        console.error('Error loading group data:', error);
        Alert.alert('Error', 'Failed to load group data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadGroupData();
    }
  }, [id]);

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will lose access to the leaderboard and group activities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleInviteMembers = () => {
    Alert.alert('Invite Members', 'Share group code: UMICH2025');
  };

  const handleViewLeaderboard = () => {
    router.push(`/leaderboard?groupId=${id}`);
  };

  const handleViewActivity = () => {
    router.push(`/activity-feed?groupId=${id}`);
  };

  const handleViewMembers = () => {
    router.push(`/members?groupId=${id}`);
  };

  const progressPercentage = group ? group.progressPercentage : 0;
  
  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading group data...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Group Not Found</Text>
        <Text style={styles.emptySubtitle}>This group may have been deleted or you may not have access to it.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Group Info Header */}
      <View style={styles.groupInfoHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.memberCount}>{group.memberCount} members</Text>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={handleLeaveGroup}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Group Goal / Milestone Tracker */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>{currentMonth} Goal</Text>
        <Text style={styles.goalProgress}>
          {group.currentPoints.toLocaleString()} / {group.monthlyGoal.toLocaleString()} Points
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
        </View>
        <Text style={styles.goalRemaining}>
          {group.monthlyGoal - group.currentPoints} points to go!
        </Text>
      </View>

      {/* Leaderboard Preview Card */}
      <TouchableOpacity style={styles.previewCard} onPress={handleViewLeaderboard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🏆 {currentMonth} Leaderboard</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.leaderboardPreview}>
          {group.members.slice(0, 3).map((member, index) => (
            <View key={member.id} style={styles.leaderboardItem}>
              <View style={styles.rankContainer}>
                <Text style={styles.rankNumber}>#{member.rank}</Text>
              </View>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberPoints}>{member.points} pts</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.viewAllLink}>View Full Leaderboard →</Text>
      </TouchableOpacity>

      {/* Activity Feed Preview Card */}
      <TouchableOpacity style={styles.previewCard} onPress={handleViewActivity}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📰 Recent Activity</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.activityPreview}>
          {group.recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <Text style={styles.activityText}>
                <Text style={styles.activityMember}>{activity.memberName}</Text> {activity.action}{' '}
                <Text style={styles.eventName}>{activity.eventName}</Text>
              </Text>
              <View style={styles.activityMeta}>
                <Text style={styles.activityPoints}>+{activity.points} pts</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.viewAllLink}>View All Activity →</Text>
      </TouchableOpacity>

      {/* Members Preview Card */}
      <TouchableOpacity style={styles.previewCard} onPress={handleViewMembers}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👥 Members</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.membersPreview}>
          <View style={styles.avatarCluster}>
            {group.members.slice(0, 4).map((member, index) => (
              <View key={member.id} style={[
                styles.clusterAvatar,
                { marginLeft: index > 0 ? -8 : 0 }
              ]}>
                {member.avatar ? (
                  <Text style={styles.clusterAvatarText}>{member.name.charAt(0)}</Text>
                ) : (
                  <Text style={styles.clusterAvatarText}>{member.name.charAt(0)}</Text>
                )}
              </View>
            ))}
            {group.memberCount > 4 && (
              <View style={[styles.moreAvatars, { marginLeft: -8 }]}>
                <Text style={styles.moreAvatarsText}>+{group.memberCount - 4}</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberSummary}>{group.memberCount} Members</Text>
        </View>
        <Text style={styles.viewAllLink}>View All Members →</Text>
      </TouchableOpacity>

      {/* Invite Button */}
      <TouchableOpacity style={styles.inviteButton} onPress={handleInviteMembers}>
        <Ionicons name="person-add" size={20} color={colors.textWhite} />
        <Text style={styles.inviteButtonText}>Invite Members</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  // Group Info Header Styles
  groupInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 8,
  },
  // Goal Card Styles
  goalCard: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  goalRemaining: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Preview Card Styles
  previewCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Leaderboard Preview Styles
  leaderboardPreview: {
    marginBottom: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  memberPoints: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Activity Preview Styles
  activityPreview: {
    marginBottom: 12,
  },
  activityItem: {
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activityMember: {
    fontWeight: '600',
  },
  eventName: {
    fontWeight: '500',
    color: colors.textPrimary,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  // Members Preview Styles
  membersPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCluster: {
    flexDirection: 'row',
    marginRight: 16,
  },
  clusterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  clusterAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  moreAvatars: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  moreAvatarsText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  memberSummary: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  viewAllLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  // Invite Button Styles
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GroupDashboardScreen;
