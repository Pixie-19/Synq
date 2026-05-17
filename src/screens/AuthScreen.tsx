import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Mail, LogIn } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

type Props = StackScreenProps<any, 'Auth'>;

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const [mode, setMode] = useState<'home' | 'email'>('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Configure Google Authentication Request for Expo Go compat with Proxy
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '1042888254801-giv6glpsi09t9ln4457ol871q91dive9.apps.googleusercontent.com',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '1042888254801-oelcsn1fpqjdn8g69f8g8so96bp4pitg.apps.googleusercontent.com',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '1042888254801-12c791pl5s0eq493bdjhhd7g0ssdk8fe.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      scheme: 'synq-auth',
      projectNameForProxy: '@Pixie-19/Synq',
    } as any),
  });

  // Handle Google Auth Response and exchange with Firebase Auth
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        setLoading(true);
        const credential = GoogleAuthProvider.credential(authentication.idToken);
        signInWithCredential(auth, credential)
          .then(() => {
            setLoading(false);
            navigation.navigate('Onboarding');
          })
          .catch((error) => {
            setLoading(false);
            console.error("Google sign-in Firebase credential exchange error:", error);
            Alert.alert(
              "Firebase Authentication Failed ⚠️",
              `We couldn't verify your Google account with Firebase.\n\nError: ${error.message}\n\nBypassing to onboarding now for presentation ease!`,
              [{ text: "Got it!", onPress: () => navigation.navigate('Onboarding') }]
            );
          });
      }
    } else if (response?.type === 'error') {
      console.warn("Google OAuth browser flow returned an error:", response.error);
      Alert.alert(
        "Google Auth Browser Error",
        "The Google login browser session encountered an issue.\n\nBypassing to onboarding now for presentation ease!",
        [{ text: "Got it!", onPress: () => navigation.navigate('Onboarding') }]
      );
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    promptAsync({
      useProxy: true,
      projectNameForProxy: '@Pixie-19/Synq'
    } as any)
      .catch((err) => {
        console.warn("Google auth prompt failed, bypassing for convenience:", err);
        navigation.navigate('Onboarding');
      })
      .finally(() => setLoading(false));
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Input Required", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigation.navigate('Onboarding');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setLoading(false);
        console.warn("Firebase config helper: Email/Password is disabled in Firebase Console.");
        Alert.alert(
          "Firebase Sync Tip 💡",
          "Email/Password Sign-In is currently disabled in your Firebase Console.\n\nTo enable it:\n1. Go to Firebase Console\n2. Open 'Authentication' > 'Sign-in method'\n3. Click 'Add new provider' and select 'Email/Password' > 'Enable'.\n\nBypassing to onboarding now for seamless demo flow!",
          [{ text: "Got it!", onPress: () => navigation.navigate('Onboarding') }]
        );
        return;
      }
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Automatically attempt registration for seamless user boarding
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          setLoading(false);
          navigation.navigate('Onboarding');
        } catch (createErr: any) {
          if (createErr.code === 'auth/operation-not-allowed') {
            setLoading(false);
            Alert.alert(
              "Firebase Sync Tip 💡",
              "Email/Password Sign-In is currently disabled in your Firebase Console.\n\nTo enable it:\n1. Go to Firebase Console\n2. Open 'Authentication' > 'Sign-in method'\n3. Click 'Add new provider' and select 'Email/Password' > 'Enable'.\n\nBypassing to onboarding now for seamless demo flow!",
              [{ text: "Got it!", onPress: () => navigation.navigate('Onboarding') }]
            );
            return;
          }
          setLoading(false);
          // presentation fallback: allow bypass if offline or configuration mismatch
          console.warn("Auth failed, letting through to onboard for presentation reliability:", createErr.message);
          navigation.navigate('Onboarding');
        }
      } else {
        setLoading(false);
        console.warn("Auth failed, letting through to onboard for presentation reliability:", err.message);
        navigation.navigate('Onboarding');
      }
    }
  };

  const handleGuest = () => navigation.navigate('Onboarding');

  const showEmail = () => {
    setMode('email');
    Animated.spring(slideAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0E0B25', '#06050C']} style={StyleSheet.absoluteFillObject} />

      {/* Brand header */}
      <View style={styles.brandSection}>
        <View style={styles.logoGlow} />
        <Text style={styles.brandName}>Synq</Text>
        <Text style={styles.brandTagline}>Build with people who{'\n'}actually click.</Text>
      </View>

      {/* Auth card */}
      <View style={styles.card}>
        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text style={styles.loadingText}>Syncing Credentials...</Text>
          </View>
        ) : (
          <>
            {/* Google SSO button */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
              <View style={styles.googleBtnInner}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {mode === 'home' ? (
              <TouchableOpacity style={styles.emailBtn} onPress={showEmail}>
                <Mail color="#8E8D9C" size={18} style={{ marginRight: 10 }} />
                <Text style={styles.emailBtnText}>Continue with Email</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ opacity: slideAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <TextInput
                  placeholder="your@email.com"
                  placeholderTextColor="#636275"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.emailInput}
                />
                <TextInput
                  placeholder="password"
                  placeholderTextColor="#636275"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.emailInput, { marginBottom: 16 }]}
                />
                <TouchableOpacity style={styles.submitEmailBtn} onPress={handleEmailSignIn}>
                  <LinearGradient colors={['#8A2BE2', '#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
                    <LogIn color="#FFF" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.submitText}>Sign In / Create Account</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Guest entry */}
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
              <Sparkles color="#636275" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06050C', paddingHorizontal: 24 },
  brandSection: { alignItems: 'center', marginBottom: 48, position: 'relative' },
  logoGlow: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#8A2BE2', opacity: 0.25, shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 40 },
  brandName: { fontSize: 56, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  brandTagline: { fontSize: 15, color: '#8E8D9C', textAlign: 'center', lineHeight: 22, marginTop: 8, fontWeight: '500' },
  card: { width: '100%', backgroundColor: 'rgba(20,18,38,0.7)', borderRadius: 28, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', padding: 28 },
  loadingArea: { alignItems: 'center', paddingVertical: 20 },
  loadingText: { color: '#00F0FF', marginTop: 14, fontWeight: '700', fontSize: 14 },
  googleBtn: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF', marginBottom: 20 },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#4285F4', marginRight: 10 },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: '#636275', fontSize: 12, fontWeight: '600', marginHorizontal: 12 },
  emailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, marginBottom: 16 },
  emailBtnText: { color: '#8E8D9C', fontWeight: '600', fontSize: 15 },
  emailInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, color: '#FFF', fontSize: 14, marginBottom: 12 },
  submitEmailBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  guestText: { color: '#636275', fontSize: 13, fontWeight: '600' },
});
