import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- The Single Source of Truth for all Firebase Services ---
const app = initializeApp(firebaseConfig);

// Initialize and export the services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app); 
export const storage = getStorage(app);

// A composable to provide these instances to any component that needs them.
export function useFirebase() {
  return { app, auth, db, functions, storage };
}
