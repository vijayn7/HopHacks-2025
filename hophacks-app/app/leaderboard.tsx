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
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { getGroupLeaderboard } from '../lib/apiService';

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
}

const LeaderboardScreen = () => {
  const { groupId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Set dynamic title
  useEffect(() => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    navigation.setOptions({ title: `${currentMonth} Leaderboard` });
  }, [navigation]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        if (!groupId) {
          console.error('No group ID provided');
          Alert.alert('Error', 'No group selected. Please go back and select a group.');
          return;
        }

        const { data, error } = await getGroupLeaderboard(groupId as string);
        
        if (error) {
          console.error('Error loading leaderboard:', error);
          Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
          return;
        }

        if (data) {
          setMembers(data);
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [groupId]);

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
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  avatarText: {
    fontSize: 18,
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
