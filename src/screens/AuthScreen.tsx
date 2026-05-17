import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GitBranch, Zap } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session';
import { auth, signInWithGitHubToken } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

type Props = StackScreenProps<any, 'Auth'>;

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Check if GitHub OAuth credentials are configured
  const gitHubConfigured = !!(
    process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID &&
    process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET
  );

  // Configure GitHub OAuth
  const [request, response, promptAsync] = useAuthRequest(
    gitHubConfigured ? {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || '',
      scopes: ['user:email', 'read:user'],
      redirectUri: makeRedirectUri({
        scheme: 'synq',
        path: 'github-callback',
      }),
    } : {
      clientId: 'demo',
      clientSecret: 'demo',
      scopes: ['user:email', 'read:user'],
      redirectUri: makeRedirectUri({
        scheme: 'synq',
        path: 'github-callback',
      }),
    },
    {
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
    }
  );

  // Glow animation effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  // Handle GitHub OAuth Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      if (access_token) {
        setLoading(true);
        handleGitHubSignIn(access_token);
      }
    } else if (response?.type === 'error') {
      console.warn("GitHub OAuth error:", response.error);
      Alert.alert("GitHub Auth Error", "Failed to authenticate with GitHub. Please try again.");
      setLoading(false);
    }
  }, [response]);

  const handleGitHubSignIn = async (accessToken: string) => {
    try {
      // Store the access token securely
      await SecureStore.setItemAsync('github_access_token', accessToken);

      // Sign in with Firebase using the GitHub token
      const user = await signInWithGitHubToken(accessToken);
      
      // Fetch GitHub user profile data to prefill onboarding
      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const githubUser = await githubUserResponse.json();

      // Store GitHub user info for onboarding prefill
      await SecureStore.setItemAsync(
        'github_profile',
        JSON.stringify({
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
          bio: githubUser.bio,
        })
      );

      // auth state change listener in AppContext will handle navigation
    } catch (err: any) {
      setLoading(false);
      console.error("GitHub sign-in error:", err);
      Alert.alert("Authentication Failed", err.message || "Failed to sign in with GitHub");
    }
  };

  const initiateGitHubLogin = async () => {
    if (!request) {
      Alert.alert("Error", "GitHub authentication is not properly configured.");
      return;
    }
    setLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      console.error("GitHub auth prompt failed:", err);
      Alert.alert("GitHub Auth Error", "Failed to start GitHub login");
      setLoading(false);
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06050C', '#0C0A1A', '#06050C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.content}>
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Zap color="#00F0FF" size={40} />
          </View>
          <Text style={styles.brandName}>Synq</Text>
          <Text style={styles.brandTagline}>Built for hackers, builders, and creators.</Text>
          <Text style={styles.brandSubtext}>Connect with developers. Build together. Ship faster.</Text>
        </View>

        {/* Card with GitHub button */}
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="large" color="#00F0FF" />
              <Text style={styles.loadingText}>Connecting to GitHub...</Text>
            </View>
          ) : gitHubConfigured ? (
            <>
              <Text style={styles.cardTitle}>Developer-Native Teamup</Text>
              <Text style={styles.cardDescription}>
                Authenticate with your GitHub account to join Synq. No passwords. No complexity.
              </Text>

              {/* Glow Button */}
              <Animated.View style={[styles.glowContainer, { opacity: glowOpacity }]}>
                <View style={styles.glowRing} />
              </Animated.View>

              <TouchableOpacity
                style={styles.githubBtn}
                onPress={initiateGitHubLogin}
                activeOpacity={0.85}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#00F0FF', '#8A2BE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.githubBtnGradient}
                >
                  <GitBranch color="#06050C" size={20} style={{ marginRight: 12 }} />
                  <Text style={styles.githubBtnText}>Continue with GitHub</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.featureList}>
                <Text style={styles.featureItem}>✓ Instant setup with your GitHub identity</Text>
                <Text style={styles.featureItem}>✓ Find developers who match your vibe</Text>
                <Text style={styles.featureItem}>✓ Build high-velocity teams</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Setup Required</Text>
              <Text style={styles.cardDescription}>
                GitHub OAuth credentials are not configured. To enable GitHub authentication, please set the following environment variables:
              </Text>
              <View style={styles.envVarList}>
                <Text style={styles.envVar}>EXPO_PUBLIC_GITHUB_CLIENT_ID</Text>
                <Text style={styles.envVar}>EXPO_PUBLIC_GITHUB_CLIENT_SECRET</Text>
              </View>
              <Text style={styles.configNote}>
                Create a GitHub OAuth App at{' '}
                <Text style={styles.configLink}>github.com/settings/developers</Text> and add the credentials to your .env file.
              </Text>
            </>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By signing in, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06050C',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
    zIndex: 2,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  brandName: {
    fontSize: 56,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: -2,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 18,
    color: '#8A2BE2',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  brandSubtext: {
    fontSize: 14,
    color: '#767676',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(11, 14, 27, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    padding: 32,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00F0FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  glowContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  glowRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  githubBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  githubBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  githubBtnText: {
    color: '#06050C',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  loadingArea: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    color: '#00F0FF',
    marginTop: 16,
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    marginVertical: 20,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    fontWeight: '500',
  },
  envVarList: {
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00F0FF',
    gap: 8,
  },
  envVar: {
    fontSize: 12,
    color: '#00F0FF',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  configNote: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 12,
  },
  configLink: {
    color: '#00F0FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
