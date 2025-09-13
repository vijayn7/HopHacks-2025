import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Interface matching the events table schema from agents.txt
export interface EventCardProps {
  id: string; // uuid from schema
  title: string;
  description?: string;
  cause: 'food_security' | 'animal_welfare' | 'environment' | 'education' | 'health' | 'community' | 'other'; // enum from schema
  starts_at: string; // timestamp with time zone
  ends_at: string; // timestamp with time zone
  lat?: number; // double precision
  lng?: number; // double precision
  capacity?: number; // integer
  org_name?: string; // from organizations table join
  distance?: string; // calculated field for UI
  onPress?: () => void;
  showJoinButton?: boolean;
  fullWidth?: boolean; // New prop to control width
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  cause,
  starts_at,
  ends_at,
  lat,
  lng,
  capacity,
  org_name = 'Organization',
  distance = 'Location TBD',
  onPress,
  showJoinButton = true,
  fullWidth = false,
}) => {
  // Format date/time for display
  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    // Simple time formatting - can be enhanced with a date library
    const isToday = start.toDateString() === now.toDateString();
    const isTomorrow = start.toDateString() === new Date(now.getTime() + 24*60*60*1000).toDateString();
    
    let dayText = '';
    if (isToday) dayText = 'Today';
    else if (isTomorrow) dayText = 'Tomorrow';
    else dayText = start.toLocaleDateString();
    
    const timeText = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${dayText}, ${timeText}`;
  };

  // Format cause for display
  const formatCause = (cause: string) => {
    return cause.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Calculate location text
  const getLocationText = () => {
    if (lat && lng) {
      return distance || 'Near you';
    }
    return distance;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      console.log(`Joining event: ${title}`);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.eventCard, 
        fullWidth && styles.eventCardFullWidth
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{title}</Text>
        <Text style={styles.eventTime}>{formatEventTime(starts_at, ends_at)}</Text>
      </View>
      
      <Text style={styles.eventOrganization}>{org_name}</Text>
      
      {description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {description}
        </Text>
      )}
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetailItem}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.eventDetailText}>{getLocationText()}</Text>
        </View>
        <View style={styles.eventDetailItem}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.eventDetailText}>{formatCause(cause)}</Text>
        </View>
        {capacity && (
          <View style={styles.eventDetailItem}>
            <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.eventDetailText}>Cap: {capacity}</Text>
          </View>
        )}
      </View>
      
      {showJoinButton && (
        <TouchableOpacity style={styles.joinButton} onPress={handlePress}>
          <Text style={styles.joinButtonText}>Join Event</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default EventCard;

const styles = StyleSheet.create({
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
  eventCardFullWidth: {
    width: '100%',
    marginRight: 0,
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
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
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
});