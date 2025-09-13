import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import HomeEventCard from '../../components/Home/HomeEventCard';
import { getUserInfoById, getEventRecommendations, getRecentActivity, calculateUserTotalPoints, calculateUserWeeklyStreak } from '@/lib/apiService';
import { authService } from '../../lib/authService';
import { router } from 'expo-router';

const HomeScreen = () => {
  // Mock data - replace with real data later

  const [user, setUser] = useState({
    name: "Alex Johnson", // fallback name
    streak: 0,
    totalPoints: 0,
    currentTier: "New Volunteer",
    nextTier: "Community Helper",
    pointsToNextTier: 100,
    tierProgress: 0,
  });
  const [suggestedEvents, setSuggestedEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Helper function to determine tier based on points
  const getTierInfo = (points: number) => {
    if (points >= 2000) {
      return {
        currentTier: "Volunteer Legend",
        nextTier: "Max Tier Reached",
        pointsToNextTier: 0,
        tierProgress: 1
      };
    } else if (points >= 1000) {
      return {
        currentTier: "Volunteer Champion",
        nextTier: "Volunteer Legend",
        pointsToNextTier: 2000 - points,
        tierProgress: points / 2000
      };
    } else if (points >= 500) {
      return {
        currentTier: "Community Helper",
        nextTier: "Volunteer Champion",
        pointsToNextTier: 1000 - points,
        tierProgress: points / 1000
      };
    } else if (points >= 100) {
      return {
        currentTier: "Active Volunteer",
        nextTier: "Community Helper",
        pointsToNextTier: 500 - points,
        tierProgress: points / 500
      };
    } else {
      return {
        currentTier: "New Volunteer",
        nextTier: "Active Volunteer",
        pointsToNextTier: 100 - points,
        tierProgress: points / 100
      };
    }
  };

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      try {
        setIsLoading(true);

        // Fetch user basic data (name only)
        const { data: userData, error: userError } = await getUserInfoById();
        
        // Calculate points and streak from points_ledger
        const { data: totalPoints, error: pointsError } = await calculateUserTotalPoints();
        const { data: weeklyStreak, error: streakError } = await calculateUserWeeklyStreak();
        
        if (userError) {
          console.log('Error fetching user:', userError);
        } else if (userData) {
          const calculatedPoints = totalPoints || 0;
          const calculatedStreak = weeklyStreak || 0;
          const tierInfo = getTierInfo(calculatedPoints);
          
          setUser({
            name: userData.display_name || "Volunteer",
            streak: calculatedStreak,
            totalPoints: calculatedPoints,
            currentTier: tierInfo.currentTier,
            nextTier: tierInfo.nextTier,
            pointsToNextTier: tierInfo.pointsToNextTier,
            tierProgress: tierInfo.tierProgress,
          });
        }
        
        if (pointsError) {
          console.log('Error calculating points:', pointsError);
        }
        if (streakError) {
          console.log('Error calculating streak:', streakError);
        }

        // Fetch event recommendations
        const { data: eventsData, error: eventsError } = await getEventRecommendations();
        
        if (eventsError) {
          console.log('Error fetching events:', eventsError);
        } else if (eventsData) {
          // Transform the data to match the expected format
          const transformedEvents = eventsData.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            cause: event.cause,
            starts_at: event.starts_at,
            ends_at: event.ends_at,
            lat: event.lat,
            lng: event.lng,
            capacity: event.capacity,
            org_name: event.organizations?.name || 'Unknown Organization',
            distance: '-- mi away', // You might want to calculate this based on user location
          }));
          setSuggestedEvents(transformedEvents);
        }

        // Fetch recent activity
        const { data: activityData, error: activityError } = await getRecentActivity();
        
        if (activityError) {
          console.log('Error fetching recent activity:', activityError);
        } else if (activityData) {
          console.log('Setting recent activity data:', activityData);
          setRecentActivity(activityData);
        } else {
          console.log('No recent activity data received, setting empty array');
          setRecentActivity([]);
        }
      } catch (error) {
        console.log('Error in fetchUserAndEvents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndEvents();
  }, []);

  const handleViewAllActivity = () => {
    router.push('/activity-feed?userId=current');
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.signOut();
              console.log('User signed out successfully');
              // You could add navigation logic here if needed
            } catch (error) {
              console.log('Error signing out:', error);
            }
          }
        }
      ]
    );
  };


  // Loading screen component
  const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading your profile...</Text>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Widget */}
      <View style={styles.profileWidget}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={18} color={colors.streakActive} />
            <Text style={styles.streakText}>{user.streak} week streak</Text>
          </View>
          <Text style={styles.tierText}>{user.currentTier}</Text>
          <Text style={styles.pointsText}>{user.totalPoints} points</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Next Tier: {user.nextTier}</Text>
          <Text style={styles.progressPoints}>{user.pointsToNextTier} points to go</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${user.tierProgress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(user.tierProgress * 100)}%</Text>
        </View>
      </View>

      {/* For You Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>For You</Text>
        <Text style={styles.sectionSubtitle}>
          {suggestedEvents.length > 0 ? 'Recommended Events Near You' : 'Loading recommendations...'}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.eventsScrollView}
        >
          {suggestedEvents.map((event) => (
            <HomeEventCard
              key={event.id}
              {...event}
            />
          ))}
        </ScrollView>
        {suggestedEvents.length === 0 && (
            <Text style={styles.noActivityText}>There are no events happening today near you :(</Text>
          )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={handleViewAllActivity} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityEvent}>{activity.event}</Text>
                {activity.organization && activity.organization.trim() !== '' && (
                  <Text style={styles.activityOrganization}>{activity.organization}</Text>
                )}
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              <View style={styles.activityStats}>
                <Text style={styles.activityPoints}>+{activity.points} pts</Text>
                <Text style={styles.activityHours}>{activity.hours}h</Text>
              </View>
            </View>
          ))}
          {recentActivity.length === 0 && (
            <Text style={styles.noActivityText}>No recent activity. Ready to make a difference?</Text>
          )}
        </View>
      </View>

      {/* Sign Out Button - For Testing */}
      <View style={styles.signOutSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out (Testing)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default HomeScreen;

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Loading Screen Styles
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
    fontWeight: '500',
  },
  // Profile Widget Styles
  profileWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.streakActive,
    marginLeft: 6,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Progress Bar Styles
  progressSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressPoints: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
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
  // Section Styles
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  // Event Card Styles
  eventsScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  // Activity Styles
  activityList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activityOrganization: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 2,
  },
  activityHours: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noActivityText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  // Sign Out Button Styles
  signOutSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
});
