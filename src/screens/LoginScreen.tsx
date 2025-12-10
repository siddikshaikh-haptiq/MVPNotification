import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {Button} from '@components/Button';
import {Input} from '@components/Input';
import {analyticsService, AnalyticsEvents} from '@services/analyticsService';

export const LoginScreen: React.FC = () => {
  const {signIn, signInWithGoogle} = useAuth();
  const {colors} = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      // Track form validation error
      analyticsService.logFormSubmission('login', false, {
        error: 'validation_error',
        error_message: 'Missing required fields',
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // Track successful login
      analyticsService.logEvent(AnalyticsEvents.LOGIN, {
        method: 'email',
      });
      analyticsService.logFormSubmission('login', true);
    } catch (err) {
      setError('Error signing in. Please try again.');
      // Track failed login
      analyticsService.logFormSubmission('login', false, {
        error: 'sign_in_failed',
        error_message: 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      // Track successful Google login
      analyticsService.logEvent(AnalyticsEvents.LOGIN, {
        method: 'google',
      });
      analyticsService.logFormSubmission('google_login', true);
    } catch (err) {
      setError('Error signing in with Google. Please try again.');
      // Track failed Google login
      analyticsService.logFormSubmission('google_login', false, {
        error: 'google_sign_in_failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={[styles.title, {color: colors.text}]}>MVP Notification</Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            Company and reminder management
          </Text>

          {error ? (
            <View style={[styles.errorContainer, {backgroundColor: colors.error + '20'}]}>
              <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            fullWidth
            style={styles.button}
            analyticsId="sign_in_button"
            analyticsParams={{method: 'email'}}
          />

          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="outline"
            loading={loading}
            fullWidth
            style={styles.button}
            analyticsId="google_sign_in_button"
            analyticsParams={{method: 'google'}}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});

