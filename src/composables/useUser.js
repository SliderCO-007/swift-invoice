import { ref } from 'vue'

// A global state to hold the user data
const user = ref(null)

export function useUser() {
  return { user }
}
