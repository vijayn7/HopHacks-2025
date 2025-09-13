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
import { router } from 'expo-router';

interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  monthlyGoal: number;
  currentPoints: number;
  progressPercentage: number;
  description: string;
  topMember: {
    name: string;
    avatar?: string;
  };
}

const GroupsScreen = () => {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadGroups = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setGroups([
          {
            id: '1',
            name: 'UMich Volunteers',
            memberCount: 15,
            monthlyGoal: 20000,
            currentPoints: 16500,
            progressPercentage: 83,
            description: "UMich Class of '28 Volunteers",
            topMember: {
              name: 'Alex Johnson',
            },
          },
          {
            id: '2',
            name: 'Community Gardeners',
            memberCount: 8,
            monthlyGoal: 12000,
            currentPoints: 8400,
            progressPercentage: 70,
            description: "Growing community, one seed at a time",
            topMember: {
              name: 'Emma Wilson',
            },
          },
          {
            id: '3',
            name: 'Animal Shelter Helpers',
            memberCount: 12,
            monthlyGoal: 16000,
            currentPoints: 12800,
            progressPercentage: 80,
            description: "Caring for our furry friends",
            topMember: {
              name: 'James Brown',
            },
          },
        ]);
      } catch (error) {
        console.error('Error loading groups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleGroupPress = (groupId: string) => {
    router.push(`/group-dashboard/${groupId}`);
  };

  const handleCreateGroup = () => {
    Alert.alert('Create Group', 'Group creation feature coming soon!');
  };

  const handleJoinGroup = () => {
    Alert.alert('Join Group', 'Enter group code to join');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Groups Yet</Text>
        <Text style={styles.emptySubtitle}>Join or create a group to start competing with friends!</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
            <Text style={styles.createGroupButtonText}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.joinGroupButton} onPress={handleJoinGroup}>
            <Text style={styles.joinGroupButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleJoinGroup}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Groups List */}
      <View style={styles.groupsList}>
        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupCard}
            onPress={() => handleGroupPress(group.id)}
          >
            {/* Group Header */}
            <View style={styles.groupHeader}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <Text style={styles.memberCount}>{group.memberCount} Members</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Monthly Goal</Text>
                <Text style={styles.progressText}>
                  {group.currentPoints.toLocaleString()} / {group.monthlyGoal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${Math.min(group.progressPercentage, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>{group.progressPercentage}%</Text>
              </View>
            </View>

            {/* Top Member Avatar */}
            <View style={styles.topMemberSection}>
              <View style={styles.topMemberInfo}>
                <Text style={styles.topMemberLabel}>Leading the way</Text>
                <View style={styles.topMemberRow}>
                  <View style={styles.topMemberAvatar}>
                    <Text style={styles.avatarText}>{group.topMember.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.topMemberName}>{group.topMember.name}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
          <Ionicons name="add-circle" size={20} color={colors.textWhite} />
          <Text style={styles.createGroupButtonText}>Create New Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.joinGroupButton} onPress={handleJoinGroup}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={styles.joinGroupButtonText}>Join Group</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  // Groups List Styles
  groupsList: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  groupDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  memberCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Progress Section Styles
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  // Top Member Styles
  topMemberSection: {
    marginBottom: 8,
  },
  topMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topMemberLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  topMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topMemberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textWhite,
  },
  topMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Action Buttons Styles
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createGroupButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  joinGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  joinGroupButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GroupsScreen;
