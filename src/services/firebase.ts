import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration keys (loaded via environment variables or fallback values)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyA1rfJFurscWWsZEYJE5JbSrc6cnTeV-sU",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "synq-444d6.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "synq-444d6",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "synq-444d6.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "80919427420",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:80919427420:web:92a9cae8e729d2f08f2999",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage persistence to survive app restarts
let auth: any;
const isAuthInitialized = (app as any).container?.getProvider?.('auth')?.hasInstance?.();

if (isAuthInitialized) {
  auth = getAuth(app);
} else {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
}

export { app, auth };

/**
 * Handles signing in with Google ID token inside Firebase
 * @param idToken The token obtained from Google Sign-In
 */
export const signInWithGoogleToken = async (idToken: string): Promise<FirebaseUser> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};
