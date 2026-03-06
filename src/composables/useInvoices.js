
import { ref, watch } from 'vue';
import { 
  collection, getDocs, doc, getDoc, updateDoc, serverTimestamp, 
  query, where, deleteDoc, runTransaction, setDoc, deleteField, onSnapshot, increment
} from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser } from './useAuth.js';

const invoices = ref([]);
const loading = ref(false);
const error = ref(null);
let unsubscribe = null; // To hold the listener's unsubscribe function

const useInvoices = () => {

  const setupInvoiceListener = (userId) => {
    if (unsubscribe) {
      unsubscribe(); // Unsubscribe from any previous listener
    }

    if (!userId) {
      invoices.value = [];
      return;
    }

    const invoicesCollection = collection(db, 'invoices');
    const q = query(invoicesCollection, where('userId', '==', userId));

    loading.value = true;
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      invoices.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
          paidAt: data.paidAt?.toDate(),
          total: calculateTotal(data),
        };
      });
      loading.value = false;
    }, (err) => {
      error.value = 'Failed to fetch invoices in real-time.';
      console.error(err);
      loading.value = false;
    });
  };

  // Watch for changes in the authenticated user
  watch(currentUser, (newUser) => {
    setupInvoiceListener(newUser?.uid);
  }, { immediate: true }); // immediate: true runs the watcher upon initialization

  const calculateTotal = (invoice) => {
    const subtotal = (invoice.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
    return subtotal + taxAmount;
  };

  const getInvoices = async () => {
    if(currentUser.value?.uid) {
      setupInvoiceListener(currentUser.value.uid)
    }
  };

  const getInvoice = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().userId === currentUser.value?.uid) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          issueDate: data.issueDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
          paidAt: data.paidAt?.toDate(),
        };
      } else {
        throw new Error('Invoice not found or permission denied');
      }
    } catch (err) {
      error.value = `Failed to fetch invoice: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async (invoiceData, userId) => {
    if (!userId) throw new Error("Authentication required.");
    loading.value = true;
    try {
      const newInvoiceId = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        const userData = userDoc.data() || {};
        const invoiceCount = userData.invoiceCount || 0;
        const subscriptionStatus = userData.subscriptionStatus || 'free';

        if (subscriptionStatus !== 'active' && invoiceCount >= 2) {
          throw new Error("Invoice limit reached. Please upgrade.");
        }

        const settingsRef = doc(db, 'userSettings', userId);
        const settingsDoc = await transaction.get(settingsRef);
        const newInvoiceCounter = (settingsDoc.data()?.invoiceCounter || 0) + 1;
        const invoiceNumber = String(newInvoiceCounter).padStart(6, '0');

        const newInvoiceRef = doc(collection(db, 'invoices'));
        transaction.set(newInvoiceRef, {
          ...invoiceData,
          invoiceNumber,
          userId: userId,
          createdAt: serverTimestamp(),
          svcFeePaid: false,
        });

        // Atomically create or update user and settings documents
        transaction.set(userRef, { invoiceCount: increment(1) }, { merge: true });
        transaction.set(settingsRef, { invoiceCounter: newInvoiceCounter }, { merge: true });

        return newInvoiceRef.id;
      });
      return newInvoiceId;
    } catch (err) {
      error.value = `Failed to create invoice: ${err.message}`;
      console.error("Error in createInvoice transaction:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };


  const updateInvoice = async (id, invoiceData, userId) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      error.value = 'Failed to update invoice.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'invoices', id);
      const updateData = { status, updatedAt: serverTimestamp() };
      updateData.paidAt = status === 'paid' ? serverTimestamp() : deleteField();
      await updateDoc(docRef, updateData);
      return true;
    } catch (err) {
      error.value = 'Failed to update status.';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoice = async (id) => {
    if (!currentUser.value) throw new Error("Authentication required.");
    loading.value = true;
    try {
      await runTransaction(db, async (transaction) => {
        const invoiceRef = doc(db, 'invoices', id);
        const userRef = doc(db, 'users', currentUser.value.uid);
        
        const invoiceDoc = await transaction.get(invoiceRef);
        if (!invoiceDoc.exists() || invoiceDoc.data().userId !== currentUser.value.uid) {
          throw new Error("Invoice not found or permission denied.");
        }

        transaction.delete(invoiceRef);
        transaction.set(userRef, { invoiceCount: increment(-1) }, { merge: true });
      });
    } catch (err) {
      error.value = `Failed to delete invoice: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { invoices, loading, error, getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus };
};

export default useInvoices;
