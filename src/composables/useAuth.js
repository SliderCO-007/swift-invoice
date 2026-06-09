import { ref } from 'vue';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, auth } from './useFirebase.js';

// --- SHARED SINGLETON STATE ---
const currentUser = ref(null);
const userProfile = ref(null);
const error = ref(null);
const loading = ref(false);

// Create a promise that resolves when auth is ready
let authReadyResolver;
const isAuthReady = new Promise(resolve => {
  authReadyResolver = resolve;
});


// --- DECOUPLED HELPER FUNCTIONS ---

const fetchUserProfile = async (userId) => {
  if (!userId) {
    userProfile.value = null;
    return null;
  }
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const profile = { id: docSnap.id, ...docSnap.data() };
      userProfile.value = profile;
      return profile;
    } else {
      userProfile.value = null;
      return null;
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    userProfile.value = null;
    return null;
  }
};

const createInitialUserData = async (user) => {
  if (!user) return;

  const batch = writeBatch(db);
  const userRef = doc(db, 'users', user.uid);
  
  batch.set(userRef, {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'New User',
    photoURL: user.photoURL || null,
    createdAt: serverTimestamp(),
    subscriptionStatus: 'free', 
    invoiceCount: 0,           
  });

  const settingsRef = doc(db, "userSettings", user.uid);
  batch.set(settingsRef, {
    company: {
        name: '',
        address: '',
        email: '',
        phone: '',
    },
    invoiceSettings: {
        defaultDueDateDays: 30,
        defaultTaxRate: 0,
    },
    updatedAt: serverTimestamp(),
    invoiceCounter: 0, 
  });

  await batch.commit();
  await fetchUserProfile(user.uid);

  // Fire Meta Pixel registration event for tracking ad conversions
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'CompleteRegistration');
  }
};


// --- AUTH ACTIONS ---

const signup = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
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
  const provider = new GoogleAuthProvider();
  // Crucial: Call signInWithPopup synchronously in the main execution thread of the click
  // to prevent mobile pop-up blockers from aggressively closing the authentication window.
  const authPromise = signInWithPopup(auth, provider);
  
  loading.value = true;
  error.value = null;
  try {
    await authPromise;
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

const resetPassword = async (email) => {
  loading.value = true;
  error.value = null;
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const verifyResetCode = async (code) => {
  error.value = null;
  loading.value = true;
  try {
    return await verifyPasswordResetCode(auth, code);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const confirmReset = async (code, newPassword) => {
  error.value = null;
  loading.value = true;
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

// --- Auth State Change Listener ---
onAuthStateChanged(auth, async (user) => {
  currentUser.value = user;
  if (user) {
    const profile = await fetchUserProfile(user.uid);
    if (!profile) {
      await createInitialUserData(user);
    }
  } else {
    userProfile.value = null;
  }
  
  if (authReadyResolver) {
    authReadyResolver();
    authReadyResolver = null;
  }
});


// --- COMPOSABLE EXPORT ---
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
    resetPassword,
    verifyResetCode,
    confirmReset,
    isAuthReady, 
  };
};

export { useAuth, currentUser, userProfile, isAuthReady };
