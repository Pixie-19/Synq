import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  GithubAuthProvider,
  signInWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration keys (loaded via environment variables)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
// For Expo React Native: use default configuration (in-memory cache)
// DO NOT use browser-specific APIs like persistentLocalCache or initializeFirestore with cache options
// These are NOT supported in React Native and cause IndexedDB errors
const db = getFirestore(app);

// Initialize Firebase Storage for profile images
const storage = getStorage(app);

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

export { app, auth, db, storage, GithubAuthProvider };

/**
 * Handles signing in with GitHub access token inside Firebase
 * @param accessToken The token obtained from GitHub OAuth
 */
export const signInWithGitHubToken = async (accessToken: string): Promise<FirebaseUser> => {
  const credential = GithubAuthProvider.credential(accessToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};
