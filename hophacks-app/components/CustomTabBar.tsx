import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const CustomTabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'events',
      label: 'Events',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
    },
    {
      id: 'myEvents',
      label: 'My Events',
      icon: 'star-outline',
      activeIcon: 'star',
      isProminent: true,
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: 'people-outline',
      activeIcon: 'people',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            tab.isProminent && styles.prominentTab,
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            tab.isProminent && styles.prominentIconContainer,
            activeTab === tab.id && styles.activeIconContainer,
          ]}>
            <Ionicons
              name={activeTab === tab.id ? tab.activeIcon : tab.icon}
              size={tab.isProminent ? 28 : 24}
              color={activeTab === tab.id ? '#FFFFFF' : tab.isProminent ? '#FF6B35' : '#666666'}
            />
          </View>
          <Text style={[
            styles.tabLabel,
            tab.isProminent && styles.prominentLabel,
            activeTab === tab.id && styles.activeLabel,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  prominentTab: {
    flex: 1.2,
    marginHorizontal: 4,
  },
  activeTab: {
    // Additional styling for active tab if needed
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  prominentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  activeIconContainer: {
    backgroundColor: '#FF6B35',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  prominentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
  },
  activeLabel: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});

export default CustomTabBar;
