import { ref, watch } from 'vue';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser } from './useAuth';

// --- SHARED STATE (SINGLETON) ---
const customers = ref([]);
const loading = ref(false);
const error = ref(null);
let unsubscribe = null; // To hold the onSnapshot unsubscribe function

// --- REACTIVE LISTENER SETUP ---

const setupCustomerListener = (userId) => {
  // If a listener is already active, unsubscribe from it first.
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  // If no user is logged in, clear the customers list and stop.
  if (!userId) {
    customers.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  const customersCollection = collection(db, 'users', userId, 'customers');
  const q = query(customersCollection);

  // Attach the real-time listener.
  unsubscribe = onSnapshot(q, (snapshot) => {
    customers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    error.value = null; // Clear previous errors on successful fetch
    loading.value = false;
  }, (err) => {
    console.error("Error fetching customers in real-time:", err);
    error.value = "Failed to load customers.";
    loading.value = false;
  });
};

// --- AUTH STATE WATCHER ---

// Watch for changes in the authenticated user (login/logout).
// The { immediate: true } option ensures this runs as soon as the app loads.
watch(currentUser, (newUser) => {
  setupCustomerListener(newUser?.uid);
}, { immediate: true });


// --- COMPOSABLE FUNCTION ---

export function useCustomers() {

  const addCustomer = async (customerData) => {
    const user = currentUser.value;
    if (!user) throw new Error("User not authenticated");

    try {
      const customersCollection = collection(db, 'users', user.uid, 'customers');
      await addDoc(customersCollection, customerData);
    } catch (err) {
      console.error("Error adding customer:", err);
      error.value = "Failed to add customer."; 
    }
  };

  const updateCustomer = async (customerId, updatedData) => {
    const user = currentUser.value;
    if (!user) throw new Error("User not authenticated");

    try {
      const customerDoc = doc(db, 'users', user.uid, 'customers', customerId);
      await updateDoc(customerDoc, updatedData);
    } catch (err) {
      console.error("Error updating customer:", err);
      error.value = "Failed to update customer.";
    }
  };

  const deleteCustomer = async (customerId) => {
    const user = currentUser.value;
    if (!user) throw new Error("User not authenticated");

    try {
      const customerDoc = doc(db, 'users', user.uid, 'customers', customerId);
      await deleteDoc(customerDoc);
    } catch (err) {
      console.error("Error deleting customer:", err);
      error.value = "Failed to delete customer.";
    }
  };

  // Expose the reactive state and methods for components to use.
  return {
    customers, // The auto-updating list of customers
    loading,   // The real-time loading state
    error,     // The real-time error state
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}

// Reset function to be called on logout from the auth composable if needed.
export const resetCustomersState = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  customers.value = [];
  loading.value = false;
  error.value = null;
};
