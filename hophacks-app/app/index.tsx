import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView } from "react-native";
import CustomTabBar from '../components/CustomTabBar';
import EventsList from '../components/EventsList';
import { Colors } from '../constants/colors';
import HomeScreen from './(tabs)/HomeScreen';
import EventsScreen from './(tabs)/EventsScreen';
import MyEventsScreen from './(tabs)/MyEventsScreen';
import GroupsScreen from './(tabs)/GroupsScreen';
import ProfileScreen from './(tabs)/ProfileScreen';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');

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
