import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { checkInToEvent, checkOutFromEvent } from '../../lib/apiService';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ visible, onClose, onSuccess }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [permission, requestPermission] = useCameraPermissions();
  const [isSignIn, setIsSignIn] = useState(true);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      requestPermission();
    }
  }, [visible, requestPermission]);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    const eventId = data;
    const result = isSignIn ? await checkInToEvent(eventId) : await checkOutFromEvent(eventId);

    if (result.error) {
      Alert.alert('Error', result.error.message || 'Unable to update attendance');
    } else {
      Alert.alert('Success', isSignIn ? 'Checked in successfully' : 'Checked out successfully');
      onSuccess && onSuccess();
    }
    onClose();
  };

  if (!permission) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {permission.granted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Camera permission is required</Text>
          </View>
        )}
        <View style={styles.controls}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>{isSignIn ? 'Sign In' : 'Sign Out'}</Text>
            <Switch value={isSignIn} onValueChange={setIsSignIn} />
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default QRScannerModal;

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    controls: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    toggleLabel: {
      color: colors.textWhite,
      fontSize: 16,
      marginRight: 8,
    },
    closeButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    closeButtonText: {
      color: colors.textWhite,
      fontSize: 16,
      fontWeight: '600',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    permissionText: {
      color: colors.textPrimary,
    },
  });
