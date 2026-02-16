import { ref } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from './useFirebase'; // Import db
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import firestore functions

const currentUser = ref(null);
const error = ref(null);
const loading = ref(false);

// Function to create a user profile document in Firestore
const createUserProfile = async (user) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  
  // Use setDoc with merge: true to avoid overwriting data on subsequent logins (e.g., Google)
  // and to create the doc if it doesn't exist.
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(), // Sets the creation time on the first write
    plan: 'free', // Assign free plan by default
    invoiceCount: 0 // Start with zero invoices
  }, { merge: true }); // Merge ensures we don't overwrite existing fields
};


// A promise that resolves when the initial auth state is determined.
const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    resolve(user);
    unsubscribe(); // Unsubscribe after the initial check is complete.
  });
});

const signup = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user) {
      // Create user profile document after successful signup
      await createUserProfile(res.user);
      currentUser.value = res.user;
    } else {
        throw new Error('Could not complete signup');
    }
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
    const res = await signInWithEmailAndPassword(auth, email, password);
    currentUser.value = res.user;
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
    if (res.user) {
        // Create or update user profile document after successful Google sign-in
        await createUserProfile(res.user);
        currentUser.value = res.user;
    } else {
        throw new Error('Could not complete Google sign in');
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    currentUser.value = null;
  } catch (err) {
    error.value = err.message;
  }
};

// Continuous listener for auth changes after the initial check
onAuthStateChanged(auth, (user) => {
  currentUser.value = user;
});

const useAuth = () => {
  return {
    currentUser,
    error,
    loading,
    signup,
    login,
    logout,
    googleLogin,
  };
};

// We no longer need a complex waitForAuth function.
// We now export the promise directly.
export { useAuth, currentUser, authReady };