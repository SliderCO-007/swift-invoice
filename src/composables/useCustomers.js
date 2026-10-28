import { ref, watch } from 'vue';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser, userProfile } from './useAuth';

// Helper to construct an immutable, timestamped note entry
const createNoteEntry = (text, profile, user) => ({
  id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  text: text.trim(),
  createdAt: new Date().toISOString(),
  authorId: user?.uid || profile?.id || 'system',
  authorName: profile?.name || user?.displayName || user?.email || 'Team Member'
});

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
        zip: '10001',
        notes: [
          {
            id: 'mock-note-1',
            text: 'Prefers text notifications before arrival. Gate code #4821.',
            createdAt: new Date().toISOString(),
            authorId: 'demo',
            authorName: 'Demo User'
          }
        ]
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

  const addCustomer = async (customerData, initialNoteText = '') => {
    const profile = userProfile.value;
    if (!profile) throw new Error("User not authenticated");
    const orgId = profile.orgId || profile.id;

    try {
      const payload = { ...customerData };
      const existingNotes = Array.isArray(payload.notes) ? [...payload.notes] : [];
      if (initialNoteText && initialNoteText.trim()) {
        existingNotes.push(createNoteEntry(initialNoteText, profile, currentUser.value));
      }
      payload.notes = existingNotes;

      const customersCollection = collection(db, 'users', orgId, 'customers');
      const docRef = await addDoc(customersCollection, payload);
      return docRef.id;
    } catch (err) {
      console.error("Error adding customer:", err);
      error.value = "Failed to add customer.";
      throw err;
    }
  };

  const updateCustomer = async (customerId, updatedData, newNoteText = '') => {
    const profile = userProfile.value;
    if (!profile) throw new Error("User not authenticated");
    const orgId = profile.orgId || profile.id;

    try {
      // Never allow profile updates to overwrite or remove existing notes (RIM append-only compliance)
      const safeData = { ...updatedData };
      delete safeData.notes;

      if (newNoteText && newNoteText.trim()) {
        safeData.notes = arrayUnion(createNoteEntry(newNoteText, profile, currentUser.value));
      }

      const customerDoc = doc(db, 'users', orgId, 'customers', customerId);
      await updateDoc(customerDoc, safeData);
    } catch (err) {
      console.error("Error updating customer:", err);
      error.value = "Failed to update customer.";
      throw err;
    }
  };

  const addCustomerNote = async (customerId, noteText) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("User not authenticated");
    if (!noteText || !noteText.trim()) return null;
    const orgId = profile.orgId || profile.id;

    try {
      const entry = createNoteEntry(noteText, profile, currentUser.value);
      const customerDoc = doc(db, 'users', orgId, 'customers', customerId);
      await updateDoc(customerDoc, {
        notes: arrayUnion(entry)
      });
      return entry;
    } catch (err) {
      console.error("Error adding customer note:", err);
      error.value = "Failed to add customer note.";
      throw err;
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
    addCustomerNote,
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
