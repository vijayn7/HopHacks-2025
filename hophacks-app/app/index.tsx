import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { StatusBar } from 'expo-status-bar';
import CustomTabBar from '../components/CustomTabBar';
import { useTheme } from '../context/ThemeContext';
import type { ColorScheme } from '../constants/colors';
import HomeScreen from './(tabs)/HomeScreen';
import EventsScreen from './(tabs)/EventsScreen';
import MyEventsScreen from './(tabs)/MyEventsScreen';
import GroupsScreen from './(tabs)/GroupsScreen';
import ProfileScreen from './(tabs)/ProfileScreen';
import { authService } from '../lib/authService';
import LoginScreen from '../components/Auth/LoginScreen';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    console.log('Initializing app...');
    const initializeApp = async () => {
      try {
        console.log('Initializing authentication...');
        const authSuccess = await authService.initializeAuth();
        setIsAuthenticated(authSuccess);
        if (authSuccess) {
          console.log('App initialized successfully');
        } else {
          console.log('No existing session, showing login screen');
        }
      } catch (error) {
        console.log('App initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log(`Switched to ${tab} tab`);
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          setActiveTab('home');
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenContainer}>
          <View style={[styles.tabView, activeTab !== 'home' && styles.hidden]}>
            <HomeScreen isActive={activeTab === 'home'} />
          </View>
          <View style={[styles.tabView, activeTab !== 'events' && styles.hidden]}>
            <EventsScreen isActive={activeTab === 'events'} />
          </View>
          <View style={[styles.tabView, activeTab !== 'myEvents' && styles.hidden]}>
            <MyEventsScreen isActive={activeTab === 'myEvents'} />
          </View>
          <View style={[styles.tabView, activeTab !== 'groups' && styles.hidden]}>
            <GroupsScreen isActive={activeTab === 'groups'} />
          </View>
          <View style={[styles.tabView, activeTab !== 'profile' && styles.hidden]}>
            <ProfileScreen
              onSignOut={() => setIsAuthenticated(false)}
              isActive={activeTab === 'profile'}
            />
          </View>
        </View>
      </SafeAreaView>
      <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    screenContainer: {
      flex: 1,
    },
    tabView: {
      flex: 1,
    },
    hidden: {
      display: 'none',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    tabContent: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
    },
  });
