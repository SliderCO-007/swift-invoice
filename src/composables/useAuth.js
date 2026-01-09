import { ref } from 'vue'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase' // Correctly import the initialized auth instance

const user = ref(null)
const error = ref(null)

// No longer need `const auth = getAuth()` here

const useAuth = () => {
  const signUp = async (email, password) => {
    error.value = null
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password) // 'auth' is now the imported instance
      user.value = res.user
      return res
    } catch (err) {
      error.value = err.message
    }
  }

  const login = async (email, password) => {
    error.value = null
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      user.value = res.user
      return res
    } catch (err) {
      error.value = err.message
    }
  }

  const signInWithGoogle = async () => {
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      const res = await signInWithPopup(auth, provider)
      user.value = res.user
      return res
    } catch (err) {
      error.value = err.message
    }
  }

  const logout = async () => {
    error.value = null
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      error.value = err.message
    }
  }

  return { user, error, signUp, login, logout, signInWithGoogle }
}

export default useAuth
