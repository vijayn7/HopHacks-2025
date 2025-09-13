
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';
import { getAllEvents } from '../lib/apiService';


interface Event {
  id: string;
  org_id: string;
  title: string;
  cause: string;
  description: string;
  starts_at: string;
  ends_at: string;
  lat: number;
  lng: number;
  capacity: number;
  qr_secret: string;
  created_by: string;
  is_published: boolean;
  created_at: string;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const start = new Date(event.starts_at);
  const end = new Date(event.ends_at);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.cause}>{event.cause}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Text style={styles.time}>
        {start.toLocaleString()} - {end.toLocaleString()}
      </Text>
      <Text style={styles.capacity}>Capacity: {event.capacity}</Text>
    </View>
  );
};


const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await getAllEvents();
      if (error) {
        setError('Failed to load events.');
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EventCard event={item} />}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cause: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  capacity: {
    fontSize: 12,
    color: Colors.textLight,
  },
});

export default EventsList;
