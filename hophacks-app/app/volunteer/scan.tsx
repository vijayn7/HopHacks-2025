import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { signInToEvent, signOutFromEvent } from '../../lib/apiService';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannedId(data);
  };

  const handleSignIn = async () => {
    if (!scannedId) return;
    const { error } = await signInToEvent(scannedId);
    setMessage(error ? 'Failed to sign in' : 'Signed in successfully');
  };

  const handleSignOut = async () => {
    if (!scannedId) return;
    const { error } = await signOutFromEvent(scannedId);
    setMessage(error ? 'Failed to sign out' : 'Signed out successfully');
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {scannedId ? (
        <View style={styles.actions}>
          <Text style={styles.eventText}>Event: {scannedId}</Text>
          <Button title="Sign In" onPress={handleSignIn} />
          <Button title="Sign Out" onPress={handleSignOut} />
          <Button title="Scan Again" onPress={() => { setScannedId(null); setMessage(''); }} />
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </View>
      ) : (
        <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={{ flex: 1 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  eventText: { fontSize: 16, marginBottom: 8 },
  message: { marginTop: 12 },
});
