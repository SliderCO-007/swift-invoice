import { ref, watch } from 'vue';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser, userProfile } from './useAuth';

// --- SHARED STATE (SINGLETON) ---
const customers = ref([]);
const loading = ref(false);
const error = ref(null);
let unsubscribe = null; // To hold the onSnapshot unsubscribe function

// --- REACTIVE LISTENER SETUP ---

const setupCustomerListener = (orgId) => {
  // If a listener is already active, unsubscribe from it first.
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  // If no organization is set, supply a mock customer for demo and autocomplete preview.
  if (!orgId) {
    customers.value = [
      {
        id: 'mock-john-smith',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '555-0199',
        address1: '123 Fake Street',
        address2: 'Suite 100',
        city: 'Anytown',
        state: 'NY',
        zip: '10001'
      }
    ];
    loading.value = false;
    return;
  }

  loading.value = true;
  const customersCollection = collection(db, 'users', orgId, 'customers');
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

// Watch for changes in the authenticated user profile.
watch(userProfile, (newProfile) => {
  setupCustomerListener(newProfile?.orgId || newProfile?.id);
}, { immediate: true });


// --- COMPOSABLE FUNCTION ---

export function useCustomers() {

  const addCustomer = async (customerData) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("User not authenticated");
    const orgId = profile.orgId || profile.id;

    try {
      const customersCollection = collection(db, 'users', orgId, 'customers');
      await addDoc(customersCollection, customerData);
    } catch (err) {
      console.error("Error adding customer:", err);
      error.value = "Failed to add customer."; 
    }
  };

  const updateCustomer = async (customerId, updatedData) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("User not authenticated");
    const orgId = profile.orgId || profile.id;

    try {
      const customerDoc = doc(db, 'users', orgId, 'customers', customerId);
      await updateDoc(customerDoc, updatedData);
    } catch (err) {
      console.error("Error updating customer:", err);
      error.value = "Failed to update customer.";
    }
  };

  const deleteCustomer = async (customerId) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("User not authenticated");
    const orgId = profile.orgId || profile.id;

    try {
      const customerDoc = doc(db, 'users', orgId, 'customers', customerId);
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
