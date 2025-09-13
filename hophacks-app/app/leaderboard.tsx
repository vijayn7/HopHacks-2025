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
  points: number;
  rank: number;
  isCurrentUser?: boolean;
}

const LeaderboardScreen = () => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockMembers: GroupMember[] = [
          { id: '1', name: 'Alex Johnson', points: 5000, rank: 1, isCurrentUser: true },
          { id: '2', name: 'Sarah Chen', points: 3920, rank: 2 },
          { id: '3', name: 'Mike Rodriguez', points: 3400, rank: 3 },
          { id: '4', name: 'Emma Wilson', points: 2880, rank: 4 },
          { id: '5', name: 'David Kim', points: 2600, rank: 5 },
          { id: '6', name: 'Lisa Park', points: 2320, rank: 6 },
          { id: '7', name: 'James Brown', points: 2080, rank: 7 },
          { id: '8', name: 'Maria Garcia', points: 1920, rank: 8 },
          { id: '9', name: 'Tom Wilson', points: 1680, rank: 9 },
          { id: '10', name: 'Anna Lee', points: 1520, rank: 10 },
          { id: '11', name: 'Chris Taylor', points: 1360, rank: 11 },
          { id: '12', name: 'Rachel Green', points: 1200, rank: 12 },
          { id: '13', name: 'Kevin White', points: 1040, rank: 13 },
          { id: '14', name: 'Sophie Martin', points: 880, rank: 14 },
          { id: '15', name: 'Ryan Davis', points: 720, rank: 15 },
        ];
        
        setMembers(mockMembers);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return colors.groupGold;
      case 2:
        return colors.groupSilver;
      case 3:
        return colors.groupBronze;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Leaderboard Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {members.map((member) => (
          <View 
            key={member.id} 
            style={[
              styles.memberRow,
              member.isCurrentUser && styles.currentUserRow
            ]}
          >
            <View style={styles.rankSection}>
              <Text style={[styles.rankText, { color: getRankColor(member.rank) }]}>
                {getRankIcon(member.rank)}
              </Text>
            </View>
            
            <View style={styles.memberAvatar}>
              <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
            </View>
            
            <View style={styles.memberInfo}>
              <Text style={[
                styles.memberName,
                member.isCurrentUser && styles.currentUserName
              ]}>
                {member.name}
                {member.isCurrentUser && ' (You)'}
              </Text>
              <Text style={styles.memberPoints}>{member.points.toLocaleString()} points</Text>
            </View>
            
            {member.rank <= 3 && (
              <View style={styles.trophyContainer}>
                <Ionicons 
                  name="trophy" 
                  size={20} 
                  color={getRankColor(member.rank)} 
                />
              </View>
            )}
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  currentUserRow: {
    backgroundColor: colors.primaryLight,
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textWhite,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  currentUserName: {
    fontWeight: '600',
    color: colors.primary,
  },
  memberPoints: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trophyContainer: {
    marginLeft: 12,
  },
});

export default LeaderboardScreen;
