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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { getCurrentUserProfile, updateUserProfile, updateUserEmail, calculateUserTotalPoints, calculateUserWeeklyStreak, calculateUserLongestStreak } from '../../lib/apiService';
import { authService } from '../../lib/authService';

interface Profile {
  id: string;
  display_name: string | null;
  role: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  birth_date?: string | null;
  created_at: string;
}

interface ProfileScreenProps {
  onSignOut: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSignOut }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  // Calculated values from points_ledger
  const [calculatedTotalPoints, setCalculatedTotalPoints] = useState<number>(0);
  const [calculatedCurrentStreak, setCalculatedCurrentStreak] = useState<number>(0);
  const [calculatedLongestStreak, setCalculatedLongestStreak] = useState<number>(0);
  
  // Form fields (these are the working copies during editing)
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Original values (these are what's displayed in the header and used for cancel)
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [originalLocation, setOriginalLocation] = useState('');
  const [originalBirthDate, setOriginalBirthDate] = useState('');

  useEffect(() => {
    loadProfile();
    const interval = setInterval(() => {
      if (!editMode) loadProfile(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [editMode]);

  const loadProfile = async (background = false) => {
    try {
      if (!background) setLoading(true);
      const [profileResult, emailResult, totalPointsResult, currentStreakResult, longestStreakResult] = await Promise.all([
        getCurrentUserProfile(),
        authService.getCurrentUserEmail(),
        calculateUserTotalPoints(),
        calculateUserWeeklyStreak(),
        calculateUserLongestStreak()
      ]);

      if (profileResult.error) {
        if (!background) Alert.alert('Error', 'Failed to load profile');
        return;
      }

      if (profileResult.data) {
        setProfile(profileResult.data);
        const displayNameValue = profileResult.data.display_name || '';
        const phoneValue = profileResult.data.phone_number || '';
        const bioValue = profileResult.data.bio || '';
        const locationValue = profileResult.data.location || '';
        const birthDateValue = profileResult.data.birth_date || '';

        // Set both working and original values
        setDisplayName(displayNameValue);
        setPhone(phoneValue);
        setBio(bioValue);
        setLocation(locationValue);
        setBirthDate(birthDateValue);

        setOriginalDisplayName(displayNameValue);
        setOriginalPhone(phoneValue);
        setOriginalBio(bioValue);
        setOriginalLocation(locationValue);
        setOriginalBirthDate(birthDateValue);
      }

      if (emailResult) {
        setEmail(emailResult);
        setOriginalEmail(emailResult);
      }

      // Set calculated values from points_ledger
      if (totalPointsResult.data !== null) {
        setCalculatedTotalPoints(totalPointsResult.data);
      }
      if (currentStreakResult.data !== null) {
        setCalculatedCurrentStreak(currentStreakResult.data);
      }
      if (longestStreakResult.data !== null) {
        setCalculatedLongestStreak(longestStreakResult.data);
      }
    } catch (error) {
      if (!background) Alert.alert('Error', 'Failed to load profile');
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form fields to original values
    setDisplayName(originalDisplayName);
    setEmail(originalEmail);
    setPhone(originalPhone);
    setBio(originalBio);
    setLocation(originalLocation);
    setBirthDate(originalBirthDate);
    setEditMode(false);
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
        phone_number: phone.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        birth_date: birthDate.trim() || null,
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
      
      // Update original values to match the saved values
      setOriginalDisplayName(displayName.trim());
      setOriginalEmail(email);
      setOriginalPhone(phone.trim() || '');
      setOriginalBio(bio.trim() || '');
      setOriginalLocation(location.trim() || '');
      setOriginalBirthDate(birthDate.trim() || '');
      
      loadProfile(); // Refresh profile data
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              onSignOut();
            } catch (error) {
              console.log('Error signing out:', error);
            }
          },
        },
      ],
    );
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
        <ActivityIndicator size="large" color={colors.primary} />
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
          <View style={styles.headerInfo}>
            <Text style={styles.displayName}>{originalDisplayName || 'No Name'}</Text>
            <Text style={styles.role}>{profile?.role || 'Volunteer'}</Text>
            <Text style={styles.memberSince}>
              Member since {new Date(profile?.created_at || '').toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={editMode ? handleCancel : () => setEditMode(true)}
          >
            <Text style={styles.editButtonText}>
              {editMode ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {renderStatCard('Total Points', calculatedTotalPoints)}
          {renderStatCard('Current Streak', `${calculatedCurrentStreak} weeks`)}
          {renderStatCard('Longest Streak', `${calculatedLongestStreak} weeks`)}
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

          {editMode && (
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
          {saving ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}
    </View>

        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  memberSince: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
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
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    marginTop: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.textSecondary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  signOutSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
});
