import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Image,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorScheme } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { getEventById, getCurrentUserProfile, getEventParticipants } from '../lib/apiService';
import EventCallToActionButton from './EventCallToActionButton';

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
  image_url?: string;
  created_by?: string;
  organizations?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    verified: boolean;
  };
}

interface EventParticipant {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  checkedIn: boolean;
  checkedOut: boolean;
  joinedAt: string;
  checkInAt?: string;
  checkOutAt?: string;
}

interface SpecificEventPageProps {
  eventId: string;
  visible: boolean;
  onClose: () => void;
  onJoinSuccess?: () => void;
}

const SpecificEventPage: React.FC<SpecificEventPageProps> = ({
  eventId,
  visible,
  onClose,
  onJoinSuccess,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    if (visible && eventId) {
      fetchEventDetails(eventId);
    }
  }, [visible, eventId]);

  // Helper function to clean image URLs
  const cleanImageUrl = (url: string) => {
    if (!url) return null;
    
    // Remove $0 suffix and other common issues
    let cleaned = url.replace(/\$0$/, '').trim();
    
    // Remove URL parameters (everything after ?)
    cleaned = cleaned.split('?')[0];
    
    // Ensure it's a valid URL
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      console.log('Invalid URL:', url);
      return null;
    }
  };

  const fetchEventDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    // Get current user ID
    const { data: userData } = await getCurrentUserProfile();
    if (userData) {
      setCurrentUserId(userData.id);
    }
    
    const { data, error } = await getEventById(id);
    
    if (error) {
      setError('Failed to load event details.');
      console.error('Error fetching event:', error);
    } else {
      // Clean the image URL before setting the event
      const cleanedData = {
        ...data,
        image_url: data?.image_url ? cleanImageUrl(data.image_url) : null
      };
      setEvent(cleanedData);
      
      // If user is the owner, fetch participants
      if (userData && data?.created_by === userData.id) {
        fetchParticipants(id);
      }
    }
    
    setLoading(false);
  };

  const fetchParticipants = async (eventId: string) => {
    setParticipantsLoading(true);
    try {
      const { data, error } = await getEventParticipants(eventId);
      if (error) {
        console.error('Error fetching participants:', error);
      } else {
        setParticipants(data || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
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

  // Handle share functionality
  const handleShare = async () => {
    if (!event) return;

    try {
      const shareMessage = `Check out this volunteering opportunity!\n\n${event.title}\nOrganized by: ${event.organizations?.name || 'Organization'}\n\n${formatEventTime(event.starts_at, event.ends_at)}\n${getLocationText()}\n\n${event.description ? `${event.description.substring(0, 100)}...` : 'Join us for a great cause!'}\n\nDownload the app to join this event!`;

      const result = await Share.share({
        message: shareMessage,
        title: event.title,
      });

      if (result.action === Share.sharedAction) {
        // Share was successful
        console.log('Event shared successfully');
      } else if (result.action === Share.dismissedAction) {
        // Share was dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      Alert.alert('Error', 'Failed to share event. Please try again.');
    }
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
            {event?.image_url ? (
              <Image
                source={{ uri: event.image_url }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="calendar" size={56} color={colors.primary} style={styles.placeholderIcon} />
                <Text style={styles.placeholderText}>Event Image</Text>
              </View>
            )}
            
            
            {/* Navigation Buttons */}
            <TouchableOpacity
              style={[styles.navButton, styles.backButton]}
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={26} color={colors.textPrimary} />
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

          {/* Participants Section - Only show for event owners */}
          {currentUserId === event.created_by && (
            <View style={styles.participantsCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.participantsHeading}>Participants ({participants.length})</Text>
              </View>
              
              {participantsLoading ? (
                <View style={styles.participantsLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.participantsLoadingText}>Loading participants...</Text>
                </View>
              ) : participants.length > 0 ? (
                <View style={styles.participantsList}>
                  {/* Header Row */}
                  <View style={styles.participantHeaderRow}>
                    <Text style={styles.participantHeaderText}>Name</Text>
                    <Text style={styles.participantHeaderText}>Checked In</Text>
                  </View>
                  
                  {/* Participant Rows */}
                  {participants.map((participant) => (
                    <View key={participant.id} style={styles.participantRow}>
                      <View style={styles.participantInfo}>
                        {participant.avatarUrl ? (
                          <Image
                            source={{ uri: participant.avatarUrl }}
                            style={styles.participantAvatar}
                          />
                        ) : (
                          <View style={styles.participantAvatarPlaceholder}>
                            <Ionicons name="person" size={16} color={colors.textSecondary} />
                          </View>
                        )}
                        <Text style={styles.participantName}>{participant.displayName}</Text>
                      </View>
                      <View style={styles.checkInStatus}>
                        {participant.checkedIn ? (
                          <Ionicons name="checkmark-circle" size={20} color={colors.success || '#4CAF50'} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={20} color={colors.textSecondary} />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noParticipantsText}>No participants yet</Text>
              )}
            </View>
          )}

          {/* Bottom spacing for sticky button */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Sticky Bottom CTA Button */}
        <View style={styles.stickyButtonContainer}>
          {event && (
            <EventCallToActionButton
              eventId={event.id}
              style={styles.joinButton}
              isOwner={currentUserId === event.created_by}
              onJoined={() => {
                onClose();
                onJoinSuccess && onJoinSuccess();
              }}
              onLeft={() => {
                onClose();
                onJoinSuccess && onJoinSuccess();
              }}
            />
          )}
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
    bannerImage: {
      width: '100%',
      height: '100%',
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
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
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
      marginTop: -12,
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
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
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
    participantsCard: {
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
    participantsHeading: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    participantsLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    participantsLoadingText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.textSecondary,
    },
    participantsList: {
      marginTop: 16,
    },
    participantHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
    },
    participantHeaderText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    participantRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 4,
    },
    participantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    participantAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
    },
    participantAvatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.borderLight || '#E5E5E5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    participantName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
    },
    checkInStatus: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
    },
    noParticipantsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      paddingVertical: 20,
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
  });

export default SpecificEventPage;
