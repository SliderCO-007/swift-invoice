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

// --- THE CORE FIX: CENTRALIZED AUTH STATE LISTENER ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser.value = user;
    const existingProfile = await fetchUserProfile(user.uid);

    if (!existingProfile) {
      await createInitialUserData(user);
    }
  } else {
    currentUser.value = null;
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
    isAuthReady, 
  };
};

export { useAuth, currentUser, userProfile, isAuthReady };
