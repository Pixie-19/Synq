import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration keys (loaded via environment variables)
const firebaseConfig = {
  // Clean, secure, and will alert you instantly if your .env isn't loading!
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with persistent local cache for better offline support
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // Useful for Web and consistent for Native
  })
});

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

export { app, auth, db, storage };

/**
 * Handles signing in with Google ID token inside Firebase
 * @param idToken The token obtained from Google Sign-In
 */
export const signInWithGoogleToken = async (idToken: string): Promise<FirebaseUser> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};
