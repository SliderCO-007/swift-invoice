import { ref } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './useFirebase';

const currentUser = ref(null);
const error = ref(null);
const loading = ref(false);

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
    currentUser.value = res.user;
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
    currentUser.value = res.user;
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
