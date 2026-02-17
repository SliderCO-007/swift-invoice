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

// Reactive state for auth
const currentUser = ref(null);
const userProfile = ref(null); // To hold Firestore user data
const error = ref(null);
const loading = ref(false);
const isAuthReady = ref(false); // New state to signal when auth is ready

// --- Firestore User Profile Management ---

const fetchUserProfile = async (userId) => {
  if (!userId) return;
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

// --- Firebase Auth Operations ---

const signup = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(res.user);
    // onAuthStateChanged will handle setting state
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const login = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting state
  } catch (err) {
    error.value = err.message;
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
    // onAuthStateChanged will handle setting state
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    // onAuthStateChanged will handle clearing state
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
  if (!isAuthReady.value) {
    isAuthReady.value = true;
  }
});

// Main composable function
const useAuth = () => {
  return {
    currentUser,
    userProfile,
    error,
    loading,
    isAuthReady, // Export the new state
    signup,
    login,
    logout,
    googleLogin,
  };
};

export { useAuth, currentUser, userProfile, isAuthReady };
