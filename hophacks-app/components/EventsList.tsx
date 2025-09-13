import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

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

const events: Event[] = [
  {
    id: '1',
    org_id: 'org1',
    title: 'Community Cleanup',
    cause: 'environment',
    description: 'Join us to clean up the local park and make our neighborhood greener.',
    starts_at: '2025-03-01T09:00:00Z',
    ends_at: '2025-03-01T12:00:00Z',
    lat: 39.2904,
    lng: -76.6122,
    capacity: 50,
    qr_secret: '1111-2222-3333-4444',
    created_by: 'user1',
    is_published: true,
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '2',
    org_id: 'org2',
    title: 'Food Drive',
    cause: 'foodSecurity',
    description: 'Help distribute food to families in need at the community center.',
    starts_at: '2025-03-05T14:00:00Z',
    ends_at: '2025-03-05T17:00:00Z',
    lat: 39.3000,
    lng: -76.6100,
    capacity: 30,
    qr_secret: '5555-6666-7777-8888',
    created_by: 'user2',
    is_published: true,
    created_at: '2025-02-10T15:30:00Z',
  },
  {
    id: '3',
    org_id: 'org3',
    title: 'Senior Tech Workshop',
    cause: 'education',
    description: 'Teach basic smartphone skills to seniors at the local library.',
    starts_at: '2025-03-10T10:00:00Z',
    ends_at: '2025-03-10T13:00:00Z',
    lat: 39.2800,
    lng: -76.6200,
    capacity: 20,
    qr_secret: '9999-0000-aaaa-bbbb',
    created_by: 'user3',
    is_published: false,
    created_at: '2025-02-15T09:45:00Z',
  },
];

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
