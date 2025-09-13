import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export interface EventCallToActionButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
}

const EventCallToActionButton: React.FC<EventCallToActionButtonProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.buttonDisabled, style]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        Learn More
      </Text>
    </TouchableOpacity>
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