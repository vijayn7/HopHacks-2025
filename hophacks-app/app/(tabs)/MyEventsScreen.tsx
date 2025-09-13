import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import EventsEventCard, { EventsEventCardProps } from '../../components/Events/EventsEventCard';
import SpecificEventPage from '../../components/SpecificEventPage';
import { getJoinedEvents } from '../../lib/apiService';

interface JoinedEvent extends EventsEventCardProps {
  org_name: string;
  distance?: string;
}

type EventsByDate = Record<string, JoinedEvent[]>;

const MyEventsScreen = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventPageVisible, setEventPageVisible] = useState(false);

  useEffect(() => {
    fetchJoinedEvents();
  }, []);

  const fetchJoinedEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await getJoinedEvents();

      if (error) {
        setError(error.message || 'Failed to fetch events');
        return;
      }

      const grouped: EventsByDate = {};
      if (data) {
        data.forEach((join: any) => {
          const event = join.events;
          if (!event) return;
          const dateKey = new Date(event.starts_at).toDateString();
          const formatted: JoinedEvent = {
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
            distance: event.lat && event.lng ? 'Near you' : 'Location TBD',
            onPress: undefined,
            showLearnMoreButton: false,
          };
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(formatted);
        });
      }

      setEventsByDate(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
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

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your events...</Text>
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

  const sortedDates = Object.keys(eventsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{formatDateLabel(date)}</Text>
                <View style={styles.dateLine} />
              </View>
              {eventsByDate[date].map((event) => (
                <View key={event.id} style={styles.eventWrapper}>
                  <EventsEventCard
                    {...event}
                    onPress={() => openEvent(event.id)}
                    showLearnMoreButton={false}
                  />
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No joined events yet</Text>
            <Text style={styles.emptySubtext}>Join an event to see it here!</Text>
          </View>
        )}
      </ScrollView>

      {selectedEventId && (
        <SpecificEventPage
          eventId={selectedEventId}
          visible={eventPageVisible}
          onClose={closeEvent}
          onJoinSuccess={closeEvent}
        />
      )}
    </>
  );
};

export default MyEventsScreen;

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
  dateSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
  },
  eventWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
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
});

