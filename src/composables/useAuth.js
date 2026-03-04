import { ref } from 'vue';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
  });

  // CORRECTED: Changed "user_settings" to "userSettings" to match firestore.rules
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
  });

  await batch.commit();
  
  await fetchUserProfile(user.uid);
};


// --- REFACTORED AUTH ACTIONS ---

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
  loading.value = true;
  error.value = null;
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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

// --- NEW, SAFER AUTH STATE LISTENER ---
onAuthStateChanged(auth, (user) => {
  currentUser.value = user;
  userProfile.value = null; // Reset profile on auth change
  
  // This signals that the initial user check is done.
  if (authReadyResolver) {
    authReadyResolver();
    authReadyResolver = null;
  }
});

// --- COMPOSABLE EXPORT ---
const useAuth = () => {
  const init = async () => {
    await isAuthReady; // Wait for the initial auth check to complete
    if (currentUser.value) {
      const existingProfile = await fetchUserProfile(currentUser.value.uid);
      if (!existingProfile) {
        await createInitialUserData(currentUser.value);
      }
    }
  };

  return {
    currentUser,
    userProfile,
    error,
    loading,
    signup,
    login,
    logout,
    googleLogin,
    isAuthReady, 
    init,
  };
};

export { useAuth, currentUser, userProfile, isAuthReady };