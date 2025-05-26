// firebase.js
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBg3gFtPkyyyjsEnaI4Q2Wz1TxN4Xlen6w",
  authDomain: "quassama-a1a15.firebaseapp.com",
  projectId: "quassama-a1a15",
  storageBucket: "quassama-a1a15.firebasestorage.app",
  messagingSenderId: "816220791108",
  appId: "1:816220791108:web:089525fba4753e13627711"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };
