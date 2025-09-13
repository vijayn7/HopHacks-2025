import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import { useTheme } from "../context/ThemeContext";
import { useColorScheme } from 'react-native';

function ThemedStack() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#FF6B35', // Orange color for back buttons
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.textPrimary,
        },
      }}
    >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{ 
            headerShown: true,
            headerBackTitle: "Back"
          }}
        />
        <Stack.Screen
          name="members"
          options={{ 
            title: "All Members",
            headerShown: true,
            headerBackTitle: "Back"
          }}
        />
        <Stack.Screen
          name="activity-feed"
          options={{ 
            title: "Activity Feed",
            headerShown: true,
            headerBackTitle: "Back"
          }}
        />
        <Stack.Screen
          name="group-dashboard/[id]"
          options={{ 
            title: "Group Dashboard",
            headerShown: true,
            headerBackTitle: "Groups"
          }}
        />
      </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
