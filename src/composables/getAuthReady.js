import { getAuth, onAuthStateChanged } from 'firebase/auth'

const getAuthReady = () => {
  return new Promise((resolve) => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // This function runs whenever the user's auth state changes.
      // We only need to know when the *initial* state has been determined on page load.
      // Once it runs the first time, we can resolve the promise and unsubscribe.
      resolve(user)
      unsubscribe()
    })
  })
}

export default getAuthReady
