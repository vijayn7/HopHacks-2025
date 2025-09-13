import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import { getGroupMembers, removeGroupMember } from '../lib/apiService';

interface GroupMember {
  id: string;
  name: string;
  joinDate: string;
  isAdmin: boolean;
  isCurrentUser?: boolean;
}

interface ManageMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onMemberRemoved: () => void;
  groupId: string;
  groupName: string;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  visible,
  onClose,
  onMemberRemoved,
  groupId,
  groupName,
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (visible) {
      loadMembers();
    }
  }, [visible, groupId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getGroupMembers(groupId);
      
      if (error) {
        Alert.alert('Error', 'Failed to load group members');
        return;
      }

      if (data) {
        // Filter out the current user from the members list
        const filteredMembers = data.filter(member => !member.isCurrentUser);
        setMembers(filteredMembers);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from ${groupName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => confirmRemoveMember(member.id, member.name)
        }
      ]
    );
  };

  const confirmRemoveMember = async (memberId: string, memberName: string) => {
    try {
      setRemovingMember(memberId);
      const { error } = await removeGroupMember(groupId, memberId);
      
      if (error) {
        Alert.alert('Error', (error as any).message || 'Failed to remove member');
        return;
      }

      // Remove member from local state
      setMembers(prev => prev.filter(member => member.id !== memberId));
      onMemberRemoved();
      
      Alert.alert('Success', `${memberName} has been removed from the group`);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
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
            <Text style={styles.headerTitle}>Manage Members</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading members...</Text>
          </View>
        </View>
      </Modal>
    );
  }

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
          <Text style={styles.headerTitle}>Manage Members</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.membersList}>
            {members.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Other Members</Text>
                <Text style={styles.emptySubtitle}>
                  You&apos;re the only member in this group. Invite others using the group&apos;s invite code to start building your team!
                </Text>
              </View>
            ) : (
              members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.avatarText}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        {member.isAdmin && (
                          <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.joinDate}>
                        Joined {formatJoinDate(member.joinDate)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMember(member)}
                    disabled={removingMember === member.id}
                  >
                    {removingMember === member.id ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Ionicons name="close" size={20} color={colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  membersList: {
    padding: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  joinDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.error + '20',
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ManageMembersModal;
