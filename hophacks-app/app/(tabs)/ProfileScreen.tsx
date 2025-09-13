import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { getCurrentUserProfile, updateUserProfile, getCurrentUserEmail, updateUserEmail } from '../../lib/apiService';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  coins: number;
  total_points: number;
  current_streak_weeks: number;
  longest_streak: number;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  birth_date?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileResult, emailResult] = await Promise.all([
        getCurrentUserProfile(),
        getCurrentUserEmail()
      ]);

      if (profileResult.error) {
        Alert.alert('Error', 'Failed to load profile');
        return;
      }

      if (profileResult.data) {
        setProfile(profileResult.data);
        setDisplayName(profileResult.data.display_name || '');
        setPhone(profileResult.data.phone || '');
        setBio(profileResult.data.bio || '');
        setLocation(profileResult.data.location || '');
        setBirthDate(profileResult.data.birth_date || '');
        setEmergencyContactName(profileResult.data.emergency_contact_name || '');
        setEmergencyContactPhone(profileResult.data.emergency_contact_phone || '');
        setAvatarUrl(profileResult.data.avatar_url || '');
      }

      if (emailResult.data) {
        setEmail(emailResult.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        display_name: displayName.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        birth_date: birthDate.trim() || null,
        emergency_contact_name: emergencyContactName.trim() || null,
        emergency_contact_phone: emergencyContactPhone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };

      const { error } = await updateUserProfile(updateData);

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      // Email update is separate and requires re-authentication
      if (email !== profile?.email) {
        const emailResult = await updateUserEmail(email);
        if (emailResult.error) {
          Alert.alert('Email Update', 'Profile updated, but email change requires verification. Check your inbox.');
        }
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setEditMode(false);
      loadProfile(); // Refresh profile data
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderStatCard = (label: string, value: number | string, icon?: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.displayName}>{displayName || 'No Name'}</Text>
            <Text style={styles.role}>{profile?.role || 'Volunteer'}</Text>
            <Text style={styles.memberSince}>
              Member since {new Date(profile?.created_at || '').toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditMode(!editMode)}
          >
            <Text style={styles.editButtonText}>
              {editMode ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {renderStatCard('Total Points', profile?.total_points || 0)}
          {renderStatCard('Coins', profile?.coins || 0)}
          {renderStatCard('Current Streak', `${profile?.current_streak_weeks || 0} weeks`)}
          {renderStatCard('Longest Streak', `${profile?.longest_streak || 0} weeks`)}
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name *</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={editMode}
            />
            <Text style={styles.inputHint}>Email changes require verification</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, !editMode && styles.inputDisabled]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={3}
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={location}
              onChangeText={setLocation}
              placeholder="City, State/Country"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Birth Date</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="YYYY-MM-DD"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Profile Picture URL</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="https://example.com/avatar.jpg"
              autoCapitalize="none"
              editable={editMode}
            />
          </View>

          {/* Emergency Contact Section */}
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact Name</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Enter emergency contact name"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              placeholder="Enter emergency contact phone"
              keyboardType="phone-pad"
              editable={editMode}
            />
          </View>

          {editMode && (
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceSecondary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  headerInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  memberSince: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginTop: 1,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.surface,
    marginTop: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputDisabled: {
    backgroundColor: Colors.surfaceSecondary,
    color: Colors.textSecondary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
