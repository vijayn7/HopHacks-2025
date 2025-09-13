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

interface GroupActivity {
  id: string;
  memberName: string;
  action: string;
  points: number;
  timestamp: string;
  eventName?: string;
}

const ActivityFeedScreen = () => {
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loadActivityFeed = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockActivities: GroupActivity[] = [
          { 
            id: '1', 
            memberName: 'Sarah Chen', 
            action: 'completed', 
            points: 120, 
            timestamp: '2 hours ago',
            eventName: 'Food Pantry Packing'
          },
          { 
            id: '2', 
            memberName: 'Mike Rodriguez', 
            action: 'finished', 
            points: 80, 
            timestamp: '4 hours ago',
            eventName: 'Beach Cleanup'
          },
          { 
            id: '3', 
            memberName: 'Emma Wilson', 
            action: 'volunteered at', 
            points: 95, 
            timestamp: '6 hours ago',
            eventName: 'Animal Shelter'
          },
          { 
            id: '4', 
            memberName: 'David Kim', 
            action: 'completed', 
            points: 150, 
            timestamp: '1 day ago',
            eventName: 'Community Garden'
          },
          { 
            id: '5', 
            memberName: 'Alex Johnson', 
            action: 'finished', 
            points: 200, 
            timestamp: '1 day ago',
            eventName: 'Soup Kitchen'
          },
          { 
            id: '6', 
            memberName: 'Lisa Park', 
            action: 'volunteered at', 
            points: 75, 
            timestamp: '2 days ago',
            eventName: 'Senior Center'
          },
          { 
            id: '7', 
            memberName: 'James Brown', 
            action: 'completed', 
            points: 110, 
            timestamp: '2 days ago',
            eventName: 'Food Drive'
          },
          { 
            id: '8', 
            memberName: 'Maria Garcia', 
            action: 'finished', 
            points: 90, 
            timestamp: '3 days ago',
            eventName: 'Park Cleanup'
          },
          { 
            id: '9', 
            memberName: 'Tom Wilson', 
            action: 'volunteered at', 
            points: 85, 
            timestamp: '3 days ago',
            eventName: 'Homeless Shelter'
          },
          { 
            id: '10', 
            memberName: 'Anna Lee', 
            action: 'completed', 
            points: 130, 
            timestamp: '4 days ago',
            eventName: 'Blood Drive'
          },
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error loading activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivityFeed();
  }, []);

  const getActivityIcon = (action: string) => {
    if (action.includes('completed') || action.includes('finished')) {
      return 'checkmark-circle';
    }
    return 'time';
  };

  const getActivityColor = (action: string) => {
    if (action.includes('completed') || action.includes('finished')) {
      return colors.success;
    }
    return colors.textSecondary;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading activity feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Activity Feed Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptySubtitle}>Group members haven't completed any activities recently.</Text>
          </View>
        ) : (
          activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons 
                  name={getActivityIcon(activity.action)} 
                  size={24} 
                  color={getActivityColor(activity.action)} 
                />
              </View>
              
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.memberName}>{activity.memberName}</Text>{' '}
                  {activity.action}{' '}
                  <Text style={styles.eventName}>{activity.eventName}</Text>
                </Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityPoints}>+{activity.points} points</Text>
                  <Text style={styles.activityTime}>{activity.timestamp}</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  memberName: {
    fontWeight: '600',
    color: colors.primary,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  activityTime: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default ActivityFeedScreen;
