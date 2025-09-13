import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import { updateGroup } from '../lib/apiService';

interface EditGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupUpdated: (group: any) => void;
  group: {
    id: string;
    name: string;
    description: string;
    monthly_goal: number;
  } | null;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  visible,
  onClose,
  onGroupUpdated,
  group,
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('10000');
  const [isUpdating, setIsUpdating] = useState(false);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Update form when group changes
  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setDescription(group.description);
      setMonthlyGoal(group.monthly_goal.toString());
    }
  }, [group]);

  const handleUpdateGroup = async () => {
    if (!group) return;

    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a group description');
      return;
    }

    const goal = parseInt(monthlyGoal);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly goal');
      return;
    }

    try {
      setIsUpdating(true);
      const { data, error } = await updateGroup(group.id, {
        name: groupName.trim(),
        description: description.trim(),
        monthly_goal: goal,
      });

      if (error) {
        Alert.alert('Error', (error as any).message || 'Failed to update group');
        return;
      }

      if (data) {
        onGroupUpdated(data);
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update group');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!group) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={isUpdating}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Group</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
        >
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Group Name *</Text>
                <TextInput
                  style={styles.input}
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Enter group name"
                  placeholderTextColor={colors.textSecondary}
                  editable={!isUpdating}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your group's purpose and goals"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isUpdating}
                  maxLength={200}
                />
                <Text style={styles.characterCount}>{description.length}/200</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Goal (Points) *</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyGoal}
                  onChangeText={setMonthlyGoal}
                  placeholder="10000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  editable={!isUpdating}
                />
                <Text style={styles.helperText}>
                  Set a monthly points goal for your group to work towards
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isUpdating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!groupName.trim() || !description.trim() || isUpdating) && styles.saveButtonDisabled
              ]}
              onPress={handleUpdateGroup}
              disabled={!groupName.trim() || !description.trim() || isUpdating}
            >
              {isUpdating ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
  saveButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditGroupModal;
