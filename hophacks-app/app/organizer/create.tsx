import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { createEvent } from '../../lib/apiService';
import EventQRCode from '../../components/EventQRCode';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    const { data, error } = await createEvent({ title });
    if (error) {
      setError('Failed to create event');
    } else {
      setCreatedEventId(data.id);
    }
  };

  if (createdEventId) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Event QR Code</Text>
        <EventQRCode eventId={createdEventId} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Event</Text>
      <TextInput
        style={styles.input}
        placeholder="Event title"
        value={title}
        onChangeText={setTitle}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Create" onPress={handleCreate} disabled={!title} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 20, marginBottom: 16 },
  input: { width: '100%', borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 16 },
  error: { color: 'red', marginBottom: 16 },
});
