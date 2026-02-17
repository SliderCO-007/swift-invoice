import { ref, watch } from 'vue';
import { 
  collection, getDocs, doc, getDoc, updateDoc, serverTimestamp, 
  query, where, deleteDoc, runTransaction, setDoc
} from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser, isAuthReady } from './useAuth.js';

const useInvoices = () => {
  const invoices = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const user = currentUser;

  const invoicesCollection = collection(db, 'invoices');

  const parseFirestoreDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate();
    if (date instanceof Date) return date;
    const parsed = new Date(date);
    return isNaN(parsed) ? null : parsed;
  };

  const calculateTotal = (invoice) => {
    const subtotal = (invoice.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
    return subtotal + taxAmount;
  };

  const getInvoices = async () => {
    if (!user.value?.uid) {
      invoices.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const q = query(invoicesCollection, where('userId', '==', user.value.uid));
      const querySnapshot = await getDocs(q);
      invoices.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: parseFirestoreDate(data.issueDate),
          dueDate: parseFirestoreDate(data.dueDate),
          total: calculateTotal(data),
        };
      });
    } catch (err) {
      error.value = 'Failed to fetch invoices.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const getInvoice = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId !== user.value?.uid) {
          throw new Error('Permission denied');
        }
        return {
          id: docSnap.id,
          ...data,
          issueDate: parseFirestoreDate(data.issueDate),
          dueDate: parseFirestoreDate(data.dueDate),
        };
      } else {
        throw new Error('Invoice not found');
      }
    } catch (err) {
      error.value = 'Failed to fetch invoice.';
      console.error(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async (invoiceData) => {
    loading.value = true;
    error.value = null;
    
    if (!user.value) {
        const authError = new Error("You must be logged in to create an invoice.");
        error.value = authError.message;
        loading.value = false;
        throw authError;
    }

    try {
      const newInvoiceId = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.value.uid);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error("User profile not found.");
        }

        const userData = userDoc.data();
        const { subscriptionStatus, invoiceCount = 0 } = userData;

        if (subscriptionStatus !== 'active' && invoiceCount >= 2) {
          throw new Error("You have reached your invoice limit. Please upgrade to create more invoices.");
        }

        const settingsRef = doc(db, 'userSettings', user.value.uid);
        const settingsDoc = await transaction.get(settingsRef);
        const currentCounter = settingsDoc.exists() ? settingsDoc.data().invoiceCounter : 0;
        const newInvoiceCounter = (currentCounter || 0) + 1;

        const invoiceNumber = String(newInvoiceCounter).padStart(6, '0');

        const newInvoiceRef = doc(collection(db, 'invoices'));
        const newInvoice = {
          ...invoiceData,
          invoiceNumber: invoiceNumber,
          userId: user.value.uid,
          createdAt: serverTimestamp(),
          svcFeePaid: false,
        };
        transaction.set(newInvoiceRef, newInvoice);

        const newInvoiceCount = invoiceCount + 1;
        transaction.update(userRef, { invoiceCount: newInvoiceCount });
        
        transaction.set(settingsRef, { invoiceCounter: newInvoiceCounter }, { merge: true });

        return newInvoiceRef.id;
      });

      await getInvoices();
      return newInvoiceId;

    } catch (err) {
      error.value = `Failed to save invoice: ${err.message}`;
      console.error("Error during invoice creation transaction:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
      const index = invoices.value.findIndex(inv => inv.id === id);
      if (index !== -1) {
        const updatedInvoice = await getInvoice(id); 
        if (updatedInvoice) {
          invoices.value.splice(index, 1, updatedInvoice);
        }
      }
      return true;
    } catch (err) {
      error.value = 'Failed to update invoice.';
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

    const updateInvoiceStatus = async (id, status) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        status: status,
        updatedAt: serverTimestamp(),
      });
      
      const index = invoices.value.findIndex(inv => inv.id === id);
      if (index !== -1) {
        invoices.value[index].status = status;
      }
      
      return true;
    } catch (err) {
      error.value = 'Failed to update invoice status.';
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoice = async (id) => {
    loading.value = true;
    error.value = null;

    if (!user.value) {
      const authError = new Error("You must be logged in to delete an invoice.");
      error.value = authError.message;
      loading.value = false;
      throw authError;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const invoiceRef = doc(db, 'invoices', id);
        const userRef = doc(db, 'users', user.value.uid);

        const invoiceDoc = await transaction.get(invoiceRef);
        if (!invoiceDoc.exists() || invoiceDoc.data().userId !== user.value.uid) {
            throw new Error("Invoice not found or you don\'t have permission to delete it.");
        }
        
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User not found.");
        }
        const currentCount = userDoc.data().invoiceCount || 0;

        transaction.delete(invoiceRef);

        transaction.update(userRef, { invoiceCount: Math.max(0, currentCount - 1) });
      });

      const index = invoices.value.findIndex(inv => inv.id === id);
      if (index !== -1) {
        invoices.value.splice(index, 1);
      }

    } catch (err) {
      error.value = 'Failed to delete invoice.';
      console.error(err);
      throw err; 
    } finally {
      loading.value = false;
    }
  };

  // Watch for authentication readiness before fetching data
  watch(isAuthReady, (ready) => {
      if (ready && currentUser.value) {
          getInvoices();
      } else {
          invoices.value = []; // Clear invoices if user logs out
      }
  }, { immediate: true });

  return { invoices, loading, error, getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus };
};

export default useInvoices;