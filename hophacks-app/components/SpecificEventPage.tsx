import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorScheme } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { getEventById } from '../lib/apiService';

interface EventDetail {
  id: string;
  title: string;
  description?: string;
  cause: string;
  starts_at: string;
  ends_at: string;
  lat?: number;
  lng?: number;
  capacity?: number;
  organizations?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    verified: boolean;
  };
}

interface SpecificEventPageProps {
  eventId: string;
  visible: boolean;
  onClose: () => void;
}

const SpecificEventPage: React.FC<SpecificEventPageProps> = ({
  eventId,
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && eventId) {
      fetchEventDetails(eventId);
    }
  }, [visible, eventId]);

  const fetchEventDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await getEventById(id);
    
    if (error) {
      setError('Failed to load event details.');
      console.error('Error fetching event:', error);
    } else {
      setEvent(data);
    }
    
    setLoading(false);
  };

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
    if (event?.lat && event?.lng) {
      return 'Near you';
    }
    return 'Location TBD';
  };

  const handleJoinEvent = () => {
    Alert.alert(
      'Join Event',
      'Are you sure you want to join this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', style: 'default', onPress: () => {
          console.log('Joined event:', event?.title);
          onClose(); // Close the modal after joining
        }}
      ]
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      );
    }

    if (error || !event) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {/* Header with Banner Image */}
        <View style={styles.headerContainer}>
          {/* Event Image Banner */}
          <View style={styles.bannerContainer}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="calendar" size={56} color={colors.primary} style={styles.placeholderIcon} />
              <Text style={styles.placeholderText}>Event Image</Text>
            </View>
            
            {/* Navigation Buttons */}
            <TouchableOpacity 
              style={[styles.navButton, styles.backButton]} 
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.shareButton]} 
              onPress={() => console.log('Share event')}
            >
              <Ionicons name="share-outline" size={26} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Event Info Card */}
          <View style={styles.mainInfoCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.organizationName}>
              {event.organizations?.name || 'Organization'}
              {event.organizations?.verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.verifiedIcon} />
              )}
            </Text>
          </View>

          {/* Key Event Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={24} color={colors.primary} style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{getLocationText()}</Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Ionicons name="pricetag" size={24} color={colors.primary} style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{formatCause(event.cause)}</Text>
              </View>
            </View>

            {event.capacity && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Ionicons name="people" size={24} color={colors.primary} style={styles.detailIcon} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Capacity</Text>
                    <Text style={styles.detailValue}>Cap: {event.capacity} people</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Ionicons name="time" size={24} color={colors.primary} style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatEventTime(event.starts_at, event.ends_at)}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          {event.description && (
            <View style={styles.descriptionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.descriptionHeading}>About this event</Text>
              </View>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          )}

          {/* Bottom spacing for sticky button */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Sticky Bottom CTA Button */}
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
            <Text style={styles.joinButtonText}>Join Event</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors: ColorScheme) =>
  StyleSheet.create({
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    errorBackButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    backButtonText: {
      color: colors.textWhite,
      fontSize: 16,
      fontWeight: '600',
    },
    headerContainer: {
      position: 'relative',
    },
    bannerContainer: {
      height: 240,
      backgroundColor: colors.surfaceSecondary,
      position: 'relative',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 16,
      margin: 16,
    },
    placeholderIcon: {
      marginBottom: 8,
    },
    placeholderText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
      opacity: 0.8,
    },
    navButton: {
      position: 'absolute',
      top: 50,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    backButton: {
      left: 20,
    },
    shareButton: {
      right: 20,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 120, // Space for sticky button
    },
    mainInfoCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: -16,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      zIndex: 1,
    },
    eventTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 8,
      lineHeight: 34,
    },
    organizationName: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: '500',
      flexDirection: 'row',
      alignItems: 'center',
    },
    verifiedIcon: {
      marginLeft: 6,
    },
    detailsCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    detailIcon: {
      marginRight: 16,
      width: 24,
      textAlign: 'center',
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      fontSize: 17,
      color: colors.textPrimary,
      fontWeight: '600',
      lineHeight: 22,
    },
    detailDivider: {
      height: 1,
      backgroundColor: colors.border || '#E5E5E5',
      marginVertical: 4,
      marginLeft: 40, // Align with content, not icons
    },
    descriptionCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    sectionHeader: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    descriptionHeading: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    descriptionText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      fontWeight: '400',
    },
    bottomSpacing: {
      height: 40,
    },
    stickyButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40, // Safe area for iOS home bar
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    joinButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    joinButtonText: {
      color: colors.textWhite,
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
  });

export default SpecificEventPage;