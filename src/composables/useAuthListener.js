import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUser } from './useUser'

export function useAuthListener() {
  const auth = getAuth()
  const { user } = useUser()

  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })
}
