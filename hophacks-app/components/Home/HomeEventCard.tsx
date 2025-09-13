import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
// Learn More button will trigger the onPress callback provided by parent

// Interface for HomeScreen event cards (compact, horizontal scrolling)
export interface HomeEventCardProps {
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
  showLearnMoreButton?: boolean;
}

const HomeEventCard: React.FC<HomeEventCardProps> = ({
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
  showLearnMoreButton = true,
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

  return (
    <TouchableOpacity 
      style={styles.eventCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.eventHeader}>
        <Text
          style={styles.eventTitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text style={styles.eventTime}>{formatEventTime(starts_at, ends_at)}</Text>
      </View>
      
      <Text style={styles.eventOrganization}>{org_name}</Text>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetailItem}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.eventDetailText}>{getLocationText()}</Text>
        </View>
        <View style={styles.eventDetailItem}>
          <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.eventDetailText}>{formatCause(cause)}</Text>
        </View>
      </View>
      
      {showLearnMoreButton && (
        <TouchableOpacity style={styles.learnMoreButton} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.learnMoreButtonText}>Learn More</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default HomeEventCard;

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginRight: 12,
      width: 280,
      shadowColor: colors.shadow,
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
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    eventTime: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    eventOrganization: {
      fontSize: 14,
      color: colors.textSecondary,
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
  });