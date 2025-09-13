export const Colors = {
  // Primary Colors
  primary: '#FF6B35',
  primaryLight: '#FFF5F0',
  primaryDark: '#E55A2B',
  
  // Background Colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  
  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  
  // Border Colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Tab Bar Colors
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E5E5',
  tabBarActive: '#FF6B35',
  tabBarInactive: '#666666',
  
  // Shadow Colors
  shadow: '#000000',
  
  // Group/Competition Colors
  groupGold: '#FFD700',
  groupSilver: '#C0C0C0',
  groupBronze: '#CD7F32',
  
  // Event Category Colors
  foodSecurity: '#4CAF50',
  animalWelfare: '#9C27B0',
  elderCare: '#FF9800',
  environment: '#4CAF50',
  education: '#2196F3',
  
  // Streak Colors
  streakActive: '#FF6B35',
  streakInactive: '#CCCCCC',
  
  // Badge Colors
  badgeGold: '#FFD700',
  badgeSilver: '#C0C0C0',
  badgeBronze: '#CD7F32',
  badgePlatinum: '#E5E4E2',
} as const;

export type ColorKey = keyof typeof Colors;
