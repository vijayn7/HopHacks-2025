import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView } from "react-native";
import CustomTabBar from '../components/CustomTabBar';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log(`Switched to ${tab} tab`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Text style={styles.tabContent}>Home Screen - Coming Soon!</Text>;
      case 'events':
        return <Text style={styles.tabContent}>Events Screen - Coming Soon!</Text>;
      case 'myEvents':
        return <Text style={styles.tabContent}>My Events Screen - Coming Soon!</Text>;
      case 'groups':
        return <Text style={styles.tabContent}>Groups Screen - Coming Soon!</Text>;
      case 'profile':
        return <Text style={styles.tabContent}>Profile Screen - Coming Soon!</Text>;
      default:
        return <Text style={styles.tabContent}>Home Screen - Coming Soon!</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    color: '#333333',
    textAlign: 'center',
  },
});
