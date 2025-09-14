import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import { joinEvent, leaveEvent, checkIfUserJoinedEvent } from '../lib/apiService';

export interface EventCallToActionButtonProps {
  eventId: string;
  disabled?: boolean;
  style?: object;
  onJoined?: () => void;
  onLeft?: () => void;
  isOwner?: boolean;
}

const EventCallToActionButton: React.FC<EventCallToActionButtonProps> = ({
  eventId,
  disabled = false,
  style,
  onJoined,
  onLeft,
  isOwner = false,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if user has already joined this event (skip if owner)
  useEffect(() => {
    if (isOwner) {
      setCheckingStatus(false);
      return;
    }

    const checkJoinStatus = async () => {
      try {
        const { data, error } = await checkIfUserJoinedEvent(eventId);
        if (!error) {
          setHasJoined(data);
        }
      } catch (error) {
        console.error('Error checking join status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkJoinStatus();
  }, [eventId, isOwner]);

  const handleAction = async () => {
    // Don't allow any action if user is the owner
    if (isOwner) {
      return;
    }

    if (hasJoined) {
      // Show confirmation alert for leaving
      Alert.alert(
        'Leave Event',
        'Are you sure you want to leave this event?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              try {
                const { data, error } = await leaveEvent(eventId);
                if (error) {
                  console.error('Leave Failed', error);
                  return;
                }
                setHasJoined(false);
                console.log('User left event:', eventId, data);
                onLeft && onLeft();
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Join the event
      setLoading(true);
      try {
        const { data, error } = await joinEvent(eventId);
        if (error) {
          console.error('Join Failed', error);
          return;
        }
        setHasJoined(true);
        console.log('User joined event:', eventId, data);
        onJoined && onJoined();
      } finally {
        setLoading(false);
      }
    }
  };

  const isDisabled = disabled || loading || checkingStatus || isOwner;

  const getButtonText = () => {
    if (isOwner) return 'Event Owner';
    if (checkingStatus) return 'Loading...';
    if (loading) return hasJoined ? 'Leaving...' : 'Joining...';
    return hasJoined ? 'Leave Event' : 'Join Event';
  };

  const getButtonStyle = () => {
    if (isOwner) {
      return [styles.button, styles.ownerButton, style];
    }
    if (hasJoined) {
      return [styles.button, styles.leaveButton, isDisabled && styles.buttonDisabled, style];
    }
    return [styles.button, isDisabled && styles.buttonDisabled, style];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handleAction}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
        {getButtonText()}
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
    leaveButton: {
      backgroundColor: colors.error || '#FF6B6B',
    },
    ownerButton: {
      backgroundColor: colors.textSecondary || '#999999',
      opacity: 0.7,
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

