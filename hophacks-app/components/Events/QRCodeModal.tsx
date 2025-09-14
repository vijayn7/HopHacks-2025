import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  value: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ visible, onClose, value }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Event Sign-In</Text>
          <QRCode value={value} size={200} />
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default QRCodeModal;

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    closeButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    closeButtonText: {
      color: colors.textWhite,
      fontSize: 14,
      fontWeight: '600',
    },
  });
