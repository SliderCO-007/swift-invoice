import { ref } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { resetUserSettings } from './useUserSettings'; // Import the reset function

// Shared state
const user = ref(auth.currentUser);
const isAuthReady = ref(false);
const error = ref(null);

// Listener for auth state changes
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser;
  isAuthReady.value = true;
  // If user is null (logged out), reset settings
  if (!currentUser) {
    resetUserSettings();
  }
});

const useAuth = () => {
  const signup = async (email, password) => {
    error.value = null;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error.value = e.message;
    }
  };

  const login = async (email, password) => {
    error.value = null;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      error.value = e.message;
    }
  };

  const logout = async () => {
    error.value = null;
    try {
      await signOut(auth);
      // No need to call resetUserSettings here anymore, as the onAuthStateChanged listener handles it.
    } catch (e) {
      error.value = e.message;
    }
  };

  const signInWithGoogle = async () => {
    error.value = null;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      error.value = e.message;
    }
  };

  return { user, isAuthReady, error, signup, login, logout, signInWithGoogle };
};

export const getCurrentUser = () => user.value;
export const getAuthReady = async () => {
  if (isAuthReady.value) return;
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
      isAuthReady.value = true;
      unsubscribe();
      resolve();
    });
  });
};

export default useAuth;
