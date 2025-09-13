import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const CustomTabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline' as const,
      activeIcon: 'home' as const,
    },
    {
      id: 'events',
      label: 'Discover',
      icon: 'search-outline' as const,
      activeIcon: 'search' as const,
    },
    {
      id: 'myEvents',
      label: 'My Events',
      icon: 'star-outline' as const,
      activeIcon: 'star' as const,
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: 'people-outline' as const,
      activeIcon: 'people' as const,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline' as const,
      activeIcon: 'person' as const,
    },
  ];

  const tabWidth = (screenWidth - 8) / tabs.length; // Account for paddingHorizontal: 4 on both sides

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    Animated.spring(animatedValue, {
      toValue: activeIndex,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab]);

  const indicatorStyle = {
    transform: [{
      translateX: animatedValue.interpolate({
        inputRange: tabs.map((_, index) => index),
        outputRange: tabs.map((_, index) => 4 + index * tabWidth + tabWidth / 2 - 20), // Add 4px for left padding
      })
    }]
  };

  return (
    <View style={styles.container}>
      {/* Animated indicator background */}
      <Animated.View style={[styles.animatedIndicator, indicatorStyle]} />
      
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabButton}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={activeTab === tab.id ? tab.activeIcon : tab.icon}
              size={20}
              color={activeTab === tab.id ? colors.textWhite : colors.tabBarInactive}
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

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.tabBarBackground,
      borderTopWidth: 1,
      borderTopColor: colors.tabBarBorder,
      paddingBottom: 36,
      paddingTop: 6,
      paddingHorizontal: 4,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
      position: 'relative',
    },
    animatedIndicator: {
      position: 'absolute',
      top: 10, // Adjusted to align with icon container
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      zIndex: 1,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 4,
      zIndex: 2, // Ensure tabs are above the indicator
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.tabBarInactive,
      textAlign: 'center',
    },
    activeLabel: {
      color: colors.tabBarActive,
      fontWeight: '600',
    },
  });

export default CustomTabBar;
