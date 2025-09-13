import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import CustomTabBar from '../components/CustomTabBar';
import { Colors } from '../constants/colors';
import HomeScreen from './(tabs)/HomeScreen';
import EventsScreen from './(tabs)/EventsScreen';
import MyEventsScreen from './(tabs)/MyEventsScreen';
import GroupsScreen from './(tabs)/GroupsScreen';
import ProfileScreen from './(tabs)/ProfileScreen';
import { authService } from '../lib/authService';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log('Initializing app...');
    const initializeApp = async () => {
      try {
        console.log('Initializing authentication...');
        const authSuccess = await authService.initializeAuth();
        
        if (authSuccess) {
          console.log('App initialized successfully');
        } else {
          console.log('Authentication failed, but continuing with app');
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'events':
        return <EventsScreen />;
      case 'myEvents':
        return <MyEventsScreen />;
      case 'groups':
        return <GroupsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderTabContent()}
      </SafeAreaView>
      <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
