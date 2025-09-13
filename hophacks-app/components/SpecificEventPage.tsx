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
import { Colors } from '../constants/colors';
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
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      );
    }

    if (error || !event) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
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
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
            </View>
            
            {/* Navigation Buttons */}
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={onClose}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.shareButton]} 
              onPress={() => console.log('Share event')}
            >
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Main Event Info Card */}
          <View style={styles.mainInfoCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.organizationName}>
              {event.organizations?.name || 'Organization'}
            </Text>
          </View>

          {/* Key Event Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{getLocationText()}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{formatCause(event.cause)}</Text>
              </View>
            </View>

            {event.capacity && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color={Colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>Cap: {event.capacity}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatEventTime(event.starts_at, event.ends_at)}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          {event.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionHeading}>About this event</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          )}

          {/* Spacing for sticky button */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    position: 'relative',
  },
  bannerContainer: {
    height: 200,
    backgroundColor: '#E5E5E5',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  navButton: {
    position: 'absolute',
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    right: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky button
  },
  mainInfoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  organizationName: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 20,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36, // Safe area for iOS home bar
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SpecificEventPage;