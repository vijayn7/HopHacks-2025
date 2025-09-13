import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import EventCallToActionButton from '../EventCallToActionButton';

// Interface for EventsScreen event cards (full-width, detailed view)
export interface EventsEventCardProps {
  id: string;
  title: string;
  description?: string;
  cause: 'food_security' | 'animal_welfare' | 'environment' | 'education' | 'health' | 'community' | 'other';
  starts_at: string;
  ends_at: string;
  lat?: number;
  lng?: number;
  capacity?: number;
  org_name?: string;
  distance?: string;
  onPress?: () => void;
  showJoinButton?: boolean;
}

const EventsEventCard: React.FC<EventsEventCardProps> = ({
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
}) => {
  // Format date/time for display
  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    
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
      style={styles.eventCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.eventHeader}>
        {/* Event Image Placeholder */}
        <View style={styles.eventImageContainer}>
          <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
        </View>
        
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{title}</Text>
          <Text style={styles.eventOrganization}>{org_name}</Text>
        </View>
      </View>
      
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
        <View style={styles.eventDetailItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.eventDetailText}>{formatEventTime(starts_at, ends_at)}</Text>
        </View>
      </View>
      
      {showJoinButton && (
        <EventCallToActionButton onPress={handlePress} />
      )}
    </TouchableOpacity>
  );
};

export default EventsEventCard;

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.borderLight || '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  eventOrganization: {
    fontSize: 14,
    color: Colors.textSecondary,
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
});