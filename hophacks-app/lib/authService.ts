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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      this.isAuthenticated = !!session;
      if (session) {
        console.log('User already authenticated:', session.user.email);
      }

      return this.isAuthenticated;
    } catch (error) {
      console.log('Auth initialization error:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.log('Sign in error:', error);
        this.isAuthenticated = false;
        return { success: false, error: error.message };
      }

      this.isAuthenticated = true;
      return { success: true };
    } catch (error: any) {
      console.log('Sign in exception:', error);
      this.isAuthenticated = false;
      return { success: false, error: error.message };
    }
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        console.log('Sign up error:', error);
        return { success: false, error: error.message };
      }

      // Automatically sign in after successful sign up
      return await this.signIn(email, password);
    } catch (error: any) {
      console.log('Sign up exception:', error);
      return { success: false, error: error.message };
    }
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

  async getCurrentUserEmail(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email || null;
    } catch (error) {
      console.log('Error getting current user email:', error);
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
