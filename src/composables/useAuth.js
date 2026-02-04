
import { ref, readonly, computed, watch } from 'vue';
import { auth } from './useFirebase'; // CORRECT: Import from the single source of truth
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// --- This is the single source of truth for all authentication logic ---

// --- Global Reactive State ---
const user = ref(null);
const authError = ref(null);
const isAuthReady = ref(false); // New state to track initial auth check

// --- Global Listener ---
let unsubscribe;
export function initializeAuthListener() {
  if (!unsubscribe) {
    unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Global auth state changed. User:', firebaseUser ? firebaseUser.uid : 'null');
      user.value = firebaseUser;
      authError.value = null;
      if (!isAuthReady.value) {
        isAuthReady.value = true; // Set to true only once
      }
    });
  }
}

// --- Utility for Router Guards ---
// Returns a promise that resolves when the initial auth state is known.
export const waitForAuth = () => {
  return new Promise(resolve => {
    if (isAuthReady.value) {
      resolve(user.value);
    } else {
      const unwatch = watch(isAuthReady, (ready) => {
        if (ready) {
          unwatch();
          resolve(user.value);
        }
      });
    }
  });
};


// --- The Composable API for Components ---
export function useAuth() {

  // --- Methods to change authentication state ---
  const signup = async (email, password) => {
    authError.value = null;
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (!res.user) throw new Error('Could not complete signup.');
    } catch (e) {
      authError.value = e.message;
    }
  };

  const login = async (email, password) => {
    authError.value = null;
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (!res.user) throw new Error('Could not complete login.');
    } catch (e) {
      authError.value = e.message;
    }
  };

  const logout = async () => {
    authError.value = null;
    try {
      await signOut(auth);
    } catch (e) {
      authError.value = e.message;
    }
  };

  const signInWithGoogle = async () => {
    authError.value = null;
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      if (!res.user) throw new Error('Could not complete Google sign-in.');
    } catch (e) {
      authError.value = e.message;
    }
  };

  return {
    // Reactive State
    user: readonly(user),
    isLoggedIn: computed(() => !!user.value),
    error: readonly(authError),
    isAuthReady: readonly(isAuthReady), // Expose new state

    // Methods
    signup,
    login,
    logout,
    signInWithGoogle
  };
}
