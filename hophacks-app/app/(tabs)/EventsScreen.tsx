import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import EventsEventCard, { EventsEventCardProps } from '../../components/Events/EventsEventCard';
import { getAllEvents } from '../../lib/apiService';

interface Event extends EventsEventCardProps {
  org_name: string;
  distance?: string;
}

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch events using the API service
      const { data, error } = await getAllEvents();

      if (error) {
        setError(error.message || 'Failed to fetch events');
        return;
      }

      if (data) {
        // Transform the data to match our EventCard interface
        const transformedEvents: Event[] = data.map((event: any) => ({
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
        }));
        
        setEvents(transformedEvents);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (eventId: string) => {
    console.log('Event pressed:', eventId);
    // TODO: Navigate to event details screen
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>All Events</Text>
        <Text style={styles.subtitle}>Find volunteering opportunities near you</Text>
      </View>
      
      <View style={styles.eventsContainer}>
        {events.length > 0 ? (
          events.map((event) => (
            <View key={event.id} style={styles.eventWrapper}>
              <EventsEventCard
                {...event}
                onPress={() => handleEventPress(event.id)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events available at the moment</Text>
            <Text style={styles.emptySubtext}>Check back later for new opportunities!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default EventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  eventWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error || '#FF6B6B',
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
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
