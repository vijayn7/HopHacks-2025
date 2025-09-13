import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import { joinEvent } from '../lib/apiService';

export interface EventCallToActionButtonProps {
  eventId: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
}

const EventCallToActionButton: React.FC<EventCallToActionButtonProps> = ({
  eventId,
  onPress,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    const { error } = await joinEvent(eventId);
    setJoining(false);

    if (error) {
      Alert.alert('Join Failed', 'Unable to join this event. Please try again later.');
    } else {
      setJoined(true);
      Alert.alert('Joined', 'You have successfully joined this event.');
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert('Join Event', 'Are you sure you want to join this event?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: handleJoin },
      ]);
    }
  };

  const isDisabled = disabled || joining || joined;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
        {joined ? 'Joined' : joining ? 'Joining...' : 'Join Event'}
      </Text>
    </TouchableOpacity>
  );
};

export default EventCallToActionButton;

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary || '#999999',
      opacity: 0.6,
    },
    buttonText: {
      color: colors.textWhite,
      fontSize: 14,
      fontWeight: '600',
    },
    buttonTextDisabled: {
      color: colors.textSecondary || '#999999',
    },
  });

