import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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

  const handleCreate = async () => {
    const { error } = await createEvent({
      title,
      description,
      cause,
      starts_at: startsAt,
      ends_at: endsAt,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
    });

    if (!error) {
      onCreated();
      onClose();
      setTitle('');
      setDescription('');
      setCause('');
      setStartsAt('');
      setEndsAt('');
      setCapacity('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Create Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Cause"
            placeholderTextColor={colors.textSecondary}
            value={cause}
            onChangeText={setCause}
          />
          <TextInput
            style={styles.input}
            placeholder="Starts At (ISO)"
            placeholderTextColor={colors.textSecondary}
            value={startsAt}
            onChangeText={setStartsAt}
          />
          <TextInput
            style={styles.input}
            placeholder="Ends At (ISO)"
            placeholderTextColor={colors.textSecondary}
            value={endsAt}
            onChangeText={setEndsAt}
          />
          <TextInput
            style={styles.input}
            placeholder="Capacity"
            placeholderTextColor={colors.textSecondary}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleCreate}>
              <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
            </TouchableOpacity>
          </View>
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
      backgroundColor: colors.cardBackground,
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

