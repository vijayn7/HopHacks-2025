import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

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
      label: 'Discover',
      icon: 'search-outline',
      activeIcon: 'search',
    },
    {
      id: 'myEvents',
      label: 'My Events',
      icon: 'star-outline',
      activeIcon: 'star',
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
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            activeTab === tab.id && styles.activeIconContainer,
          ]}>
            <Ionicons
              name={activeTab === tab.id ? tab.activeIcon : tab.icon}
              size={20}
              color={activeTab === tab.id ? Colors.textWhite : Colors.tabBarInactive}
            />
          </View>
          <Text style={[
            styles.tabLabel,
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
    backgroundColor: Colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    paddingBottom: 36,
    paddingTop: 6,
    paddingHorizontal: 4,
    shadowColor: Colors.shadow,
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
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  activeTab: {
    // Additional styling for active tab if needed
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.tabBarInactive,
    textAlign: 'center',
  },
  activeLabel: {
    color: Colors.tabBarActive,
    fontWeight: '600',
  },
});

export default CustomTabBar;
