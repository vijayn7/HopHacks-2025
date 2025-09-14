import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
// Learn More button will trigger the onPress callback provided by parent

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
  image_url?: string | null;
  onPress?: () => void;
  showLearnMoreButton?: boolean;
  isOwner?: boolean;
  onQRCodePress?: () => void;
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
  image_url,
  onPress,
  showLearnMoreButton = true,
  isOwner = false,
  onQRCodePress,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

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


  // Get icon for cause/category
  const getCauseIcon = (cause: string) => {
    switch (cause) {
      case 'food_security':
        return 'restaurant';
      case 'animal_welfare':
        return 'paw';
      case 'environment':
        return 'leaf';
      case 'education':
        return 'school';
      case 'health':
        return 'medical';
      case 'community':
        return 'people';
      default:
        return 'heart';
    }
  };

  // Get color for cause/category
  const getCauseColor = (cause: string) => {
    switch (cause) {
      case 'food_security':
        return '#4CAF50'; // Green
      case 'animal_welfare':
        return '#9C27B0'; // Purple
      case 'environment':
        return '#4CAF50'; // Green
      case 'education':
        return '#2196F3'; // Blue
      case 'health':
        return '#F44336'; // Red
      case 'community':
        return '#FF9800'; // Orange
      default:
        return colors.primary; // Default orange
    }
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isOwner && (
        <View style={styles.ownerBadge}>
          <Text style={styles.ownerBadgeText}>Owner</Text>
        </View>
      )}
      <View style={styles.eventHeader}>
        {/* Event Image */}
        <View style={styles.eventImageContainer}>
          {image_url ? (
            <>
              <Image
                source={{ uri: image_url }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            </>
          ) : (
            <View style={styles.debugContainer}>
              <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.debugText}>No image</Text>
            </View>
          )}
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
      
      <View style={styles.detailsRow}>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailItem}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>{getLocationText()}</Text>
          </View>
          <View style={styles.eventDetailItem}>
            <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>{formatCause(cause)}</Text>
          </View>
          {capacity && (
            <View style={styles.eventDetailItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.eventDetailText}>Cap: {capacity}</Text>
            </View>
          )}
          <View style={styles.eventDetailItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>{formatEventTime(starts_at, ends_at)}</Text>
          </View>
        </View>
        {isOwner && onQRCodePress && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={onQRCodePress}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.textWhite} />
          </TouchableOpacity>
        )}
      </View>
      
      {showLearnMoreButton && (
        <TouchableOpacity style={styles.learnMoreButton} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.learnMoreButtonText}>Learn More</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default EventsEventCard;

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      width: '100%',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    ownerBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.primary,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
    },
    ownerBadgeText: {
      color: colors.textWhite,
      fontSize: 10,
      fontWeight: '600',
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
      backgroundColor: colors.borderLight || '#E5E5E5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },
    eventImage: {
      width: '100%',
      height: '100%',
    },
    debugContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    debugText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    eventInfo: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    eventOrganization: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    eventDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 18,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    eventDetails: {
      flex: 1,
      marginRight: 12,
    },
    eventDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    eventDetailText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 6,
    },
    learnMoreButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    learnMoreButtonText: {
      color: colors.textWhite,
      fontSize: 14,
      fontWeight: '600',
    },
    scanButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
      alignSelf: 'flex-end',
    },
  });
