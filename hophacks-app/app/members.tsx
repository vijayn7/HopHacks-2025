import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import { router } from 'expo-router';

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
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sortedMembers, setSortedMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockMembers: GroupMember[] = [
          { 
            id: '1', 
            name: 'Alex Johnson', 
            isCurrentUser: true,
            joinDate: '2024-01-15',
            totalHours: 180,
            currentStreak: 12,
            isAdmin: true,
            role: 'Group Creator'
          },
          { 
            id: '2', 
            name: 'Anna Lee', 
            joinDate: '2024-03-15',
            totalHours: 56,
            currentStreak: 3,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '3', 
            name: 'Chris Taylor', 
            joinDate: '2024-03-20',
            totalHours: 48,
            currentStreak: 7,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '4', 
            name: 'David Kim', 
            joinDate: '2024-02-15',
            totalHours: 100,
            currentStreak: 5,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '5', 
            name: 'Emma Wilson', 
            joinDate: '2024-02-10',
            totalHours: 112,
            currentStreak: 8,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '6', 
            name: 'James Brown', 
            joinDate: '2024-03-01',
            totalHours: 80,
            currentStreak: 2,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '7', 
            name: 'Kevin White', 
            joinDate: '2024-04-01',
            totalHours: 32,
            currentStreak: 1,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '8', 
            name: 'Lisa Park', 
            joinDate: '2024-02-20',
            totalHours: 88,
            currentStreak: 4,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '9', 
            name: 'Maria Garcia', 
            joinDate: '2024-03-05',
            totalHours: 72,
            currentStreak: 6,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '10', 
            name: 'Mike Rodriguez', 
            joinDate: '2024-02-01',
            totalHours: 128,
            currentStreak: 9,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '11', 
            name: 'Rachel Green', 
            joinDate: '2024-03-25',
            totalHours: 40,
            currentStreak: 0,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '12', 
            name: 'Ryan Davis', 
            joinDate: '2024-04-10',
            totalHours: 16,
            currentStreak: 1,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '13', 
            name: 'Sarah Chen', 
            joinDate: '2024-01-20',
            totalHours: 152,
            currentStreak: 11,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '14', 
            name: 'Sophie Martin', 
            joinDate: '2024-04-05',
            totalHours: 24,
            currentStreak: 2,
            isAdmin: false,
            role: 'Member'
          },
          { 
            id: '15', 
            name: 'Tom Wilson', 
            joinDate: '2024-03-10',
            totalHours: 64,
            currentStreak: 3,
            isAdmin: false,
            role: 'Member'
          },
        ];
        
        setMembers(mockMembers);
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

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
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
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
