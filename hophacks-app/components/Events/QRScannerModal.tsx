import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
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
  const [mode, setMode] = useState<'in' | 'out'>('in');
  const [scanned, setScanned] = useState(false);
  const highlight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setMode('in');
      requestPermission();
    }
  }, [visible, requestPermission]);

  useEffect(() => {
    Animated.timing(highlight, {
      toValue: mode === 'in' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [mode, highlight]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    const eventId = data;
    const isSignIn = mode === 'in';

    Alert.alert(
      `Confirm ${isSignIn ? 'Sign In' : 'Sign Out'}`,
      `Do you want to ${isSignIn ? 'sign in to' : 'sign out of'} this event?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'OK',
          onPress: async () => {
            const result = isSignIn
              ? await checkInToEvent(eventId)
              : await checkOutFromEvent(eventId);
            if (result.error) {
              console.log(result.error.message || 'Unable to update attendance');
            } else {
              console.log(
                isSignIn ? 'Checked in successfully' : 'Checked out successfully'
              );
              onSuccess && onSuccess();
            }
            onClose();
          },
        },
      ]
    );
  };

  if (!permission) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {permission.granted ? (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarCodeScanned}
            />
            <View style={styles.frameContainer} pointerEvents="none">
              <View style={styles.frame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
            <Text style={styles.instructions}>Scan the event QR code</Text>
          </>
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Camera permission is required</Text>
          </View>
        )}
        <View style={styles.controls}>
          <View style={styles.toggleWrapper}>
            <Animated.View
              style={[
                styles.toggleHighlight,
                {
                  left: highlight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '50%'],
                  }),
                },
              ]}
            />
            <TouchableOpacity style={styles.toggleOption} onPress={() => setMode('in')}>
              <Text style={[styles.toggleText, mode === 'in' && styles.selectedToggleText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleOption} onPress={() => setMode('out')}>
              <Text style={[styles.toggleText, mode === 'out' && styles.selectedToggleText]}>Sign Out</Text>
            </TouchableOpacity>
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
    instructions: {
      position: 'absolute',
      top: 60,
      alignSelf: 'center',
      color: colors.textWhite,
      fontSize: 16,
    },
    frameContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    frame: {
      width: 250,
      height: 250,
    },
    corner: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderColor: colors.textWhite,
      borderWidth: 2,
    },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    controls: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    toggleWrapper: {
      width: 200,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      overflow: 'hidden',
      marginBottom: 16,
    },
    toggleHighlight: {
      position: 'absolute',
      width: '50%',
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    toggleOption: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    selectedToggleText: {
      color: colors.textWhite,
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
