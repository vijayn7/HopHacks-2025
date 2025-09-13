import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { ColorScheme } from '../../constants/colors';
import { authService } from '../../lib/authService';

interface LoginScreenProps {
  onAuthSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthSuccess }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result =
        mode === 'signIn'
          ? await authService.signIn(email, password)
          : await authService.signUp(email, password);

      if (result.success) {
        onAuthSuccess();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'signIn' ? 'Sign In' : 'Create Account'}
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textWhite} />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          setMode(mode === 'signIn' ? 'signUp' : 'signIn')
        }
      >
        <Text style={styles.switchText}>
          {mode === 'signIn'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 24,
      color: colors.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    buttonText: {
      color: colors.textWhite,
      fontSize: 16,
      fontWeight: '600',
    },
    switchText: {
      color: colors.primary,
      textAlign: 'center',
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginBottom: 8,
    },
  });
