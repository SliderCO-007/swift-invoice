import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Connect to the correct region for Cloud Functions
const functions = getFunctions(app, 'us-central1');
const storage = getStorage(app);

// Initialize App Check and store its instance
let appCheck;

// WORKAROUND: Only initialize App Check in production.
// This bypasses a 403 Forbidden error on debug token exchange in the dev environment,
// likely caused by a hard-to-diagnose Google Cloud project configuration.
if (import.meta.env.PROD && import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY) {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
    console.log("Firebase App Check initialized for PRODUCTION.");
  } catch (e) {
    console.error("Firebase App Check initialization failed", e);
  }
} else if (import.meta.env.DEV) {
    console.warn("Firebase App Check is intentionally DISABLED in the development environment as a temporary workaround.");
}


// Export the initialized services for use in other parts of the app
export { app, auth, db, functions, storage, appCheck };
