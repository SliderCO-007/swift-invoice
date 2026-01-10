import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase'

const user = ref(auth.currentUser)
const error = ref(null)

// A promise that resolves when the initial auth state is loaded
let authReadyResolver
const authReadyPromise = new Promise(resolve => {
  authReadyResolver = resolve
})

// The onAuthStateChanged listener is set up once and keeps the user ref in sync
onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser
  // If the resolver exists, it means the promise hasn't resolved yet.
  if (authReadyResolver) {
    authReadyResolver()
    authReadyResolver = null // Set to null to prevent it from being called again
  }
})

// A new composable function that returns the promise.
const getAuthReady = () => {
    return authReadyPromise
}

const useAuth = () => {
  const signUp = async (email, password) => {
    error.value = null
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)
      return res
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const login = async (email, password) => {
    error.value = null
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      return res
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const logout = async () => {
    error.value = null
    try {
      await signOut(auth)
    } catch (err) {
      error.value = err.message
    }
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    error.value = null
    try {
      const res = await signInWithPopup(auth, provider)
      return res
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    user,
    error,
    signUp,
    login,
    logout,
    signInWithGoogle,
  }
}

// We export both the main composable and our new auth-ready utility.
export { getAuthReady }
export default useAuth
