import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ToastAndroid, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { createEvent } from '../../lib/apiService';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ visible, onClose, onCreated }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cause, setCause] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [capacity, setCapacity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!cause.trim()) newErrors.cause = 'Cause is required';
    if (!startsAt.trim()) newErrors.startsAt = 'Start time is required';
    if (!endsAt.trim()) newErrors.endsAt = 'End time is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const { error } = await createEvent({
      title,
      description,
      cause,
      starts_at: startsAt,
      ends_at: endsAt,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      lat: latitude ? parseFloat(latitude) : undefined,
      lng: longitude ? parseFloat(longitude) : undefined,
      image_url: imageUrl || undefined,
      location_name: locationName || undefined,
      address: address || undefined,
      location_notes: locationNotes || undefined,
    });

    if (error) {
      showToast('Failed to create event');
      return;
    }

    showToast('Event created');
    onCreated();
    onClose();
    setTitle('');
    setDescription('');
    setCause('');
    setStartsAt('');
    setEndsAt('');
    setCapacity('');
    setLatitude('');
    setLongitude('');
    setLocationName('');
    setAddress('');
    setLocationNotes('');
    setImageUrl('');
    setErrors({});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.header}>Create Event</Text>
            <TextInput
              style={[styles.input, errors.title && styles.errorInput]}
              placeholder="Title*"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={[styles.input, errors.cause && styles.errorInput]}
              placeholder="Cause*"
              placeholderTextColor={colors.textSecondary}
              value={cause}
              onChangeText={setCause}
            />
            {errors.cause && <Text style={styles.errorText}>{errors.cause}</Text>}
            <TextInput
              style={[styles.input, errors.startsAt && styles.errorInput]}
              placeholder="Starts At (ISO)*"
              placeholderTextColor={colors.textSecondary}
              value={startsAt}
              onChangeText={setStartsAt}
            />
            {errors.startsAt && <Text style={styles.errorText}>{errors.startsAt}</Text>}
            <TextInput
              style={[styles.input, errors.endsAt && styles.errorInput]}
              placeholder="Ends At (ISO)*"
              placeholderTextColor={colors.textSecondary}
              value={endsAt}
              onChangeText={setEndsAt}
            />
            {errors.endsAt && <Text style={styles.errorText}>{errors.endsAt}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Capacity"
              placeholderTextColor={colors.textSecondary}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              placeholderTextColor={colors.textSecondary}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              placeholderTextColor={colors.textSecondary}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Location Name"
              placeholderTextColor={colors.textSecondary}
              value={locationName}
              onChangeText={setLocationName}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={colors.textSecondary}
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Location Notes"
              placeholderTextColor={colors.textSecondary}
              value={locationNotes}
              onChangeText={setLocationNotes}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              placeholderTextColor={colors.textSecondary}
              value={imageUrl}
              onChangeText={setImageUrl}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleCreate}>
                <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 8,
    },
    header: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: 8,
      marginBottom: 12,
      color: colors.textPrimary,
    },
    errorInput: {
      borderColor: colors.error || '#FF6B6B',
    },
    errorText: {
      color: colors.error || '#FF6B6B',
      marginTop: -8,
      marginBottom: 12,
      fontSize: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginLeft: 8,
    },
    buttonText: {
      color: colors.textPrimary,
    },
    createButton: {
      backgroundColor: colors.primary,
    },
    createButtonText: {
      color: colors.textWhite,
    },
  });

export default CreateEventModal;

