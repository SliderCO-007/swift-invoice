import { ref } from 'vue';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './useFirebase.js';

// --- SHARED SINGLETON STATE ---
// These are defined once and shared across the entire application.
const currentUser = ref(null);
const userProfile = ref(null);
const error = ref(null);
const loading = ref(false);

// Create a promise that resolves when auth is ready
let authReadyResolver;
const isAuthReady = new Promise(resolve => {
  authReadyResolver = resolve;
});



const fetchUserProfile = async (userId) => {
  if (!userId) {
    userProfile.value = null;
    return;
  }
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    userProfile.value = { id: docSnap.id, ...docSnap.data() };
  } else {
    userProfile.value = null;
    console.warn('User profile document not found in Firestore.');
  }
};

const createUserProfile = async (user) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'User',
      subscriptionStatus: 'free',
      invoiceCount: 0,
      createdAt: serverTimestamp(),
    });
  }
};

// --- AUTH ACTIONS ---

const signup = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(res.user);
    await fetchUserProfile(res.user.uid); // Ensure profile is loaded right after signup
  } catch (err) {
    error.value = err.message;
    throw err; 
  } finally {
    loading.value = false;
  }
};

const login = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const googleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    await createUserProfile(res.user);
    await fetchUserProfile(res.user.uid);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    error.value = err.message;
  }
};

// Single, persistent listener for auth state changes.
// This is the core of the fix.
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser.value = user;
    await fetchUserProfile(user.uid);
  } else {
    currentUser.value = null;
    userProfile.value = null;
  }
  // The first time this runs, the initial auth state is determined.
  // Resolve the promise to signal that auth is ready.
  if (authReadyResolver) {
    authReadyResolver();
    authReadyResolver = null;
  }
});
// Main composable function
const useAuth = () => {
  return {
    currentUser,
    userProfile,
    error,
    loading,
    signup,
    login,
    logout,
    googleLogin,
  };
};

// We export the reactive state and the promise directly for convenience elsewhere in the app.
export { useAuth, currentUser, userProfile, isAuthReady };