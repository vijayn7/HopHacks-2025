import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import SpecificEventPage from './SpecificEventPage';

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
  const [showEventDetails, setShowEventDetails] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Show the event details modal
      setShowEventDetails(true);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.button, disabled && styles.buttonDisabled, style]} 
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          Learn More
        </Text>
      </TouchableOpacity>

      <SpecificEventPage
        eventId={eventId}
        visible={showEventDetails}
        onClose={() => setShowEventDetails(false)}
      />
    </>
  );
};

export default EventCallToActionButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.textSecondary || '#999999',
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: Colors.textSecondary || '#999999',
  },
});