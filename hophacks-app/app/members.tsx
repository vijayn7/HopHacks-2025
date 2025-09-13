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
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { getGroupMembers } from '../lib/apiService';

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  isCurrentUser?: boolean;
  joinDate: string;
  totalHours: number;
  currentStreak: number;
  isAdmin: boolean;
  role: string;
}

const MembersScreen = () => {
  const { groupId } = useLocalSearchParams();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sortedMembers, setSortedMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        if (!groupId) {
          console.error('No group ID provided');
          Alert.alert('Error', 'No group selected. Please go back and select a group.');
          return;
        }

        const { data, error } = await getGroupMembers(groupId as string);
        
        if (error) {
          console.error('Error loading members:', error);
          Alert.alert('Error', 'Failed to load members. Please try again.');
          return;
        }

        if (data) {
          setMembers(data);
        }
      } catch (error) {
        console.error('Error loading members:', error);
        Alert.alert('Error', 'Failed to load members. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [groupId]);

  // Sort members: admin first, then alphabetically
  useEffect(() => {
    const sorted = [...members].sort((a, b) => {
      // Admin first
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      
      // Then alphabetical
      return a.name.localeCompare(b.name);
    });
    setSortedMembers(sorted);
  }, [members]);


  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Members Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.memberCountHeader}>
          <Text style={styles.memberCountText}>{sortedMembers.length} Members</Text>
        </View>
        
        {sortedMembers.map((member) => (
          <View 
            key={member.id} 
            style={[
              styles.memberCard,
              member.isCurrentUser && styles.currentUserCard,
              member.isAdmin && styles.adminCard
            ]}
          >
            <View style={styles.memberHeader}>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
              
              <View style={styles.memberInfo}>
                <View style={styles.nameRow}>
                  <Text style={[
                    styles.memberName,
                    member.isCurrentUser && styles.currentUserName
                  ]}>
                    {member.name}
                    {member.isCurrentUser && ' (You)'}
                  </Text>
                  {member.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberRole}>{member.role}</Text>
                <Text style={styles.joinDate}>
                  Joined {formatJoinDate(member.joinDate)}
                </Text>
              </View>
            </View>
            
            <View style={styles.memberStats}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <Text style={styles.statValue}>{member.totalHours}</Text>
                <Text style={styles.statLabel}>Hours</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="flame" size={16} color={colors.warning} />
                <Text style={styles.statValue}>{member.currentStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  // Content Styles
  content: {
    flex: 1,
  },
  memberCountHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  memberCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  memberCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  adminCard: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textWhite,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 8,
  },
  currentUserName: {
    fontWeight: '600',
    color: colors.primary,
  },
  adminBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textWhite,
  },
  memberRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 4,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderLight,
    marginHorizontal: 16,
  },
});

export default MembersScreen;
