import { ref } from 'vue';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, getDoc, setDoc } from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser } from './useAuth';

export function useCustomers() {
  const customers = ref([]);
  const loading = ref(false);
  const error = ref(null);

  let unsubscribe = null;

  // Fetch customers
  const fetchCustomers = () => {
    if (!currentUser.value) {
        error.value = "User not authenticated";
        customers.value = [];
        return;
    }

    loading.value = true;
    const uid = currentUser.value.uid;
    const customersCollection = collection(db, 'users', uid, 'customers');
    const q = query(customersCollection);

    unsubscribe = onSnapshot(q, (snapshot) => {
      customers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loading.value = false;
    }, (err) => {
      error.value = err;
      loading.value = false;
      console.error("Error fetching customers:", err);
    });
  };

  const stopFetching = () => {
    if (unsubscribe) {
        unsubscribe();
    }
  };

  // Add a new customer
  const addCustomer = async (customerData) => {
    if (!currentUser.value) return;
    loading.value = true;
    try {
      const uid = currentUser.value.uid;
      const userDocRef = doc(db, 'users', uid);
      
      // Ensure the user document exists before adding a subcollection
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // You can add initial user data here if needed
        await setDoc(userDocRef, { email: currentUser.value.email, createdAt: new Date() });
      }

      const customersCollection = collection(userDocRef, 'customers');
      await addDoc(customersCollection, customerData);

    } catch (err) {
      error.value = err;
      console.error("Error adding customer:", err);
    } finally {
      loading.value = false;
    }
  };

  // Update an existing customer
  const updateCustomer = async (customerId, updatedData) => {
     if (!currentUser.value) return;
    loading.value = true;
    try {
        const uid = currentUser.value.uid;
        const customerDoc = doc(db, 'users', uid, 'customers', customerId);
        await updateDoc(customerDoc, updatedData);
    } catch (err) {
      error.value = err;
      console.error("Error updating customer:", err);
    } finally {
      loading.value = false;
    }
  };

  // Delete a customer
  const deleteCustomer = async (customerId) => {
     if (!currentUser.value) return;
    loading.value = true;
    try {
        const uid = currentUser.value.uid;
        const customerDoc = doc(db, 'users', uid, 'customers', customerId);
        await deleteDoc(customerDoc);
    } catch (err) {
      error.value = err;
      console.error("Error deleting customer:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    stopFetching,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}
