import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import HomeEventCard from '../../components/Home/HomeEventCard';
import { getUserInfoById, getEventRecommendations, getRecentActivity, calculateUserTotalPoints, calculateUserWeeklyStreak } from '@/lib/apiService';
import { router } from 'expo-router';
import SpecificEventPage from '../../components/SpecificEventPage';

interface HomeScreenProps {
  isActive: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ isActive }) => {
  // Mock data - replace with real data later

  const [user, setUser] = useState({
    name: "Alex Johnson", // fallback name
    avatar: null as string | null,
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
  const [refreshing, setRefreshing] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [eventPageVisible, setEventPageVisible] = useState(false);
    const animations = useRef<Record<string, { slide: Animated.Value; bubble: Animated.Value }>>({});
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
      if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental?.(true);
      }
    }, []);

  // Helper function to clean image URLs and provide fallbacks
  const cleanImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    const cleaned = url.replace(/\$0$/, '').trim();
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      console.log('Invalid URL:', url);
      return null;
    }
  };

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

  const fetchUserAndEvents = async (background = false) => {
    try {
      if (!background) setIsLoading(true);

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
          avatar: userData.avatar_url || null,
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
        const transformedEvents = eventsData.map((event: any) => {
          console.log('🔍 Raw event data:', event);
          console.log('🖼️ Event image_url (raw):', event.image_url);
          const cleanedUrl = event.image_url ? cleanImageUrl(event.image_url) : null;
          console.log('🧹 Event image_url (cleaned):', cleanedUrl);
          return {
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
            image_url: cleanedUrl,
          };
        });
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
      if (!background) setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserAndEvents(true);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserAndEvents();
    const interval = setInterval(() => fetchUserAndEvents(true), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchUserAndEvents(true);
    }
  }, [isActive]);

  const handleViewAllActivity = () => {
    router.push('/activity-feed?userId=current');
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

  const openEvent = (id: string) => {
    setSelectedEventId(id);
    setEventPageVisible(true);
  };

  const closeEvent = () => {
    setEventPageVisible(false);
    setSelectedEventId(null);
  };

  const avatarUri = cleanImageUrl(user.avatar);

  const handleEventJoined = (id: string) => {
    if (!animations.current[id]) {
      animations.current[id] = {
        slide: new Animated.Value(0),
        bubble: new Animated.Value(0),
      };
    }
    const { slide, bubble } = animations.current[id];

    Animated.timing(slide, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    bubble.setValue(1);
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(bubble, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(bubble, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(bubble, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSuggestedEvents((prev) => prev.filter((e) => e.id !== id));
      delete animations.current[id];
    });

    closeEvent();
  };

  return (
    <>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Profile Widget */}
      <View style={styles.profileWidget}>
        <View style={styles.profileIcon}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileIconText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          )}
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
          {suggestedEvents.slice(0, 3).map((event) => {
            if (!animations.current[event.id]) {
              animations.current[event.id] = {
                slide: new Animated.Value(0),
                bubble: new Animated.Value(0),
              };
            }
            const { slide, bubble } = animations.current[event.id];
            const translateX = slide.interpolate({
              inputRange: [0, 1],
              outputRange: [0, screenWidth],
            });
            const opacity = slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
            return (
              <View key={event.id} style={styles.suggestedEventWrapper}>
                <Animated.View style={[styles.joinBubbleContainer, { opacity: bubble }]}>
                  <View style={styles.joinBubble}>
                    <Text style={styles.joinBubbleText}>Joined!</Text>
                  </View>
                </Animated.View>
                <Animated.View style={{ transform: [{ translateX }], opacity }}>
                  <HomeEventCard
                    {...event}
                    onPress={() => openEvent(event.id)}
                  />
                </Animated.View>
              </View>
            );
          })}
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
            <Text style={styles.noActivityText}>No activity this month. Ready to make a difference?</Text>
          )}
        </View>
      </View>

      {/* Sign Out Button - For Testing */}
    </ScrollView>

    {selectedEventId && (
      <SpecificEventPage
        eventId={selectedEventId}
        visible={eventPageVisible}
        onClose={closeEvent}
        onJoinSuccess={() => selectedEventId && handleEventJoined(selectedEventId)}
      />
    )}
    </>
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    overflow: 'hidden',
  },
  profileIconText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textWhite,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
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
  suggestedEventWrapper: {
    position: 'relative',
  },
  joinBubbleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  joinBubble: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.success,
  },
  joinBubbleText: {
    color: colors.textWhite,
    fontWeight: '600',
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
});
