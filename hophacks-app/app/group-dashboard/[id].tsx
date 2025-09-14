import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { getGroupDashboard, leaveGroup, disbandGroup, updateGroup } from '../../lib/apiService';
import EditGroupModal from '../../components/EditGroupModal';
import ManageMembersModal from '../../components/ManageMembersModal';

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
  isCurrentUser?: boolean;
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
  inviteCode: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Load group data from database
  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will lose access to the leaderboard and group activities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const { error } = await leaveGroup(id as string);
              if (error) {
                Alert.alert('Error', (error as any).message || 'Failed to leave group');
                return;
              }
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            }
          }
        },
      ]
    );
  };

  const handleAdminMenuPress = () => {
    setShowAdminMenu(true);
  };

  const handleEditGroup = () => {
    setShowAdminMenu(false);
    setShowEditModal(true);
  };

  const handleManageMembers = () => {
    setShowAdminMenu(false);
    setShowManageMembersModal(true);
  };

  const handleDisbandGroup = () => {
    setShowAdminMenu(false);
    Alert.alert(
      'Disband Group',
      'This will remove all members from the group and disband the group permanently. This action cannot be undone. Are you really sure you want to do this?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disband', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await disbandGroup(id as string);
              if (error) {
                Alert.alert('Error', (error as any).message || 'Failed to disband group');
                return;
              }
              Alert.alert('Success', 'Group has been disbanded');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to disband group');
            }
          }
        },
      ]
    );
  };

  const handleGroupUpdated = (updatedGroup: any) => {
    setGroup(prev => prev ? { ...prev, ...updatedGroup } : null);
    setShowEditModal(false);
  };

  const handleMemberRemoved = () => {
    // Reload group data to reflect member changes
    loadGroupData();
  };

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const { data: groupData, error } = await getGroupDashboard(id as string);
      
      if (error) {
        console.error('Error loading group data:', error);
        Alert.alert('Error', 'Failed to load group data');
        return;
      }

      if (groupData) {
        setGroup(groupData);
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      Alert.alert('Error', 'Failed to load group data');
    } finally {
      setLoading(false);
    }
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

  // Helper to clean avatar URLs similar to event images
  const cleanImageUrl = (url: string | undefined) => {
    if (!url) return null;
    let cleaned = url.replace(/\$0$/, '').trim();
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      console.log('Invalid avatar URL:', url);
      return null;
    }
  };
  
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
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Group Info Header */}
      <View style={styles.groupInfoHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.memberCount}>{group.memberCount} members</Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton} 
          onPress={group?.members?.find(m => m.isCurrentUser)?.isAdmin ? handleAdminMenuPress : handleLeaveGroup}
        >
          <Ionicons 
            name={group?.members?.find(m => m.isCurrentUser)?.isAdmin ? "settings" : "exit"} 
            size={24} 
            color={colors.textSecondary} 
          />
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
                {(() => {
                  const avatarUri = cleanImageUrl(member.avatar);
                  return avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                  );
                })()}
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
                <View
                  key={member.id}
                  style={[
                    styles.clusterAvatar,
                    { marginLeft: index > 0 ? -8 : 0 }
                  ]}
                >
                  {(() => {
                    const avatarUri = cleanImageUrl(member.avatar);
                    return avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={styles.clusterAvatarImage}
                      />
                    ) : (
                      <Text style={styles.clusterAvatarText}>{member.name.charAt(0)}</Text>
                    );
                  })()}
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

      {/* Invite Code Section */}
      <View style={styles.inviteCodeCard}>
        <View style={styles.inviteCodeHeader}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={styles.inviteCodeTitle}>Invite Code</Text>
        </View>
        <View style={styles.inviteCodeContainer}>
          <Text style={styles.inviteCodeText}>{group.inviteCode}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => {
              // Copy to clipboard functionality would go here
              Alert.alert('Copied!', 'Invite code copied to clipboard');
            }}
          >
            <Ionicons name="copy" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.inviteCodeSubtext}>Share this code with friends to invite them to the group</Text>
      </View>


      </ScrollView>

      {/* Admin Menu Modal */}
      {showAdminMenu && (
        <View style={styles.adminMenuOverlay}>
          <View style={styles.adminMenu}>
            <TouchableOpacity style={styles.adminMenuItem} onPress={handleEditGroup}>
              <Ionicons name="create" size={20} color={colors.textPrimary} />
              <Text style={styles.adminMenuText}>Edit Group Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminMenuItem} onPress={handleManageMembers}>
              <Ionicons name="people" size={20} color={colors.textPrimary} />
              <Text style={styles.adminMenuText}>Manage Members</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.adminMenuItem, styles.dangerItem]} onPress={handleDisbandGroup}>
              <Ionicons name="trash" size={20} color={colors.error} />
              <Text style={[styles.adminMenuText, styles.dangerText]}>Disband Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminMenuItem} onPress={() => setShowAdminMenu(false)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
              <Text style={styles.adminMenuText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modals */}
      <EditGroupModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onGroupUpdated={handleGroupUpdated}
        group={group ? {
          id: group.id,
          name: group.name,
          description: group.description,
          monthly_goal: group.monthlyGoal
        } : null}
      />
      
      <ManageMembersModal
        visible={showManageMembersModal}
        onClose={() => setShowManageMembersModal(false)}
        onMemberRemoved={handleMemberRemoved}
        groupId={id as string}
        groupName={group?.name || ''}
      />
    </>
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
  inviteCodeCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  inviteCodeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },
  inviteCodeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: 'hidden',
  },
  clusterAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textWhite,
  },
  clusterAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
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
  // Admin Menu Styles
  adminMenuOverlay: {
    position: 'absolute',
    top: -50, // Extend above the screen to cover status bar
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  adminMenu: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 250,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adminMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  adminMenuText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
  dangerItem: {
    backgroundColor: colors.error + '10',
  },
  dangerText: {
    color: colors.error,
  },
});

export default GroupDashboardScreen;
