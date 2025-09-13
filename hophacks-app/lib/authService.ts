import { supabase } from './supabase';

export class AuthService {
  private static instance: AuthService;
  private isAuthenticated = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initializeAuth(): Promise<boolean> {
    try {
      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('User already authenticated:', session.user.email);
        this.isAuthenticated = true;
        return true;
      }

      // If no session, sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: process.env.EXPO_PUBLIC_USER_EMAIL || '',
        password: process.env.EXPO_PUBLIC_USER_PASSWORD || '',
      });

      if (error) {
        console.log('Authentication error:', error);
        this.isAuthenticated = false;
        return false;
      }

      console.log('User authenticated successfully:', data.user?.email);
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.log('Auth initialization error:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.log('Error getting current user ID:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    console.log('Signing out...');
    await supabase.auth.signOut();
    this.isAuthenticated = false;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
