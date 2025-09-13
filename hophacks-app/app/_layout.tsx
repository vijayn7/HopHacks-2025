import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerTintColor: '#FF6B35', // Orange color for back buttons
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
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
            title: "Monthly Leaderboard",
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
    </ThemeProvider>
  );
}
