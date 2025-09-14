import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';

interface InviteCodeModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  inviteCode: string;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  visible,
  onClose,
  groupName,
  inviteCode,
}) => {
  const [copied, setCopied] = useState(false);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  const handleShareCode = async () => {
    try {
      const shareMessage = `Join my group "${groupName}" on HopHacks! Use invite code: ${inviteCode}`;
      await Share.share({
        message: shareMessage,
        title: `Join "${groupName}"`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite code');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Created!</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>

          <Text style={styles.title}>Welcome to &quot;{groupName}&quot;!</Text>
          <Text style={styles.subtitle}>
            Your group has been created successfully. Share the invite code below with friends to get them to join!
          </Text>

          <View style={styles.inviteCodeSection}>
            <Text style={styles.inviteCodeLabel}>Invite Code</Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCode}>{inviteCode}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyCode}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy"}
                  size={20}
                  color={copied ? colors.success : colors.primary}
                />
              </TouchableOpacity>
            </View>
            {copied && (
              <Text style={styles.copiedText}>Copied to clipboard!</Text>
            )}
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to invite others:</Text>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Share the invite code with friends
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                They can join by entering the code in the Groups tab
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Start competing and earning points together!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareCode}
          >
            <Ionicons name="share" size={20} color={colors.textWhite} />
            <Text style={styles.shareButtonText}>Share Invite Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  inviteCodeSection: {
    width: '100%',
    marginBottom: 32,
  },
  inviteCodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  copiedText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  instructions: {
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default InviteCodeModal;
