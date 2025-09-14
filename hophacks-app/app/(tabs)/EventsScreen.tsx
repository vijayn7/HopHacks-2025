import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import EventsEventCard, { EventsEventCardProps } from '../../components/Events/EventsEventCard';
import SpecificEventPage from '../../components/SpecificEventPage';
import { getUnjoinedEvents, getCurrentUserProfile } from '../../lib/apiService';
import CreateEventModal from '../../components/Events/CreateEventModal';
import QRCodeModal from '../../components/Events/QRCodeModal';
import { Ionicons } from '@expo/vector-icons';

interface Event extends EventsEventCardProps {
  org_name: string;
  distance?: string;
  image_url?: string | null;
}

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventPageVisible, setEventPageVisible] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrEventId, setQrEventId] = useState<string | null>(null);
  const animations = useRef<Record<string, { slide: Animated.Value; bubble: Animated.Value }>>({});
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  useEffect(() => {
    checkRole();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchEvents();
      const interval = setInterval(() => fetchEvents(true), 60000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  // Helper function to clean image URLs
  const cleanImageUrl = (url: string) => {
    if (!url) return null;
    // Remove $0 suffix and other common issues
    let cleaned = url.replace(/\$0$/, '').trim();
    // Ensure it's a valid URL
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      console.log('Invalid URL:', url);
      return null;
    }
  };

  const checkRole = async () => {
    const { data } = await getCurrentUserProfile();
    if (data) {
      if (data.role === 'organizer') {
        setIsOrganizer(true);
      }
      setCurrentUserId(data.id);
    }
  };

  const fetchEvents = async (background = false) => {
    try {
      if (!background) {
        setLoading(true);
        setError(null);
      }

      // Fetch events the user hasn't joined
      const { data, error } = await getUnjoinedEvents();

      if (error) {
        if (!background) setError(error.message || 'Failed to fetch events');
        return;
      }

      if (data) {
        // Transform the data to match our EventCard interface
        const transformedEvents: Event[] = data.map((event: any) => {
          console.log('🔍 EventsScreen - Raw event data:', event);
          console.log('🖼️ EventsScreen - Event image_url (raw):', event.image_url);
          const cleanedUrl = event.image_url ? cleanImageUrl(event.image_url) : null;
          console.log('🧹 EventsScreen - Event image_url (cleaned):', cleanedUrl);
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
            distance: event.lat && event.lng ? 'Near you' : 'Location TBD', // TODO: Calculate actual distance
            image_url: cleanedUrl,
            isOwner: event.created_by === currentUserId,
          };
        });

        setEvents(transformedEvents);
      }
    } catch (err) {
      if (!background) setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      if (!background) setLoading(false);
    }
  };

  const openEvent = (id: string) => {
    setSelectedEventId(id);
    setEventPageVisible(true);
  };

  const closeEvent = () => {
    setEventPageVisible(false);
    setSelectedEventId(null);
  };

  const openQRCode = (id: string) => {
    setQrEventId(id);
    setQrVisible(true);
  };

  const handleEventJoined = (id: string) => {
    if (!animations.current[id]) {
      animations.current[id] = {
        slide: new Animated.Value(0),
        bubble: new Animated.Value(0),
      };
    }
    const { slide, bubble } = animations.current[id];

    // Slide the card out
    Animated.timing(slide, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Show bubble, blink after 1 second, then remove event
    bubble.setValue(1);
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(bubble, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(bubble, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(bubble, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      delete animations.current[id];
    });

    closeEvent();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>All Events</Text>
          <Text style={styles.subtitle}>Find volunteering opportunities near you</Text>
        </View>

        <View style={styles.eventsContainer}>
          {events.length > 0 ? (
            events.map((event) => {
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
                <View key={event.id} style={styles.eventWrapper}>
                  <Animated.View style={[styles.joinBubbleContainer, { opacity: bubble }]}>
                    <View style={styles.joinBubble}>
                      <Text style={styles.joinBubbleText}>Joined!</Text>
                    </View>
                  </Animated.View>
                  <Animated.View style={{ transform: [{ translateX }], opacity }}>
                    <EventsEventCard
                      {...event}
                      onPress={() => openEvent(event.id)}
                      onQRCodePress={() => openQRCode(event.id)}
                    />
                  </Animated.View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events available at the moment</Text>
              <Text style={styles.emptySubtext}>Check back later for new opportunities!</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {isOrganizer && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={32} color={colors.textWhite} />
        </TouchableOpacity>
      )}

      <CreateEventModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={fetchEvents}
      />

      {selectedEventId && (
        <SpecificEventPage
          eventId={selectedEventId}
          visible={eventPageVisible}
          onClose={closeEvent}
          onJoinSuccess={() => selectedEventId && handleEventJoined(selectedEventId)}
        />
      )}

      <QRCodeModal
        visible={qrVisible}
        value={qrEventId || ''}
        onClose={() => setQrVisible(false)}
      />
    </>
  );
};

export default EventsScreen;

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  eventWrapper: {
    marginBottom: 16,
    width: '100%',
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
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
