import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  // Mock data - replace with real data later
  const user = {
    name: "Alex Johnson",
    streak: 3,
    totalPoints: 1250,
    currentTier: "Community Helper",
    nextTier: "Volunteer Champion",
    pointsToNextTier: 200,
    tierProgress: 0.86, // 1250 / 1450 = 0.86
  };

  const suggestedEvents = [
    {
      id: 1,
      title: "Food Pantry Packing",
      organization: "Ann Arbor Food Bank",
      time: "Today, 2:00 PM",
      location: "0.5 mi away",
      cause: "Food Security",
    },
    {
      id: 2,
      title: "Animal Shelter Cleanup",
      organization: "Humane Society",
      time: "Tomorrow, 10:00 AM",
      location: "1.2 mi away",
      cause: "Animal Welfare",
    },
    {
      id: 3,
      title: "Community Garden",
      organization: "Green Thumb Initiative",
      time: "Saturday, 9:00 AM",
      location: "0.8 mi away",
      cause: "Environment",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      event: "Soup Kitchen Volunteer",
      organization: "Community Kitchen",
      date: "Yesterday",
      points: 45,
      hours: 3,
    },
    {
      id: 2,
      event: "Beach Cleanup",
      organization: "Ocean Conservation",
      date: "3 days ago",
      points: 30,
      hours: 2,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Widget */}
      <View style={styles.profileWidget}>
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={40} color={Colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={18} color={Colors.streakActive} />
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
        <Text style={styles.sectionSubtitle}>Happening Today Near You</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.eventsScrollView}
        >
          {suggestedEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
              <Text style={styles.eventOrganization}>{event.organization}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventDetailText}>{event.cause}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Event</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {suggestedEvents.length === 0 && (
            <Text style={styles.noActivityText}>There are no events happening today near you :(</Text>
          )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityEvent}>{activity.event}</Text>
                <Text style={styles.activityOrganization}>{activity.organization}</Text>
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
    </ScrollView>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Profile Widget Styles
  profileWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
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
    backgroundColor: Colors.primaryLight,
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
    color: Colors.textPrimary,
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
    color: Colors.streakActive,
    marginLeft: 6,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Progress Bar Styles
  progressSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow,
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
    color: Colors.textPrimary,
  },
  progressPoints: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  // Section Styles
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  // Event Card Styles
  eventsScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  eventOrganization: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  // Activity Styles
  activityList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
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
    borderBottomColor: Colors.borderLight,
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityOrganization: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 2,
  },
  activityHours: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noActivityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
