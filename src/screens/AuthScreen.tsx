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
      {/* Brand header */}
      <View style={styles.brandSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.brandName}>Synq</Text>
        <Text style={styles.brandTagline}>Build with people who{'\n'}actually click.</Text>
      </View>

      {/* Auth card */}
      <View style={styles.card}>
        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#800020" />
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
                <Mail color="#800020" size={18} style={{ marginRight: 10 }} />
                <Text style={styles.emailBtnText}>Continue with Email</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ opacity: slideAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <TextInput
                  placeholder="your@email.com"
                  placeholderTextColor="#767676"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.emailInput}
                />
                <TextInput
                  placeholder="password"
                  placeholderTextColor="#767676"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.emailInput, { marginBottom: 16 }]}
                />
                <TouchableOpacity style={styles.submitEmailBtn} onPress={handleEmailSignIn}>
                  <View style={styles.submitGrad}>
                    <LogIn color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.submitText}>Sign In / Create Account</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Guest entry */}
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
              <Sparkles color="#767676" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6F0', paddingHorizontal: 24 },
  brandSection: { alignItems: 'center', marginBottom: 48, position: 'relative' },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  logoText: { fontSize: 36, fontFamily: 'serif', color: '#800020', fontWeight: '800' },
  brandName: { fontSize: 50, fontFamily: 'serif', fontWeight: '900', color: '#800020', letterSpacing: -1 },
  brandTagline: { fontSize: 18, color: '#2C2C2C', fontStyle: 'italic', textAlign: 'center', lineHeight: 26, marginTop: 8, fontWeight: '600' },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  loadingArea: { alignItems: 'center', paddingVertical: 20 },
  loadingText: { color: '#800020', marginTop: 14, fontWeight: '700', fontSize: 14, fontFamily: 'serif' },
  googleBtn: { borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20 },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#4285F4', marginRight: 10 },
  googleText: { fontSize: 15, fontWeight: '700', color: '#2C2C2C' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', backgroundColor: 'transparent' },
  dividerText: { color: '#767676', fontSize: 12, fontWeight: '600', marginHorizontal: 12, fontStyle: 'italic' },
  emailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#800020', borderRadius: 8, padding: 14, marginBottom: 16 },
  emailBtnText: { color: '#800020', fontWeight: '700', fontSize: 15 },
  emailInput: { backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 14, color: '#2C2C2C', fontSize: 15, marginBottom: 12 },
  submitEmailBtn: { borderRadius: 8, overflow: 'hidden', marginBottom: 16, backgroundColor: '#800020' },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, fontFamily: 'serif', letterSpacing: 0.5 },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  guestText: { color: '#767676', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
